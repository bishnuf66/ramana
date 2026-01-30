-- Storage Policies for Profile Pictures (Private Bucket)
-- Authenticated users: INSERT + SELECT + UPDATE + DELETE only | Service role: bypasses all policies

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert (upload) profile pictures
CREATE POLICY "Users can manage their profile pictures" ON storage.objects
FOR ALL USING (
  bucket_id = 'profile-pictures' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
