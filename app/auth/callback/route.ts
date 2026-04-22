import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler.
 * Supabase redirects here after Google / Facebook sign-in.
 * Exchanges the auth code for a session, then routes the user:
 *   - /onboarding  if this is a new install (no profile in localStorage - client decides)
 *   - /log         otherwise
 * The actual redirect decision is deferred to the client via the `next` param.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(`${origin}/onboarding?auth_error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured - continue as anonymous
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/onboarding?auth_error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
