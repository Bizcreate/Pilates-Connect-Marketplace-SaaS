-- Backfill missing profiles for existing auth users
-- This script creates profiles for users who have auth accounts but no profile records

-- Step 1: Create missing profiles from auth.users
-- This will look at the user's metadata to determine their user_type
INSERT INTO public.profiles (id, email, user_type, display_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  -- Get user_type from metadata, default to 'instructor' if not found
  COALESCE(
    au.raw_user_meta_data->>'user_type',
    'instructor'
  ) as user_type,
  -- Get display_name from metadata
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) as display_name,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create instructor_profiles for users with user_type = 'instructor'
INSERT INTO public.instructor_profiles (
  id,
  equipment,
  certifications,
  specializations,
  years_experience,
  hourly_rate_min,
  hourly_rate_max,
  availability_status,
  created_at,
  updated_at
)
SELECT 
  p.id,
  ARRAY[]::TEXT[],  -- empty equipment array
  ARRAY[]::TEXT[],  -- empty certifications array
  ARRAY[]::TEXT[],  -- empty specializations array
  0,                -- default years_experience
  NULL,             -- no min rate set
  NULL,             -- no max rate set
  'available',      -- default availability status
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.instructor_profiles ip ON p.id = ip.id
WHERE p.user_type = 'instructor' 
  AND ip.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create studio_profiles for users with user_type = 'studio'
INSERT INTO public.studio_profiles (
  id,
  studio_name,
  equipment_available,
  created_at,
  updated_at
)
SELECT 
  p.id,
  COALESCE(p.display_name, 'Studio'),  -- use display_name as studio_name
  ARRAY[]::TEXT[],  -- empty equipment array
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.studio_profiles sp ON p.id = sp.id
WHERE p.user_type = 'studio' 
  AND sp.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create default notification preferences for users who don't have them
INSERT INTO public.notification_preferences (
  user_id,
  email_messages,
  email_job_applications,
  email_cover_requests,
  email_job_matches,
  email_referrals,
  email_marketing,
  push_messages,
  push_job_applications,
  push_cover_requests,
  sms_urgent_covers,
  created_at,
  updated_at
)
SELECT 
  p.id,
  true,   -- email_messages
  true,   -- email_job_applications
  true,   -- email_cover_requests
  true,   -- email_job_matches
  true,   -- email_referrals
  false,  -- email_marketing
  true,   -- push_messages
  true,   -- push_job_applications
  true,   -- push_cover_requests
  false,  -- sms_urgent_covers
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.notification_preferences np ON p.id = np.user_id
WHERE np.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Verify the results
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'user_type' as metadata_user_type,
  p.user_type as profile_user_type,
  p.display_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.user_type = 'instructor' AND ip.id IS NULL THEN '⚠️  MISSING INSTRUCTOR PROFILE'
    WHEN p.user_type = 'studio' AND sp.id IS NULL THEN '⚠️  MISSING STUDIO PROFILE'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.instructor_profiles ip ON p.id = ip.id AND p.user_type = 'instructor'
LEFT JOIN public.studio_profiles sp ON p.id = sp.id AND p.user_type = 'studio'
ORDER BY au.created_at DESC;
