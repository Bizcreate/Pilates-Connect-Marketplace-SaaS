-- Add timezone support to the platform with Sydney, Australia as default

-- 1. Add timezone column to profiles (for future multi-timezone support)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 2. Add timezone columns to instructor and studio profiles
ALTER TABLE public.instructor_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

ALTER TABLE public.studio_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 3. Add timezone to availability_slots (already has timestamptz for start/end times)
ALTER TABLE public.availability_slots 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 4. Add timezone to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 5. Add timezone to cover_requests
ALTER TABLE public.cover_requests 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 6. Add timezone to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 7. Add timezone to casual_postings
ALTER TABLE public.casual_postings 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- 8. Create helper function to convert times to user's timezone
CREATE OR REPLACE FUNCTION get_local_time(
  timestamp_val TIMESTAMPTZ,
  user_timezone TEXT DEFAULT 'Australia/Sydney'
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN timestamp_val AT TIME ZONE user_timezone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_local_time IS 'Converts timestamp to specified timezone (default: Sydney, Australia)';

-- 9. Add indexes for timezone-based queries
CREATE INDEX IF NOT EXISTS availability_slots_timezone_idx ON public.availability_slots(timezone);
CREATE INDEX IF NOT EXISTS bookings_timezone_idx ON public.bookings(timezone);
CREATE INDEX IF NOT EXISTS jobs_timezone_idx ON public.jobs(timezone);
CREATE INDEX IF NOT EXISTS cover_requests_timezone_idx ON public.cover_requests(timezone);
