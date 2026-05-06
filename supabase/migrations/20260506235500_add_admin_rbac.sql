-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$function$;

-- 3. Update existing policies for clients
DROP POLICY IF EXISTS "Users can manage their clients" ON public.clients;
CREATE POLICY "Users can manage their clients" ON public.clients
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id OR public.is_admin()) 
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Update existing policies for documents
DROP POLICY IF EXISTS "Users can manage their documents" ON public.documents;
CREATE POLICY "Users can manage their documents" ON public.documents
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id OR public.is_admin()) 
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 5. Update existing policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id OR public.is_admin()) 
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- 6. Set joaozinhosantoss@icloud.com as admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'joaozinhosantoss@icloud.com';
