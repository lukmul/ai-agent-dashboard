/**
 * useRealtimeMetrics Hook
 *
 * Přihlásí se k Supabase Realtime channelu pro agent_metrics table.
 * Automaticky aktualizuje metriky při změnách v databázi.
 */

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

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
  findings: Record<string, any>
  trend: 'improving' | 'stable' | 'regressing'
  updated_at: string
}

export function useRealtimeMetrics(projectId: string | null) {
  const [metrics, setMetrics] = useState<AgentMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setMetrics([])
      setLoading(false)
      return
    }

    const supabase = createBrowserClient()

    // Initial load
    const loadMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_metrics')
          .select('*')
          .eq('project_id', projectId)
          .order('agent_name', { ascending: true })

        if (error) throw error

        setMetrics(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`metrics:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_metrics',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setMetrics((prev) => {
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as AgentMetric]
            }

            if (payload.eventType === 'UPDATE') {
              return prev.map((m) =>
                m.id === payload.new.id ? (payload.new as AgentMetric) : m
              )
            }

            if (payload.eventType === 'DELETE') {
              return prev.filter((m) => m.id !== payload.old.id)
            }

            return prev
          })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  return { metrics, loading, error }
}
