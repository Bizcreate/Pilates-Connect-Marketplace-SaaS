"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Loader2, User, X } from "lucide-react"
import { RecurringSchedule } from "@/lib/types"

interface ScheduleAssignmentProps {
  schedule: RecurringSchedule
  instructors: Array<{ id: string; name: string }>
  onAssign: (instructorId: string, notes: string) => Promise<void>
  isLoading?: boolean
}

export function ScheduleAssignment({
  schedule,
  instructors,
  onAssign,
  isLoading = false,
}: ScheduleAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState("none")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAssign = async () => {
    if (selectedInstructor === "none") {
      setError("Please select an instructor")
      return
    }

    try {
      await onAssign(selectedInstructor, notes)
      setIsOpen(false)
      setSelectedInstructor("none")
      setNotes("")
      setError(null)
    } catch (err) {
      console.error("[v0] Assignment error:", err)
      setError("Failed to assign instructor. Please try again.")
    }
  }

  const assignedInstructor = schedule.instructor_id
    ? instructors.find((i) => i.id === schedule.instructor_id)
    : null

  return (
    <>
      {assignedInstructor ? (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-700 dark:text-green-400" />
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Assigned to: {assignedInstructor.name}
            </p>
          </div>
          {schedule.instructor_notes && (
            <p className="text-sm text-green-800 dark:text-green-300 ml-6">{schedule.instructor_notes}</p>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-green-700 dark:text-green-400"
            onClick={() => setIsOpen(true)}
          >
            Change assignment
          </Button>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">No instructor assigned</p>
            </div>
            <Button size="sm" onClick={() => setIsOpen(true)}>
              Assign Instructor
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Instructor to {schedule.class_name}</DialogTitle>
            <DialogDescription>
              {schedule.day_of_week} at {schedule.start_time}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-2 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instructor-select">Instructor *</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor} disabled={isLoading}>
                <SelectTrigger id="instructor-select">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Clear assignment)</SelectItem>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-notes">Assignment Notes</Label>
              <Textarea
                id="assignment-notes"
                placeholder="e.g., Special requests, setup requirements, equipment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                These notes will be visible to the assigned instructor
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={isLoading || selectedInstructor === "none"}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Confirm Assignment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
