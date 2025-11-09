-- FIX NULL STATUS VALUES
-- Run this to fix any NULL status fields that might be blocking data from displaying

-- Fix jobs with NULL status
UPDATE jobs
SET status = 'open'
WHERE status IS NULL;

-- Fix cover requests with NULL status
UPDATE cover_requests  
SET status = 'open'
WHERE status IS NULL;

-- Fix applications with NULL status
UPDATE job_applications
SET status = 'pending'
WHERE status IS NULL;

UPDATE applications
SET status = 'pending'
WHERE status IS NULL;

-- Verify fixes
SELECT 'Jobs fixed' as action, COUNT(*) as count
FROM jobs
WHERE status = 'open'
UNION ALL
SELECT 'Covers fixed', COUNT(*)
FROM cover_requests
WHERE status = 'open';
