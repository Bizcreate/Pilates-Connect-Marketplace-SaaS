"use client"

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
import { Calendar, Clock, Info } from "lucide-react"

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
        .select("hourly_rate_min")
        .eq("id", slot.instructor_id)
        .single()

      const durationHours = (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / (1000 * 60 * 60)
      const hourlyRate = instructorProfile?.hourly_rate_min || 60
      const totalAmount = durationHours * hourlyRate

      const coverRequestDate = startDate.toISOString().split("T")[0]
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          studio_id: user.id,
          instructor_id: slot.instructor_id,
          booking_type: "cover",
          title: `Cover class on ${coverRequestDate}`,
          description:
            message ||
            `Cover request for ${startDate.toLocaleTimeString("en-AU")} - ${endDate.toLocaleTimeString("en-AU")}`,
          booking_date: coverRequestDate,
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
          location: "Studio location",
          instructor_rate: hourlyRate,
          hours_worked: durationHours,
          total_amount: totalAmount,
          status: "scheduled",
        })
        .select()
        .single()

      if (bookingError) throw bookingError

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

      const bookingMessage =
        message ||
        `Hi ${instructorName}, I'd like to book your availability slot on ${startDate.toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} from ${startDate.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
        })} to ${endDate.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
        })}.`

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: bookingMessage,
        read: false,
      })

      await supabase.from("notifications").insert({
        user_id: slot.instructor_id,
        type: "booking_request",
        title: "New Booking Request",
        message: `You have a new booking request for ${coverRequestDate}`,
        link: `/instructor/bookings/${booking.id}`,
      })

      try {
        await fetch("/api/notifications/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: slot.instructor_id,
            title: "New Booking Request",
            body: `Booking request for ${coverRequestDate} from ${startDate.toLocaleTimeString("en-AU")} to ${endDate.toLocaleTimeString("en-AU")}`,
          }),
        })
      } catch (error) {
        console.error("[v0] Push notification failed:", error)
      }

      toast({
        title: "Booking request sent!",
        description: "The instructor has been notified. This will be billed in your monthly invoice.",
      })

      setTimeout(() => {
        router.push("/studio/bookings")
        onOpenChange(false)
        router.refresh()
      }, 1500)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Availability Slot</DialogTitle>
          <DialogDescription>
            Send a booking request to {instructorName}. You'll be billed monthly for completed bookings.
          </DialogDescription>
        </DialogHeader>

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

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">How Billing Works</span>
            </div>
            <p className="text-xs text-muted-foreground">
              No payment required now. After the class is completed, this booking will be added to your monthly invoice
              along with a platform service fee based on your subscription tier.
            </p>
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
            {loading ? "Sending..." : "Send Booking Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
