/**
 * Main Dashboard Page
 *
 * Zobrazuje:
 * - ProjectSwitcher (výběr projektu)
 * - Agent Status Cards (grid metrik agentů)
 * - MetricsChart (performance trends)
 * - MemoryBrowser (memory entries)
 */

'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ProjectSwitcher } from '@/components/ProjectSwitcher'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { MetricsChart } from '@/components/MetricsChart'
import { MemoryBrowser } from '@/components/MemoryBrowser'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import { Button } from '@/components/ui/button'
import { RefreshCw, UserCircle } from 'lucide-react'

interface AgentMetric {
  agent_name: string
  total_runs: number
  successful_runs: number
  failed_runs: number
  success_rate: number
  avg_duration_seconds: number
  last_run: string | null
  trend: 'improving' | 'stable' | 'regressing'
}

export default function DashboardPage() {
  const { user } = useUser()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Real-time metrics subscription (automatická aktualizace z Supabase)
  const { metrics, loading, error } = useRealtimeMetrics(projectId)

  const handleSync = async () => {
    if (!projectId) return

    try {
      setSyncing(true)
      const response = await fetch(`/api/projects/${projectId}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        // Metriky se automaticky aktualizují přes useRealtimeMetrics hook
        alert('Synchronizace dokončena!')
      } else {
        const error = await response.json()
        alert(`Chyba: ${error.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Synchronizace selhala')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Multi-project monitoring pro Claude AI agenty
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ProjectSwitcher onProjectChange={setProjectId} />

              {projectId && (
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  variant="outline"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`}
                  />
                  {syncing ? 'Synchronizuji...' : 'Sync'}
                </Button>
              )}

              <ThemeToggle />

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <UserCircle className="h-5 w-5" />
                <span>{user?.emailAddresses?.[0]?.emailAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!projectId ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vyberte projekt
            </h2>
            <p className="text-gray-600">
              Použijte dropdown nahoře pro výběr projektu, nebo vytvořte nový.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Chyba při načítání metrik
            </h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Agent Status Cards Grid */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Agent Metrics
              </h2>
              {metrics.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                  <p className="text-gray-600">
                    Žádná agent metrics.
                    <br />
                    Klikněte na "Sync" button pro stažení dat z GitHub.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.map((metric) => (
                    <AgentStatusCard key={metric.agent_name} metrics={metric} />
                  ))}
                </div>
              )}
            </section>

            {/* Performance Trends Chart */}
            {metrics.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Trends
                </h2>
                <MetricsChart data={[]} />
              </section>
            )}

            {/* Memory Browser */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Agent Memory
              </h2>
              <MemoryBrowser projectId={projectId} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
