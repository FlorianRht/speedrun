import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-ink">Speedrun Tracker</h1>
          <p className="text-ink/60 text-sm mt-1">Connecte-toi pour suivre tes runs</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            {message}
          </p>
        )}

        <form action={signInWithGoogle}>
          <button type="submit" className="btn-secondary w-full">
            Continuer avec Google
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-ink/40">
          <div className="h-px bg-black/10 flex-1" />
          ou avec un email
          <div className="h-px bg-black/10 flex-1" />
        </div>

        <form className="card space-y-3" action={signInWithEmail}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" name="email" required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" name="password" required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full">
            Se connecter
          </button>
        </form>

        <form action={signUpWithEmail}>
          <details className="card">
            <summary className="cursor-pointer text-sm font-medium text-ink/70">
              Pas encore de compte ?
            </summary>
            <div className="space-y-3 mt-3">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" name="email" required />
              </div>
              <div>
                <label className="label">Mot de passe (6 caractères min.)</label>
                <input className="input" type="password" name="password" required minLength={6} />
              </div>
              <button type="submit" className="btn-secondary w-full">
                Créer mon compte
              </button>
            </div>
          </details>
        </form>
      </div>
    </main>
  );
}
