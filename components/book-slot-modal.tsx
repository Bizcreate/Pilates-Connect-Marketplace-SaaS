"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Calendar, Clock } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
  amount,
}: { clientSecret: string; onSuccess: () => void; onCancel: () => void; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError("")

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/studio/bookings/success`,
      },
      redirect: "if_required",
    })

    if (submitError) {
      setError(submitError.message || "Payment failed")
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border p-4 bg-muted/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Total Amount</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Includes 5% Pilates Connect service fee</p>
      </div>

      <PaymentElement />

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading} className="flex-1">
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

interface BookSlotModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: {
    id: string
    start_time: string
    end_time: string
    instructor_id: string
    notes?: string
  }
  instructorName: string
}

export function BookSlotModal({ open, onOpenChange, slot, instructorName }: BookSlotModalProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const router = useRouter()

  const startDate = new Date(slot.start_time)
  const endDate = new Date(slot.end_time)

  const handleBooking = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to book availability slots",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      const { data: instructorProfile } = await supabase
        .from("instructor_profiles")
        .select("stripe_charges_enabled, hourly_rate_min")
        .eq("id", slot.instructor_id)
        .single()

      if (!instructorProfile?.stripe_charges_enabled) {
        toast({
          title: "Payment not available",
          description: "This instructor hasn't set up payments yet. Please contact them directly.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const durationHours = (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / (1000 * 60 * 60)
      const hourlyRate = instructorProfile.hourly_rate_min || 60
      const totalAmount = durationHours * hourlyRate

      console.log("[v0] Creating payment intent for $", totalAmount)

      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${slot.instructor_id}),and(participant1_id.eq.${slot.instructor_id},participant2_id.eq.${user.id})`,
        )
        .single()

      let conversationId = existingConv?.id

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant1_id: user.id,
            participant2_id: slot.instructor_id,
          })
          .select()
          .single()

        if (convError) throw convError
        conversationId = newConv.id
      }

      const coverRequestDate = startDate.toISOString().split("T")[0]
      const { data: coverRequest, error: coverError } = await supabase
        .from("cover_requests")
        .insert({
          studio_id: user.id,
          instructor_id: slot.instructor_id,
          date: coverRequestDate,
          start_time: startDate.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          end_time: endDate.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          status: "pending",
          notes: message || null,
        })
        .select()
        .single()

      if (coverError) throw coverError

      const paymentResponse = await fetch("/api/stripe/create-booking-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: slot.instructor_id,
          bookingId: coverRequest.id,
          amount: totalAmount,
          bookingType: "cover",
          bookingDate: coverRequestDate,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to create payment")
      }

      setClientSecret(paymentData.clientSecret)
      setPaymentAmount(totalAmount)
      setShowPayment(true)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "There was an error creating your booking request.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const bookingMessage = `Payment confirmed! I've booked your slot on ${startDate.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })} from ${startDate.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    })} to ${endDate.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    })}.${message ? ` Note: ${message}` : ""}`

    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${user?.id},participant2_id.eq.${slot.instructor_id}),and(participant1_id.eq.${slot.instructor_id},participant2_id.eq.${user?.id})`,
      )
      .single()

    if (conv) {
      await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_id: user?.id,
        content: bookingMessage,
        read: false,
      })

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conv.id)
    }

    toast({
      title: "Booking confirmed!",
      description: "Payment successful. The instructor has been notified.",
    })

    setTimeout(() => {
      router.push("/studio/dashboard")
      onOpenChange(false)
      router.refresh()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{showPayment ? "Complete Payment" : "Book Availability Slot"}</DialogTitle>
          <DialogDescription>
            {showPayment ? "Enter payment details to confirm booking" : `Send a booking request to ${instructorName}`}
          </DialogDescription>
        </DialogHeader>

        {!showPayment ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {startDate.toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {startDate.toLocaleTimeString("en-AU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endDate.toLocaleTimeString("en-AU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message or specify any requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleBooking} disabled={loading}>
                {loading ? "Loading..." : "Continue to Payment"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-4">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setShowPayment(false)
                    setClientSecret("")
                  }}
                  amount={paymentAmount}
                />
              </Elements>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
