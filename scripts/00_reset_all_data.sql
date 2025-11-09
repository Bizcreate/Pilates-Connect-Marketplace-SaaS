-- RESET ALL USER DATA
-- This will delete all user-created records but preserve the table structure and RLS policies
-- Run this before starting fresh with new test data

-- Delete in order to respect foreign key constraints

-- Step 1: Delete applications first (references jobs and instructors)
DELETE FROM job_applications;
DELETE FROM applications;

-- Step 2: Delete messages and conversations
DELETE FROM messages;
DELETE FROM conversations;

-- Step 3: Delete availability slots
DELETE FROM availability_slots;

-- Step 4: Delete jobs and cover requests (reference studios)
DELETE FROM jobs;
DELETE FROM cover_requests;
DELETE FROM casual_postings;

-- Step 5: Delete referrals
DELETE FROM referrals;

-- Step 6: Delete notification preferences
DELETE FROM notification_preferences;

-- Step 7: Delete profile extensions
DELETE FROM instructor_profiles;
DELETE FROM studio_profiles;

-- Step 8: Delete main profiles (will cascade to auth.users if configured)
DELETE FROM profiles;

-- Verify all tables are empty
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'instructor_profiles', COUNT(*) FROM instructor_profiles
UNION ALL
SELECT 'studio_profiles', COUNT(*) FROM studio_profiles
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'cover_requests', COUNT(*) FROM cover_requests
UNION ALL
SELECT 'availability_slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Reset sequences (if needed)
-- Note: UUIDs don't use sequences, so this is just for reference
