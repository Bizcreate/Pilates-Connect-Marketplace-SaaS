-- Fix availability_slots table to support the full availability posting form
-- This table needs significant updates to match the form

-- Drop and recreate with proper structure
DROP TABLE IF EXISTS availability_slots CASCADE;

CREATE TABLE availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Date and time fields
  date_from date NOT NULL,
  date_to date,
  repeat_days text[], -- Array of day names: Mon, Tue, Wed, etc.
  start_time time NOT NULL,
  end_time time NOT NULL,
  
  -- Availability details
  availability_type text NOT NULL CHECK (availability_type IN ('cover', 'regular', 'temp')),
  location text NOT NULL,
  pilates_level text NOT NULL,
  equipment text[] NOT NULL,
  
  -- Rate information
  rate_min integer,
  rate_unit text CHECK (rate_unit IN ('per_class', 'per_hour')),
  
  -- Status
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled')),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public availability is viewable"
  ON availability_slots FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage own availability"
  ON availability_slots FOR ALL
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Create index for better query performance
CREATE INDEX idx_availability_instructor ON availability_slots(instructor_id);
CREATE INDEX idx_availability_dates ON availability_slots(date_from, date_to);
CREATE INDEX idx_availability_status ON availability_slots(status);

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'availability_slots' 
ORDER BY ordinal_position;
