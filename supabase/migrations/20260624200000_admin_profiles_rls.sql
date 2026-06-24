-- Redefine is_admin() as SECURITY DEFINER to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $function$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT is_admin INTO _is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing profiles RLS and add admin policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- Create basic user policies
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT TO authenticated USING (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated USING (id = auth.uid() OR user_id = auth.uid()) WITH CHECK (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR user_id = auth.uid());

-- Create admin policies
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- Trigger to automatically provision profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, name, is_admin)
  VALUES (
    NEW.id, 
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
    is_admin = COALESCE(EXCLUDED.is_admin, profiles.is_admin);
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed joaozinhosantoss@icloud.com
DO $do$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joaozinhosantoss@icloud.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'joaozinhosantoss@icloud.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Joãozinho Santos", "is_admin": true}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, user_id, email, name, is_admin)
    VALUES (new_user_id, new_user_id, 'joaozinhosantoss@icloud.com', 'Joãozinho Santos', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    -- Ensure existing user is admin
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE email = 'joaozinhosantoss@icloud.com';
    
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
    WHERE email = 'joaozinhosantoss@icloud.com';
  END IF;
END $do$;
