import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speedrun Tracker",
  description: "Suivi de progression speedrun, jeu par jeu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
