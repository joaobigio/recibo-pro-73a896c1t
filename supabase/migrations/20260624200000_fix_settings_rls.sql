-- Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing potentially conflicting policies safely
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow admin delete" ON public.profiles;
    DROP POLICY IF EXISTS "Allow admin insert" ON public.profiles;
    DROP POLICY IF EXISTS "Allow admin select" ON public.profiles;
    DROP POLICY IF EXISTS "Allow admin update" ON public.profiles;
    DROP POLICY IF EXISTS "Allow individual insert" ON public.profiles;
    DROP POLICY IF EXISTS "Allow individual select" ON public.profiles;
    DROP POLICY IF EXISTS "Allow individual update" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles INSERT own" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles SELECT own" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles UPDATE own" ON public.profiles;
END $$;

-- Create policy allowing authenticated users to SELECT their own record
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Create policy allowing authenticated users to UPDATE their own record
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create policy allowing authenticated users to INSERT their own record
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (is_admin());
