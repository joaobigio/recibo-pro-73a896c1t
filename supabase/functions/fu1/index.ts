Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let payload: { name?: string } = {}
  try {
    payload = await req.json()
  } catch {
    // Optional body
  }

  const name = payload?.name ?? 'there'

  return new Response(
    JSON.stringify({
      message: `Hello ${name} from fu1`,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
})
