-- Add gallery and social media fields to profiles

-- Update instructor_profiles
ALTER TABLE instructor_profiles
ADD COLUMN IF NOT EXISTS image_gallery TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_url TEXT;

-- Update studio_profiles  
ALTER TABLE studio_profiles
ADD COLUMN IF NOT EXISTS image_gallery TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS studio_name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_image_gallery ON instructor_profiles USING GIN (image_gallery);
CREATE INDEX IF NOT EXISTS idx_studio_profiles_image_gallery ON studio_profiles USING GIN (image_gallery);
