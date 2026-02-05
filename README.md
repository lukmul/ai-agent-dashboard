# AI Agent Dashboard

Multi-project web dashboard pro sledování výkonnosti Claude AI agentů, prohlížení memory storage a správu projektů.

## Tech Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui komponenty
- **Charts:** Recharts
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Auth:** Clerk (email/social login)
- **GitHub Integration:** Octokit API (OAuth)
- **Real-time:** Supabase Realtime
- **Hosting:** Vercel

## Features

- 🔐 **Autentizace** - Clerk (email/password, social providers)
- 📊 **Multi-project monitoring** - Přepínání mezi projekty
- 🤖 **Agent metrics** - Success rate, avg duration, trendy
- 🧠 **Memory browser** - Prohlížení a vyhledávání v memory entries
- 📈 **Performance trends** - Grafy výkonnosti v čase
- 🔄 **GitHub sync** - Automatické stahování `.claude/metrics/agent-stats.json` z repozitářů
- ⚡ **Real-time updates** - Supabase Realtime subscriptions

## Setup

### 1. Prerekvizity

- Node.js 18+
- npm nebo pnpm
- Supabase účet (https://supabase.com)
- Clerk účet (https://clerk.com)
- GitHub účet (pro OAuth)

### 2. Supabase Setup

1. Vytvoř Supabase projekt: https://supabase.com/dashboard
2. Spusť SQL migraci: `supabase/migrations/001_initial_schema.sql`
3. Zkopíruj credentials:
   - Project URL
   - Anon key
   - Service role key

### 3. Clerk Setup

1. Vytvoř Clerk aplikaci: https://dashboard.clerk.com
2. Povolit email/password + social providers
3. Zkopíruj API keys:
   - Publishable key
   - Secret key

### 4. GitHub OAuth Setup

1. GitHub App: https://github.com/settings/apps/new
2. Permissions: `repo` (read .claude/ files)
3. Callback URL: `https://your-domain.vercel.app/api/auth/github/callback`
4. Zkopíruj:
   - Client ID
   - Client Secret

### 5. Environment Variables

Vytvoř `.env.local` v kořenu projektu:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxx
GITHUB_CLIENT_SECRET=xxx
```

### 6. Instalace a Spuštění

```bash
# Instalace závislostí
npm install

# Development server
npm run dev

# Production build
npm run build
npm run start
```

Aplikace běží na `http://localhost:3000`.

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: Initial Next.js Web Dashboard"
git branch -M main
git remote add origin git@github.com:username/ai-agent-dashboard.git
git push -u origin main
```

### 2. Import do Vercel

1. https://vercel.com/new
2. Import GitHub repository
3. Add environment variables (všechny z `.env.local`)
4. Deploy

### 3. Post-deployment

1. Aktualizuj GitHub OAuth Callback URL na Vercel domain
2. Aktualizuj Clerk Allowed Origins na Vercel domain

## API Endpoints

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/projects` | GET | Seznam všech projektů uživatele |
| `/api/projects` | POST | Vytvoření nového projektu |
| `/api/projects/[id]/sync` | POST | Synchronizace dat z GitHub |
| `/api/metrics?projectId={id}` | GET | Agent metrics pro projekt |
| `/api/memory?projectId={id}` | GET | Memory entries pro projekt |

## Database Schema

### users
- `id` - UUID
- `clerk_id` - TEXT UNIQUE
- `email` - TEXT NOT NULL
- `github_username` - TEXT
- `github_token` - TEXT (encrypted)

### projects
- `id` - UUID
- `user_id` - UUID (FK)
- `name` - TEXT NOT NULL
- `github_repo` - TEXT (format: "owner/repo")
- `last_synced_at` - TIMESTAMPTZ

### agent_metrics
- `id` - UUID
- `project_id` - UUID (FK)
- `agent_name` - TEXT NOT NULL
- `total_runs` - INT
- `successful_runs` - INT
- `failed_runs` - INT
- `success_rate` - FLOAT
- `avg_duration_seconds` - FLOAT
- `last_run` - TIMESTAMPTZ
- `trend` - TEXT (improving/stable/regressing)
- UNIQUE(project_id, agent_name)

### memory_entries
- `id` - UUID
- `project_id` - UUID (FK)
- `entity_name` - TEXT NOT NULL
- `entity_type` - TEXT NOT NULL
- `observation` - TEXT NOT NULL
- `metadata` - JSONB

## Multi-Project Support

- **1 user** → **N projects** (Dys, Cteme2, Cteme3, ...)
- **1 project** → **29 agents** (shared global agents)
- **Metrics** → per-project (`.claude/metrics/agent-stats.json` v každém repo)
- **Memory** → per-project (MCP memory je izolovaná per-workspace)

## Security

- ✅ Clerk session management
- ✅ API routes ověřují `userId` z session
- ✅ Supabase RLS policies: `user_id = auth.uid()`
- ✅ GitHub token encrypted v DB
- ✅ CORS restricted to Vercel domain
- ✅ Input validation (Zod schemas)

## Troubleshooting

### GitHub Sync selhává

1. Ověř, že GitHub token má `repo` permissions
2. Zkontroluj, že `.claude/metrics/agent-stats.json` existuje v repo
3. Zkontroluj Supabase logs pro error details

### Supabase Realtime nefunguje

1. Ověř, že Realtime je enabled v Supabase dashboard
2. Zkontroluj, že RLS policies povolují SELECT
3. Zkontroluj browser console pro WebSocket errors

### Clerk autentizace selhává

1. Ověř, že `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` je správně nastavený
2. Zkontroluj Clerk dashboard → Allowed Origins
3. Vyčisti browser cookies a zkus znovu

## License

MIT
