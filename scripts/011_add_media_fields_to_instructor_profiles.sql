-- Add media fields to instructor_profiles table for storing images and videos
ALTER TABLE public.instructor_profiles 
ADD COLUMN IF NOT EXISTS media_images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_videos text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.instructor_profiles.media_images IS 'Array of image URLs uploaded to Vercel Blob for instructor profile showcase';
COMMENT ON COLUMN public.instructor_profiles.media_videos IS 'Array of video URLs uploaded to Vercel Blob for instructor profile showcase';
