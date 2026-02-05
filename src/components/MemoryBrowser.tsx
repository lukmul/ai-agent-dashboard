/**
 * MemoryBrowser Component
 *
 * Prohlížeč memory entries s:
 * - Search/filter funkcionalitou
 * - List entries s entity_name, observation, metadata
 * - Timestamp každé entry
 */

'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface MemoryEntry {
  id: string
  entity_name: string
  entity_type: string
  observation: string
  metadata: Record<string, any>
  created_at: string
}

interface MemoryBrowserProps {
  projectId: string
}

export function MemoryBrowser({ projectId }: MemoryBrowserProps) {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchMemories()
    }
  }, [projectId])

  const fetchMemories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/memory?projectId=${projectId}`)
      const data = await response.json()
      setMemories(data.memories || [])
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrování podle search query
  const filtered = memories.filter(
    (m) =>
      m.entity_name.toLowerCase().includes(search.toLowerCase()) ||
      m.observation.toLowerCase().includes(search.toLowerCase()) ||
      m.entity_type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Browser</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat v memory (entity, observation, type)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mr-2" />
            Načítání memory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-gray-500">
            {search ? (
              <>
                Žádné výsledky pro "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Zrušit filtr
                </button>
              </>
            ) : (
              <>
                Žádné memory entries.
                <span className="mt-1 text-xs">
                  Memory entries se ukládají automaticky během agent runs.
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filtered.map((memory) => (
              <div
                key={memory.id}
                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-blue-600">
                    {memory.entity_name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {memory.entity_type}
                  </span>
                </div>

                {/* Observation */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {memory.observation}
                </p>

                {/* Metadata & Timestamp */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    {memory.metadata?.file && (
                      <span className="font-mono">
                        {memory.metadata.file}
                        {memory.metadata.line && `:${memory.metadata.line}`}
                      </span>
                    )}
                    {memory.metadata?.severity && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase font-semibold">
                        {memory.metadata.severity}
                      </span>
                    )}
                  </div>
                  <span>{formatDate(memory.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
