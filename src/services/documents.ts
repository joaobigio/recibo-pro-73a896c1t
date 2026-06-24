import { supabase } from '@/lib/supabase/client'

export interface Document {
  id: string
  user_id: string
  client_id?: string
  type: string
  amount: number
  status: string
  data: any
  created_at: string
  document_number?: number
  profiles?: {
    name: string | null
    email: string | null
  } | null
}

export const createDocument = async (userId: string, doc: Partial<Document>) => {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      client_id: doc.client_id || null,
      type: doc.type || 'receipt',
      amount: doc.amount || 0,
      data: doc.data || {},
      status: doc.status || 'issued',
      document_number: doc.document_number,
    })
    .select()
    .single()
  return { data, error }
}

export const getNextDocumentNumber = async (userId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('document_number')
    .eq('user_id', userId)
    .not('document_number', 'is', null)
    .order('document_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return 1
  }

  return (data?.document_number || 0) + 1
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
  return { data, error }
}

export const deleteDocument = async (id: string) => {
  const { data, error } = await supabase.from('documents').delete().eq('id', id)
  return { data, error }
}
