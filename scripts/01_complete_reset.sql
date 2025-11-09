-- COMPLETE DATABASE RESET
-- This will delete ALL data from all tables
-- Run this to start fresh

-- All 13 tables: profiles, studio_profiles, instructor_profiles, jobs, casual_postings,
-- cover_requests, applications, job_applications, availability_slots, messages, 
-- conversations, referrals, notification_preferences

-- Disable RLS temporarily for cleanup
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instructor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS casual_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cover_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS availability_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_preferences DISABLE ROW LEVEL SECURITY;

-- Delete all data (order matters due to foreign keys)
-- Start with tables that have foreign keys to others
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM applications;
DELETE FROM job_applications;
DELETE FROM referrals;
DELETE FROM notification_preferences;
DELETE FROM availability_slots;
DELETE FROM cover_requests;
DELETE FROM casual_postings;
DELETE FROM jobs;
DELETE FROM instructor_profiles;
DELETE FROM studio_profiles;
DELETE FROM profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE casual_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 'Profiles' as table_name, COUNT(*) as remaining_records FROM profiles
UNION ALL
SELECT 'Studio Profiles', COUNT(*) FROM studio_profiles
UNION ALL
SELECT 'Instructor Profiles', COUNT(*) FROM instructor_profiles
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Casual Postings', COUNT(*) FROM casual_postings
UNION ALL
SELECT 'Cover Requests', COUNT(*) FROM cover_requests
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Job Applications', COUNT(*) FROM job_applications
UNION ALL
SELECT 'Availability Slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'Notification Preferences', COUNT(*) FROM notification_preferences;
