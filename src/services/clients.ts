import { supabase } from '@/lib/supabase/client'

export interface Client {
  id: string
  user_id: string
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  pix_key_type?: string | null
  pix_key?: string | null
  cep?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  created_at: string
}

export const getClients = async (userId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  return { data: data as Client[] | null, error }
}

export const createClient = async (client: Partial<Client>) => {
  const { data, error } = await supabase.from('clients').insert(client).select().single()
  return { data: data as Client | null, error }
}

export const updateClient = async (id: string, updates: Partial<Client>) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data: data as Client | null, error }
}

export const deleteClient = async (id: string) => {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  return { error }
}
