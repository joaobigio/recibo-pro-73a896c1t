const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

  let payload: unknown
  try {
    payload = await req.json()
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

  if (typeof payload !== 'object' || payload === null) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Payload must be a JSON object.',
        },
      },
      400,
    )
  }

  const { name } = payload as { name?: unknown }

  if (name !== undefined && typeof name !== 'string') {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'INVALID_FIELD',
          message: 'Field "name" must be a string when provided.',
        },
      },
      400,
    )
  }

  return jsonResponse({
    ok: true,
    data: {
      message: `Hello ${name?.trim() || 'there'} from fu1`,
      timestamp: new Date().toISOString(),
    },
  })
})
