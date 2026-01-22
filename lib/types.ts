export interface AvailabilitySlot {
  id: string
  instructor_id: string
  start_time: string
  end_time: string
  is_available: boolean
  notes?: string
  location?: string
  rate?: number
  rate_type?: string
  equipment?: string[]
  created_at: string
}

export interface Booking {
  id: string
  studio_id: string
  instructor_id: string
  title?: string
  description?: string
  booking_date: string
  start_time: string
  end_time: string
  location?: string
  instructor_rate: number
  status: string
  created_at: string
  updated_at: string
}

// Recurring Schedule Types
export type ScheduleDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"

export interface RecurringSchedule {
  id: string
  studio_id: string
  class_name: string
  day_of_week: ScheduleDay
  start_time: string // HH:mm format
  end_time: string // HH:mm format
  equipment_types: string[]
  instructor_id?: string
  instructor_notes?: string
  max_capacity?: number
  rate_per_hour?: number
  is_active: boolean
  timezone: string // e.g., "Australia/Sydney"
  created_at: string
  updated_at: string
}

export interface ScheduleAssignment {
  id: string
  recurring_schedule_id: string
  assigned_instructor_id: string
  date_assigned: string
  notes?: string
  created_at: string
}
