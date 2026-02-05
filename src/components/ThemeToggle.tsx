/**
 * ThemeToggle Component
 *
 * Toggle switch pro přepínání mezi light a dark mode.
 * Design: design/dark-mode-toggle.pen
 */

'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration fix - čeká na mount před zobrazením
  useEffect(() => {
    setMounted(true)
    // Zjisti aktuální theme z localStorage nebo system preference
    const theme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (theme === 'dark' || (!theme && systemPrefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Nezobraž nic během SSR (prevent hydration mismatch)
  if (!mounted) {
    return <div className="w-14 h-7" />
  }

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Switch */}
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
          isDark ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Thumb */}
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
            isDark ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>

      {/* Icon */}
      {isDark ? (
        <Moon className="h-5 w-5 text-indigo-500" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500" />
      )}
    </div>
  )
}
