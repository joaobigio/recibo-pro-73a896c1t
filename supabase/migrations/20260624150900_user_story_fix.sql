-- 1. Create trigger for auto-provisioning profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, name, is_admin)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Safe is_admin check to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT is_admin INTO _is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual select" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin select" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin update" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin delete" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert" ON public.profiles;

CREATE POLICY "Allow individual select" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Allow individual update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Allow individual insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Allow admin select" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin update" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- 4. Initial Admin Seed
DO $$
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Joãozinho", "is_admin": true}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, user_id, email, name, is_admin)
    VALUES (new_user_id, new_user_id, 'joaozinhosantoss@icloud.com', 'Admin Joãozinho', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
END $$;
