import Link from "next/link";
import { signOut } from "@/lib/actions";

export function NavBar({ gameName, gameSlug }: { gameName: string; gameSlug: string }) {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold font-display text-ink">
            Speedrun Tracker
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/${gameSlug}`} className="text-ink/70 hover:text-ink">
              {gameName} - Stats
            </Link>
            <Link href={`/${gameSlug}/runs`} className="text-ink/70 hover:text-ink">
              Runs
            </Link>
            <Link href={`/${gameSlug}/add`} className="text-berry font-medium">
              + Ajouter une run
            </Link>
          </nav>
        </div>
        <form action={signOut}>
          <button className="text-sm text-ink/50 hover:text-ink">Déconnexion</button>
        </form>
      </div>
    </header>
  );
}
