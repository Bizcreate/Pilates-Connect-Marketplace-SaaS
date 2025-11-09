-- CHECK CURRENT DATA
-- Run this to see what data exists in your database

-- Check all profiles
SELECT 
    'Total Profiles' as metric,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 'Studio Profiles', COUNT(*) FROM profiles WHERE user_type = 'studio'
UNION ALL
SELECT 'Instructor Profiles', COUNT(*) FROM profiles WHERE user_type = 'instructor'
UNION ALL
SELECT 'Instructor Details', COUNT(*) FROM instructor_profiles
UNION ALL
SELECT 'Studio Details', COUNT(*) FROM studio_profiles;

-- Check jobs and status
SELECT 
    'Total Jobs' as metric,
    COUNT(*) as count
FROM jobs
UNION ALL
SELECT 'Open Jobs', COUNT(*) FROM jobs WHERE status = 'open'
UNION ALL
SELECT 'Jobs with NULL status', COUNT(*) FROM jobs WHERE status IS NULL
UNION ALL
SELECT 'Closed Jobs', COUNT(*) FROM jobs WHERE status = 'closed';

-- Check cover requests
SELECT 
    'Total Cover Requests' as metric,
    COUNT(*) as count
FROM cover_requests
UNION ALL
SELECT 'Open Covers', COUNT(*) FROM cover_requests WHERE status = 'open'
UNION ALL
SELECT 'Covers with NULL status', COUNT(*) FROM cover_requests WHERE status IS NULL;

-- Check availability slots
SELECT 
    'Total Availability Slots' as metric,
    COUNT(*) as count
FROM availability_slots
UNION ALL
SELECT 'Available Slots', COUNT(*) FROM availability_slots WHERE is_available = true;

-- Show actual job data (limited)
SELECT 
    j.id,
    j.title,
    j.status,
    j.job_type,
    p.display_name as studio_name,
    j.created_at
FROM jobs j
LEFT JOIN profiles p ON j.studio_id = p.id
ORDER BY j.created_at DESC
LIMIT 10;

-- Show actual instructor data (limited)
SELECT 
    p.id,
    p.display_name,
    p.user_type,
    ip.years_experience,
    ip.hourly_rate_min,
    ip.hourly_rate_max
FROM profiles p
LEFT JOIN instructor_profiles ip ON p.id = ip.id
WHERE p.user_type = 'instructor'
LIMIT 10;
