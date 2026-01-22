// Recurring Schedule utilities and helpers
import { RecurringSchedule, ScheduleDay } from "./types"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

export const getDayIndex = (day: ScheduleDay): number => {
  return DAYS_OF_WEEK.indexOf(day as any)
}

export const getNextOccurrence = (schedule: RecurringSchedule): Date => {
  const today = new Date()
  const dayIndex = getDayIndex(schedule.day_of_week as ScheduleDay)
  const todayIndex = today.getDay()
  
  let daysUntilNext = (dayIndex - todayIndex + 7) % 7
  if (daysUntilNext === 0 && new Date().getHours() >= parseInt(schedule.start_time.split(":")[0])) {
    daysUntilNext = 7
  }
  
  const nextDate = new Date(today)
  nextDate.setDate(nextDate.getDate() + daysUntilNext)
  
  const [hours, minutes] = schedule.start_time.split(":").map(Number)
  nextDate.setHours(hours, minutes, 0, 0)
  
  return nextDate
}

export const formatScheduleTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`
}

export const getRecurrenceLabel = (schedule: RecurringSchedule): string => {
  return `Every ${schedule.day_of_week} at ${schedule.start_time}`
}

export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHours, startMins] = startTime.split(":").map(Number)
  const [endHours, endMins] = endTime.split(":").map(Number)
  
  const startTotal = startHours * 60 + startMins
  const endTotal = endHours * 60 + endMins
  
  return (endTotal - startTotal) / 60 // return duration in hours
}
