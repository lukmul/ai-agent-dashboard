# Testing Checklist

## Manual Testing

### Auth Flow

- [ ] **Sign Up**
  - [ ] Email/password registrace funguje
  - [ ] Social provider (Google/GitHub) registrace funguje
  - [ ] Redirect na /dashboard po úspěšné registraci
  - [ ] Uživatel je vytvořen v Supabase `users` tabulce

- [ ] **Sign In**
  - [ ] Email/password přihlášení funguje
  - [ ] Social provider přihlášení funguje
  - [ ] Redirect na /dashboard po úspěšném přihlášení
  - [ ] Session persistence (refresh page stále přihlášen)

- [ ] **Sign Out**
  - [ ] Odhlášení funguje
  - [ ] Redirect na /sign-in po odhlášení
  - [ ] Session je smazána

- [ ] **GitHub OAuth**
  - [ ] GitHub autorizace získá access token
  - [ ] Token je uložen v Supabase (encrypted)
  - [ ] Permissions obsahují `repo` scope

### Project Management

- [ ] **Create Project**
  - [ ] Manuální vytvoření projektu (bez GitHub repo)
  - [ ] Vytvoření projektu s GitHub repo
  - [ ] Validace: project name je required
  - [ ] Projekt se zobrazí v seznamu
  - [ ] Projekt je správně přiřazen k uživateli

- [ ] **List Projects**
  - [ ] Seznam zobrazuje všechny projekty uživatele
  - [ ] Projekty jiných uživatelů nejsou viditelné
  - [ ] GitHub repo je zobrazen jako link (pokud je nastaven)
  - [ ] Last synced timestamp je zobrazen
  - [ ] Empty state zobrazí "Žádné projekty"

- [ ] **Project Switcher**
  - [ ] Dropdown zobrazuje všechny projekty
  - [ ] Přepnutí projektu změní zobrazená data
  - [ ] Vybraný projekt je zvýrazněn
  - [ ] ProjectId je uložen v URL/localStorage

- [ ] **Sync Button**
  - [ ] Sync button je disabled bez GitHub repo
  - [ ] Kliknutí spustí synchronizaci
  - [ ] Loading state (spinner) během syncu
  - [ ] Success message po dokončení
  - [ ] Error message při selhání
  - [ ] Last synced timestamp se aktualizuje

### Dashboard

- [ ] **Agent Status Cards**
  - [ ] Cards zobrazují správné metriky
    - [ ] Total runs
    - [ ] Success rate (color-coded)
    - [ ] Avg duration
    - [ ] Last run timestamp
  - [ ] Trend emoji (📈 improving, ➡️ stable, 📉 regressing)
  - [ ] Success rate color:
    - [ ] Green ≥80%
    - [ ] Yellow 50-80%
    - [ ] Red <50%
  - [ ] Hover efekt na cardech
  - [ ] Cards jsou responsive (grid layout)

- [ ] **Metrics Chart**
  - [ ] Chart zobrazuje performance trends
  - [ ] Success rate line (zelená)
  - [ ] Avg duration line (modrá)
  - [ ] Tooltip při hover
  - [ ] Legend je zobrazen
  - [ ] Placeholder když nejsou data

- [ ] **Memory Browser**
  - [ ] Memory entries jsou zobrazeny
  - [ ] Search filter funguje (entity_name, observation, type)
  - [ ] Metadata zobrazuje file:line
  - [ ] Severity badge (pokud je)
  - [ ] Timestamp formátován česky
  - [ ] Empty state zobrazí "Žádné memory entries"
  - [ ] Clear filter button funguje

- [ ] **Real-time Updates**
  - [ ] Změny v DB se okamžitě projeví v UI
  - [ ] INSERT event přidá novou metriku
  - [ ] UPDATE event aktualizuje existující
  - [ ] DELETE event odstraní metriku
  - [ ] Žádné memory leaky při odpojení

### API Endpoints

- [ ] **GET /api/projects**
  - [ ] Vrací pouze projekty aktuálního uživatele
  - [ ] 401 pokud není přihlášen
  - [ ] JSON response format správný

- [ ] **POST /api/projects**
  - [ ] Vytvoří nový projekt
  - [ ] Validace: name required
  - [ ] Auto-vytvoří user v Supabase pokud neexistuje
  - [ ] 401 pokud není přihlášen

