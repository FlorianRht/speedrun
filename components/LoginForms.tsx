"use client";

import { signInWithEmail, signUpWithEmail } from "@/lib/actions";
import { SubmitButton } from "./ui/SubmitButton";

export function LoginForms({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display">MyPace</h1>
        <p className="text-muted text-sm mt-1">Connecte-toi pour suivre tes runs</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <form className="card space-y-3" action={signInWithEmail}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" name="email" required />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input className="input" type="password" name="password" required minLength={6} />
        </div>
        <SubmitButton pendingLabel="Connexion..." className="w-full">
          Se connecter
        </SubmitButton>
      </form>

      <form action={signUpWithEmail}>
        <details className="card">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            Pas encore de compte ?
          </summary>
          <div className="space-y-3 mt-3">
            <div>
              <label className="label">Pseudo</label>
              <input
                className="input"
                type="text"
                name="username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                autoComplete="username"
              />
              <p className="text-xs text-muted mt-1">
                3-20 caractères, lettres, chiffres et _ uniquement
              </p>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" name="email" required />
            </div>
            <div>
              <label className="label">Mot de passe (6 caractères min.)</label>
              <input className="input" type="password" name="password" required minLength={6} />
            </div>
            <SubmitButton variant="secondary" pendingLabel="Création..." className="w-full">
              Créer mon compte
            </SubmitButton>
          </div>
        </details>
      </form>
    </div>
  );
}
