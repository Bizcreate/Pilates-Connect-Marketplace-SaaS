-- Repair Missing Instructor and Studio Detail Profiles
-- This script creates missing instructor_profiles and studio_profiles records
-- for users who have profiles but no detail records

-- Create missing instructor_profiles for instructors
INSERT INTO instructor_profiles (id, years_experience, hourly_rate_min, hourly_rate_max, certifications, specializations, equipment, availability_status)
SELECT 
  p.id,
  0 as years_experience,
  60 as hourly_rate_min,
  80 as hourly_rate_max,
  ARRAY[]::text[] as certifications,
  ARRAY[]::text[] as specializations,
  ARRAY[]::text[] as equipment,
  'available' as availability_status
FROM profiles p
LEFT JOIN instructor_profiles ip ON p.id = ip.id
WHERE p.user_type = 'instructor' AND ip.id IS NULL;

-- Create missing studio_profiles for studios
INSERT INTO studio_profiles (id, studio_name, equipment_available, studio_size)
SELECT 
  p.id,
  p.display_name as studio_name,
  ARRAY[]::text[] as equipment_available,
  NULL as studio_size
FROM profiles p
LEFT JOIN studio_profiles sp ON p.id = sp.id
WHERE p.user_type = 'studio' AND sp.id IS NULL;

-- Verify the repair
SELECT 
  'Instructor profiles created:' as message,
  COUNT(*) as count
FROM instructor_profiles
UNION ALL
SELECT 
  'Studio profiles created:' as message,
  COUNT(*) as count
FROM studio_profiles;
