-- Create availability slots and cover requests for instructors

-- Availability slots for instructors
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.profiles(id) on delete cascade,
  availability_type text not null check (availability_type in ('regular', 'one-time', 'cover')),
  date_from date,
  date_to date,
  start_time time,
  end_time time,
  repeat_days text[],
  location text,
  equipment text[],
  pilates_level text,
  rate_min integer,
  rate_unit text check (rate_unit in ('hourly', 'per-class', 'daily')),
  status text default 'available' check (status in ('available', 'booked', 'unavailable')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cover requests from studios
create table if not exists public.cover_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  date_from date not null,
  date_to date,
  start_time time not null,
  end_time time not null,
  repeat_days text[],
  location text not null,
  equipment text[],
  pilates_level text,
  certifications_required text[],
  compensation_type text check (compensation_type in ('hourly', 'per-class', 'daily')),
  compensation_min integer,
  compensation_max integer,
  status text default 'open' check (status in ('open', 'filled', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.availability_slots enable row level security;
alter table public.cover_requests enable row level security;

-- RLS Policies for availability_slots
create policy "Anyone can view available slots"
  on public.availability_slots for select
  using (status = 'available' or instructor_id = auth.uid());

create policy "Instructors can manage their own availability"
  on public.availability_slots for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- RLS Policies for cover_requests
create policy "Anyone can view open cover requests"
  on public.cover_requests for select
  using (status = 'open' or studio_id = auth.uid());

create policy "Studios can manage their own cover requests"
  on public.cover_requests for all
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

-- Create indexes
create index if not exists availability_slots_instructor_id_idx on public.availability_slots(instructor_id);
create index if not exists availability_slots_status_idx on public.availability_slots(status);
create index if not exists cover_requests_studio_id_idx on public.cover_requests(studio_id);
create index if not exists cover_requests_status_idx on public.cover_requests(status);
