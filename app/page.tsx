import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import { ensureProfile } from "@/lib/profiles";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await ensureProfile(supabase, user);

  const { data: games } = await supabase.from("games").select("slug, name, steam_app_id").order("name");

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold font-display">Les jeux</h1>
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
              className="group relative rounded-xl md:rounded-2xl overflow-hidden h-28 md:h-32 border border-border hover:border-berry/50 transition active:scale-[0.98]"
            >
              {headerUrl && (
                <img
                  src={headerUrl}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
              <div className="relative h-full flex items-center justify-between px-5 md:px-8">
                <span className="font-bold font-display text-lg md:text-xl">{g.name}</span>
                <span className="text-berry text-sm font-medium md:opacity-0 md:group-hover:opacity-100 transition">
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
