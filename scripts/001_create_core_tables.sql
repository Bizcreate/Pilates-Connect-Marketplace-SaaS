-- Create core tables: profiles, instructor_profiles, studio_profiles
-- These are the foundation tables for user data

-- Profiles table (base table for all users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('instructor', 'studio')),
  email text unique not null,
  display_name text,
  bio text,
  location text,
  phone text,
  avatar_url text,
  referral_code text unique,
  referral_earnings integer default 0,
  referred_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Instructor-specific profile data
create table if not exists public.instructor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  hourly_rate_min integer,
  hourly_rate_max integer,
  years_experience integer,
  certifications text[],
  equipment text[],
  qualifications jsonb,
  availability jsonb,
  verified boolean default false,
  instagram text,
  website text,
  social_links jsonb,
  video_urls jsonb,
  preview_videos text[],
  image_gallery text[],
  cv_url text,
  insurance_url text
);

-- Studio-specific profile data
create table if not exists public.studio_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  studio_name text not null,
  equipment text[],
  verified boolean default false,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'premium')),
  instagram text,
  website text
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.studio_profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for instructor_profiles
create policy "Public instructor profiles are viewable by everyone"
  on public.instructor_profiles for select
  using (true);

create policy "Instructors can insert their own profile"
  on public.instructor_profiles for insert
  with check (auth.uid() = id);

create policy "Instructors can update their own profile"
  on public.instructor_profiles for update
  using (auth.uid() = id);

-- RLS Policies for studio_profiles
create policy "Public studio profiles are viewable by everyone"
  on public.studio_profiles for select
  using (true);

create policy "Studios can insert their own profile"
  on public.studio_profiles for insert
  with check (auth.uid() = id);

create policy "Studios can update their own profile"
  on public.studio_profiles for update
  using (auth.uid() = id);

-- Create indexes for better query performance
create index if not exists profiles_user_type_idx on public.profiles(user_type);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);
