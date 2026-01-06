"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIMEZONES, DEFAULT_TIMEZONE } from "@/lib/timezone"

interface TimezoneSelectorProps {
  value?: string
  onChange: (timezone: string) => void
  disabled?: boolean
}

export function TimezoneSelector({ value = DEFAULT_TIMEZONE, onChange, disabled }: TimezoneSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {TIMEZONES.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
