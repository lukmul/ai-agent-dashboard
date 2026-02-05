/**
 * Home Page
 *
 * Přesměruje uživatele na /dashboard (hlavní aplikace).
 */

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
