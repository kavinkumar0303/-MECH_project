const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function respond(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const demoEmail = Deno.env.get('DEMO_ACCOUNT_EMAIL')?.trim();
  const demoPassword = Deno.env.get('DEMO_ACCOUNT_PASSWORD');

  if (!supabaseUrl || !demoEmail || !demoPassword) {
    console.error('Demo login function is missing required server-side configuration.');
    return respond({ error: 'Demo sign-in is unavailable.' }, 503);
  }

  return respond({ email: demoEmail, password: demoPassword }, 200);
});
