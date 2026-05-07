DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('logos', 'logos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
CREATE POLICY "Logos are publicly accessible" ON storage.objects 
  FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Users can upload their own logo" ON storage.objects;
CREATE POLICY "Users can upload their own logo" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own logo" ON storage.objects;
CREATE POLICY "Users can update their own logo" ON storage.objects 
  FOR UPDATE TO authenticated USING (
    bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own logo" ON storage.objects;
CREATE POLICY "Users can delete their own logo" ON storage.objects 
  FOR DELETE TO authenticated USING (
    bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
