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

  const { data: games } = await supabase.from("games").select("slug, name").order("name");

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold font-display">Tes jeux</h1>
        <form action={signOut}>
          <button className="text-sm text-ink/50 hover:text-ink">Déconnexion</button>
        </form>
      </div>

      <div className="grid gap-4">
        {(games ?? []).map((g) => (
          <Link
            key={g.slug}
            href={`/${g.slug}`}
            className="card flex items-center justify-between hover:shadow-md transition"
          >
            <span className="font-semibold">{g.name}</span>
            <span className="text-berry text-sm">Voir mes stats →</span>
          </Link>
        ))}
        {(!games || games.length === 0) && (
          <p className="text-ink/50 text-sm">Aucun jeu configuré pour l'instant.</p>
        )}
      </div>
    </main>
  );
}
