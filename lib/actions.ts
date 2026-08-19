"use server";

import { createClient } from "@/lib/supabase/server";
import { parseTimeToSeconds } from "@/lib/time";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/login?message=Compte créé, vérifie tes mails pour confirmer.");
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/celeste");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Erreur Google")}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addRun(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const gameSlug = String(formData.get("gameSlug"));
  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("slug", gameSlug)
    .single();
  if (!game) throw new Error("Jeu introuvable");

  const categoryId = String(formData.get("categoryId"));
  const runDate = String(formData.get("runDate"));
  const totalTimeText = String(formData.get("totalTime"));
  const comment = String(formData.get("comment") ?? "");

  const totalTimeSeconds = parseTimeToSeconds(totalTimeText);
  if (totalTimeSeconds === null) {
    throw new Error("Format de temps invalide (attendu: mm:ss.cc ou h:mm:ss.cc)");
  }

  // Récupère les chapitres du jeu pour lire les champs dynamiques du form
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", game.id)
    .order("sort_order");

  let totalDeaths = 0;
  const splitsPayload: { chapter_id: string; time_seconds: number | null; deaths: number }[] = [];

  for (const chapter of chapters ?? []) {
    const timeText = String(formData.get(`chapter_time_${chapter.id}`) ?? "");
    const deathsRaw = formData.get(`chapter_deaths_${chapter.id}`);
    const deaths = deathsRaw ? Number(deathsRaw) : 0;
    totalDeaths += Number.isNaN(deaths) ? 0 : deaths;

    splitsPayload.push({
      chapter_id: chapter.id,
      time_seconds: timeText ? parseTimeToSeconds(timeText) : null,
      deaths: Number.isNaN(deaths) ? 0 : deaths,
    });
  }

  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      user_id: user.id,
      game_id: game.id,
      category_id: categoryId || null,
      run_date: runDate,
      total_time_seconds: totalTimeSeconds,
      total_deaths: totalDeaths,
      comment,
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Erreur lors de l'ajout de la run");
  }

  if (splitsPayload.length > 0) {
    const { error: splitsError } = await supabase
      .from("run_splits")
      .insert(splitsPayload.map((s) => ({ ...s, run_id: run.id })));
    if (splitsError) {
      throw new Error(splitsError.message);
    }
  }

  redirect(`/${gameSlug}/runs`);
}
