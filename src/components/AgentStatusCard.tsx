/**
 * AgentStatusCard Component
 *
 * Zobrazuje metriky jednotlivého agenta včetně:
 * - Total runs, success rate, avg duration
 * - Trend (improving/stable/regressing)
 * - Last run timestamp
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDuration } from '@/lib/utils'

interface AgentMetrics {
  agent_name: string
  total_runs: number
  successful_runs: number
  failed_runs: number
  success_rate: number
  avg_duration_seconds: number
  last_run: string | null
  trend: 'improving' | 'stable' | 'regressing'
}

interface AgentStatusCardProps {
  metrics: AgentMetrics
}

export function AgentStatusCard({ metrics }: AgentStatusCardProps) {
  const trendEmoji = {
    improving: '📈',
    stable: '➡️',
    regressing: '📉',
  }

  const successRateColor =
    metrics.success_rate >= 0.8
      ? 'text-green-600'
      : metrics.success_rate >= 0.5
      ? 'text-yellow-600'
      : 'text-red-600'

  const successRatePercentage = (metrics.success_rate * 100).toFixed(1)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate">{metrics.agent_name}</span>
          <span className="text-2xl">{trendEmoji[metrics.trend]}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Total Runs */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Runs</span>
            <span className="font-medium text-gray-900">
              {metrics.total_runs}
            </span>
          </div>

          {/* Success Rate */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Success Rate</span>
            <span className={`font-semibold ${successRateColor}`}>
              {successRatePercentage}%
            </span>
          </div>

          {/* Avg Duration */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Duration</span>
            <span className="font-medium text-gray-900">
              {formatDuration(metrics.avg_duration_seconds)}
            </span>
          </div>

          {/* Failed Runs (if any) */}
          {metrics.failed_runs > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-red-600">Failed Runs</span>
              <span className="font-medium text-red-600">
                {metrics.failed_runs}
              </span>
            </div>
          )}

          {/* Last Run */}
          {metrics.last_run && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Last run: {formatDate(metrics.last_run)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
