-- Create profiles table for both studios and instructors
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('studio', 'instructor')),
  email text not null,
  display_name text not null,
  bio text,
  location text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create studio_profiles table for studio-specific data
create table if not exists public.studio_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  studio_name text not null,
  website text,
  instagram text,
  equipment text[], -- Array of equipment types: reformer, cadillac, chair, tower, mat
  verified boolean default false,
  subscription_tier text default 'basic' check (subscription_tier in ('basic', 'professional', 'enterprise'))
);

-- Create instructor_profiles table for instructor-specific data
create table if not exists public.instructor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  certifications text[], -- Array of certifications
  equipment text[], -- Equipment they can teach on
  hourly_rate_min integer,
  hourly_rate_max integer,
  years_experience integer,
  availability jsonb, -- Store weekly availability as JSON
  verified boolean default false
);

-- Create jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  job_type text not null check (job_type in ('full-time', 'part-time', 'casual', 'cover', 'temp')),
  location text not null,
  equipment text[] not null,
  certifications_required text[],
  class_types text[], -- pilates, yoga, barre
  compensation_type text check (compensation_type in ('hourly', 'per-class', 'salary')),
  compensation_min integer,
  compensation_max integer,
  schedule_details text,
  start_date date,
  status text default 'open' check (status in ('open', 'closed', 'filled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, instructor_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.studio_profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Studio profiles policies
create policy "Studio profiles are viewable by everyone"
  on public.studio_profiles for select
  using (true);

create policy "Studios can insert their own profile"
  on public.studio_profiles for insert
  with check (auth.uid() = id);

create policy "Studios can update their own profile"
  on public.studio_profiles for update
  using (auth.uid() = id);

-- Instructor profiles policies
create policy "Instructor profiles are viewable by everyone"
  on public.instructor_profiles for select
  using (true);

create policy "Instructors can insert their own profile"
  on public.instructor_profiles for insert
  with check (auth.uid() = id);

create policy "Instructors can update their own profile"
  on public.instructor_profiles for update
  using (auth.uid() = id);

-- Jobs policies
create policy "Jobs are viewable by everyone"
  on public.jobs for select
  using (true);

create policy "Studios can insert their own jobs"
  on public.jobs for insert
  with check (auth.uid() = studio_id);

create policy "Studios can update their own jobs"
  on public.jobs for update
  using (auth.uid() = studio_id);

create policy "Studios can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = studio_id);

-- Applications policies
create policy "Studios can view applications for their jobs"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
      and jobs.studio_id = auth.uid()
    )
  );

create policy "Instructors can view their own applications"
  on public.applications for select
  using (auth.uid() = instructor_id);

create policy "Instructors can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = instructor_id);

create policy "Instructors can update their own applications"
  on public.applications for update
  using (auth.uid() = instructor_id);

create policy "Studios can update applications for their jobs"
  on public.applications for update
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
      and jobs.studio_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists profiles_user_type_idx on public.profiles(user_type);
create index if not exists jobs_studio_id_idx on public.jobs(studio_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_instructor_id_idx on public.applications(instructor_id);
create index if not exists applications_status_idx on public.applications(status);
