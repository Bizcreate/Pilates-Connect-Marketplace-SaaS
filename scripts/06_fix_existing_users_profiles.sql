-- This script creates missing profile records for users who were created before the trigger was set up
-- Run this ONCE to backfill profiles for existing users

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all auth.users who don't have a profile yet
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    RAISE NOTICE 'Creating profile for user: % (%)', user_record.email, user_record.id;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
      id,
      user_type,
      email,
      display_name,
      location,
      phone,
      bio
    )
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data ->> 'user_type', 'instructor'),
      user_record.email,
      COALESCE(user_record.raw_user_meta_data ->> 'display_name', user_record.raw_user_meta_data ->> 'studio_name'),
      COALESCE(user_record.raw_user_meta_data ->> 'location', NULL),
      COALESCE(user_record.raw_user_meta_data ->> 'phone', NULL),
      COALESCE(user_record.raw_user_meta_data ->> 'bio', NULL)
    )
    ON CONFLICT (id) DO NOTHING;

    -- If instructor user_type, create instructor_profiles
    IF COALESCE(user_record.raw_user_meta_data ->> 'user_type', 'instructor') = 'instructor' THEN
      INSERT INTO public.instructor_profiles (
        id,
        equipment,
        certifications,
        years_experience,
        hourly_rate_min,
        hourly_rate_max,
        availability_status
      )
      VALUES (
        user_record.id,
        COALESCE(
          CASE 
            WHEN jsonb_typeof(user_record.raw_user_meta_data -> 'equipment') = 'array' 
            THEN ARRAY(SELECT jsonb_array_elements_text(user_record.raw_user_meta_data -> 'equipment'))
            ELSE ARRAY[]::text[]
          END,
          ARRAY[]::text[]
        ),
        COALESCE(
          CASE 
            WHEN jsonb_typeof(user_record.raw_user_meta_data -> 'certifications') = 'array' 
            THEN ARRAY(SELECT jsonb_array_elements_text(user_record.raw_user_meta_data -> 'certifications'))
            ELSE ARRAY[]::text[]
          END,
          ARRAY[]::text[]
        ),
        COALESCE((user_record.raw_user_meta_data ->> 'years_experience')::integer, 0),
        COALESCE((user_record.raw_user_meta_data ->> 'hourly_rate_min')::integer, NULL),
        COALESCE((user_record.raw_user_meta_data ->> 'hourly_rate_max')::integer, NULL),
        'available'
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;

    -- If studio user_type, create studio_profiles
    IF COALESCE(user_record.raw_user_meta_data ->> 'user_type', '') = 'studio' THEN
      INSERT INTO public.studio_profiles (
        id,
        studio_name,
        equipment_available,
        website
      )
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data ->> 'studio_name', 'My Studio'),
        COALESCE(
          CASE 
            WHEN jsonb_typeof(user_record.raw_user_meta_data -> 'equipment') = 'array' 
            THEN ARRAY(SELECT jsonb_array_elements_text(user_record.raw_user_meta_data -> 'equipment'))
            ELSE ARRAY[]::text[]
          END,
          ARRAY[]::text[]
        ),
        COALESCE(user_record.raw_user_meta_data ->> 'website', NULL)
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Verify the fix worked
SELECT 
  u.email,
  u.id as user_id,
  p.id as profile_id,
  p.user_type,
  p.display_name,
  ip.id as instructor_profile_id,
  sp.id as studio_profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.instructor_profiles ip ON u.id = ip.id
LEFT JOIN public.studio_profiles sp ON u.id = sp.id
ORDER BY u.created_at DESC;
