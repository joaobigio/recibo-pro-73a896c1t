-- Idempotent user seed
DO $BODY$
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
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    -- Link profile
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_user_id, 'joaozinhosantoss@icloud.com', 'Administrador', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $BODY$;

-- Ensure no nulls in GoTrue token fields
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Profile RLS verification
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Clients RLS verification
DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
CREATE POLICY "Users can manage their own clients" ON public.clients
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Documents RLS verification
DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
CREATE POLICY "Users can manage their own documents" ON public.documents
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products RLS verification
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
CREATE POLICY "Users can manage their own products" ON public.products
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recurring Documents RLS verification
DROP POLICY IF EXISTS "Users can manage their own recurring documents" ON public.recurring_documents;
CREATE POLICY "Users can manage their own recurring documents" ON public.recurring_documents
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
