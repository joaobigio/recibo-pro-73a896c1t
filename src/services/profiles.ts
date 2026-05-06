import { supabase } from '@/lib/supabase/client'

export interface Profile {
  id: string
  name: string | null
  document: string | null
  phone: string | null
  pix_key: string | null
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  return { data: data as Profile | null, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}
