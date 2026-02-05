# Vercel Deployment Guide

Kompletní návod na deployment AI Agent Dashboard na Vercel.

## 📋 Prerequisites

- [x] GitHub account s repozitářem `lukmul/ai-agent-dashboard`
- [x] Vercel account (https://vercel.com/signup)
- [x] Clerk account s projektem (https://clerk.com)
- [x] Supabase account s projektem (https://supabase.com)
- [ ] Environment variables připravené (viz níže)

## 🚀 Deployment Steps (Dashboard)

### 1. Import GitHub Repository

1. Přejdi na: **https://vercel.com/new**
2. Vyber: **Import Git Repository**
3. Najdi: `lukmul/ai-agent-dashboard`
4. Klikni: **Import**

### 2. Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./`
**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)
**Install Command:** `npm install` (default)

✅ Ponechej všechny defaults, pouze přidej Environment Variables (krok 3).

### 3. Environment Variables (KRITICKÉ!)

V Vercel Project Settings → Environment Variables přidej:

#### Supabase (3 proměnné)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbo...your-service-role-key
```

#### Clerk (2 proměnné)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your-publishable-key
CLERK_SECRET_KEY=sk_test_...your-secret-key
```

#### GitHub (1 proměnná - optional)

```env
GITHUB_TOKEN=ghp_xxx  # Pokud máš, přidej pro Sync funkci
```

**Poznámka:** Všechny tyto hodnoty najdeš v `.env.vercel` souboru v root složce projektu.

### 4. Deploy

1. Klikni: **Deploy**
2. Čekej 2-3 minuty (build + deployment)
3. ✅ Deployment úspěšný!

**Production URL:** `https://ai-agent-dashboard-xxx.vercel.app`

---

## 🔧 Post-Deployment Configuration

### 1. Clerk Dashboard

**Přidej Vercel URL do Allowed Redirect URLs:**

1. Přejdi: https://dashboard.clerk.com
2. Vyber svůj projekt
3. Settings → **Domains**
4. Přidej:
   - `https://ai-agent-dashboard-xxx.vercel.app`
   - `https://ai-agent-dashboard-xxx.vercel.app/login`
   - `https://ai-agent-dashboard-xxx.vercel.app/dashboard`

### 2. Supabase Dashboard

**Přidej Vercel URL do Site URL:**

1. Přejdi: https://app.supabase.com
2. Vyber svůj projekt
3. Settings → **API**
4. **Site URL:** `https://ai-agent-dashboard-xxx.vercel.app`

---

## ✅ Post-Deployment Testing

### 1. Basic Smoke Test

```bash
# Homepage
curl -I https://ai-agent-dashboard-xxx.vercel.app
# Expected: 200 OK nebo 307 Redirect

# API Health
curl https://ai-agent-dashboard-xxx.vercel.app/api/projects
# Expected: 401 Unauthorized (pokud nejsi přihlášen) nebo JSON response
```

### 2. Manual Testing Checklist

**Login Flow:**
- [ ] Otevři `https://ai-agent-dashboard-xxx.vercel.app`
- [ ] Přesměruje na `/login`
- [ ] Clerk SignIn form se zobrazí
- [ ] Přihlaš se (email/password nebo Google)
- [ ] Přesměruje na `/dashboard`

**Dashboard:**
- [ ] ProjectSwitcher dropdown funguje
- [ ] ThemeToggle přepíná dark/light mode
- [ ] Metriky se načtou po vytvoření projektu

**Projects Page:**
- [ ] Otevři `/projects`
- [ ] "Add Project" tlačítko funguje
- [ ] Project cards se zobrazují
- [ ] "Sync" button synchronizuje GitHub data

---

## 🔄 Auto-Deploy Configuration

**Po prvním deploymentu Vercel automaticky:**

1. **Monitoruje GitHub repo** `lukmul/ai-agent-dashboard`
2. **Auto-deploy při push do `main`**
   - Každý commit na `main` branch → nový production deploy
3. **Preview deployments pro PR**
   - Pull requesty → unique preview URL

**Disable auto-deploy (optional):**
- Vercel Project Settings → Git → **Auto Deploy: OFF**

---

## 📊 Monitoring & Logs

### Vercel Dashboard

- **Deployments:** https://vercel.com/dashboard/deployments
- **Analytics:** https://vercel.com/dashboard/analytics
- **Logs:** https://vercel.com/dashboard/logs
- **Domains:** https://vercel.com/dashboard/domains

### Useful Commands

```bash
# Vercel CLI - trigger redeploy
vercel --prod

# Check deployment logs
vercel logs https://ai-agent-dashboard-xxx.vercel.app

# List all deployments
vercel ls
```

---

## 🐛 Troubleshooting

### Build Failed

**Error:** `Module not found: Can't resolve 'tailwindcss-animate'`

**Fix:**
```bash
npm install -D tailwindcss-animate
git add package.json package-lock.json
git commit -m "fix: add tailwindcss-animate dependency"
git push
```

### Clerk Authentication Fails

**Error:** `Redirect URL not allowed`

**Fix:** Přidej Vercel URL do Clerk Dashboard → Domains → Allowed Redirect URLs

### Supabase Connection Fails

**Error:** `Failed to fetch metrics`

**Fix 1:** Zkontroluj environment variables ve Vercel Dashboard
**Fix 2:** Přidej Vercel URL do Supabase Dashboard → Settings → Site URL

### TypeScript Errors in Build

**Error:** `Type error: ...`

**Fix:** Zkontroluj `npm run build` lokálně před push
```bash
npm run build  # Musí projít bez chyb
```

---

## 🔐 Security Best Practices

1. **Environment Variables:**
   - ✅ Všechny secrets v Vercel Environment Variables (ne v kódu!)
   - ✅ `.env.local` v `.gitignore` (nikdy necommit secrets!)

2. **Clerk Configuration:**
   - ✅ Allowed Redirect URLs pouze pro production domains
   - ✅ Nepoužívej test keys v production (upgrade na production keys)

3. **Supabase RLS:**
   - ✅ Row Level Security enabled na všech tabulkách
   - ✅ Service Role Key používej jen v API routes (server-side)

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/app/building-your-application/deploying
- **Clerk Production:** https://clerk.com/docs/deployments/production
- **Supabase Production:** https://supabase.com/docs/guides/platform/going-into-prod

---

## 🎉 Success!

Po dokončení všech kroků máš:

- ✅ Production deployment na Vercel
- ✅ Auto-deploy při push do GitHub
- ✅ Clerk authentication funguje
- ✅ Supabase real-time metrics fungují
- ✅ Dark mode toggle na všech stránkách

**Gratulace!** 🚀
