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
