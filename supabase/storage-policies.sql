-- Storage Policies for Payment Screenshots (Private Bucket)
-- Authenticated users: INSERT + SELECT only | Service role: bypasses all policies

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert (upload) payment screenshots
CREATE POLICY "Authenticated users can upload payment screenshots" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  auth.role() = 'authenticated'
);

-- Policy for authenticated users to select (read) payment screenshots
CREATE POLICY "Authenticated users can read payment screenshots" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-screenshots' AND
  auth.role() = 'authenticated'
);
