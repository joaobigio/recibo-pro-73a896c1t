import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin')
  const allowedOrigins = [
    'https://recibo-pro-0351d--preview.goskip.app',
    'https://recibo-pro-0351d.goskip.app',
    'http://localhost:5173',
    'http://localhost:4173',
  ]

  // Use specific origin if it matches allowed ones, otherwise allow all '*' as fallback
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : '*'
  const responseHeaders = { ...corsHeaders, 'Access-Control-Allow-Origin': allowOrigin }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      throw new Error('Forbidden: Only administrators can send invites')
    }

    const { name, email, password, appUrl } = await req.json()
    if (!email) {
      throw new Error('Email is required')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured in Supabase Secrets')
    }

    console.log(`[Email] Sending welcome email to ${name || 'User'} <${email}>.`)

    const resetUrl = `${appUrl || 'https://recibo-pro-0351d.goskip.app'}/login`

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #000;">Bem-vindo ao Recibo Pro!</h2>
        <p>Olá ${name || 'usuário'},</p>
        <p>Você foi convidado para acessar o Recibo Pro. Sua conta já foi criada com sucesso.</p>
        ${
          password
            ? `<p>Sua senha temporária de acesso é: <strong style="background: #f4f4f5; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px;">${password}</strong></p><p>Recomendamos que você altere sua senha após o primeiro acesso.</p>`
            : '<p>Para acessar, clique no botão abaixo e faça login. Se você não possui uma senha, utilize a opção "Esqueci minha senha" para criar uma nova.</p>'
        }
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar o Sistema</a>
        </div>
        <p>Se você tiver alguma dúvida, entre em contato com o administrador do seu sistema.</p>
        <p>Atenciosamente,<br/>Equipe Recibo Pro</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Recibo Pro <onboarding@resend.dev>',
        to: email,
        subject: 'Bem-vindo ao Recibo Pro!',
        html,
      }),
    })

    if (!res.ok) {
      let errorText = await res.text()
      try {
        const errorJson = JSON.parse(errorText)
        errorText = errorJson.message || errorText
      } catch (e) {
        // ignore parsing error if it's not json
      }
      console.error('[Email] Resend API error:', errorText)
      throw new Error(`Erro na API do Resend: ${errorText}`)
    }

    const resData = await res.json()
    console.log('[Email] Email sent successfully:', resData)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome email sent successfully to ${email}`,
      }),
      {
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    console.error('[Email Error]:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
