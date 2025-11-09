-- Comprehensive diagnostics for Pilates Connect

-- Check all jobs and their status
SELECT 
  'JOBS' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_count
FROM jobs;

-- Show sample jobs with their studio details
SELECT 
  id,
  title,
  job_type,
  status,
  studio_id,
  created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 5;

-- Check cover requests
SELECT 
  'COVER_REQUESTS' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
  COUNT(CASE WHEN instructor_id IS NULL THEN 1 END) as unassigned_count
FROM cover_requests;

-- Check instructor profiles
SELECT 
  'INSTRUCTOR_PROFILES' as table_name,
  COUNT(DISTINCT ip.id) as profile_count,
  COUNT(DISTINCT p.id) as instructor_users_count
FROM instructor_profiles ip
FULL OUTER JOIN profiles p ON p.id = ip.id AND p.user_type = 'instructor';

-- Show instructor profile details
SELECT 
  p.id,
  p.display_name,
  p.email,
  p.location,
  p.user_type,
  ip.years_experience,
  ip.hourly_rate_min,
  ip.hourly_rate_max,
  ip.certifications,
  ip.availability_status
FROM profiles p
LEFT JOIN instructor_profiles ip ON ip.id = p.id
WHERE p.user_type = 'instructor'
ORDER BY p.created_at DESC
LIMIT 5;

-- Fix any jobs with NULL status (set to 'open')
UPDATE jobs
SET status = 'open'
WHERE status IS NULL;

-- Fix any cover requests with NULL status
UPDATE cover_requests
SET status = 'open'
WHERE status IS NULL;

-- Show final counts
SELECT 
  'FINAL_COUNTS' as summary,
  (SELECT COUNT(*) FROM jobs WHERE status = 'open') as open_jobs,
  (SELECT COUNT(*) FROM cover_requests WHERE status = 'open' AND instructor_id IS NULL) as available_covers,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'instructor') as total_instructors,
  (SELECT COUNT(*) FROM instructor_profiles) as instructor_profiles_count;
