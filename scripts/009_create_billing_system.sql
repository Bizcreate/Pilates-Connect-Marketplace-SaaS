-- Create billing system for monthly invoicing (no upfront payment)
-- Platform fee: Professional = 5%, Enterprise = 2.5%

-- Update studio_profiles to track subscription
ALTER TABLE public.studio_profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Create bookings table (unified for cover requests and jobs)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  instructor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_type text CHECK (booking_type IN ('cover', 'job', 'casual')) NOT NULL,
  cover_request_id uuid REFERENCES public.cover_requests(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Booking details
  title text NOT NULL,
  description text,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text,
  
  -- Compensation
  instructor_rate numeric(10, 2) NOT NULL, -- Amount instructor will receive
  hours_worked numeric(5, 2) DEFAULT 1,
  total_amount numeric(10, 2) NOT NULL, -- Total before platform fee
  
  -- Status tracking
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'billed', 'paid', 'cancelled')) NOT NULL,
  completed_at timestamptz,
  
  -- Billing info
  billed_in_invoice uuid, -- Reference to invoice
  paid_out_to_instructor boolean DEFAULT false,
  instructor_payout_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monthly invoices table
CREATE TABLE IF NOT EXISTS public.studio_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Invoice period
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Amounts
  subscription_fee numeric(10, 2) NOT NULL, -- Monthly subscription ($49 or $149)
  total_bookings_amount numeric(10, 2) DEFAULT 0, -- Sum of all bookings
  platform_fee numeric(10, 2) DEFAULT 0, -- 5% or 2.5% depending on tier
  total_due numeric(10, 2) NOT NULL, -- subscription_fee + total_bookings_amount + platform_fee
  
  -- Platform fee rate applied
  platform_fee_rate numeric(5, 2) NOT NULL, -- 5.00 or 2.50
  
  -- Payment tracking
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')) NOT NULL,
  stripe_invoice_id text,
  paid_at timestamptz,
  due_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(studio_id, period_start, period_end)
);

-- Create instructor payouts table
CREATE TABLE IF NOT EXISTS public.instructor_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Payout details
  amount numeric(10, 2) NOT NULL,
  booking_ids uuid[] NOT NULL, -- Array of booking IDs included in this payout
  
  -- Stripe Connect transfer
  stripe_transfer_id text,
  stripe_connected_account_id text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')) NOT NULL,
  completed_at timestamptz,
  failure_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Studios can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = studio_id);

CREATE POLICY "Instructors can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = instructor_id);

CREATE POLICY "Studios can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Studios and instructors can update bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = studio_id OR auth.uid() = instructor_id);

-- RLS Policies for studio_invoices
CREATE POLICY "Studios can view their own invoices"
  ON public.studio_invoices FOR SELECT
  USING (auth.uid() = studio_id);

-- RLS Policies for instructor_payouts
CREATE POLICY "Instructors can view their own payouts"
  ON public.instructor_payouts FOR SELECT
  USING (auth.uid() = instructor_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS bookings_studio_id_idx ON public.bookings(studio_id);
CREATE INDEX IF NOT EXISTS bookings_instructor_id_idx ON public.bookings(instructor_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS studio_invoices_studio_id_idx ON public.studio_invoices(studio_id);
CREATE INDEX IF NOT EXISTS studio_invoices_status_idx ON public.studio_invoices(status);
CREATE INDEX IF NOT EXISTS instructor_payouts_instructor_id_idx ON public.instructor_payouts(instructor_id);
CREATE INDEX IF NOT EXISTS instructor_payouts_status_idx ON public.instructor_payouts(status);
