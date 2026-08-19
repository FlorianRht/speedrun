# MyPace

Suivi de progression pour tes speedruns (Celeste pour l'instant, pensé pour
accueillir d'autres jeux plus tard). Next.js + Supabase (DB + auth), déployable
gratuitement sur Vercel.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois créé, ouvre **SQL Editor** → **New query**, colle le contenu de
   `supabase/schema.sql`, puis **Run**. Ça crée les tables, les policies de
   sécurité (RLS), et insère Celeste + ses 7 chapitres + ses catégories.
3. Va dans **Project Settings → API** : note l'**URL** et la clé **anon public**.

## 2. Activer la connexion Google (en plus de l'email)

1. Dans Supabase : **Authentication → Providers → Google** → active-le.
2. Il te faut un Client ID / Client Secret Google : sur
   [console.cloud.google.com](https://console.cloud.google.com) :
   - Crée un projet (ou utilise un existant).
   - **APIs & Services → OAuth consent screen** : configure-le en mode
     "External", ajoute-toi comme test user si besoin.
   - **APIs & Services → Credentials → Create Credentials → OAuth client ID**,
     type "Web application".
   - Dans **Authorized redirect URIs**, ajoute l'URL de callback que Supabase
     t'indique sur sa page Google Provider (du type
     `https://xxxxx.supabase.co/auth/v1/callback`).
   - Copie le Client ID et le Client Secret dans Supabase, sauvegarde.
3. Authentication → **URL Configuration** : ajoute l'URL de ton site (celle de
   Vercel, une fois déployé) dans **Site URL** et **Redirect URLs**
   (ex: `https://ton-app.vercel.app/**`). En local, ajoute aussi
   `http://localhost:3000/**`.

## 3. Config locale (optionnel, pour tester avant de déployer)

```bash
cp .env.local.example .env.local
```

Remplis `.env.local` avec l'URL et la clé anon notées à l'étape 1, puis :

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## 4. Déployer sur Vercel (gratuit)

1. Pousse ce projet sur un repo GitHub.
2. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importe le repo.
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Déploie. Vercel te donne une URL (`https://ton-app.vercel.app`).
5. Retourne dans Supabase (étape 2.3) et mets à jour Site URL / Redirect URLs
   avec cette vraie URL Vercel.

## Structure du projet

- `app/[game]/` : pages spécifiques à un jeu (stats, ajout de run, journal des
  runs). Le slug `game` (ex: `celeste`) vient de la table `games`.
- `app/login/` : connexion (email/mot de passe + Google).
- `lib/actions.ts` : Server Actions (auth, ajout de run).
- `lib/time.ts` : conversion "1:27:51.938" ⇄ secondes.
- `supabase/schema.sql` : schéma complet + policies + seed Celeste.

## Ajouter un nouveau jeu plus tard

Dans le SQL Editor de Supabase :

```sql
insert into games (slug, name) values ('super-mario-odyssey', 'Super Mario Odyssey');

insert into categories (game_id, name)
select id, unnest(array['Any%', '100%'])
from games where slug = 'super-mario-odyssey';

insert into chapters (game_id, name, sort_order)
select g.id, c.name, c.sort_order
from games g, (values
  ('Cap Kingdom', 1),
  ('Cascade Kingdom', 2)
) as c(name, sort_order)
where g.slug = 'super-mario-odyssey';
```

Le site prend automatiquement en compte le nouveau jeu sur `/super-mario-odyssey`,
`/super-mario-odyssey/add`, etc. — aucune modification de code nécessaire tant
que la structure (catégories + chapitres avec temps/morts) suffit. Pour un jeu
qui a besoin d'un affichage vraiment différent, on pourra dupliquer et adapter
un des fichiers dans `app/[game]/`.
