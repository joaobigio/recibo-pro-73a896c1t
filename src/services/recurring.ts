import { supabase } from '@/lib/supabase/client'

export interface RecurringDocument {
  id: string
  user_id: string
  client_id: string
  title: string
  amount: number
  frequency: string
  next_date: string
  active: boolean
  document_data: any
  created_at: string
  client?: { name: string }
}

export const getRecurringDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('recurring_documents')
    .select('*, client:clients(name)')
    .eq('user_id', userId)
    .order('next_date', { ascending: true })

  return { data: data as any[], error }
}

export const createRecurringDocument = async (userId: string, doc: Partial<RecurringDocument>) => {
  const { data, error } = await supabase
    .from('recurring_documents')
    .insert({
      user_id: userId,
      client_id: doc.client_id,
      title: doc.title,
      amount: doc.amount,
      frequency: doc.frequency || 'monthly',
      next_date: doc.next_date,
      active: doc.active ?? true,
      document_data: doc.document_data || {},
    })
    .select()
    .single()
  return { data, error }
}

export const toggleRecurringActive = async (id: string, active: boolean) => {
  const { error } = await supabase.from('recurring_documents').update({ active }).eq('id', id)
  return { error }
}

export const deleteRecurringDocument = async (id: string) => {
  const { error } = await supabase.from('recurring_documents').delete().eq('id', id)
  return { error }
}
