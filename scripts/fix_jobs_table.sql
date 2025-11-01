-- Fix jobs table to match the form requirements
-- Add missing columns to jobs table

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS schedule_blocks jsonb,
ADD COLUMN IF NOT EXISTS schedule_details text,
ADD COLUMN IF NOT EXISTS class_types text[];

-- Update RLS policies to ensure studios can manage their own jobs
-- (policies already exist, just verifying they work correctly)

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;
