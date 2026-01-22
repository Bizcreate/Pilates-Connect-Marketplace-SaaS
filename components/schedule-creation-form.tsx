"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"
import { RecurringSchedule, ScheduleDay } from "@/lib/types"

interface ScheduleCreationFormProps {
  studioId: string
  instructors: Array<{ id: string; name: string }>
  onSubmit: (schedule: Omit<RecurringSchedule, "id" | "created_at" | "updated_at">) => Promise<void>
  isLoading?: boolean
}

const DAYS_OF_WEEK: ScheduleDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const EQUIPMENT_OPTIONS = ["Mat Pilates", "Reformer", "Cadillac", "Chair", "Barrel", "Towers"]

export function ScheduleCreationForm({
  studioId,
  instructors,
  onSubmit,
  isLoading = false,
}: ScheduleCreationFormProps) {
  const [formData, setFormData] = useState({
    class_name: "",
    day_of_week: "Monday" as ScheduleDay,
    start_time: "09:00",
    end_time: "10:00",
    equipment_types: [] as string[],
    instructor_id: "",
    instructor_notes: "",
    max_capacity: 10,
    rate_per_hour: 50,
    timezone: "Australia/Sydney",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.class_name.trim()) {
      newErrors.class_name = "Class name is required"
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required"
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required"
    }

    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = "End time must be after start time"
    }

    if (formData.equipment_types.length === 0) {
      newErrors.equipment_types = "Select at least one equipment type"
    }

    if (formData.max_capacity && formData.max_capacity < 1) {
      newErrors.max_capacity = "Max capacity must be at least 1"
    }

    if (formData.rate_per_hour && formData.rate_per_hour < 0) {
      newErrors.rate_per_hour = "Rate cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        studio_id: studioId,
        class_name: formData.class_name,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        equipment_types: formData.equipment_types,
        instructor_id: formData.instructor_id || undefined,
        instructor_notes: formData.instructor_notes || undefined,
        max_capacity: formData.max_capacity,
        rate_per_hour: formData.rate_per_hour,
        is_active: true,
        timezone: formData.timezone,
      })

      // Reset form
      setFormData({
        class_name: "",
        day_of_week: "Monday",
        start_time: "09:00",
        end_time: "10:00",
        equipment_types: [],
        instructor_id: "",
        instructor_notes: "",
        max_capacity: 10,
        rate_per_hour: 50,
        timezone: "Australia/Sydney",
      })
      setErrors({})
    } catch (error) {
      console.error("[v0] Form submission error:", error)
      setErrors({ submit: "Failed to create schedule. Please try again." })
    }
  }

  const toggleEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(equipment)
        ? prev.equipment_types.filter((e) => e !== equipment)
        : [...prev.equipment_types, equipment],
    }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Recurring Schedule</CardTitle>
        <CardDescription>Set up a recurring class that repeats every week</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Class Name */}
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name *</Label>
            <Input
              id="class-name"
              placeholder="e.g., Morning Mat Pilates"
              value={formData.class_name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, class_name: e.target.value }))
                if (errors.class_name) setErrors((prev) => ({ ...prev, class_name: "" }))
              }}
              disabled={isLoading}
            />
            {errors.class_name && <p className="text-sm text-destructive">{errors.class_name}</p>}
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="day">Day of Week *</Label>
            <Select value={formData.day_of_week} onValueChange={(value) => setFormData((prev) => ({ ...prev, day_of_week: value as ScheduleDay }))}>
              <SelectTrigger id="day" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                  if (errors.start_time) setErrors((prev) => ({ ...prev, start_time: "" }))
                }}
                disabled={isLoading}
              />
              {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.end_time}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                  if (errors.end_time) setErrors((prev) => ({ ...prev, end_time: "" }))
                }}
                disabled={isLoading}
              />
              {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
            </div>
          </div>

          {/* Equipment Types */}
          <div className="space-y-3">
            <Label>Equipment Types *</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={formData.equipment_types.includes(equipment)}
                    onCheckedChange={() => toggleEquipment(equipment)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={equipment} className="font-normal cursor-pointer">
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
            {errors.equipment_types && <p className="text-sm text-destructive">{errors.equipment_types}</p>}
          </div>

          {/* Instructor Assignment */}
          <div className="space-y-2">
            <Label htmlFor="instructor">Assign Instructor (Optional)</Label>
            <Select value={formData.instructor_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, instructor_id: value }))}>
              <SelectTrigger id="instructor" disabled={isLoading}>
                <SelectValue placeholder="Select an instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Staff Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Bring extra mats, Room setup notes..."
              value={formData.instructor_notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructor_notes: e.target.value }))}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Max Capacity and Rate */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="capacity">Max Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.max_capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, max_capacity: parseInt(e.target.value) || 10 }))}
                disabled={isLoading}
              />
              {errors.max_capacity && <p className="text-sm text-destructive">{errors.max_capacity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Hour ($)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="5"
                value={formData.rate_per_hour}
                onChange={(e) => setFormData((prev) => ({ ...prev, rate_per_hour: parseFloat(e.target.value) || 50 }))}
                disabled={isLoading}
              />
              {errors.rate_per_hour && <p className="text-sm text-destructive">{errors.rate_per_hour}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Schedule"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ScheduleCreationForm
