-- Fix RLS policy to allow instructors to accept cover requests
-- This allows instructors to update cover_requests when accepting them

-- Drop the existing policy that only allows studios to manage cover requests
DROP POLICY IF EXISTS "Studios can manage own cover requests" ON cover_requests;

-- Create new policies with more granular permissions
-- Studios can do everything with their own cover requests
CREATE POLICY "Studios can manage own cover requests"
ON cover_requests
FOR ALL
TO authenticated
USING (auth.uid() = studio_id)
WITH CHECK (auth.uid() = studio_id);

-- Instructors can accept open cover requests (update to add themselves)
CREATE POLICY "Instructors can accept cover requests"
ON cover_requests
FOR UPDATE
TO authenticated
USING (
  status = 'open' 
  AND instructor_id IS NULL
)
WITH CHECK (
  auth.uid() = instructor_id 
  AND status = 'filled'
);

-- Instructors can view cover requests they've accepted
CREATE POLICY "Instructors can view accepted cover requests"
ON cover_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = instructor_id 
  OR status = 'open'
);
