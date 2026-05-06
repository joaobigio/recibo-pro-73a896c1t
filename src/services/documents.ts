import { supabase } from '@/lib/supabase/client'

export interface Document {
  id: string
  type: string
  amount: number
  status: string
  data: any
  created_at: string
}

export const getDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
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
