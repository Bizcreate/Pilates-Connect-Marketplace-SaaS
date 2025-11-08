-- Check existing jobs and their status
SELECT id, title, status, studio_id, created_at 
FROM jobs 
ORDER BY created_at DESC;

-- Check cover requests
SELECT id, date, class_type, status, studio_id, created_at 
FROM cover_requests 
ORDER BY created_at DESC;

-- Check instructor profiles
SELECT ip.id, ip.availability_status, p.display_name, p.location
FROM instructor_profiles ip
JOIN profiles p ON ip.id = p.id
ORDER BY ip.created_at DESC;

-- If jobs exist but have NULL status, update them to 'open'
UPDATE jobs 
SET status = 'open' 
WHERE status IS NULL;

-- If cover requests exist but have NULL status, update them to 'open'
UPDATE cover_requests 
SET status = 'open' 
WHERE status IS NULL AND instructor_id IS NULL;
