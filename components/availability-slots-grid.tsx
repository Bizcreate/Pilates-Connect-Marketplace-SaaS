"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Grid3x3, List } from "lucide-react"
import { BookSlotModal } from "./book-slot-modal"

interface Slot {
  id: string
  start_time: string
  end_time: string
  is_available: boolean
  notes?: string | null
  instructor_id: string
}

interface AvailabilitySlotsGridProps {
  slots: Slot[]
  instructor: {
    id: string
    display_name: string
    avatar_url?: string | null
    location?: string | null
  }
  hourlyRate?: string | null
  studioId?: string | null
  showBooking?: boolean
}

export function AvailabilitySlotsGrid({
  slots,
  instructor,
  hourlyRate,
  studioId,
  showBooking = true,
}: AvailabilitySlotsGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [bookModalOpen, setBookModalOpen] = useState(false)

  const handleBookSlot = (slot: Slot) => {
    if (!studioId || !showBooking) return
    setSelectedSlot(slot)
    setBookModalOpen(true)
  }

  const availableSlots = slots.filter((slot) => slot.is_available)

  if (availableSlots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No available slots</h3>
          <p className="text-sm text-muted-foreground">Check back later for new availability</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {availableSlots.length} slot{availableSlots.length !== 1 ? "s" : ""} available
          </p>
          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSlots.map((slot) => {
              const slotDate = new Date(slot.start_time)
              const startTime = slotDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
              const endTime = new Date(slot.end_time).toLocaleTimeString("en-AU", {
                hour: "2-digit",
                minute: "2-digit",
              })
              const formattedDate = slotDate.toLocaleDateString("en-AU", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })

              return (
                <Card key={slot.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formattedDate}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {startTime} - {endTime}
                          </div>
                        </div>
                        <Badge variant="secondary">Available</Badge>
                      </div>

                      {instructor.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {instructor.location}
                        </div>
                      )}

                      {slot.notes && <p className="text-xs text-muted-foreground line-clamp-2">{slot.notes}</p>}

                      {showBooking && studioId && (
                        <Button className="w-full" size="sm" onClick={() => handleBookSlot(slot)}>
                          Book Slot
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {availableSlots.map((slot) => {
              const slotDate = new Date(slot.start_time)
              const startTime = slotDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
              const endTime = new Date(slot.end_time).toLocaleTimeString("en-AU", {
                hour: "2-digit",
                minute: "2-digit",
              })
              const formattedDate = slotDate.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })

              return (
                <Card key={slot.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {startTime} - {endTime}
                          </div>
                          <Badge variant="secondary">Available</Badge>
                        </div>
                        {slot.notes && <p className="text-sm text-muted-foreground ml-6">{slot.notes}</p>}
                      </div>

                      {showBooking && studioId && (
                        <Button size="sm" onClick={() => handleBookSlot(slot)}>
                          Book Slot
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedSlot && studioId && (
        <BookSlotModal
          open={bookModalOpen}
          onOpenChange={setBookModalOpen}
          slot={selectedSlot}
          instructor={instructor}
          hourlyRate={hourlyRate}
          studioId={studioId}
        />
      )}
    </>
  )
}
