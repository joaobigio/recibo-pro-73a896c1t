-- Fix RLS policies for documents and profiles according to acceptance criteria

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles SELECT own" ON public.profiles;
CREATE POLICY "Profiles SELECT own" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles UPDATE own" ON public.profiles;
CREATE POLICY "Profiles UPDATE own" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id OR auth.uid() = user_id) WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles INSERT own" ON public.profiles;
CREATE POLICY "Profiles INSERT own" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Documents RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_delete" ON public.documents
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
