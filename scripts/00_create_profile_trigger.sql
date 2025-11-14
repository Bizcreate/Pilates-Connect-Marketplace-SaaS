-- Create trigger to auto-create profiles when user signs up
-- This runs with elevated privileges (SECURITY DEFINER) so it bypasses RLS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'instructor'),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'location', NULL),
    COALESCE(new.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(new.raw_user_meta_data ->> 'bio', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- If instructor, create instructor_profiles
  IF COALESCE(new.raw_user_meta_data ->> 'user_type', 'instructor') = 'instructor' THEN
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
      new.id,
      CASE 
        WHEN new.raw_user_meta_data ->> 'equipment' IS NOT NULL 
        THEN string_to_array(TRIM(BOTH '[]' FROM (new.raw_user_meta_data ->> 'equipment')), ',')
        ELSE ARRAY[]::text[]
      END,
      CASE 
        WHEN new.raw_user_meta_data ->> 'certifications' IS NOT NULL 
        THEN string_to_array(TRIM(BOTH '[]' FROM (new.raw_user_meta_data ->> 'certifications')), ',')
        ELSE ARRAY[]::text[]
      END,
      COALESCE((new.raw_user_meta_data ->> 'years_experience')::integer, 0),
      COALESCE((new.raw_user_meta_data ->> 'hourly_rate_min')::integer, NULL),
      COALESCE((new.raw_user_meta_data ->> 'hourly_rate_max')::integer, NULL),
      'available'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- If studio, create studio_profiles
  IF COALESCE(new.raw_user_meta_data ->> 'user_type', '') = 'studio' THEN
    INSERT INTO public.studio_profiles (
      id,
      studio_name,
      equipment_available,
      website
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'studio_name', 'My Studio'),
      CASE 
        WHEN new.raw_user_meta_data ->> 'equipment' IS NOT NULL 
        THEN string_to_array(TRIM(BOTH '[]' FROM (new.raw_user_meta_data ->> 'equipment')), ',')
        ELSE ARRAY[]::text[]
      END,
      COALESCE(new.raw_user_meta_data ->> 'website', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
