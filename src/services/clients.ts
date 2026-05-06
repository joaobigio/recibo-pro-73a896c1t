import { supabase } from '@/lib/supabase/client'

export interface Client {
  id: string
  name: string
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export const getClients = async () => {
  const { data, error } = await supabase.from('clients').select('*').order('name')
  return { data: data as Client[] | null, error }
}

export const createClient = async (userId: string, client: Omit<Client, 'id'>) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...client, user_id: userId }])
    .select()
    .single()
  return { data, error }
}
