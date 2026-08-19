import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ensureProfile } from "@/lib/profiles";

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await ensureProfile(supabase, user);

  const { data: game } = await supabase
    .from("games")
    .select("id, slug, name, steam_app_id")
    .eq("slug", gameSlug)
    .single();

  if (!game) notFound();

  const iconUrl = game.steam_app_id
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_app_id}/capsule_184x69.jpg`
    : undefined;

  const { count } = await supabase.from("games").select("id", { count: "exact", head: true });
  const multipleGames = (count ?? 0) > 1;

  return (
    <div>
      <NavBar gameName={game.name} gameSlug={game.slug} gameIconUrl={iconUrl} showGameSelector={multipleGames} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
