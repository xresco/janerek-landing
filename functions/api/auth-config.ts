// Surfaces the Supabase URL + public anon key to the browser so the
// signup-side JS can boot a Supabase client without us hard-coding
// values into the repo. Anon keys are designed to be public — RLS does
// the actual access control on the database side.

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Surface which keys are actually visible so a quick curl tells you
    // whether wrangler loaded .dev.vars at all (and what it loaded).
    const body = JSON.stringify({
      error: "Missing SUPABASE_URL and/or SUPABASE_ANON_KEY",
      sawSupabaseUrl: Boolean(supabaseUrl),
      sawSupabaseAnonKey: Boolean(supabaseAnonKey),
      visibleEnvKeys: Object.keys(env as Record<string, unknown>).sort(),
    }, null, 2);
    return new Response(body, {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const body = JSON.stringify({ supabaseUrl, supabaseAnonKey });
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
