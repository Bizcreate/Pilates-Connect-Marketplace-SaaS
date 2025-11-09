-- PILATES CONNECT - Complete Data Reset
-- This resets all data while preserving schema and RLS policies
-- Run this in your Pilates Connect Supabase SQL Editor

-- Temporarily disable RLS to allow deletion
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE casual_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE cover_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE studio_profiles DISABLE ROW LEVEL SECURITY;

-- Delete all data (order matters for foreign keys)
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM referrals;
DELETE FROM applications;
DELETE FROM job_applications;
DELETE FROM availability_slots;
DELETE FROM casual_postings;
DELETE FROM cover_requests;
DELETE FROM jobs;
DELETE FROM notification_preferences;
DELETE FROM instructor_profiles;
DELETE FROM studio_profiles;
DELETE FROM profiles;

-- Re-enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE casual_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_profiles ENABLE ROW LEVEL SECURITY;

-- Verify reset
SELECT 
  'applications' as table_name, COUNT(*) as remaining_records FROM applications
UNION ALL SELECT 'availability_slots', COUNT(*) FROM availability_slots
UNION ALL SELECT 'casual_postings', COUNT(*) FROM casual_postings
UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL SELECT 'cover_requests', COUNT(*) FROM cover_requests
UNION ALL SELECT 'instructor_profiles', COUNT(*) FROM instructor_profiles
UNION ALL SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'notification_preferences', COUNT(*) FROM notification_preferences
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL SELECT 'studio_profiles', COUNT(*) FROM studio_profiles;
