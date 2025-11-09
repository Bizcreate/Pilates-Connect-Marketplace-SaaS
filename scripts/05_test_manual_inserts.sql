-- TEST MANUAL DATA INSERTION
-- Use this to manually test if data can be inserted
-- Replace the UUIDs with actual user IDs from your auth.users table

-- First, check existing auth users
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check existing profiles
SELECT 
  id,
  email,
  user_type,
  display_name,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check if profiles are missing for any auth users
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'user_type' as user_type,
  p.id as profile_exists
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- If profiles are missing, create them manually
-- (Replace the UUID with actual user ID)
-- INSERT INTO profiles (id, email, user_type, created_at, updated_at)
-- SELECT 
--   id, 
--   email, 
--   COALESCE(raw_user_meta_data->>'user_type', 'instructor'),
--   NOW(),
--   NOW()
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles);
