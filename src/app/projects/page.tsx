/**
 * Projects Management Page
 *
 * Zobrazuje list všech projektů uživatele s možností:
 * - Zobrazit detail projektu
 * - Synchronizovat data z GitHub
 * - Vytvořit nový projekt
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FolderGit2, RefreshCw, Plus, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Project {
  id: string
  name: string
  github_repo: string | null
  last_synced_at: string | null
  created_at: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (projectId: string) => {
    try {
      setSyncing(projectId)
      const response = await fetch(`/api/projects/${projectId}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Synchronizace dokončena!')
        await fetchProjects() // Reload list
      } else {
        const error = await response.json()
        alert(`Chyba: ${error.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Synchronizace selhala')
    } finally {
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="container mx-auto px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={() => router.push('/projects/new')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              + Add Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-12 py-0">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderGit2 className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Žádné projekty
            </h2>
            <p className="text-gray-600 mb-6">
              Vytvořte svůj první projekt pro začátek sledování agent metrics.
            </p>
            <Button onClick={() => router.push('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Vytvořit Projekt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-gray-600" />
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* GitHub Repo */}
                    {project.github_repo ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          GitHub Repository
                        </p>
                        <a
                          href={`https://github.com/${project.github_repo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          {project.github_repo}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Není propojeno s GitHub
                      </p>
                    )}

                    {/* Last Synced */}
                    {project.last_synced_at && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Poslední synchronizace
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDate(project.last_synced_at)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end pt-2">
                      <Button
                        onClick={() => router.push(`/dashboard?projectId=${project.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 h-9 px-4 text-sm"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSync(project.id)}
                        disabled={!project.github_repo || syncing === project.id}
                        className={`h-9 px-4 text-sm ${!project.github_repo ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {syncing === project.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          'Sync'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
