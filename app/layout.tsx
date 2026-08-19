import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "MyPace",
  description: "Ton rythme, tes runs — suivi de progression speedrun, jeu par jeu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen font-body">{children}</body>
    </html>
  );
}
