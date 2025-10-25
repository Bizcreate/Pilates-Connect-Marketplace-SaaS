-- Create availability_slots table for instructors to post multiple availability blocks
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  availability_type text not null check (availability_type in ('cover', 'regular', 'temp')),
  date_from date not null,
  date_to date,
  repeat_days text[] default array[]::text[],
  start_time time not null,
  end_time time not null,
  location text,
  pilates_level text,
  equipment text[] default array[]::text[],
  rate_min integer,
  rate_unit text check (rate_unit in ('per_class', 'per_hour')),
  status text default 'available' check (status in ('available', 'booked', 'expired')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create cover_requests table for studios to request class cover
create table if not exists public.cover_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  date_from date not null,
  date_to date,
  repeat_days text[] default array[]::text[],
  start_time time not null,
  end_time time not null,
  location text not null,
  pilates_level text,
  equipment text[] default array[]::text[],
  certifications_required text[] default array[]::text[],
  compensation_min integer,
  compensation_max integer,
  compensation_type text check (compensation_type in ('per_class', 'hourly')),
  status text default 'open' check (status in ('open', 'filled', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create referrals table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_id uuid references public.profiles(id) on delete cascade,
  referred_email text,
  referral_code text unique not null,
  status text default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_amount integer default 0,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Add referral_code to profiles
alter table public.profiles
add column if not exists referral_code text unique,
add column if not exists referred_by uuid references public.profiles(id),
add column if not exists referral_earnings integer default 0;

-- Create indexes
create index if not exists idx_availability_slots_instructor on public.availability_slots(instructor_id);
create index if not exists idx_availability_slots_status on public.availability_slots(status);
create index if not exists idx_cover_requests_studio on public.cover_requests(studio_id);
create index if not exists idx_cover_requests_status on public.cover_requests(status);
create index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_code on public.referrals(referral_code);

-- Enable RLS
alter table public.availability_slots enable row level security;
alter table public.cover_requests enable row level security;
alter table public.referrals enable row level security;

-- RLS Policies for availability_slots
create policy "Instructors can manage their own availability"
  on public.availability_slots for all
  using (auth.uid() = instructor_id);

create policy "Studios can view available slots"
  on public.availability_slots for select
  using (status = 'available');

-- RLS Policies for cover_requests
create policy "Studios can manage their own cover requests"
  on public.cover_requests for all
  using (auth.uid() = studio_id);

create policy "Instructors can view open cover requests"
  on public.cover_requests for select
  using (status = 'open');

-- RLS Policies for referrals
create policy "Users can view their own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "Users can create referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

-- Function to generate unique referral code
create or replace function generate_referral_code()
returns text as $$
declare
  code text;
  exists boolean;
begin
  loop
    code := upper(substring(md5(random()::text) from 1 for 8));
    select exists(select 1 from public.profiles where referral_code = code) into exists;
    exit when not exists;
  end loop;
  return code;
end;
$$ language plpgsql;

-- Trigger to generate referral code on profile creation
create or replace function set_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := generate_referral_code();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_referral_code_trigger
  before insert on public.profiles
  for each row
  execute function set_referral_code();

-- Add media columns to instructor_profiles
alter table public.instructor_profiles
add column if not exists preview_videos text[] default array[]::text[],
add column if not exists image_gallery text[] default array[]::text[],
add column if not exists website text,
add column if not exists instagram text;
