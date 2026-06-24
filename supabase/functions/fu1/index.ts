import { z } from 'npm:zod@3.23.8'
import { createClient } from 'npm:@supabase/supabase-js@2.49.8'
import { createLocalJWKSet, jwtVerify } from 'npm:jose@5.9.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_JWKS = Deno.env.get('SUPABASE_JWKS')

if (!SUPABASE_URL) throw new Error('SUPABASE_URL is required')
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
if (!SUPABASE_JWKS) throw new Error('SUPABASE_JWKS is required')

const JWKS = createLocalJWKSet(JSON.parse(SUPABASE_JWKS))

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const bodySchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200, 'title too long'),
  is_done: z.boolean().optional(),
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Use POST for this endpoint.',
        },
      },
      405,
    )
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header.',
        },
      },
      401,
    )
  }

  const token = authHeader.replace('Bearer ', '')

  let sub: string
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ['ES256', 'RS256', 'EdDSA'],
      issuer: `${SUPABASE_URL}/auth/v1`,
    })

    if (!payload.sub) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token does not include user id (sub).',
          },
        },
        401,
      )
    }

    sub = payload.sub
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token.',
        },
      },
      401,
    )
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON.',
        },
      },
      400,
    )
  }

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid payload.',
          issues: parsed.error.issues,
        },
      },
      400,
    )
  }

  const { title, is_done } = parsed.data

  const { data, error } = await admin
    .from('tasks')
    .insert({ user_id: sub, title, ...(is_done !== undefined ? { is_done } : {}) })
    .select('id, user_id, title, is_done, created_at')
    .single()

  if (error) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'DB_INSERT_FAILED',
          message: error.message,
        },
      },
      500,
    )
  }

  return jsonResponse({
    ok: true,
    data,
  })
})
