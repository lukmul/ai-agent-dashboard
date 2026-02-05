/**
 * Supabase Client (Client-Side Only)
 *
 * Pro použití v 'use client' komponentách.
 * ŽÁDNÉ server-side importy (Clerk auth).
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Client Component Client
 * Pro použití v 'use client' komponentách.
 */
export function createBrowserClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
