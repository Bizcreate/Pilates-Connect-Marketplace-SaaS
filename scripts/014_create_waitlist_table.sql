-- Create waitlist table for marketing page
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('studio', 'instructor')),
  created_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_type ON waitlist(user_type);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow admins to read all
CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
