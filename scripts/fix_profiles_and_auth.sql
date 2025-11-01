-- Fix profiles table and ensure all auth users have profiles with correct user_type

-- Step 1: Check if profiles exist for all auth users and create missing ones
-- This will create profiles for existing auth users who don't have one yet
-- We'll set user_type based on their email domain or default to 'instructor'
INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  -- Try to get user_type from raw_user_meta_data, default to 'instructor' if not found
  COALESCE(
    au.raw_user_meta_data->>'user_type',
    'instructor'
  ) as user_type,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 2: Update any profiles that have NULL user_type
-- Set them to 'instructor' as default
UPDATE public.profiles
SET user_type = 'instructor'
WHERE user_type IS NULL;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value TEXT;
  display_name_value TEXT;
  location_value TEXT;
  phone_value TEXT;
  bio_value TEXT;
BEGIN
  -- Extract user_type from metadata, default to 'instructor' if not provided
  user_type_value := COALESCE(NEW.raw_user_meta_data->>'user_type', 'instructor');
  display_name_value := NEW.raw_user_meta_data->>'display_name';
  location_value := NEW.raw_user_meta_data->>'location';
  phone_value := NEW.raw_user_meta_data->>'phone';
  bio_value := NEW.raw_user_meta_data->>'bio';

  -- Create profile in profiles table
  INSERT INTO public.profiles (
    id,
    email,
    user_type,
    display_name,
    location,
    phone,
    bio,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_type_value,
    display_name_value,
    location_value,
    phone_value,
    bio_value,
    NOW(),
    NOW()
  );

  -- Create type-specific profile based on user_type
  IF user_type_value = 'instructor' THEN
    INSERT INTO public.instructor_profiles (
      id,
      equipment,
      certifications,
      years_experience,
      hourly_rate_min,
      hourly_rate_max,
      availability_status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'equipment')::TEXT[], ARRAY[]::TEXT[]),
      COALESCE((NEW.raw_user_meta_data->>'certifications')::TEXT[], ARRAY[]::TEXT[]),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
      COALESCE((NEW.raw_user_meta_data->>'hourly_rate_min')::INTEGER, NULL),
      COALESCE((NEW.raw_user_meta_data->>'hourly_rate_max')::INTEGER, NULL),
      'available',
      NOW(),
      NOW()
    );
  ELSIF user_type_value = 'studio' THEN
    INSERT INTO public.studio_profiles (
      id,
      studio_name,
      email,
      phone,
      description,
      equipment_available,
      website,
      social_links,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'studio_name',
      NEW.email,
      phone_value,
      bio_value,
      COALESCE((NEW.raw_user_meta_data->>'equipment')::TEXT[], ARRAY[]::TEXT[]),
      NEW.raw_user_meta_data->>'website',
      jsonb_build_object(
        'instagram', NEW.raw_user_meta_data->>'instagram'
      ),
      NOW(),
      NOW()
    );
  END IF;

  -- Create default notification preferences
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
  ) VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify the setup
-- This will show you all users and their profile status
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.user_type,
  p.display_name,
  CASE 
    WHEN p.id IS NULL THEN 'NO PROFILE'
    WHEN p.user_type IS NULL THEN 'NULL USER_TYPE'
    ELSE 'OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
