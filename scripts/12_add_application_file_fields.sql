-- Add CV and demo file URL fields to job_applications table

ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS demo_urls JSONB;

COMMENT ON COLUMN job_applications.cv_url IS 'URL to uploaded CV/resume file';
COMMENT ON COLUMN job_applications.demo_urls IS 'Array of URLs to demo videos and images';
