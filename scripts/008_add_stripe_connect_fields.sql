-- Add Stripe Connect fields to support marketplace payments

-- Add stripe_account_id to instructor_profiles
ALTER TABLE instructor_profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean DEFAULT false;

-- Add stripe_customer_id to studio_profiles
ALTER TABLE studio_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Create payments table to track all transactions
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES profiles(id) NOT NULL,
  instructor_id uuid REFERENCES profiles(id) NOT NULL,
  booking_id uuid, -- Reference to cover_requests or other booking types
  amount_total integer NOT NULL, -- Total amount in cents
  platform_fee integer NOT NULL, -- Platform fee in cents
  instructor_amount integer NOT NULL, -- Amount instructor receives in cents
  stripe_payment_intent_id text UNIQUE,
  stripe_transfer_id text,
  status text CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  booking_type text CHECK (booking_type IN ('cover', 'job', 'casual')) NOT NULL,
  booking_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_studio ON payments(studio_id);
CREATE INDEX IF NOT EXISTS idx_payments_instructor ON payments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Studios can see their own payments
CREATE POLICY "Studios can view own payments" ON payments
  FOR SELECT USING (auth.uid() = studio_id);

-- Instructors can see payments they received
CREATE POLICY "Instructors can view own payments" ON payments
  FOR SELECT USING (auth.uid() = instructor_id);

-- Only server (service role) can insert payments
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Only server can update payment status
CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');
