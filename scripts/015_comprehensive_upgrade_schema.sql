-- =====================================================
-- PILATES CONNECT - COMPREHENSIVE UPGRADE SCHEMA
-- Features: Job Slots, Cover Request Slots, Payment Tracking, Verification Systems
-- =====================================================

-- 1. CREATE JOB SLOTS TABLE
-- Tracks individual class times for accepted jobs
CREATE TABLE IF NOT EXISTS job_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE COVER REQUEST SLOTS TABLE
-- Tracks individual cover shift times
CREATE TABLE IF NOT EXISTS cover_request_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cover_request_id UUID REFERENCES cover_requests(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADD INSURANCE FIELD TO INSTRUCTOR PROFILES (if not exists)
ALTER TABLE instructor_profiles 
ADD COLUMN IF NOT EXISTS insurance_documents JSONB DEFAULT '[]'::jsonb;

-- 4. ADD CERTIFICATION DOCUMENTS FIELD (if not exists)
ALTER TABLE instructor_profiles 
ADD COLUMN IF NOT EXISTS certification_documents JSONB DEFAULT '[]'::jsonb;

-- 5. UPDATE JOB_APPLICATIONS TO TRACK EMPLOYMENT TYPE
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'casual', 'per-class')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- 6. CREATE ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE PLATFORM STATISTICS TABLE
CREATE TABLE IF NOT EXISTS platform_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_instructors INTEGER DEFAULT 0,
  total_studios INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  total_applications INTEGER DEFAULT 0,
  total_cover_requests INTEGER DEFAULT 0,
  active_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Job Slots Indexes
CREATE INDEX IF NOT EXISTS idx_job_slots_job_id ON job_slots(job_id);
CREATE INDEX IF NOT EXISTS idx_job_slots_instructor_id ON job_slots(instructor_id);
CREATE INDEX IF NOT EXISTS idx_job_slots_date ON job_slots(date);
CREATE INDEX IF NOT EXISTS idx_job_slots_status ON job_slots(status);
CREATE INDEX IF NOT EXISTS idx_job_slots_payment_status ON job_slots(payment_status);

-- Cover Request Slots Indexes
CREATE INDEX IF NOT EXISTS idx_cover_slots_request_id ON cover_request_slots(cover_request_id);
CREATE INDEX IF NOT EXISTS idx_cover_slots_instructor_id ON cover_request_slots(instructor_id);
CREATE INDEX IF NOT EXISTS idx_cover_slots_date ON cover_request_slots(date);
CREATE INDEX IF NOT EXISTS idx_cover_slots_status ON cover_request_slots(status);

-- Applications Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_instructor_id ON job_applications(instructor_id);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON job_applications(applied_at DESC);

-- Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_studio_id ON jobs(studio_id);

-- Cover Requests Indexes
CREATE INDEX IF NOT EXISTS idx_cover_requests_status ON cover_requests(status);
CREATE INDEX IF NOT EXISTS idx_cover_requests_urgency ON cover_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_cover_requests_created_at ON cover_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cover_requests_studio_id ON cover_requests(studio_id);

-- Messages Indexes
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Profile Location Indexes
CREATE INDEX IF NOT EXISTS idx_instructor_location ON instructor_profiles(location);
CREATE INDEX IF NOT EXISTS idx_studio_location ON studio_profiles(location);

-- Referrals Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Job Slots updated_at trigger
CREATE OR REPLACE FUNCTION update_job_slots_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_slots_updated_at
BEFORE UPDATE ON job_slots
FOR EACH ROW
EXECUTE FUNCTION update_job_slots_timestamp();

-- Cover Request Slots updated_at trigger
CREATE OR REPLACE FUNCTION update_cover_slots_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cover_slots_updated_at
BEFORE UPDATE ON cover_request_slots
FOR EACH ROW
EXECUTE FUNCTION update_cover_slots_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE job_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_request_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_statistics ENABLE ROW LEVEL SECURITY;

-- Job Slots Policies
CREATE POLICY "Job slots are viewable by instructor and studio"
  ON job_slots FOR SELECT
  USING (
    auth.uid() = instructor_id OR
    auth.uid() IN (SELECT user_id FROM jobs WHERE id = job_slots.job_id)
  );

CREATE POLICY "Instructors can update their own job slots"
  ON job_slots FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can insert job slots for their jobs"
  ON job_slots FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM jobs WHERE id = job_slots.job_id)
  );

-- Cover Request Slots Policies
CREATE POLICY "Cover slots are viewable by instructor and studio"
  ON cover_request_slots FOR SELECT
  USING (
    auth.uid() = instructor_id OR
    auth.uid() IN (SELECT studio_id FROM cover_requests WHERE id = cover_request_slots.cover_request_id)
  );

CREATE POLICY "Instructors can update their own cover slots"
  ON cover_request_slots FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can manage cover slots for their requests"
  ON cover_request_slots FOR ALL
  USING (
    auth.uid() IN (SELECT studio_id FROM cover_requests WHERE id = cover_request_slots.cover_request_id)
  );

-- Admin Users Policies (admin only)
CREATE POLICY "Admin users viewable by admins only"
  ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admin users manageable by super_admins only"
  ON admin_users FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

-- Platform Statistics (public read, admin write)
CREATE POLICY "Platform statistics viewable by all"
  ON platform_statistics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform statistics writable by admins"
  ON platform_statistics FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON job_slots TO authenticated;
GRANT ALL ON cover_request_slots TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT SELECT ON platform_statistics TO authenticated;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Add your admin email here (replace with actual admin email)
-- INSERT INTO admin_users (user_id, email, role, permissions)
-- SELECT id, email, 'super_admin', '["all"]'::jsonb
-- FROM profiles
-- WHERE email = 'your-admin-email@example.com'
-- ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE job_slots IS 'Individual class times for accepted job positions';
COMMENT ON TABLE cover_request_slots IS 'Individual cover shift times';
COMMENT ON TABLE admin_users IS 'Platform administrators with special permissions';
COMMENT ON TABLE platform_statistics IS 'Daily platform metrics and statistics';
