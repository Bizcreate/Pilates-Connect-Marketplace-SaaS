-- Create jobs and applications tables for the job marketplace

-- Jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  job_type text not null check (job_type in ('full-time', 'part-time', 'casual', 'contract')),
  location text not null,
  compensation_type text check (compensation_type in ('hourly', 'salary', 'per-class')),
  compensation_min integer,
  compensation_max integer,
  equipment text[],
  certifications_required text[],
  class_types text[],
  schedule_details text,
  start_date date,
  status text default 'active' check (status in ('active', 'closed', 'draft')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, instructor_id)
);

-- Enable RLS
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- RLS Policies for jobs
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (status = 'active' or studio_id = auth.uid());

create policy "Studios can insert their own jobs"
  on public.jobs for insert
  with check (auth.uid() = studio_id);

create policy "Studios can update their own jobs"
  on public.jobs for update
  using (auth.uid() = studio_id);

create policy "Studios can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = studio_id);

-- RLS Policies for applications
create policy "Instructors can view their own applications"
  on public.applications for select
  using (auth.uid() = instructor_id);

create policy "Studios can view applications for their jobs"
  on public.applications for select
  using (auth.uid() in (select studio_id from public.jobs where id = job_id));

create policy "Instructors can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = instructor_id);

create policy "Instructors can update their own applications"
  on public.applications for update
  using (auth.uid() = instructor_id);

create policy "Studios can update applications for their jobs"
  on public.applications for update
  using (auth.uid() in (select studio_id from public.jobs where id = job_id));

-- Create indexes
create index if not exists jobs_studio_id_idx on public.jobs(studio_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_instructor_id_idx on public.applications(instructor_id);
