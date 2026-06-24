-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (id = auth.uid());

-- Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, name)
  VALUES (NEW.id, NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Bucket for Logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for logos
DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_auth_insert" ON storage.objects;
CREATE POLICY "logos_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_auth_update" ON storage.objects;
CREATE POLICY "logos_auth_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_auth_delete" ON storage.objects;
CREATE POLICY "logos_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'logos');

-- Seed user joaozinhosantoss@icloud.com
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
      '{"name": "Joãozinho Santos"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, user_id, email, name, is_admin)
    VALUES (new_user_id, new_user_id, 'joaozinhosantoss@icloud.com', 'Joãozinho Santos', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
