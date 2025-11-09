-- Test Manual Data Insertion
-- Use this to manually test if data can be inserted (run as authenticated user or service role)

-- NOTE: Replace the UUIDs below with actual user IDs from your auth.users table
-- To get user IDs, run: SELECT id, email FROM auth.users;

-- Example: Insert test profile (replace 'YOUR_USER_ID_HERE' with actual UUID)
-- INSERT INTO profiles (id, email, user_type, display_name, created_at, updated_at)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'test@example.com',
--   'studio',
--   'Test Studio',
--   NOW(),
--   NOW()
-- );

-- Example: Insert test studio profile
-- INSERT INTO studio_profiles (id, studio_name, created_at, updated_at)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'Test Studio Name',
--   NOW(),
--   NOW()
-- );

-- Example: Insert test job
-- INSERT INTO jobs (
--   id,
--   studio_id,
--   title,
--   description,
--   job_type,
--   status,
--   location,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'YOUR_STUDIO_USER_ID_HERE',
--   'Test Pilates Instructor',
--   'Looking for a certified Pilates instructor',
--   'full-time',
--   'open',
--   'Sydney, NSW',
--   NOW(),
--   NOW()
-- );

-- After inserting, verify the data
SELECT * FROM profiles;
SELECT * FROM studio_profiles;
SELECT * FROM instructor_profiles;
SELECT * FROM jobs;
SELECT * FROM cover_requests;
