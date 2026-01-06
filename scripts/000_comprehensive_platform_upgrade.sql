-- Comprehensive Platform Upgrade for Pilates Connect
-- Run this script in your Supabase SQL Editor to enable all new features

-- ============================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add insurance and certification tracking to instructor_profiles
ALTER TABLE instructor_profiles
ADD COLUMN IF NOT EXISTS insurance_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS insurance_verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS certification_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certifications_verified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN instructor_profiles.insurance_documents IS 'JSONB array of insurance documents with structure: [{id, provider, policy_number, expiry_date, document_url, status, reviewed_by, reviewed_at, rejection_reason}]';
COMMENT ON COLUMN instructor_profiles.certification_documents IS 'JSONB array of certification documents with structure: [{id, name, issuing_organization, certification_number, issue_date, expiry_date, document_url, status, reviewed_by, reviewed_at, rejection_reason}]';

-- Add payment tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS instructor_payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS studio_payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Add slot tracking to jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS total_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- Add slot tracking to cover_requests
ALTER TABLE cover_requests
ADD COLUMN IF NOT EXISTS total_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- ============================================
-- 2. CREATE NEW TABLES
-- ============================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, super_admin, moderator
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Job slots for tracking individual class times
CREATE TABLE IF NOT EXISTS job_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'open', -- open, filled, completed, cancelled
  instructor_rate NUMERIC(10, 2),
  hours_worked NUMERIC(5, 2),
  total_amount NUMERIC(10, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  instructor_payment_status TEXT DEFAULT 'pending', -- pending, processing, paid
  instructor_paid_at TIMESTAMP WITH TIME ZONE,
  studio_payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover request slots for tracking individual cover shifts
CREATE TABLE IF NOT EXISTS cover_request_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cover_request_id UUID REFERENCES cover_requests(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'open', -- open, filled, completed, cancelled
  instructor_rate NUMERIC(10, 2),
  hours_worked NUMERIC(5, 2),
  total_amount NUMERIC(10, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  instructor_payment_status TEXT DEFAULT 'pending',
  instructor_paid_at TIMESTAMP WITH TIME ZONE,
  studio_payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform statistics tracking
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_instructors INTEGER DEFAULT 0,
  total_studios INTEGER DEFAULT 0,
  active_jobs INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Job slots indexes
CREATE INDEX IF NOT EXISTS idx_job_slots_job_id ON job_slots(job_id);
CREATE INDEX IF NOT EXISTS idx_job_slots_studio_id ON job_slots(studio_id);
CREATE INDEX IF NOT EXISTS idx_job_slots_instructor_id ON job_slots(instructor_id);
CREATE INDEX IF NOT EXISTS idx_job_slots_date ON job_slots(date);
CREATE INDEX IF NOT EXISTS idx_job_slots_status ON job_slots(status);
CREATE INDEX IF NOT EXISTS idx_job_slots_payment_status ON job_slots(instructor_payment_status, studio_payment_status);

-- Cover request slots indexes
CREATE INDEX IF NOT EXISTS idx_cover_slots_request_id ON cover_request_slots(cover_request_id);
CREATE INDEX IF NOT EXISTS idx_cover_slots_studio_id ON cover_request_slots(studio_id);
CREATE INDEX IF NOT EXISTS idx_cover_slots_instructor_id ON cover_request_slots(instructor_id);
CREATE INDEX IF NOT EXISTS idx_cover_slots_date ON cover_request_slots(date);
CREATE INDEX IF NOT EXISTS idx_cover_slots_status ON cover_request_slots(status);

-- Insurance and certification verification indexes
CREATE INDEX IF NOT EXISTS idx_instructor_insurance_verified ON instructor_profiles(insurance_verified);
CREATE INDEX IF NOT EXISTS idx_instructor_certifications_verified ON instructor_profiles(certifications_verified);

-- ============================================
-- 4. CREATE AUTO-UPDATE TIMESTAMP FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update to new tables
DROP TRIGGER IF EXISTS update_job_slots_updated_at ON job_slots;
CREATE TRIGGER update_job_slots_updated_at
  BEFORE UPDATE ON job_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cover_slots_updated_at ON cover_request_slots;
CREATE TRIGGER update_cover_slots_updated_at
  BEFORE UPDATE ON cover_request_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_request_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Job slots policies
CREATE POLICY "Public can view open job slots"
  ON job_slots FOR SELECT
  USING (status = 'open' OR studio_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Studios can manage their job slots"
  ON job_slots FOR ALL
  USING (studio_id = auth.uid());

CREATE POLICY "Instructors can view their assigned slots"
  ON job_slots FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their assigned slots"
  ON job_slots FOR UPDATE
  USING (instructor_id = auth.uid());

-- Cover request slots policies
CREATE POLICY "Public can view open cover slots"
  ON cover_request_slots FOR SELECT
  USING (status = 'open' OR studio_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Studios can manage their cover slots"
  ON cover_request_slots FOR ALL
  USING (studio_id = auth.uid());

CREATE POLICY "Instructors can view their assigned cover slots"
  ON cover_request_slots FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their assigned cover slots"
  ON cover_request_slots FOR UPDATE
  USING (instructor_id = auth.uid());

-- Platform stats policies
CREATE POLICY "Admins can view platform stats"
  ON platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update job filled slots count
CREATE OR REPLACE FUNCTION update_job_slots_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs
  SET filled_slots = (
    SELECT COUNT(*) FROM job_slots
    WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
    AND status = 'filled'
  )
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_slots_count ON job_slots;
CREATE TRIGGER trigger_update_job_slots_count
  AFTER INSERT OR UPDATE OR DELETE ON job_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_job_slots_count();

-- Function to update cover request filled slots count
CREATE OR REPLACE FUNCTION update_cover_slots_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cover_requests
  SET filled_slots = (
    SELECT COUNT(*) FROM cover_request_slots
    WHERE cover_request_id = COALESCE(NEW.cover_request_id, OLD.cover_request_id)
    AND status = 'filled'
  )
  WHERE id = COALESCE(NEW.cover_request_id, OLD.cover_request_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cover_slots_count ON cover_request_slots;
CREATE TRIGGER trigger_update_cover_slots_count
  AFTER INSERT OR UPDATE OR DELETE ON cover_request_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_cover_slots_count();

-- ============================================
-- 7. SAMPLE ADMIN USER (OPTIONAL)
-- ============================================

-- Uncomment and update this to create your first admin user
-- Replace 'your-user-id-here' with your actual user UUID from the profiles table

-- INSERT INTO admin_users (user_id, role, permissions)
-- VALUES (
--   'your-user-id-here'::uuid,
--   'super_admin',
--   '{"manage_users": true, "manage_jobs": true, "manage_payments": true, "view_analytics": true}'::jsonb
-- )
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify the migration
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS admin_users_count FROM admin_users;
SELECT COUNT(*) AS job_slots_count FROM job_slots;
SELECT COUNT(*) AS cover_slots_count FROM cover_request_slots;
