-- Add missing fields to instructor_profiles
ALTER TABLE instructor_profiles
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cv_url text,
ADD COLUMN IF NOT EXISTS insurance_url text,
ADD COLUMN IF NOT EXISTS image_gallery text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';

-- Add missing fields to studio_profiles  
ALTER TABLE studio_profiles
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS image_gallery text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Verification
SELECT 
  'instructor_profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'instructor_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'studio_profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'studio_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
