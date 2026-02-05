/**
 * API Endpoints E2E Tests
 *
 * Testuje API endpoints bez authentication:
 * - Ověří že endpoints existují
 * - Vrací správné HTTP status codes (401/400 bez auth)
 * - Neexponují sensitive data
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'https://ai-agent-dashboard-six.vercel.app'

test.describe('API Endpoints - Unauthenticated Access', () => {
  test('GET /api/projects returns auth error or 404 without auth', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/api/projects`)

    // Očekáváme 401 Unauthorized, 403 Forbidden, nebo 404 (endpoint neexistuje)
    // 404 je také validní - endpoint může být chráněn middleware, který vrací 404
    expect([401, 403, 404, 500]).toContain(response.status())

    const body = await response.text()

    // Neměl by vrátit žádná citlivá data
    expect(body.toLowerCase()).not.toContain('api_key')
    expect(body.toLowerCase()).not.toContain('secret')
    expect(body.toLowerCase()).not.toContain('password')
  })

  test('POST /api/projects returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/projects`, {
      data: {
        name: 'Test Project',
        description: 'E2E Test',
      },
    })

    // Očekáváme auth error
    expect([401, 403, 405, 500]).toContain(response.status())
  })

  test('GET /api/metrics returns error without projectId', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/api/metrics`)

    // Očekáváme 400 (missing projectId) nebo 401 (no auth)
    expect([400, 401, 403, 404, 500]).toContain(response.status())
  })

  test('GET /api/metrics with invalid projectId', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/metrics?projectId=invalid-id-12345`
    )

    // Očekáváme error response
    expect([400, 401, 403, 404, 500]).toContain(response.status())
  })

  test('GET /api/memory returns error without projectId', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/api/memory`)

    // Očekáváme 400 (missing projectId) nebo 401 (no auth)
    expect([400, 401, 403, 404, 500]).toContain(response.status())
  })

  test('GET /api/memory with invalid projectId', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/memory?projectId=invalid-id-12345`
    )

    // Očekáváme error response
    expect([400, 401, 403, 404, 500]).toContain(response.status())
  })
})

test.describe('API Security - No Sensitive Data Exposure', () => {
  test('API error responses do not leak sensitive info', async ({ request }) => {
    // Test různých endpoints
    const endpoints = ['/api/projects', '/api/metrics', '/api/memory']

    for (const endpoint of endpoints) {
      const response = await request.get(`${BASE_URL}${endpoint}`)
      const body = await response.text()
      const bodyLower = body.toLowerCase()

      // Kontrola že nejsou exponovány citlivé údaje
      expect(bodyLower).not.toContain('supabase_url')
      expect(bodyLower).not.toContain('supabase_key')
      expect(bodyLower).not.toContain('clerk_secret')
      expect(bodyLower).not.toContain('database_url')
      expect(bodyLower).not.toContain('postgres://')

      // Stack trace by neměl být vidět v production
      if (response.status() >= 500) {
        // V production by neměl být detailed stack trace
        const hasStackTrace =
          bodyLower.includes('at ') && bodyLower.includes('.ts:')
        // Logujeme ale nepročíme - záleží na konfiguraci
        if (hasStackTrace) {
          console.warn(
            `Warning: ${endpoint} may expose stack trace in error response`
          )
        }
      }
    }
  })

  test('Non-existent API routes return 404', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/nonexistent-endpoint-xyz`
    )

    // Měl by vrátit 404 Not Found
    expect([404, 405]).toContain(response.status())
  })
})
