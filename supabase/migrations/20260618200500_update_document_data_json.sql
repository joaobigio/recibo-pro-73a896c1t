DO $$
BEGIN
  -- Ensure RLS policies on documents table are properly set for robust access
  ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
  CREATE POLICY "Users can manage their own documents" ON public.documents
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

  -- Backfill data jsonb to ensure payment_method and pix_key exist for historical accuracy
  UPDATE public.documents
  SET data = data || jsonb_build_object(
    'payment_method', data->>'paymentMethod',
    'pix_key', COALESCE(data->>'clientPixKey', data->>'issuerPixKey')
  )
  WHERE (data ? 'paymentMethod' AND NOT data ? 'payment_method')
     OR ((data ? 'clientPixKey' OR data ? 'issuerPixKey') AND NOT data ? 'pix_key');
END $$;
