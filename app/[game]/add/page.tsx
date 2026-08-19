import { createClient } from "@/lib/supabase/server";
import { addRun } from "@/lib/actions";

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Ajouter une run - {game.name}</h1>
        <p className="text-ink/60 text-sm mt-1">
          Tape les temps exactement comme en jeu (ex: 34:16.830 ou 1:27:51.938).
        </p>
      </div>

      <form action={addRun} className="space-y-6">
        <input type="hidden" name="gameSlug" value={game.slug} />

        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" name="runDate" required />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" name="categoryId" required>
                <option value="">-- Choisir --</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Temps total (comme en jeu)</label>
            <input className="input font-mono" type="text" name="totalTime" placeholder="1:27:51.938" required />
          </div>

          <div>
            <label className="label">Commentaire</label>
            <textarea className="input" name="comment" rows={2} />
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Détail par chapitre</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr,110px,80px] gap-3 text-xs font-medium text-ink/50 px-1">
              <span>Chapitre</span>
              <span>Temps</span>
              <span>Morts</span>
            </div>
            {(chapters ?? []).map((chapter) => (
              <div key={chapter.id} className="grid grid-cols-[1fr,110px,80px] gap-3 items-center">
                <span className="text-sm">{chapter.name}</span>
                <input
                  className="input font-mono text-sm py-1.5"
                  type="text"
                  name={`chapter_time_${chapter.id}`}
                  placeholder="mm:ss.cc"
                />
                <input
                  className="input text-sm py-1.5"
                  type="number"
                  min={0}
                  name={`chapter_deaths_${chapter.id}`}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Enregistrer la run
        </button>
      </form>
    </div>
  );
}
