-- Check Current Data in Database
-- Run this to see what data currently exists

-- Check profiles
SELECT 
  id,
  email,
  user_type,
  display_name,
  location,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check studio profiles
SELECT 
  id,
  studio_name,
  suburb,
  state,
  postcode,
  created_at
FROM studio_profiles
ORDER BY created_at DESC;

-- Check instructor profiles  
SELECT 
  id,
  years_experience,
  certifications,
  specializations,
  hourly_rate_min,
  hourly_rate_max,
  availability_status,
  created_at
FROM instructor_profiles
ORDER BY created_at DESC;

-- Check jobs
SELECT 
  id,
  studio_id,
  title,
  job_type,
  status,
  location,
  created_at
FROM jobs
ORDER BY created_at DESC;

-- Check cover requests
SELECT 
  id,
  studio_id,
  instructor_id,
  date,
  start_time,
  end_time,
  class_type,
  status,
  created_at
FROM cover_requests
ORDER BY created_at DESC;

-- Check availability slots
SELECT 
  id,
  instructor_id,
  start_time,
  end_time,
  is_available,
  created_at
FROM availability_slots
ORDER BY created_at DESC;

-- Get summary counts
SELECT 'Total Profiles' as metric, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Total Studios', COUNT(*) FROM studio_profiles
UNION ALL
SELECT 'Total Instructors', COUNT(*) FROM instructor_profiles
UNION ALL
SELECT 'Total Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Total Cover Requests', COUNT(*) FROM cover_requests
UNION ALL
SELECT 'Total Availability Slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'Total Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Total Job Applications', COUNT(*) FROM job_applications;
