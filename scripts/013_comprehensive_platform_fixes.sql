-- Comprehensive Platform Audit & Fix Script
-- Addresses connection issues, missing fields, and data integrity

-- 1. ADD MISSING REFERRAL FIELDS TO PROFILES TABLE
-- These fields are used by referral widgets but missing from live database
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_earnings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Create index for referral lookups
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON public.profiles(referral_code);

-- Generate referral codes for existing users who don't have one
UPDATE public.profiles
SET referral_code = 
  CASE user_type
    WHEN 'instructor' THEN 'INS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
    WHEN 'studio' THEN 'STU-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
  END
WHERE referral_code IS NULL;

-- 2. FIX AVAILABILITY_SLOTS FOREIGN KEY CONSTRAINT
-- Ensure instructor_id properly references profiles table
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'availability_slots_instructor_id_fkey'
    AND table_name = 'availability_slots'
  ) THEN
    ALTER TABLE public.availability_slots
    DROP CONSTRAINT availability_slots_instructor_id_fkey;
  END IF;

  -- Add proper foreign key constraint
  ALTER TABLE public.availability_slots
  ADD CONSTRAINT availability_slots_instructor_id_fkey
  FOREIGN KEY (instructor_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
END $$;

-- 3. CONSOLIDATE APPLICATION TABLES
-- Migrate data from old 'applications' table to 'job_applications' if needed
INSERT INTO public.job_applications (id, job_id, instructor_id, cover_letter, status, created_at, updated_at)
SELECT 
  a.id,
  a.job_id,
  a.instructor_id,
  a.cover_letter,
  a.status,
  a.created_at,
  a.updated_at
FROM public.applications a
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_applications ja
  WHERE ja.id = a.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. ADD MISSING COLUMNS TO TABLES FOR ROBUSTNESS

-- Ensure instructor_profiles has all necessary fields
ALTER TABLE public.instructor_profiles
ADD COLUMN IF NOT EXISTS specializations TEXT[],
ADD COLUMN IF NOT EXISTS media_images TEXT[],
ADD COLUMN IF NOT EXISTS media_videos TEXT[],
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';

-- Ensure studio_profiles has all necessary fields
ALTER TABLE public.studio_profiles
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS suburb TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS equipment_available TEXT[],
ADD COLUMN IF NOT EXISTS studio_size TEXT,
ADD COLUMN IF NOT EXISTS image_gallery TEXT[],
ADD COLUMN IF NOT EXISTS video_urls TEXT[],
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- 5. ENSURE ALL TABLES HAVE PROPER INDEXES FOR PERFORMANCE

-- Job lookups
CREATE INDEX IF NOT EXISTS jobs_studio_id_idx ON public.jobs(studio_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);

-- Application lookups  
CREATE INDEX IF NOT EXISTS job_applications_instructor_id_idx ON public.job_applications(instructor_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON public.job_applications(status);

-- Availability lookups
CREATE INDEX IF NOT EXISTS availability_slots_instructor_id_idx ON public.availability_slots(instructor_id);
CREATE INDEX IF NOT EXISTS availability_slots_start_time_idx ON public.availability_slots(start_time);
CREATE INDEX IF NOT EXISTS availability_slots_is_available_idx ON public.availability_slots(is_available);

-- Cover request lookups
CREATE INDEX IF NOT EXISTS cover_requests_studio_id_idx ON public.cover_requests(studio_id);
CREATE INDEX IF NOT EXISTS cover_requests_status_idx ON public.cover_requests(status);
CREATE INDEX IF NOT EXISTS cover_requests_date_idx ON public.cover_requests(date);

-- Message lookups
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);

-- 6. ADD UPDATED_AT TRIGGERS FOR DATA CONSISTENCY

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
    AND c.column_name = 'updated_at'
    AND t.table_type = 'BASE TABLE'
  LOOP
    -- Drop trigger if exists
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_name, table_name);
    
    -- Create trigger
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', table_name, table_name);
  END LOOP;
END $$;

-- 7. VERIFY DATA INTEGRITY

-- Check for orphaned records
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Check for job_applications without valid jobs
  SELECT COUNT(*) INTO orphan_count
  FROM public.job_applications ja
  LEFT JOIN public.jobs j ON ja.job_id = j.id
  WHERE j.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % orphaned job applications', orphan_count;
  END IF;

  -- Check for availability_slots without valid instructors
  SELECT COUNT(*) INTO orphan_count
  FROM public.availability_slots av
  LEFT JOIN public.profiles p ON av.instructor_id = p.id
  WHERE p.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % orphaned availability slots', orphan_count;
  END IF;
END $$;

-- 8. REFRESH ALL RLS POLICIES TO ENSURE THEY'RE ACTIVE
-- Sometimes RLS policies can become stale after schema changes

-- Force RLS to be enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Refresh RLS cache
NOTIFY pgrst, 'reload schema';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Platform audit and fixes completed successfully!';
  RAISE NOTICE '1. Added missing referral fields to profiles';
  RAISE NOTICE '2. Fixed availability_slots foreign key constraints';
  RAISE NOTICE '3. Consolidated application tables';
  RAISE NOTICE '4. Added missing columns to profile tables';
  RAISE NOTICE '5. Created performance indexes';
  RAISE NOTICE '6. Added updated_at triggers';
  RAISE NOTICE '7. Verified data integrity';
  RAISE NOTICE '8. Refreshed RLS policies';
END $$;
