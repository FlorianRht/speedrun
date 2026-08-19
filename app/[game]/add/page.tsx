import { createClient } from "@/lib/supabase/server";
import { AddRunForm } from "@/components/AddRunForm";

export default async function AddRunPage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, name, slug")
    .eq("slug", gameSlug)
    .single();
  if (!game) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("game_id", game.id)
    .order("name");

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, sort_order")
    .eq("game_id", game.id)
    .order("sort_order");

  return (
    <AddRunForm
      gameSlug={game.slug}
      gameName={game.name}
      categories={categories ?? []}
      chapters={chapters ?? []}
    />
  );
}
