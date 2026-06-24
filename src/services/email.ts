import { supabase } from '@/lib/supabase/client'

export const sendWelcomeEmail = async (params: { name: string; email: string }) => {
  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: { ...params, appUrl: 'https://recibo-pro-0351d.goskip.app' },
  })
  return { data, error }
}
