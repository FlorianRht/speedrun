"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = (gameSlug: string) => [
  {
    href: `/${gameSlug}`,
    label: "Stats",
    match: (path: string) =>
      path === `/${gameSlug}` || path.startsWith(`/${gameSlug}/player/`),
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: `/${gameSlug}/leaderboard`,
    label: "Classement",
    match: (path: string) => path.startsWith(`/${gameSlug}/leaderboard`),
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2M3 20h18M5 20V9l7-4 7 4v11" />
      </svg>
    ),
  },
  {
    href: `/${gameSlug}/runs`,
    label: "Runs",
    match: (path: string) => path.startsWith(`/${gameSlug}/runs`),
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: `/${gameSlug}/add`,
    label: "Ajouter",
    match: (path: string) => path.startsWith(`/${gameSlug}/add`),
    highlight: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
      </svg>
    ),
  },
];

export function MobileBottomNav({ gameSlug }: { gameSlug: string }) {
  const pathname = usePathname();
  const items = tabs(gameSlug);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--background) 92%, transparent)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="grid grid-cols-4 min-h-[68px]">
        {items.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`touch-manipulation flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] font-medium transition active:opacity-70 ${
                active
                  ? tab.highlight
                    ? "text-berry"
                    : "text-foreground"
                  : "text-muted"
              }`}
            >
              <span className={active && tab.highlight ? "text-berry" : ""}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
