DO $$
DECLARE
  v_admin_id uuid;
  v_employee_id uuid;
  v_client_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'joaozinhosantoss@icloud.com';
  
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'joaozinhosantoss@icloud.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin João"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (v_admin_id, 'joaozinhosantoss@icloud.com', 'Admin João', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'employee@recibopro.com') THEN
    v_employee_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_employee_id, '00000000-0000-0000-0000-000000000000', 'employee@recibopro.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Maria Funcional"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (v_employee_id, 'employee@recibopro.com', 'Maria Funcional', false)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_employee_id FROM auth.users WHERE email = 'employee@recibopro.com';
  END IF;

  INSERT INTO public.clients (id, user_id, name, email) 
  VALUES (gen_random_uuid(), v_admin_id, 'Cliente Teste Admin', 'cliente@admin.com')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_client_id;

  IF v_client_id IS NULL THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_admin_id LIMIT 1;
  END IF;

  INSERT INTO public.documents (user_id, client_id, type, amount, status, data)
  SELECT 
    v_admin_id, v_client_id, 'receipt', (random() * 1000 + 100)::numeric(10,2), 'issued', '{"description": "Serviço de teste admin"}'
  FROM generate_series(1, 5) AS i
  ON CONFLICT DO NOTHING;

  INSERT INTO public.clients (id, user_id, name, email) 
  VALUES (gen_random_uuid(), v_employee_id, 'Cliente Teste Func', 'cliente@func.com')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_client_id;

  IF v_client_id IS NULL THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_employee_id LIMIT 1;
  END IF;

  INSERT INTO public.documents (user_id, client_id, type, amount, status, data)
  SELECT 
    v_employee_id, v_client_id, 'receipt', (random() * 500 + 50)::numeric(10,2), 'issued', '{"description": "Venda funcionário"}'
  FROM generate_series(6, 15) AS i
  ON CONFLICT DO NOTHING;

END $$;
