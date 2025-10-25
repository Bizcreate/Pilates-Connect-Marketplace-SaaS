import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

interface AvailabilityCalendarProps {
  availability: {
    [key: string]: string[]
  } | null
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function AvailabilityCalendar({ availability }: AvailabilityCalendarProps) {
  if (!availability || Object.keys(availability).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No availability set</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => {
          const daySlots = availability[day] || []

          if (daySlots.length === 0) return null

          return (
            <div key={day} className="space-y-2">
              <p className="text-sm font-semibold">{day}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <Badge key={slot} variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
