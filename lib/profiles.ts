import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Le pseudo doit faire au moins 3 caractères.";
  if (username.length > 20) return "Le pseudo ne peut pas dépasser 20 caractères.";
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Le pseudo ne peut contenir que des lettres, chiffres et underscores.";
  }
  return null;
}

export async function isUsernameTaken(supabase: SupabaseClient, username: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return !!data;
}

export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  username: string
) {
  return supabase.from("profiles").insert({ id: userId, username });
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const fromMetadata = user.user_metadata?.username;
  const emailPrefix = user.email?.split("@")[0] ?? "joueur";
  let username = fromMetadata
    ? normalizeUsername(String(fromMetadata))
    : normalizeUsername(emailPrefix) || "joueur";

  if (validateUsername(username)) {
    username = `joueur${Math.floor(Math.random() * 9999)}`;
  }

  for (let i = 0; i < 5; i++) {
    const { error } = await createProfile(supabase, user.id, username);
    if (!error) return;
    username = `${normalizeUsername(emailPrefix).slice(0, 12) || "joueur"}${Math.floor(Math.random() * 9999)}`;
  }
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ id: string; username: string } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", userId)
    .maybeSingle();
  return data;
}
