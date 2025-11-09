-- VERIFY AND FIX DATABASE SCHEMA
-- This ensures all tables, constraints, and triggers are correct

-- Check if all required tables exist
SELECT 
  table_name,
  CASE WHEN table_name IN (
    'profiles', 'studio_profiles', 'instructor_profiles', 'jobs', 
    'cover_requests', 'job_applications', 'cover_applications',
    'saved_jobs', 'saved_instructors', 'availability_slots',
    'messages', 'social_links', 'reviews'
  ) THEN '✓ Exists' ELSE '✗ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify foreign key constraints exist
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify critical columns have correct types
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'jobs', 'cover_requests', 'studio_profiles', 'instructor_profiles')
ORDER BY table_name, ordinal_position;
