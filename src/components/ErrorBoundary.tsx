/**
 * ErrorBoundary Component
 *
 * React Error Boundary pro zachycení runtime chyb a zobrazení fallback UI.
 */

'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Něco se pokazilo
            </h2>
            <p className="mb-6 text-gray-600">
              Omlouváme se, došlo k neočekávané chybě. Zkuste stránku obnovit.
            </p>
            {this.state.error && (
              <details className="mb-6 rounded-lg bg-gray-100 p-4 text-left text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Zobrazit technické detaily
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Zkusit znovu
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Zpět na Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
