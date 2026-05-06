import { supabase } from '@/lib/supabase/client'

export interface Document {
  id: string
  user_id?: string
  client_id?: string | null
  type: string
  amount: number
  status: string
  data: any
  created_at: string
  profiles?: { name: string; email: string }
}

export const getMyDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data as Document[] | null, error }
}

export const getAllDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })
  return { data: data as Document[] | null, error }
}

export const createDocument = async (
  userId: string,
  document: { type: string; amount: number; data: any; client_id?: string },
) => {
  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...document, user_id: userId }])
    .select()
    .single()
  return { data, error }
}
