# Deployment Guide

Kompletní průvodce nasazením AI Agent Dashboard na Vercel.

## Přehled Procesu

1. **Příprava projektu** - Git setup, env vars
2. **Supabase konfigurace** - Database setup, RLS policies
3. **Clerk konfigurace** - Auth providers, domains
4. **GitHub OAuth** - App registrace, permissions
5. **Vercel deployment** - Import repo, configure
6. **Post-deployment** - Testing, monitoring

---

## 1. Příprava Projektu

### Git Repository

```bash
cd /Users/lmuller/Documents/ai-agent-dashboard

# Inicializace Git
git init

# Přidání souborů
git add .

# První commit
git commit -m "feat: Initial Next.js Web Dashboard

- Next.js 15 + React 19 + TypeScript
- Supabase PostgreSQL database
- Clerk authentication
- GitHub OAuth integration
- Multi-project support
- Real-time updates
- Agent metrics & memory browser

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Vytvoření main branch
git branch -M main
```

### GitHub Repository

```bash
# Vytvoř repository na GitHub: https://github.com/new
# Název: ai-agent-dashboard
# Visibility: Private (doporučeno) nebo Public

# Přidání remote
git remote add origin git@github.com:USERNAME/ai-agent-dashboard.git

# Push
git push -u origin main
```

---

## 2. Supabase Konfigurace

### A. Vytvoření Projektu

1. Jdi na https://supabase.com/dashboard
2. Klikni "New project"
3. Zadej:
   - Project name: `ai-agent-dashboard`
   - Database password: (vygeneruj strong password)
   - Region: `Europe West (Frankfurt)` nebo nejbližší
4. Klikni "Create new project"
5. Čekej ~2 minuty na provisioning

### B. Spuštění Migrace

1. V Supabase dashboard → SQL Editor
2. Klikni "New query"
3. Zkopíruj obsah `supabase/migrations/001_initial_schema.sql`
4. Klikni "Run"
5. Ověř, že všechny tabulky byly vytvořeny:
   - `users`
   - `projects`
   - `agent_metrics`
   - `memory_entries`

### C. Kopírování Credentials

1. V Supabase dashboard → Settings → API
2. Zkopíruj:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (začíná na `eyJ`)
   - **service_role key**: `eyJhbGc...` (začíná na `eyJ`, delší než anon)

### D. Povolení Realtime

1. V Supabase dashboard → Database → Replication
2. Najdi tabulku `agent_metrics`
3. Zapni "Realtime" toggle
4. Ulož změny

---

## 3. Clerk Konfigurace

### A. Vytvoření Aplikace

1. Jdi na https://dashboard.clerk.com
2. Klikni "Add application"
3. Zadej:
   - Application name: `AI Agent Dashboard`
   - Sign-in options: `Email`, `Google`, `GitHub`
4. Klikni "Create application"

### B. Konfigurace Providers

**Email/Password:**
1. Settings → Authentication → Email & Password
2. Zapni "Email address"
3. Ulož

**Google OAuth:**
1. Settings → Authentication → Social Connections → Google
2. Zapni "Enabled"
3. (Clerk má default Google OAuth keys, nebo můžeš použít vlastní)

**GitHub OAuth:**
1. Settings → Authentication → Social Connections → GitHub
2. Zapni "Enabled"
3. (Clerk má default GitHub OAuth keys, nebo můžeš použít vlastní)

### C. Kopírování API Keys

1. V Clerk dashboard → API Keys
2. Zkopíruj:
   - **Publishable key**: `pk_test_xxx`
   - **Secret key**: `sk_test_xxx`

---

## 4. GitHub OAuth (pro sync)

**POZOR:** Toto je ODLIŠNÉ od Clerk GitHub OAuth. Tento GitHub App je pro čtení `.claude/` souborů z repozitářů.

### A. Vytvoření GitHub App

1. Jdi na https://github.com/settings/apps/new
2. Zadej:
   - **GitHub App name**: `AI Agent Dashboard Sync`
   - **Homepage URL**: `https://ai-agent-dashboard.vercel.app` (později aktualizuj)
   - **Callback URL**: `https://ai-agent-dashboard.vercel.app/api/auth/github/callback`
   - **Webhook**: Zaškrtni "Active" (optional, pro auto-sync)
     - Webhook URL: `https://ai-agent-dashboard.vercel.app/api/webhooks/github`
     - Webhook secret: (vygeneruj random string)
   - **Permissions:**
     - Repository permissions → Contents: `Read-only`
   - **Where can this GitHub App be installed?**: `Any account`
3. Klikni "Create GitHub App"

### B. Kopírování Credentials

1. Po vytvoření App:
   - **Client ID**: `Iv1.xxxxx`
   - Klikni "Generate a new client secret"
   - **Client Secret**: `xxxxx` (zkopíruj hned, zobrazí se pouze jednou)

---

## 5. Vercel Deployment

### A. Import Repository

1. Jdi na https://vercel.com/new
2. Import Git Repository:
   - Vyber GitHub
   - Autorizuj Vercel na GitHub
   - Vyber repository `USERNAME/ai-agent-dashboard`
3. Klikni "Import"

### B. Konfigurace Projektu

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### C. Environment Variables

Klikni "Environment Variables" a přidej:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# GitHub OAuth (pro sync)
GITHUB_CLIENT_ID=Iv1.xxx
GITHUB_CLIENT_SECRET=xxx
```

**IMPORTANT:** Ověř, že všechny hodnoty jsou správně zkopírované (žádné trailing spaces).

### D. Deploy

1. Klikni "Deploy"
2. Čekej ~2-3 minuty
3. Deployment dokončen → získáš URL: `https://ai-agent-dashboard.vercel.app`

