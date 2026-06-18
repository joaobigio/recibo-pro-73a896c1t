ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_number INT;

DO $$
DECLARE
  rec RECORD;
  current_user_id UUID := NULL;
  seq INT := 1;
BEGIN
  -- Backfill existing documents sequentially per user based on creation time
  FOR rec IN
    SELECT id, user_id
    FROM public.documents
    ORDER BY user_id, created_at ASC
  LOOP
    IF current_user_id IS DISTINCT FROM rec.user_id THEN
      current_user_id := rec.user_id;
      seq := 1;
    END IF;
    
    UPDATE public.documents
    SET document_number = seq
    WHERE id = rec.id;
    
    seq := seq + 1;
  END LOOP;
END $$;
