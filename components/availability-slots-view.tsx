"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BookSlotModal } from "@/components/book-slot-modal"
import { Calendar, Clock, MapPin, Grid3x3, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface AvailabilitySlot {
  id: string
  start_time: string
  end_time: string
  instructor_id: string
  notes?: string
}

interface AvailabilitySlotsViewProps {
  slots: AvailabilitySlot[]
  instructorName: string
  instructorId: string
  userId?: string
}

export function AvailabilitySlotsView({ slots, instructorName, instructorId, userId }: AvailabilitySlotsViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  const handleBookSlot = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot)
    setBookingModalOpen(true)
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No availability slots at the moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {slots.length} slot{slots.length !== 1 ? "s" : ""} available
        </p>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3x3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => {
            const startDate = new Date(slot.start_time)
            const endDate = new Date(slot.end_time)

            let metadata: any = {}
            try {
              if (slot.notes) {
                metadata = JSON.parse(slot.notes)
              }
            } catch (e) {
              // Notes is not JSON
            }

            return (
              <Card key={slot.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      {startDate.toLocaleDateString("en-AU", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {startDate.toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {metadata.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {metadata.location}
                    </div>
                  )}

                  {(metadata.pilates_level || metadata.rate_min) && (
                    <div className="flex flex-wrap gap-2">
                      {metadata.pilates_level && (
                        <Badge variant="secondary" className="text-xs">
                          {metadata.pilates_level}
                        </Badge>
                      )}
                      {metadata.rate_min && (
                        <Badge variant="outline" className="text-xs">
                          ${metadata.rate_min}
                          {metadata.rate_unit ? `/${metadata.rate_unit}` : ""}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button className="w-full" onClick={() => handleBookSlot(slot)}>
                    Book Slot
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const startDate = new Date(slot.start_time)
            const endDate = new Date(slot.end_time)

            let metadata: any = {}
            try {
              if (slot.notes) {
                metadata = JSON.parse(slot.notes)
              }
            } catch (e) {
              // Notes is not JSON
            }

            return (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {startDate.toLocaleDateString("en-AU", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
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

                  <div className="flex flex-wrap gap-2">
                    {metadata.location && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {metadata.location}
                      </span>
                    )}
                    {metadata.pilates_level && (
                      <Badge variant="secondary" className="text-xs">
                        {metadata.pilates_level}
                      </Badge>
                    )}
                    {metadata.rate_min && (
                      <Badge variant="outline" className="text-xs">
                        ${metadata.rate_min}
                        {metadata.rate_unit ? `/${metadata.rate_unit}` : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button onClick={() => handleBookSlot(slot)}>Book Slot</Button>
              </div>
            )
          })}
        </div>
      )}

      {selectedSlot && (
        <BookSlotModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          slot={selectedSlot}
          instructorName={instructorName}
          userId={userId} // Added userId prop to BookSlotModal
        />
      )}
    </div>
  )
}
