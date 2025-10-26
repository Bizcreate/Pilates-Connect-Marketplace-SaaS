-- ============================================================================
-- PILATES CONNECT - COMPLETE DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: PURGE ALL EXISTING TABLES AND POLICIES
-- ============================================================================
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.cover_requests CASCADE;
DROP TABLE IF EXISTS public.availability_slots CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.instructor_profiles CASCADE;
DROP TABLE IF EXISTS public.studio_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing storage policies before recreating them
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Job images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Studios can upload job images" ON storage.objects;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN ('avatars', 'documents', 'job-images');

-- STEP 2: CREATE CORE TABLES
-- ============================================================================

-- Profiles table (base for all users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('instructor', 'studio')),
  email text NOT NULL UNIQUE,
  display_name text,
  bio text,
  location text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Instructor profiles
CREATE TABLE public.instructor_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate_min integer,
  hourly_rate_max integer,
  years_experience integer,
  certifications text[],
  specializations text[],
  equipment text[],
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Studio profiles
CREATE TABLE public.studio_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_name text NOT NULL,
  website text,
  address text,
  suburb text,
  state text,
  postcode text,
  equipment_available text[],
  studio_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for instructor_profiles
CREATE POLICY "Public instructor profiles are viewable"
  ON public.instructor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Instructors can insert own profile"
  ON public.instructor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Instructors can update own profile"
  ON public.instructor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for studio_profiles
CREATE POLICY "Public studio profiles are viewable"
  ON public.studio_profiles FOR SELECT
  USING (true);

CREATE POLICY "Studios can insert own profile"
  ON public.studio_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Studios can update own profile"
  ON public.studio_profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 3: CREATE JOBS AND APPLICATIONS
-- ============================================================================

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('permanent', 'casual', 'contract', 'cover')),
  location text NOT NULL,
  suburb text,
  state text,
  hourly_rate_min integer,
  hourly_rate_max integer,
  required_certifications text[],
  required_experience integer,
  equipment_provided text[],
  start_date date,
  end_date date,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, instructor_id)
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Public jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (true);

CREATE POLICY "Studios can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Studios can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = studio_id);

CREATE POLICY "Studios can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = studio_id);

-- RLS Policies for job_applications
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = instructor_id OR auth.uid() IN (
    SELECT studio_id FROM public.jobs WHERE id = job_id
  ));

CREATE POLICY "Instructors can insert own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() IN (
    SELECT studio_id FROM public.jobs WHERE id = job_id
  ));

-- STEP 4: CREATE MESSAGING SYSTEM
-- ============================================================================

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (auth.uid() IN (
    SELECT participant1_id FROM public.conversations WHERE id = conversation_id
    UNION
    SELECT participant2_id FROM public.conversations WHERE id = conversation_id
  ));

CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (
    SELECT participant1_id FROM public.conversations WHERE id = conversation_id
    UNION
    SELECT participant2_id FROM public.conversations WHERE id = conversation_id
  ));

-- STEP 5: CREATE AVAILABILITY AND COVER REQUESTS
-- ============================================================================

CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_available boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.cover_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  class_type text NOT NULL,
  notes text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public availability is viewable"
  ON public.availability_slots FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage own availability"
  ON public.availability_slots FOR ALL
  USING (auth.uid() = instructor_id);

CREATE POLICY "Public cover requests are viewable"
  ON public.cover_requests FOR SELECT
  USING (true);

CREATE POLICY "Studios can manage own cover requests"
  ON public.cover_requests FOR ALL
  USING (auth.uid() = studio_id);

-- STEP 6: CREATE REFERRALS
-- ============================================================================

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_email text NOT NULL,
  referred_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- STEP 7: CREATE STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for job images
CREATE POLICY "Job images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-images');

CREATE POLICY "Studios can upload job images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-images' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Removed demo data inserts that require auth users
-- All tables are created with proper RLS policies
-- You can now sign up as a studio or instructor to create real data
-- ============================================================================