- [ ] **POST /api/projects/{id}/sync**
  - [ ] Stahuje `.claude/metrics/agent-stats.json` z GitHub
  - [ ] Upsertuje metrics do DB
  - [ ] Aktualizuje last_synced_at
  - [ ] 404 pokud projekt neexistuje
  - [ ] 404 pokud `.claude/` soubor chybí
  - [ ] 400 pokud chybí GitHub token
  - [ ] 401 pokud user nevlastní projekt

- [ ] **GET /api/metrics?projectId={id}**
  - [ ] Vrací metrics pro projekt
  - [ ] 400 pokud chybí projectId
  - [ ] 404 pokud projekt neexistuje
  - [ ] 401 pokud user nevlastní projekt

- [ ] **GET /api/memory?projectId={id}**
  - [ ] Vrací memory entries pro projekt
  - [ ] 400 pokud chybí projectId
  - [ ] 404 pokud projekt neexistuje
  - [ ] 401 pokud user nevlastní projekt

### Security

- [ ] **Authentication**
  - [ ] Nepřihlášený user je redirectován na /sign-in
  - [ ] Protected routes jsou zabezpečeny
  - [ ] API routes vyžadují valid session

- [ ] **Authorization**
  - [ ] User vidí pouze své projekty
  - [ ] API ověřuje ownership při každém requestu
  - [ ] Supabase RLS policies fungují

- [ ] **Data Isolation**
  - [ ] Projekty jsou izolované mezi uživateli
  - [ ] Metrics jsou per-project
  - [ ] Memory entries jsou per-project

### Performance

- [ ] **Initial Load**
  - [ ] Dashboard load < 2s
  - [ ] Projects page load < 2s
  - [ ] Fonts load bez FOUT/FOIT

- [ ] **API Response Times**
  - [ ] GET /api/projects < 500ms
  - [ ] GET /api/metrics < 500ms
  - [ ] POST /api/projects/{id}/sync < 5s

- [ ] **Chart Rendering**
  - [ ] Smooth scrolling (60fps)
  - [ ] Žádné jank při hover
  - [ ] Responsive resize

- [ ] **Mobile Responsive**
  - [ ] iPhone (375px width)
  - [ ] iPad (768px width)
  - [ ] Android (各種サイズ)
  - [ ] Touch targets ≥44px

### Error Handling

- [ ] **Error Boundary**
  - [ ] Zachytává runtime errors
  - [ ] Zobrazuje fallback UI
  - [ ] "Try again" button funguje
  - [ ] Error detail je zobrazen (dev mode)

- [ ] **Network Errors**
  - [ ] Fetch failure zobrazí error message
  - [ ] Retry button funguje
  - [ ] Loading states jsou správně spravované

- [ ] **404 Pages**
  - [ ] Neexistující route → 404
  - [ ] Neexistující projekt → 404
  - [ ] Link na homepage

- [ ] **Validation Errors**
  - [ ] Form validation zobrazuje errors
  - [ ] API validation errors jsou zobrazeny
  - [ ] User-friendly error messages

### Browser Compatibility

- [ ] **Chrome** (nejnovější)
- [ ] **Firefox** (nejnovější)
- [ ] **Safari** (nejnovější)
- [ ] **Edge** (nejnovější)
- [ ] **Mobile Safari** (iOS 15+)
- [ ] **Chrome Mobile** (Android 10+)

## Automated Testing (Optional)

### Playwright E2E Tests

```bash
npm run test:e2e
```

- [ ] Auth flow tests pass
- [ ] Project CRUD tests pass
- [ ] Dashboard tests pass
- [ ] API tests pass

### Unit Tests

```bash
npm run test
```

- [ ] Component tests pass
- [ ] Utility function tests pass
- [ ] Hook tests pass

## Pre-deployment Checklist

- [ ] All manual tests passed
- [ ] TypeScript build passes (`npm run build`)
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Supabase migrations applied
- [ ] GitHub OAuth configured
- [ ] Clerk domains configured
- [ ] `.env.local` not committed

## Post-deployment Verification

- [ ] Production URL accessible
- [ ] Sign in works on production
- [ ] GitHub sync works on production
- [ ] Real-time updates work on production
- [ ] Performance meets targets
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs
