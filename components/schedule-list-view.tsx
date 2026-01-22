"use client"

import { RecurringSchedule } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, AlertCircle, Edit2, Trash2, Calendar } from "lucide-react"
import { formatScheduleTime, getNextOccurrence, getRecurrenceLabel, calculateDuration } from "@/lib/recurring-schedules"

interface ScheduleListViewProps {
  schedules: RecurringSchedule[]
  onEdit?: (schedule: RecurringSchedule) => void
  onDelete?: (scheduleId: string) => void
  isLoading?: boolean
}

export function ScheduleListView({ schedules, onEdit, onDelete, isLoading = false }: ScheduleListViewProps) {
  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No recurring schedules created yet</p>
          <p className="text-sm text-muted-foreground">Create your first recurring class to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const duration = calculateDuration(schedule.start_time, schedule.end_time)
        const nextOccurrence = getNextOccurrence(schedule)

        return (
          <Card key={schedule.id} className={`overflow-hidden transition-opacity ${!schedule.is_active ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{schedule.class_name}</CardTitle>
                    {!schedule.is_active && <Badge variant="secondary">Inactive</Badge>}
                    <Badge variant="outline">{schedule.day_of_week}</Badge>
                  </div>
                  <CardDescription className="mt-1">{getRecurrenceLabel(schedule)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(schedule)} disabled={isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(schedule.id)} disabled={isLoading}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Time and Duration */}
                <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {formatScheduleTime(schedule.start_time, schedule.end_time)} ({duration}h)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Next: {nextOccurrence.toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Equipment and Capacity */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Equipment</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {schedule.equipment_types.map((equipment) => (
                        <Badge key={equipment} variant="secondary">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {schedule.max_capacity && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Max Capacity</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{schedule.max_capacity} participants</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rate */}
                {schedule.rate_per_hour && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Rate</p>
                    <p className="mt-1 text-sm font-medium">${schedule.rate_per_hour}/hour</p>
                  </div>
                )}

                {/* Instructor Notes */}
                {schedule.instructor_notes && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-amber-50/50 p-3 dark:bg-amber-950/20">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Staff Notes</p>
                          <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{schedule.instructor_notes}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ScheduleListView
