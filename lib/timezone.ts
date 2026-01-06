// Timezone utilities for Pilates Connect
// Default timezone: Australia/Sydney

export const DEFAULT_TIMEZONE = "Australia/Sydney"

// Common timezones for future expansion
export const TIMEZONES = [
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST/AEDT)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
  { value: "Australia/Perth", label: "Perth (AWST)" },
  { value: "Australia/Adelaide", label: "Adelaide (ACST/ACDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
] as const

/**
 * Formats a date/time to the user's timezone
 * @param date - Date string or Date object
 * @param timezone - IANA timezone string (defaults to Sydney)
 * @param options - Intl.DateTimeFormat options
 */
export function formatInTimezone(
  date: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    ...options,
  }).format(dateObj)
}

/**
 * Formats time only (HH:MM) in the user's timezone
 */
export function formatTimeInTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, timezone, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Formats date only in the user's timezone
 */
export function formatDateInTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, timezone, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formats date and time in the user's timezone
 */
export function formatDateTimeInTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, timezone, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Combines date and time strings into ISO timestamp for the given timezone
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:MM)
 * @param timezone - IANA timezone string
 */
export function createTimestampInTimezone(date: string, time: string, timezone: string = DEFAULT_TIMEZONE): string {
  // Create a date string in the format that JavaScript can parse with timezone
  const dateTimeString = `${date}T${time}:00`

  // Parse as if it's in the specified timezone
  const localDate = new Date(dateTimeString)

  // Get the timezone offset for the specified timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  // Return ISO string (will be stored as UTC in database)
  return localDate.toISOString()
}

/**
 * Gets the current time in the specified timezone
 */
export function getNowInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const values: Record<string, string> = {}

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value
    }
  }

  return new Date(`${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`)
}

/**
 * Detects the user's browser timezone
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

/**
 * Gets timezone abbreviation (e.g., AEDT, AEST)
 */
export function getTimezoneAbbreviation(timezone: string = DEFAULT_TIMEZONE): string {
  const date = new Date()
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    timeZoneName: "short",
  })

  const parts = formatter.formatToParts(date)
  const timezonePart = parts.find((part) => part.type === "timeZoneName")

  return timezonePart?.value || timezone
}
