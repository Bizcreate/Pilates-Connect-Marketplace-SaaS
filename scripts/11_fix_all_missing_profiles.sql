-- COMPLETE FIX: Create missing profile records for all Auth users
-- This script is safe to run multiple times

-- First, insert missing profiles for all Auth users
INSERT INTO profiles (id, email, user_type, display_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  -- Determine user type based on email domain or default to 'instructor'
  CASE 
    WHEN au.email LIKE '%lagreeontheroad%' THEN 'studio'
    WHEN au.email LIKE '%pearce%' THEN 'studio'
    ELSE 'instructor'
  END as user_type,
  SPLIT_PART(au.email, '@', 1) as display_name,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Now create instructor_profiles for all instructor-type profiles that don't have one
INSERT INTO instructor_profiles (
  id, 
  years_experience, 
  hourly_rate_min, 
  hourly_rate_max, 
  certifications, 
  equipment_owned,
  created_at,
  updated_at
)
SELECT 
  p.id,
  0 as years_experience,
  60 as hourly_rate_min,
  100 as hourly_rate_max,
  '[]'::jsonb as certifications,
  '[]'::jsonb as equipment_owned,
  NOW(),
  NOW()
FROM profiles p
LEFT JOIN instructor_profiles ip ON ip.id = p.id
WHERE p.user_type = 'instructor' AND ip.id IS NULL;

-- Create studio_profiles for all studio-type profiles that don't have one
INSERT INTO studio_profiles (
  id,
  studio_name,
  created_at,
  updated_at
)
SELECT 
  p.id,
  COALESCE(p.display_name, SPLIT_PART(p.email, '@', 1)) as studio_name,
  NOW(),
  NOW()
FROM profiles p
LEFT JOIN studio_profiles sp ON sp.id = p.id
WHERE p.user_type = 'studio' AND sp.id IS NULL;

-- Verify the fix worked
SELECT 
  p.email,
  p.user_type,
  CASE WHEN ip.id IS NOT NULL THEN '✓ Has instructor profile' ELSE '' END as instructor_status,
  CASE WHEN sp.id IS NOT NULL THEN '✓ Has studio profile' ELSE '' END as studio_status
FROM profiles p
LEFT JOIN instructor_profiles ip ON ip.id = p.id
LEFT JOIN studio_profiles sp ON sp.id = p.id
ORDER BY p.created_at DESC;
