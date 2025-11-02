-- Allow instructors to accept open cover requests
-- This policy enables instructors to update cover_requests when accepting them

CREATE POLICY "Instructors can accept open cover requests"
ON cover_requests
FOR UPDATE
TO authenticated
USING (
  status = 'open'
  AND instructor_id IS NULL
)
WITH CHECK (
  status = 'filled'
  AND instructor_id = auth.uid()
);

-- Add comment explaining the policy
COMMENT ON POLICY "Instructors can accept open cover requests" ON cover_requests IS 
'Allows authenticated instructors to accept open cover requests by updating the status to filled and setting themselves as the instructor';
