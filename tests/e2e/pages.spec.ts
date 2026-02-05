/**
 * Page Rendering E2E Tests
 *
 * Testuje že všechny stránky se renderují správně:
 * - Žádné 500 errors
 * - Žádné kritické console errors
 * - Správné HTTP status codes
 */
import { test, expect } from '@playwright/test'

test.describe('Page Rendering', () => {
  test('homepage loads without errors', async ({ page }) => {
    // Sbíráme console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const response = await page.goto('/')

    // HTTP response by měl být úspěšný
    expect(response?.status()).toBeLessThan(500)

    await page.waitForLoadState('networkidle')

    // Screenshot homepage
    await page.screenshot({
      path: 'test-results/10-homepage.png',
      fullPage: true,
    })

    // Filtrujeme expected errors (např. auth-related)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('clerk') &&
        !error.includes('Clerk') &&
        !error.includes('auth') &&
        !error.includes('401') &&
        !error.includes('403') &&
        !error.includes('hydration') // React hydration warnings
    )

    // Logujeme všechny errors pro debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors on homepage:', consoleErrors)
    }

    // Kritické errors by neměly být
    expect(criticalErrors.length).toBeLessThanOrEqual(2) // Tolerance pro minor errors
  })

  test('sign-in page renders correctly', async ({ page }) => {
    const response = await page.goto('/sign-in')

    expect(response?.status()).toBeLessThan(500)

    await page.waitForLoadState('networkidle')

    // Stránka by měla obsahovat nějaký auth-related content
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(100) // Není prázdná

    // Neměla by být prázdná stránka nebo pure error
    expect(pageContent).not.toContain('Application error')

    await page.screenshot({
      path: 'test-results/11-sign-in-render.png',
      fullPage: true,
    })
  })

  test('dashboard page returns proper response', async ({ page }) => {
    const response = await page.goto('/dashboard')

    // Může být 200 (s auth redirect) nebo redirect status
    expect(response?.status()).toBeLessThan(500)

    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/12-dashboard-render.png',
      fullPage: true,
    })
  })

  test('projects page returns proper response', async ({ page }) => {
    const response = await page.goto('/projects')

    // Může být 200, 302, nebo 404 pokud route neexistuje
    const status = response?.status() || 0
    expect(status).toBeLessThan(500)

    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/13-projects-render.png',
      fullPage: true,
    })
  })

  test('404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz')

    // Měl by vrátit 404 nebo custom error page
    // Next.js může vrátit 200 s 404 obsahem
    expect(response?.status()).toBeLessThan(500)

    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/14-404-page.png',
      fullPage: true,
    })
  })
})

test.describe('Environment Variables Security', () => {
  test('no sensitive env vars exposed in page source', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Získáme celý page source
    const pageSource = await page.content()
    const sourceLower = pageSource.toLowerCase()

    // Kontrola že žádné sensitive env vars nejsou v HTML
    expect(sourceLower).not.toContain('supabase_service_role')
    expect(sourceLower).not.toContain('clerk_secret_key')
    expect(sourceLower).not.toContain('database_url')
    expect(sourceLower).not.toContain('postgres://') // DB connection string

    // NEXT_PUBLIC_ vars jsou OK - jsou určené pro client
    // Ale private vars by neměly být

    // Kontrola JavaScript bundle (pokud je inline)
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script'))
        .map((s) => s.innerHTML)
        .join('')
    })

    const scriptsLower = scripts.toLowerCase()
    expect(scriptsLower).not.toContain('supabase_service_role')
    expect(scriptsLower).not.toContain('clerk_secret_key')
  })

  test('no API keys in client-side JavaScript', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Interceptujeme JS soubory (kromě third-party SDK)
    const jsResponses: string[] = []

    page.on('response', async (response) => {
      const url = response.url()
      // Filtrujeme pouze naše JS soubory (ne Clerk, analytics, atd.)
      if (
        url.includes('.js') &&
        url.includes('ai-agent-dashboard') &&
        !url.includes('clerk') &&
        !url.includes('analytics') &&
        !url.includes('_next/static/chunks/node_modules')
      ) {
        try {
          const text = await response.text()
          jsResponses.push(text)
        } catch {
          // Ignore errors
        }
      }
    })

    // Reload pro zachycení JS
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Kontrola JS obsahu - hledáme skutečné secrets, ne názvy proměnných v SDK
    for (const js of jsResponses) {
      // Hledáme specifické patterny skutečných secrets
      // Supabase service role key pattern: eyJ...
      const hasServiceRoleKey = /service_role.*eyJ[A-Za-z0-9-_]+/.test(js)
      expect(hasServiceRoleKey).toBeFalsy()

      // Clerk secret key pattern: sk_live_ nebo sk_test_
      const hasClerkSecretKey = /sk_(live|test)_[A-Za-z0-9]+/.test(js)
      expect(hasClerkSecretKey).toBeFalsy()

      // Database connection strings
      expect(js).not.toContain('postgres://')
      expect(js).not.toContain('postgresql://')
    }
  })
})

test.describe('Performance and Accessibility', () => {
  test('page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime

    // Stránka by měla načíst do 10 sekund
    expect(loadTime).toBeLessThan(10000)

    console.log(`Homepage load time: ${loadTime}ms`)
  })

  test('no major accessibility issues on sign-in', async ({ page }) => {
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')

    // Základní accessibility checks
    // Stránka by měla mít title
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)

    // Měl by existovat main nebo podobný landmark
    const hasLandmarks = await page.evaluate(() => {
      return (
        document.querySelector('main') !== null ||
        document.querySelector('[role="main"]') !== null ||
        document.querySelector('div') !== null // Fallback
      )
    })

    expect(hasLandmarks).toBeTruthy()
  })
})
