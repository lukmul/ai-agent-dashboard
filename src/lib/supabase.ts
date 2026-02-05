/**
 * Supabase Client Factory
 * 
 * Vytváří Supabase klienty pro různé use cases:
 * - Server-side s Clerk auth
 * - Client-side s anon key
 * - Admin operace s service role
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server Component Client
 * Používá Clerk auth pro RLS policies.
 */
export async function createServerClient() {
  const { userId, getToken } = await auth()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabaseAccessToken = await getToken({ template: 'supabase' })

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  })
}

/**
 * Client Component Client
 * Pro použití v 'use client' komponentách.
 */
export function createBrowserClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Service Role Client
 * Pro admin operace (bypass RLS). Používej POUZE v API routes!
 */
export function createServiceClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * API Route Client
 * Default client pro API routes s service role.
 */
export const supabase = createServiceClient()
