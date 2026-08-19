import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/actions";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: games } = await supabase.from("games").select("slug, name, steam_app_id").order("name");

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold font-display">Les jeux</h1>
        <form action={signOut}>
            <button className="text-sm text-muted hover:text-foreground transition">Déconnexion</button>
        </form>
      </div>

      <div className="grid gap-4">
        {(games ?? []).map((g) => {
          const headerUrl = g.steam_app_id
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steam_app_id}/header.jpg`
            : null;
          return (
            <Link
              key={g.slug}
              href={`/${g.slug}`}
              className="group relative rounded-2xl overflow-hidden h-32 border border-border hover:border-berry/50 transition"
            >
              {headerUrl && (
                <img
                  src={headerUrl}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
              <div className="relative h-full flex items-center justify-between px-8">
                <span className="font-bold font-display text-xl">{g.name}</span>
                <span className="text-berry text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                  Voir mes stats →
                </span>
              </div>
            </Link>
          );
        })}
        {(!games || games.length === 0) && (
          <p className="text-muted text-sm">Aucun jeu configuré pour l'instant.</p>
        )}
      </div>
    </main>
  );
}
