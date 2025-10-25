-- Create storage bucket for instructor documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('instructor-documents', 'instructor-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for instructor documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'instructor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'instructor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'instructor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'instructor-documents');

-- Add columns to instructor_profiles for documents and media
ALTER TABLE instructor_profiles
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_url TEXT,
ADD COLUMN IF NOT EXISTS qualifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS image_gallery JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN instructor_profiles.qualifications IS 'Array of qualification documents with name and url';
COMMENT ON COLUMN instructor_profiles.video_urls IS 'Array of video URLs showcasing instruction';
COMMENT ON COLUMN instructor_profiles.image_gallery IS 'Array of image URLs for portfolio';
COMMENT ON COLUMN instructor_profiles.social_links IS 'Object with social media links (instagram, facebook, linkedin, website)';
