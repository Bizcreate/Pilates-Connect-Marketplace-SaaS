-- Fix all RLS policies to ensure data is visible to authenticated users
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Fix JOBS table policies
-- ============================================
DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Studios can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Studios can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Studios can delete own jobs" ON jobs;

CREATE POLICY "Anyone can view active jobs"
ON jobs FOR SELECT
USING (status = 'open' OR auth.uid() = studio_id);

CREATE POLICY "Studios can insert own jobs"
ON jobs FOR INSERT
WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Studios can update own jobs"
ON jobs FOR UPDATE
USING (auth.uid() = studio_id);

CREATE POLICY "Studios can delete own jobs"
ON jobs FOR DELETE
USING (auth.uid() = studio_id);

-- ============================================
-- 2. Fix COVER_REQUESTS table policies  
-- ============================================
DROP POLICY IF EXISTS "Public cover requests are viewable" ON cover_requests;
DROP POLICY IF EXISTS "Studios can manage own cover requests" ON cover_requests;

CREATE POLICY "Anyone can view active cover requests"
ON cover_requests FOR SELECT
USING (
  status = 'open' 
  OR auth.uid() = studio_id 
  OR auth.uid() = instructor_id
);

CREATE POLICY "Studios can manage own cover requests"
ON cover_requests FOR ALL
USING (auth.uid() = studio_id);

CREATE POLICY "Instructors can accept cover requests"
ON cover_requests FOR UPDATE
USING (status = 'open' AND instructor_id IS NULL);

-- ============================================
-- 3. Fix INSTRUCTOR_PROFILES table policies
-- ============================================
DROP POLICY IF EXISTS "Public instructor profiles are viewable" ON instructor_profiles;
DROP POLICY IF EXISTS "Instructors can insert own profile" ON instructor_profiles;
DROP POLICY IF EXISTS "Instructors can update own profile" ON instructor_profiles;

CREATE POLICY "Anyone can view instructor profiles"
ON instructor_profiles FOR SELECT
USING (true);

CREATE POLICY "Instructors can insert own profile"
ON instructor_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Instructors can update own profile"
ON instructor_profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 4. Fix STUDIO_PROFILES table policies
-- ============================================
DROP POLICY IF EXISTS "Public studio profiles are viewable" ON studio_profiles;
DROP POLICY IF EXISTS "Studios can insert own profile" ON studio_profiles;
DROP POLICY IF EXISTS "Studios can update own profile" ON studio_profiles;

CREATE POLICY "Anyone can view studio profiles"
ON studio_profiles FOR SELECT
USING (true);

CREATE POLICY "Studios can insert own profile"
ON studio_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Studios can update own profile"
ON studio_profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 5. Fix PROFILES table policies
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 6. Fix JOB_APPLICATIONS table policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;
DROP POLICY IF EXISTS "Instructors can insert own applications" ON job_applications;
DROP POLICY IF EXISTS "Instructors can update own applications" ON job_applications;
DROP POLICY IF EXISTS "Studios can update applications for their jobs" ON job_applications;

CREATE POLICY "Instructors can view own applications"
ON job_applications FOR SELECT
USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can view applications for their jobs"
ON job_applications FOR SELECT
USING (
  auth.uid() IN (
    SELECT studio_id FROM jobs WHERE jobs.id = job_applications.job_id
  )
);

CREATE POLICY "Instructors can insert own applications"
ON job_applications FOR INSERT
WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own applications"
ON job_applications FOR UPDATE
USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can update applications for their jobs"
ON job_applications FOR UPDATE
USING (
  auth.uid() IN (
    SELECT studio_id FROM jobs WHERE jobs.id = job_applications.job_id
  )
);

-- ============================================
-- 7. Fix AVAILABILITY_SLOTS table policies
-- ============================================
DROP POLICY IF EXISTS "Public availability is viewable" ON availability_slots;
DROP POLICY IF EXISTS "Instructors can manage own availability" ON availability_slots;

CREATE POLICY "Anyone can view availability"
ON availability_slots FOR SELECT
USING (is_available = true OR auth.uid() = instructor_id);

CREATE POLICY "Instructors can manage own availability"
ON availability_slots FOR ALL
USING (auth.uid() = instructor_id);

-- ============================================
-- Verify all policies are created
-- ============================================
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
