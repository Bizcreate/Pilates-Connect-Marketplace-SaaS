-- CREATE TRIGGERS TO AUTO-CREATE PROFILE RECORDS
-- This ensures profiles, studio_profiles, and instructor_profiles are created automatically

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table (this should happen automatically)
  INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'instructor'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user is a studio, create studio_profile
  IF (NEW.raw_user_meta_data->>'user_type' = 'studio') THEN
    INSERT INTO public.studio_profiles (id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- If user is an instructor, create instructor_profile
  IF (NEW.raw_user_meta_data->>'user_type' = 'instructor') THEN
    INSERT INTO public.instructor_profiles (
      id,
      availability_status,
      years_experience,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      'available',
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY event_object_table, trigger_name;
