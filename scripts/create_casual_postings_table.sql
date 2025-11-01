-- Create casual_postings table for studios to post casual/cover opportunities
-- This is separate from full jobs

CREATE TABLE IF NOT EXISTS casual_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic information
  title text NOT NULL,
  description text,
  class_type text NOT NULL,
  
  -- Date and time
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  
  -- Location
  location text NOT NULL,
  suburb text,
  state text,
  
  -- Requirements
  required_equipment text[],
  required_certifications text[],
  experience_level text,
  
  -- Compensation
  rate numeric,
  rate_type text CHECK (rate_type IN ('per_class', 'per_hour', 'fixed')),
  
  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  filled_by_instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE casual_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public casual postings are viewable"
  ON casual_postings FOR SELECT
  USING (true);

CREATE POLICY "Studios can manage own casual postings"
  ON casual_postings FOR ALL
  USING (auth.uid() = studio_id)
  WITH CHECK (auth.uid() = studio_id);

-- Create indexes
CREATE INDEX idx_casual_postings_studio ON casual_postings(studio_id);
CREATE INDEX idx_casual_postings_date ON casual_postings(date);
CREATE INDEX idx_casual_postings_status ON casual_postings(status);

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'casual_postings' 
ORDER BY ordinal_position;
