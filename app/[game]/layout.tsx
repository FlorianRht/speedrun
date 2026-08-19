import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game } = await supabase
    .from("games")
    .select("id, slug, name")
    .eq("slug", gameSlug)
    .single();

  if (!game) notFound();

  return (
    <div>
      <NavBar gameName={game.name} gameSlug={game.slug} />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
