/**
 * Sign In Page
 *
 * Clerk authentication - uživatel se přihlásí pomocí email/password nebo social providers.
 */

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            AI Agent Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Přihlaste se pro přístup k dashboard
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
        />
      </div>
    </div>
  )
}
