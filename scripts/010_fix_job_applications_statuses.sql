-- Fix job_applications status constraint to include all workflow statuses
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected', 'withdrawn'));
