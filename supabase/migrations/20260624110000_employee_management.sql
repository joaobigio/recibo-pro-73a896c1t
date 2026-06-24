-- Migration for Employee Management & RBAC

DO $$
BEGIN
  -- Create the is_admin function securely
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  AS $func$
    SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
  $func$;

  -- Update RLS for documents
  DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
  DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
  DROP POLICY IF EXISTS "Users can select own documents" ON public.documents;
  DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
  DROP POLICY IF EXISTS "documents_select" ON public.documents;
  DROP POLICY IF EXISTS "documents_insert" ON public.documents;
  DROP POLICY IF EXISTS "documents_update" ON public.documents;
  DROP POLICY IF EXISTS "documents_delete" ON public.documents;

  CREATE POLICY "documents_select" ON public.documents
    FOR SELECT TO authenticated USING ( user_id = auth.uid() OR public.is_admin() );
    
  CREATE POLICY "documents_insert" ON public.documents
    FOR INSERT TO authenticated WITH CHECK ( user_id = auth.uid() );
    
  CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE TO authenticated USING ( user_id = auth.uid() OR public.is_admin() ) 
    WITH CHECK ( user_id = auth.uid() OR public.is_admin() );
    
  CREATE POLICY "documents_delete" ON public.documents
    FOR DELETE TO authenticated USING ( user_id = auth.uid() OR public.is_admin() );

  -- Update RLS for profiles
  DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

  -- Everyone authenticated can see names
  CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT TO authenticated USING ( true );

  -- Only admins or self can insert
  CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK ( id = auth.uid() OR public.is_admin() );

  -- Only admins or self can update
  CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE TO authenticated USING ( id = auth.uid() OR public.is_admin() ) 
    WITH CHECK ( id = auth.uid() OR public.is_admin() );

  -- Only admins or self can delete
  CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE TO authenticated USING ( id = auth.uid() OR public.is_admin() );

END $$;

-- Seed Admin User
DO $$
DECLARE
  admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joaozinhosantoss@icloud.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'joaozinhosantoss@icloud.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (admin_id, 'joaozinhosantoss@icloud.com', 'Administrador', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    -- Ensure the user is admin
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE email = 'joaozinhosantoss@icloud.com';
  END IF;
END $$;
