"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookAvailabilityDialog } from "@/components/book-availability-dialog"
import { Calendar } from 'lucide-react'

interface AvailabilitySlot {
  id: string
  start_time: string
  end_time: string
  notes?: string
}

interface BookAvailabilityButtonProps {
  slot: AvailabilitySlot
  instructorId: string
  instructorName: string
}

export function BookAvailabilityButton({ slot, instructorId, instructorName }: BookAvailabilityButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setShowDialog(true)}>
        <Calendar className="h-4 w-4 mr-2" />
        Book Slot
      </Button>
      <BookAvailabilityDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        slot={slot}
        instructorId={instructorId}
        instructorName={instructorName}
        onBook={() => {
          // Optional: Add any post-booking logic here
        }}
      />
    </>
  )
}
