interface CalendarEvent {
  title: string
  description?: string
  location?: string
  start: Date
  end: Date
  uid?: string
}

export function generateICalContent(events: CalendarEvent[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  let ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pilates Connect//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Pilates Connect Schedule",
    "X-WR-TIMEZONE:UTC",
  ].join("\r\n")

  events.forEach((event, index) => {
    const uid = event.uid || `${now}-${index}@pilatesconnect.com`
    const dtstart = event.start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const dtend = event.end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const dtstamp = now

    ical += "\r\n"
    ical += [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeICalValue(event.title)}`,
      event.description ? `DESCRIPTION:${escapeICalValue(event.description)}` : "",
      event.location ? `LOCATION:${escapeICalValue(event.location)}` : "",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n")
  })

  ical += "\r\nEND:VCALENDAR"
  return ical
}

function escapeICalValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export function downloadICalFile(content: string, filename = "pilates-schedule.ics") {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function availabilitySlotsToCalendarEvents(slots: any[]): CalendarEvent[] {
  return slots.map((slot) => ({
    title: `Available: ${slot.location || "Pilates Session"}`,
    description: `Rate: $${slot.rate} ${slot.rate_type}\nEquipment: ${slot.equipment?.join(", ") || "None"}\nNotes: ${slot.notes || ""}`,
    location: slot.location || "",
    start: new Date(slot.start_time),
    end: new Date(slot.end_time),
    uid: `availability-${slot.id}@pilatesconnect.com`,
  }))
}

export function bookingsToCalendarEvents(bookings: any[]): CalendarEvent[] {
  return bookings.map((booking) => {
    const date = new Date(booking.booking_date)
    const startTime = booking.start_time.split(":")
    const endTime = booking.end_time.split(":")

    const start = new Date(date)
    start.setHours(Number.parseInt(startTime[0]), Number.parseInt(startTime[1]), 0)

    const end = new Date(date)
    end.setHours(Number.parseInt(endTime[0]), Number.parseInt(endTime[1]), 0)

    return {
      title: booking.title || "Pilates Booking",
      description: `${booking.description || ""}\nRate: $${booking.instructor_rate}/hr\nStatus: ${booking.status}`,
      location: booking.location || "",
      start,
      end,
      uid: `booking-${booking.id}@pilatesconnect.com`,
    }
  })
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(event.start)}/${formatGoogleDate(event.end)}`,
    details: event.description || "",
    location: event.location || "",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}
