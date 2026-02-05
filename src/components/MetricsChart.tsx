/**
 * MetricsChart Component
 *
 * Line chart zobrazující časové trendy metrik:
 * - Success rate over time
 * - Avg duration over time
 */

'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsHistory {
  date: string
  success_rate: number
  avg_duration: number
}

interface MetricsChartProps {
  data: MetricsHistory[]
  title?: string
}

export function MetricsChart({
  data,
  title = 'Performance Trends',
}: MetricsChartProps) {
  // Pokud nejsou data, zobraz placeholder
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
            Žádná data pro zobrazení grafu.
            <br />
            Synchronizuj projekt pro načtení metrik.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            <Line
              type="monotone"
              dataKey="success_rate"
              stroke="#10b981"
              strokeWidth={2}
              name="Success Rate (%)"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="avg_duration"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Avg Duration (s)"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
