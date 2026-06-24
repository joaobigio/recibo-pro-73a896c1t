-- 1. Create or replace the handle_new_user function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, name)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles SELECT own" ON public.profiles;
CREATE POLICY "Profiles SELECT own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles UPDATE own" ON public.profiles;
CREATE POLICY "Profiles UPDATE own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Profiles INSERT own" ON public.profiles;
CREATE POLICY "Profiles INSERT own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 3. Seed user joaozinhosantoss@icloud.com
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "João Santos"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, user_id, email, name, is_admin)
    VALUES (new_user_id, new_user_id, 'joaozinhosantoss@icloud.com', 'João Santos', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Ensure the user profile exists if user is already there
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'joaozinhosantoss@icloud.com' LIMIT 1;
    INSERT INTO public.profiles (id, user_id, email, name, is_admin)
    VALUES (new_user_id, new_user_id, 'joaozinhosantoss@icloud.com', 'João Santos', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
