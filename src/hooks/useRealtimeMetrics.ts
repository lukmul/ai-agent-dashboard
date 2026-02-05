/**
 * useRealtimeMetrics Hook
 *
 * Supabase Realtime subscription pro automatickou aktualizaci agent metrik.
 * Subscribuje změny v agent_metrics tabulce a aktualizuje state v reálném čase.
 */

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'

interface AgentMetric {
  id: string
  project_id: string
  agent_name: string
  total_runs: number
  successful_runs: number
  failed_runs: number
  success_rate: number
  avg_duration_seconds: number
  last_run: string | null
  trend: 'improving' | 'stable' | 'regressing'
  updated_at: string
}

/**
 * Hook pro real-time sledování agent metrik z Supabase.
 *
 * @param projectId - ID projektu, pro který chceme sledovat metriky
 * @returns Object s metrics, loading a error states
 */
export function useRealtimeMetrics(projectId: string | null) {
  const [metrics, setMetrics] = useState<AgentMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setMetrics([])
      setLoading(false)
      return
    }

    const supabase = createBrowserClient()

    // Initial load metrik
    const loadInitialMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('agent_metrics')
          .select('*')
          .eq('project_id', projectId)
          .order('agent_name', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        setMetrics(data || [])
      } catch (err) {
        console.error('Failed to load initial metrics:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialMetrics()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`metrics:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'agent_metrics',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: any) => {
          console.log('Realtime change detected:', payload)

          setMetrics((prev) => {
            // INSERT: Přidat novou metriku
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as AgentMetric].sort((a, b) =>
                a.agent_name.localeCompare(b.agent_name)
              )
            }

            // UPDATE: Aktualizovat existující metriku
            if (payload.eventType === 'UPDATE') {
              return prev
                .map((m) => (m.id === payload.new.id ? (payload.new as AgentMetric) : m))
                .sort((a, b) => a.agent_name.localeCompare(b.agent_name))
            }

            // DELETE: Odstranit metriku
            if (payload.eventType === 'DELETE') {
              return prev.filter((m) => m.id !== payload.old.id)
            }

            return prev
          })
        }
      )
      .subscribe()

    // Cleanup: odsubscribovat při unmount nebo změně projectId
    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  return { metrics, loading, error }
}