---

## 6. Post-Deployment Konfigurace

### A. Aktualizace GitHub OAuth Callback

1. Jdi na https://github.com/settings/apps
2. Vyber "AI Agent Dashboard Sync"
3. Aktualizuj:
   - **Homepage URL**: `https://ai-agent-dashboard.vercel.app`
   - **Callback URL**: `https://ai-agent-dashboard.vercel.app/api/auth/github/callback`
   - **Webhook URL**: `https://ai-agent-dashboard.vercel.app/api/webhooks/github` (pokud používáš)
4. Ulož změny

### B. Aktualizace Clerk Domains

1. V Clerk dashboard → Settings → Domains
2. Přidej production domain:
   - Domain: `ai-agent-dashboard.vercel.app`
   - Klikni "Add domain"
3. V Settings → API Keys → Allowed Origins:
   - Přidej: `https://ai-agent-dashboard.vercel.app`

### C. Testování Production Build

1. Otevři `https://ai-agent-dashboard.vercel.app`
2. Projdi testing checklist (viz `TESTING.md`)
3. Testuj zejména:
   - Sign in/up flow
   - GitHub OAuth
   - Project sync
   - Real-time updates

---

## 7. Custom Domain (Optional)

### A. Přidání Custom Domain

1. V Vercel dashboard → Project Settings → Domains
2. Klikni "Add"
3. Zadej domain: `dashboard.example.com`
4. Vercel poskytne DNS záznamy:
   ```
   Type: CNAME
   Name: dashboard
   Value: cname.vercel-dns.com
   ```

### B. Konfigurace DNS

1. U svého DNS providera (Cloudflare, Namecheap, atd.)
2. Přidej CNAME záznam podle instrukcí Vercel
3. Čekej na propagaci (~10 minut až 24 hodin)

### C. Aktualizace Callbacks

1. Aktualizuj GitHub OAuth callback na `https://dashboard.example.com/api/auth/github/callback`
2. Aktualizuj Clerk domains na `dashboard.example.com`

---

## 8. Monitoring & Logs

### Vercel Logs

1. V Vercel dashboard → Project → Logs
2. Real-time logs všech requestů
3. Filtr podle:
   - Status code
   - Path
   - Time range

### Supabase Logs

1. V Supabase dashboard → Logs
2. Database logs
3. API logs
4. Realtime logs

### Clerk Logs

1. V Clerk dashboard → Logs
2. Authentication events
3. User sessions

---

## 9. Troubleshooting

### Build Failed

**Error: `Module not found`**

```bash
# Lokálně:
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: `Type error`**

```bash
# Lokálně:
npm run type-check
# Oprav všechny TypeScript errors
```

### Runtime Errors

**Error: `Clerk auth failed`**

1. Ověř, že env vars jsou správně nastavené
2. Zkontroluj Clerk dashboard → Allowed Origins
3. Vyčisti browser cookies

**Error: `Supabase connection failed`**

1. Ověř, že `NEXT_PUBLIC_SUPABASE_URL` je správný
2. Zkontroluj, že `SUPABASE_SERVICE_ROLE_KEY` má správné permissions
3. Zkontroluj Supabase dashboard → Settings → API → API Keys

**Error: `GitHub sync failed`**

1. Ověř, že GitHub token má `repo` permissions
2. Zkontroluj, že `.claude/metrics/agent-stats.json` existuje
3. Zkontroluj API logs v Vercel

---

## 10. Rollback Strategy

### Revert Deployment

1. V Vercel dashboard → Project → Deployments
2. Najdi předchozí working deployment
3. Klikni "..." → "Promote to Production"
4. Confirm

### Database Rollback

1. V Supabase dashboard → Database → Backups
2. Vyber backup point
3. Restore (CAREFUL: destructive operation)

---

## 11. Security Checklist

- [ ] Všechny env vars jsou nastavené
- [ ] `.env.local` NENÍ commitnutý do Git
- [ ] Supabase service role key je POUZE v server-side kódu
- [ ] Clerk secret key je POUZE v server-side kódu
- [ ] GitHub client secret je POUZE v server-side kódu
- [ ] RLS policies jsou enabled v Supabase
- [ ] CORS je restricted na Vercel domain
- [ ] Rate limiting je enabled (Vercel default)

---

## 12. Performance Optimization

### A. Vercel Analytics

1. V Vercel dashboard → Project → Analytics
2. Zapni "Web Analytics"
3. Sleduj:
   - Page load times
   - Core Web Vitals
   - Traffic patterns

### B. Supabase Connection Pooling

Default Supabase connection pool: 15 connections

Pro high-traffic aplikace:
1. V Supabase dashboard → Settings → Database
2. Zvýšit "Max connections"

### C. Next.js Optimizations

Již implementováno:
- ✅ Image optimization (Next.js Image component)
- ✅ Font optimization (Geist fonts)
- ✅ Code splitting (automatic)
- ✅ Static generation where possible

---

## 13. Maintenance

### Regular Tasks

**Weekly:**
- [ ] Zkontrolovat Vercel logs na errors
- [ ] Zkontrolovat Supabase usage
- [ ] Zkontrolovat Clerk usage

**Monthly:**
- [ ] Review dependency updates (`npm outdated`)
- [ ] Security audit (`npm audit`)
- [ ] Performance audit (Lighthouse)

**Quarterly:**
- [ ] Major dependency updates
- [ ] Database backup verification
- [ ] Load testing

---

## Contact

Pro podporu nebo dotazy:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Clerk Support: https://clerk.com/support
