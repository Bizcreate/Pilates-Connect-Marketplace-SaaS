-- Check if user exists in profiles table
SELECT 
  id,
  email,
  display_name,
  user_type,
  created_at
FROM profiles
WHERE email = 'jay.perace23@gmail.com';

-- Check if studio profile exists
SELECT 
  sp.*,
  p.email,
  p.user_type
FROM studio_profiles sp
JOIN profiles p ON sp.id = p.id
WHERE p.email = 'jay.perace23@gmail.com';

-- Check all studio users
SELECT 
  id,
  email,
  display_name,
  user_type,
  created_at
FROM profiles
WHERE user_type = 'studio'
ORDER BY created_at DESC;
