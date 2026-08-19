import Link from "next/link";
import { signOut } from "@/lib/actions";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar({
  gameName,
  gameSlug,
  gameIconUrl,
  showGameSelector = false,
}: {
  gameName: string;
  gameSlug: string;
  gameIconUrl?: string;
  showGameSelector?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
      }}
    >
      <div className="w-full px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="font-bold font-display text-lg shrink-0">
            MyPace
          </Link>

          {showGameSelector && (
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition hover:opacity-80"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              {gameIconUrl && (
                <img src={gameIconUrl} alt={gameName} className="h-4 rounded-sm" />
              )}
              <span>{gameName}</span>
              <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          )}
        </div>

        <nav className="flex items-center gap-1">
          <NavLink href={`/${gameSlug}`}>Stats</NavLink>
          <NavLink href={`/${gameSlug}/runs`}>Runs</NavLink>
          <Link
            href={`/${gameSlug}/add`}
            className="ml-1 flex items-center gap-1.5 rounded-full bg-berry/10 text-berry text-sm font-medium px-4 py-1.5 hover:bg-berry/20 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
            </svg>
            Ajouter
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <button className="rounded-full p-2 text-muted hover:text-foreground hover:bg-foreground/5 transition" title="Déconnexion">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition"
    >
      {children}
    </Link>
  );
}
