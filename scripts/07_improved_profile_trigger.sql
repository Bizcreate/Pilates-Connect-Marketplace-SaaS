-- Improved trigger with better error handling and logging
-- This replaces the existing trigger with a more robust version

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
  v_equipment text[];
  v_certifications text[];
BEGIN
  -- Extract user_type with fallback to 'instructor'
  v_user_type := COALESCE(new.raw_user_meta_data ->> 'user_type', 'instructor');
  
  RAISE NOTICE 'Creating profile for user % with type %', new.email, v_user_type;

  -- Parse equipment array
  v_equipment := CASE 
    WHEN jsonb_typeof(new.raw_user_meta_data -> 'equipment') = 'array' 
    THEN ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data -> 'equipment'))
    ELSE ARRAY[]::text[]
  END;

  -- Parse certifications array
  v_certifications := CASE 
    WHEN jsonb_typeof(new.raw_user_meta_data -> 'certifications') = 'array' 
    THEN ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data -> 'certifications'))
    ELSE ARRAY[]::text[]
  END;

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
    v_user_type,
    new.email,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name', 
      new.raw_user_meta_data ->> 'studio_name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data ->> 'location', NULL),
    COALESCE(new.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(new.raw_user_meta_data ->> 'bio', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    location = COALESCE(EXCLUDED.location, public.profiles.location),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    bio = COALESCE(EXCLUDED.bio, public.profiles.bio);

  -- If instructor, create instructor_profiles
  IF v_user_type = 'instructor' THEN
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
      v_equipment,
      v_certifications,
      COALESCE((new.raw_user_meta_data ->> 'years_experience')::integer, 0),
      COALESCE((new.raw_user_meta_data ->> 'hourly_rate_min')::integer, NULL),
      COALESCE((new.raw_user_meta_data ->> 'hourly_rate_max')::integer, NULL),
      'available'
    )
    ON CONFLICT (id) DO UPDATE SET
      equipment = COALESCE(EXCLUDED.equipment, public.instructor_profiles.equipment),
      certifications = COALESCE(EXCLUDED.certifications, public.instructor_profiles.certifications);
  END IF;

  -- If studio, create studio_profiles
  IF v_user_type = 'studio' THEN
    INSERT INTO public.studio_profiles (
      id,
      studio_name,
      equipment_available,
      website,
      address,
      suburb,
      state,
      postcode
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'studio_name', 'My Studio'),
      v_equipment,
      COALESCE(new.raw_user_meta_data ->> 'website', NULL),
      COALESCE(new.raw_user_meta_data ->> 'address', NULL),
      COALESCE(new.raw_user_meta_data ->> 'suburb', NULL),
      COALESCE(new.raw_user_meta_data ->> 'state', NULL),
      COALESCE(new.raw_user_meta_data ->> 'postcode', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
      studio_name = COALESCE(EXCLUDED.studio_name, public.studio_profiles.studio_name),
      equipment_available = COALESCE(EXCLUDED.equipment_available, public.studio_profiles.equipment_available),
      website = COALESCE(EXCLUDED.website, public.studio_profiles.website);
  END IF;

  RAISE NOTICE 'Successfully created profile for user %', new.email;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', new.email, SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
