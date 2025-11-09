-- Diagnostic script to test Supabase data connectivity
-- This will help us see what data exists in your database

-- Check all tables for data
SELECT 'studio_profiles' as table_name, COUNT(*) as row_count FROM studio_profiles
UNION ALL
SELECT 'instructor_profiles', COUNT(*) FROM instructor_profiles
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'cover_requests', COUNT(*) FROM cover_requests
UNION ALL
SELECT 'availability_slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- Show actual data from each table
SELECT '--- STUDIO PROFILES ---' as section;
SELECT * FROM studio_profiles;

SELECT '--- INSTRUCTOR PROFILES ---' as section;
SELECT * FROM instructor_profiles;

SELECT '--- JOBS ---' as section;
SELECT * FROM jobs;

SELECT '--- COVER REQUESTS ---' as section;
SELECT * FROM cover_requests;

SELECT '--- AVAILABILITY SLOTS ---' as section;
SELECT * FROM availability_slots;

SELECT '--- USER PROFILES ---' as section;
SELECT id, email, display_name, user_type FROM profiles;
