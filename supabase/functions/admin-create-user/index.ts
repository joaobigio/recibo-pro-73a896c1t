import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Server misconfiguration')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    // Check if caller is admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) throw new Error('Forbidden: Admin access required')

    const { email, password, name, is_admin } = await req.json()

    if (!email || !password || !name) {
      throw new Error('Missing required fields: email, password, name')
    }

    // Use Service Role to bypass GoTrue constraints and create the user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, is_admin },
    })

    if (error) throw error

    // Ensure auth.users columns are correctly formatted to prevent GoTrue 500 errors
    const supabaseAuthDb = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'auth' },
    })

    await supabaseAuthDb
      .from('users')
      .update({
        confirmation_token: '',
        recovery_token: '',
        email_change_token_new: '',
        email_change: '',
        email_change_token_current: '',
        phone_change: '',
        phone_change_token: '',
        reauthentication_token: '',
        phone: null,
      })
      .eq('id', data.user.id)

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
