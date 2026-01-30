-- Storage Policies for Profile Pictures (Private Bucket)
-- Authenticated users: INSERT + SELECT + DELETE only | Service role: bypasses all policies

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert (upload) profile pictures
CREATE POLICY "Authenticated users can upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'profile-pictures' AND
  (storage.foldername(name))[2] = 'user-' || auth.uid()
);

-- Policy for authenticated users to select (read) profile pictures
CREATE POLICY "Authenticated users can read profile pictures" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-pictures' AND
  auth.role() = 'authenticated' AND
  (
    -- Users can read their own profile pictures
    (storage.foldername(name))[2] = 'user-' || auth.uid() OR
    -- Allow reading all profile pictures for public display
    (storage.foldername(name))[1] = 'profile-pictures'
  )
);

-- Policy for authenticated users to delete their own profile pictures
CREATE POLICY "Authenticated users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[2] = 'user-' || auth.uid()
);

-- Policy for authenticated users to update their own profile pictures
CREATE POLICY "Authenticated users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[2] = 'user-' || auth.uid()
);
