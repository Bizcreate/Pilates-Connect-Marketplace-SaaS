"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"

interface AvailabilitySlot {
  id: string
  start_time: string
  end_time: string
  notes?: string
}

interface BookAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: AvailabilitySlot
  instructorId: string
  instructorName: string
  onBook: () => void
}

export function BookAvailabilityDialog({
  open,
  onOpenChange,
  slot,
  instructorId,
  instructorName,
  onBook,
}: BookAvailabilityDialogProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const startDate = new Date(slot.start_time)
  const endDate = new Date(slot.end_time)

  let metadata: any = {}
  try {
    if (slot.notes) {
      metadata = JSON.parse(slot.notes)
    }
  } catch (e) {
    // Notes is not JSON, treat as plain text
  }

  const handleBook = async () => {
    setIsLoading(true)
    try {
      // Create or get conversation
      const response = await fetch(`/api/messages/${instructorId}`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to create conversation")

      const { conversationId } = await response.json()

      // Send initial booking message
      const bookingMessage = `Hi ${instructorName}, I'd like to book your availability slot on ${startDate.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })} from ${startDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} to ${endDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}.\n\n${message}`

      // Redirect to messages with the booking request
      toast({
        title: "Booking request sent!",
        description: "You'll be redirected to messages to continue the conversation.",
      })

      setTimeout(() => {
        router.push(`/messages?conversation=${conversationId}&initialMessage=${encodeURIComponent(bookingMessage)}`)
      }, 1000)

      onBook()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error booking slot:", error)
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Availability Slot</DialogTitle>
          <DialogDescription>Send a booking request to {instructorName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {startDate.toLocaleDateString('en-AU', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {startDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} - 
                {endDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {metadata.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{metadata.location}</span>
              </div>
            )}
            {metadata.rate_min && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>${metadata.rate_min}{metadata.rate_unit ? `/${metadata.rate_unit}` : ''}</span>
              </div>
            )}
            {metadata.pilates_level && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {metadata.pilates_level}
                </Badge>
                {metadata.equipment && Array.isArray(metadata.equipment) && metadata.equipment.map((item: string) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Add a message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell the instructor about your studio, class type, or any special requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleBook} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Booking Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
