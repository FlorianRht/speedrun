import Link from "next/link";
import { signOut } from "@/lib/actions";
import { ThemeToggle } from "./ThemeToggle";

export function HomeHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md w-full"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="w-full px-4 md:px-6 min-h-14 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="touch-manipulation font-bold font-display text-lg shrink-0 inline-flex items-center min-h-11 px-1 -ml-1"
        >
          MyPace
        </Link>

        <div className="flex items-center gap-0.5 shrink-0">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="touch-manipulation inline-flex items-center justify-center rounded-full min-w-11 min-h-11 p-2.5 text-muted hover:text-foreground hover:bg-foreground/5 transition active:opacity-70"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
