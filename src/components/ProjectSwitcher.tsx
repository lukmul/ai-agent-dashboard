/**
 * ProjectSwitcher Component
 *
 * Dropdown pro přepínání mezi projekty uživatele.
 * Zobrazuje aktuální projekt a umožňuje výběr z listu projektů.
 */

'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, FolderGit2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  github_repo: string | null
  last_synced_at: string | null
}

interface ProjectSwitcherProps {
  onProjectChange?: (projectId: string) => void
}

export function ProjectSwitcher({ onProjectChange }: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects)
        setCurrentProject(data.projects[0])
        onProjectChange?.(data.projects[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
    setIsOpen(false)
    onProjectChange?.(project.id)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        Načítání projektů...
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        Žádné projekty
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <FolderGit2 className="h-4 w-4 text-gray-500" />
        <span>{currentProject?.name || 'Vyber projekt'}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Projekty
              </div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`w-full flex flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    currentProject?.id === project.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{project.name}</span>
                  {project.github_repo && (
                    <span className="text-xs text-gray-500">
                      {project.github_repo}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
