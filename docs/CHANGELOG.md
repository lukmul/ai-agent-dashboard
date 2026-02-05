# Changelog

Všechny významné změny v tomto projektu budou dokumentovány v tomto souboru.

Formát je založen na [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/),
a projekt dodržuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-05

### feat: Complete Dashboard UI Implementation (Fáze 0-5)

**Design v Pencil.dev (FÁZE 0)**
- Vytvořeny 3 .pen design soubory:
  - `design/login-page.pen` - Login page s Clerk SignIn
  - `design/projects-page.pen` - Projects page s grid layout
  - `design/dark-mode-toggle.pen` - Dark mode toggle component
- Vygenerovány screenshots pro review

**Login Page (FÁZE 1)**
- `src/app/(auth)/login/page.tsx` - Clerk SignIn s custom stylingem
- Gradient pozadí (gray-50 → gray-100)
- Floating ThemeToggle v pravém horním rohu
- Redirect na /dashboard po přihlášení

**Projects Page (FÁZE 2)**
- `src/app/projects/page.tsx` - Seznam projektů s CRUD
- Grid layout pro project cards (3 sloupce desktop)
- Action buttons: "View" (primary blue), "Sync" (outline)
- Empty state pro žádné projekty
- ThemeToggle v headeru vedle "Add Project"

**Real-time Metrics (FÁZE 3)**
- `src/hooks/useRealtimeMetrics.ts` - Supabase Realtime subscription
- Automatická aktualizace agent metrik bez manuálního refresh
- Support pro INSERT, UPDATE, DELETE events
- Error handling s loading states
- Integrace do dashboard/page.tsx (nahrazuje useState + fetch)

**Tailwind Config + Dark Mode (FÁZE 4)**
- `tailwind.config.ts` - Dark mode s class strategy
- Custom color tokens: success, warning, danger
- Design system tokens (border, background, foreground)
- `src/components/ThemeToggle.tsx` - Toggle switch s Sun/Moon ikonami
- localStorage persistence + system preference detection
- `src/app/globals.css` - Dark mode CSS pravidla (.dark class)

**Supabase Client/Server Split (FÁZE 5)**
- `src/lib/supabase-client.ts` - Client-side Supabase (bez Clerk importů)
- `src/lib/supabase-server.ts` - Server-side Supabase (s Clerk auth)
- Oprava "server-only cannot be imported from Client Component"
- Aktualizace všech importů v API routes a hooks

**Ovlivněné soubory:**
- Created: `design/*.pen` (3 soubory)
- Created: `src/app/(auth)/login/page.tsx`
- Created: `src/hooks/useRealtimeMetrics.ts`
- Created: `tailwind.config.ts`
- Created: `src/components/ThemeToggle.tsx`
- Created: `src/lib/supabase-client.ts`
- Renamed: `src/lib/supabase.ts` → `src/lib/supabase-server.ts`
- Modified: `src/app/projects/page.tsx` (ThemeToggle integration)
- Modified: `src/app/dashboard/page.tsx` (useRealtimeMetrics + ThemeToggle)
- Modified: `src/app/globals.css` (dark mode CSS)
- Modified: `src/app/api/projects/route.ts` (import z supabase-server)
- Modified: `src/app/api/projects/[id]/sync/route.ts` (import z supabase-server)
- Modified: `src/app/api/memory/route.ts` (import z supabase-server)
- Modified: `src/app/api/metrics/route.ts` (import z supabase-server)

**Build Status:**
- ✅ TypeScript compilation successful
- ✅ All routes generated (11/11)
- ⚠️  Warning: tailwindcss-animate not installed (ignorovatelné)

**Testing:**
- Dev server: http://localhost:3000
- Manual E2E testing required (checklist provided)

---

## Formát záznamu

```
## YYYY-MM-DD

### typ: Stručný popis

- Detail změny 1
- Detail změny 2
- Ovlivněné soubory: seznam
```

**Typy:** feat, fix, refactor, docs, test, chore, perf
