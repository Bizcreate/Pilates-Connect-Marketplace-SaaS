-- Check if authentication is properly configured
-- This script helps diagnose authentication issues

-- Check if there are any users in the auth.users table
SELECT 
  'Total Users' as check_type,
  COUNT(*) as count
FROM auth.users;

-- Check if there are profiles for all users
SELECT 
  'Users without profiles' as check_type,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Check RLS policies on profiles table
SELECT 
  'Profiles RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check RLS policies on job_applications table
SELECT 
  'Job Applications RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'job_applications';
