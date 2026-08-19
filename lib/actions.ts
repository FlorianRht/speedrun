"use server";

import { createClient } from "@/lib/supabase/server";
import { parseTimeToSeconds } from "@/lib/time";
import {
  createProfile,
  isUsernameTaken,
  normalizeUsername,
  validateUsername,
} from "@/lib/profiles";
import { authErrorMessage } from "@/lib/auth-errors";
import { redirect } from "next/navigation";

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const username = normalizeUsername(String(formData.get("username")));
  const supabase = await createClient();

  const usernameError = validateUsername(username);
  if (usernameError) {
    redirect(`/login?error=${encodeURIComponent(usernameError)}`);
  }

  if (await isUsernameTaken(supabase, username)) {
    redirect(`/login?error=${encodeURIComponent("Ce pseudo est déjà pris.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  }

  // Si confirmation email désactivée, session active → on crée le profil tout de suite
  if (data.user && data.session) {
    const { error: profileError } = await createProfile(supabase, data.user.id, username);
    if (profileError) {
      redirect(`/login?error=${encodeURIComponent("Erreur lors de la création du profil.")}`);
    }
    redirect("/celeste");
  }

  redirect(
    `/login?message=${encodeURIComponent("Compte créé, vérifie tes mails pour confirmer.")}`
  );
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(authErrorMessage(error.message))}`);
  }
  redirect("/celeste");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteRun(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const runId = String(formData.get("runId"));
  const gameSlug = String(formData.get("gameSlug"));

  await supabase.from("runs").delete().eq("id", runId).eq("user_id", user.id);

  redirect(`/${gameSlug}/runs`);
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

  // Calcul du temps d'intro = temps total - somme des splits
  const sumSplits = splitsPayload.reduce((sum, s) => sum + (s.time_seconds ?? 0), 0);
  const introTime = sumSplits > 0 ? totalTimeSeconds - sumSplits : null;

  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      user_id: user.id,
      game_id: game.id,
      category_id: categoryId || null,
      run_date: runDate,
      total_time_seconds: totalTimeSeconds,
      intro_time_seconds: introTime && introTime > 0 ? introTime : null,
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
