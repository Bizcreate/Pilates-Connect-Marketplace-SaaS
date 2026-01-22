-- Create recurring_schedules table for managing studio class schedules
CREATE TABLE IF NOT EXISTS recurring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_name VARCHAR(255) NOT NULL,
  day_of_week VARCHAR(10) NOT NULL, -- Monday, Tuesday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  equipment_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  instructor_notes TEXT,
  max_capacity INTEGER,
  rate_per_hour DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create schedule_assignments table for tracking instructor assignments
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_schedule_id UUID NOT NULL REFERENCES recurring_schedules(id) ON DELETE CASCADE,
  assigned_instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_assigned DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, pending, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_recurring_schedules_studio_id ON recurring_schedules(studio_id);
CREATE INDEX idx_recurring_schedules_instructor_id ON recurring_schedules(assigned_instructor_id);
CREATE INDEX idx_schedule_assignments_schedule_id ON schedule_assignments(recurring_schedule_id);
CREATE INDEX idx_schedule_assignments_instructor_id ON schedule_assignments(assigned_instructor_id);
CREATE INDEX idx_schedule_assignments_date ON schedule_assignments(date_assigned);

-- Enable Row Level Security
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_schedules
CREATE POLICY "Studios can view their own schedules"
  ON recurring_schedules FOR SELECT
  USING (studio_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
  ));

CREATE POLICY "Studios can create schedules"
  ON recurring_schedules FOR INSERT
  WITH CHECK (studio_id = auth.uid());

CREATE POLICY "Studios can update their own schedules"
  ON recurring_schedules FOR UPDATE
  USING (studio_id = auth.uid())
  WITH CHECK (studio_id = auth.uid());

CREATE POLICY "Studios can delete their own schedules"
  ON recurring_schedules FOR DELETE
  USING (studio_id = auth.uid());

-- RLS Policies for schedule_assignments
CREATE POLICY "Studios can view their schedule assignments"
  ON schedule_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recurring_schedules 
    WHERE id = recurring_schedule_id AND studio_id = auth.uid()
  ) OR assigned_instructor_id = auth.uid());

CREATE POLICY "Studios can create assignments"
  ON schedule_assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recurring_schedules 
    WHERE id = recurring_schedule_id AND studio_id = auth.uid()
  ));

CREATE POLICY "Studios can update assignments"
  ON schedule_assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recurring_schedules 
    WHERE id = recurring_schedule_id AND studio_id = auth.uid()
  ));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recurring_schedules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_schedules_update_timestamp
  BEFORE UPDATE ON recurring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_schedules_timestamp();

CREATE OR REPLACE FUNCTION update_schedule_assignments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_assignments_update_timestamp
  BEFORE UPDATE ON schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_assignments_timestamp();
