import Link from "next/link";
import { signOut } from "@/lib/actions";
import { ThemeToggle } from "./ThemeToggle";

export function HomeHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md w-full max-w-full overflow-hidden"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="font-bold font-display text-lg shrink-0">
          MyPace
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <form action={signOut}>
            <button
              className="rounded-full p-2.5 text-muted hover:text-foreground hover:bg-foreground/5 transition"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
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
