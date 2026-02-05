/**
 * Login Page
 *
 * Přihlašovací stránka s Clerk SignIn komponentou.
 * Design: design/login-page.pen
 */

'use client'

import { SignIn } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 relative">
      {/* Theme Toggle - Floating v pravém horním rohu */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Agent Dashboard
      </h1>

      {/* Clerk SignIn with custom appearance matching design */}
      <div className="w-full max-w-[400px]">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-xl border border-gray-200",
              headerTitle: "text-2xl font-bold text-gray-900",
              headerSubtitle: "text-sm text-gray-600",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600 rounded-lg h-11",
              formFieldInput: "rounded-lg border-gray-300 h-11",
              formFieldLabel: "text-sm font-medium text-gray-700",
              footerActionLink: "text-gray-600 hover:text-blue-500",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-600",
              socialButtonsBlockButton: "border-gray-300 rounded-lg h-11",
              socialButtonsBlockButtonText: "text-gray-700",
              formFieldInputShowPasswordButton: "text-gray-500"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
