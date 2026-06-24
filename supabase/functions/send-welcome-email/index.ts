import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, appUrl } = await req.json()

    console.log(
      `[Email Mock] Sending welcome email to ${name || 'User'} <${email}>. Welcome to Recibo Pro! Access the app at: ${appUrl}`,
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome email sent successfully to ${email}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
