/**
 * Utility Functions
 *
 * Pomocné funkce pro Tailwind CSS, formátování, validace, atd.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Sloučí Tailwind CSS classes s inteligentním mergováním.
 * Používá clsx pro podmíněné classes a tailwind-merge pro conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formátuje ISO timestamp na čitelný formát pro české prostředí.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formátuje duration v sekundách na čitelný formát.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds.toFixed(1)}s`
}

/**
 * Zkrátí dlouhý text na maximální délku s elipsou.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength) + '...'
}
