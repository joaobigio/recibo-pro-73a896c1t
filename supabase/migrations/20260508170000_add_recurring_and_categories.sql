DO $$
BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
END $$;

CREATE TABLE IF NOT EXISTS public.recurring_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  document_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recurring_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own recurring_documents" ON public.recurring_documents;
CREATE POLICY "Users can manage their own recurring_documents" ON public.recurring_documents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

DROP TRIGGER IF EXISTS tr_recurring_documents_updated_at ON public.recurring_documents;
CREATE TRIGGER tr_recurring_documents_updated_at BEFORE UPDATE ON public.recurring_documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_recurring_documents_user_id ON public.recurring_documents(user_id);
