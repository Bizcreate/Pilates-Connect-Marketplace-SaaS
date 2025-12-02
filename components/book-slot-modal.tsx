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
import { Calendar, Clock } from "lucide-react"

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

      // Get current user
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

      console.log("[v0] Booking slot - User ID:", user.id)
      console.log("[v0] Booking slot - Instructor ID:", slot.instructor_id)

      // Create or get conversation
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${slot.instructor_id}),and(participant1_id.eq.${slot.instructor_id},participant2_id.eq.${user.id})`,
        )
        .single()

      let conversationId = existingConv?.id

      if (!conversationId) {
        console.log("[v0] Creating new conversation")
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant1_id: user.id,
            participant2_id: slot.instructor_id,
          })
          .select()
          .single()

        if (convError) {
          console.error("[v0] Error creating conversation:", convError)
          throw convError
        }
        conversationId = newConv.id
      }

      console.log("[v0] Using conversation ID:", conversationId)

      // Format booking message
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

      // Send message
      console.log("[v0] Sending message to conversation")
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: bookingMessage,
        read: false,
      })

      if (messageError) {
        console.error("[v0] Error sending message:", messageError)
        throw messageError
      }

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

      const coverRequestDate = startDate.toISOString().split("T")[0]
      const coverStartTime = startDate.toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      const coverEndTime = endDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })

      console.log("[v0] Creating cover request")
      await supabase.from("cover_requests").insert({
        studio_id: user.id,
        instructor_id: slot.instructor_id,
        date: coverRequestDate,
        start_time: coverStartTime,
        end_time: coverEndTime,
        status: "pending",
        notes: message || null,
      })

      console.log("[v0] Creating notification")
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: slot.instructor_id,
        type: "cover_request",
        title: "New Cover Request",
        message: `You have a new booking request for ${startDate.toLocaleDateString("en-AU")}`,
        link: `/messages?conversation=${conversationId}`,
        read: false,
      })

      if (notifError) {
        console.error("[v0] Error creating notification (table may not exist):", notifError)
        // Don't throw - continue even if notifications fail
      }

      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("push_messages")
        .eq("user_id", slot.instructor_id)
        .single()

      if (notifPrefs?.push_messages) {
        console.log("[v0] Sending push notification")
        await fetch("/api/notifications/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: slot.instructor_id,
            title: "New Booking Request",
            body: `New booking request for ${startDate.toLocaleDateString("en-AU")}`,
            link: `/messages?conversation=${conversationId}`,
          }),
        }).catch((err) => console.error("[v0] Push notification failed:", err))
      }

      toast({
        title: "Booking request sent!",
        description: "You'll be redirected to messages to continue the conversation.",
      })

      setTimeout(() => {
        router.push(`/messages?conversation=${conversationId}`)
        onOpenChange(false)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("[v0] Error booking slot:", error)
      toast({
        title: "Booking failed",
        description: "There was an error sending your booking request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Availability Slot</DialogTitle>
          <DialogDescription>Send a booking request to {instructorName}</DialogDescription>
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

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message or specify any requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              A default booking message will be sent if you don't add one.
            </p>
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
