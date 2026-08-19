import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profiles";
import { getSiteOriginFromRequest } from "@/lib/site-url";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = getSiteOriginFromRequest(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/celeste";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await ensureProfile(supabase, user);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Confirmation de compte échouée. Réessaie de te connecter.")}`
  );
}
