"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Download, ExternalLink } from "lucide-react"
import {
  generateICalContent,
  downloadICalFile,
  availabilitySlotsToCalendarEvents,
  bookingsToCalendarEvents,
} from "@/lib/calendar/ical"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CalendarExportButtonProps {
  userId: string
  userType: "instructor" | "studio"
}

export function CalendarExportButton({ userId, userType }: CalendarExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleExportIcal = async () => {
    setIsLoading(true)
    try {
      let events: any[] = []

      if (userType === "instructor") {
        // Fetch availability slots
        const { data: slots } = await supabase
          .from("availability_slots")
          .select("*")
          .eq("instructor_id", userId)
          .eq("is_available", true)
          .gte("start_time", new Date().toISOString())

        // Fetch bookings
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("instructor_id", userId)
          .gte("booking_date", new Date().toISOString().split("T")[0])

        if (slots) events.push(...availabilitySlotsToCalendarEvents(slots))
        if (bookings) events.push(...bookingsToCalendarEvents(bookings))
      } else {
        // Studio: fetch their bookings
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("studio_id", userId)
          .gte("booking_date", new Date().toISOString().split("T")[0])

        if (bookings) events = bookingsToCalendarEvents(bookings)
      }

      const icalContent = generateICalContent(events)
      downloadICalFile(icalContent, "pilates-schedule.ics")

      toast({
        title: "Calendar exported",
        description: "Your schedule has been downloaded as an iCal file.",
      })
    } catch (error) {
      console.error("[v0] Error exporting calendar:", error)
      toast({
        title: "Export failed",
        description: "Could not export your calendar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncGoogleCalendar = async () => {
    toast({
      title: "Google Calendar Sync",
      description:
        "Download the iCal file and import it into Google Calendar manually, or use the individual event links.",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Calendar className="h-4 w-4 mr-2" />
          Export Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportIcal}>
          <Download className="h-4 w-4 mr-2" />
          Download iCal (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSyncGoogleCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Sync to Google Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
