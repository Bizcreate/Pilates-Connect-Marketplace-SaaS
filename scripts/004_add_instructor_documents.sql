-- Add document storage columns to instructor_profiles
alter table public.instructor_profiles
add column if not exists cv_url text,
add column if not exists insurance_url text,
add column if not exists qualifications jsonb default '[]'::jsonb;

-- Add comment for clarity
comment on column public.instructor_profiles.qualifications is 'Array of qualification documents with name and url: [{"name": "Cert Name", "url": "blob_url"}]';
