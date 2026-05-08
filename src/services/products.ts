import { supabase } from '@/lib/supabase/client'

export interface Product {
  id: string
  user_id: string
  name: string
  description?: string
  price: number
  type: 'product' | 'service'
  created_at: string
}

export const getProducts = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('User not found') }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return { data: data as Product[] | null, error }
}

export const getProduct = async (id: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  return { data: data as Product | null, error }
}

export const createProduct = async (product: Partial<Product>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('User not found') }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, user_id: user.id })
    .select()
    .single()
  return { data: data as Product | null, error }
}

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  return { data: data as Product | null, error }
}

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}
