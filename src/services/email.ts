import { supabase } from '@/lib/supabase/client'

export const sendWelcomeEmail = async (params: {
  name: string
  email: string
  password?: string
}) => {
  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: { ...params, appUrl: window.location.origin },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return { data, error: null }
}
