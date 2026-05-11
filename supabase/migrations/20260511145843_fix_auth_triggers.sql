DO $$
BEGIN
  -- Cria o trigger para confirmar automaticamente o e-mail de novos usuários, ignorando o bloqueio de login
  DROP TRIGGER IF EXISTS auto_confirm_new_users_trigger ON auth.users;
  
  CREATE TRIGGER auto_confirm_new_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_users();
  
  -- Garante que o trigger de criação automática de perfil esteja associado a auth.users
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

  -- Se existirem usuários não confirmados pendentes, os confirma para evitar bloqueio no login
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE email_confirmed_at IS NULL;
END $$;
