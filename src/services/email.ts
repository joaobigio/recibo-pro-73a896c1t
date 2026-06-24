import { supabase } from '@/lib/supabase/client'

export const sendWelcomeEmail = async (params: {
  name: string
  email: string
  password?: string
}) => {
  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: { ...params, appUrl: window.location.origin },
  })

  if (error) {
    let errorMessage = error.message
    if (error.name === 'FunctionsHttpError' && (error as any).context) {
      try {
        const body = await (error as any).context.json()
        if (body && body.error) {
          errorMessage = body.error
        }
      } catch (e) {
        // ignore
      }
    }
    throw new Error(errorMessage)
  }

  if (data?.error) throw new Error(data.error)

  return { data, error: null }
}
