/**
 * GitHub API Client
 *
 * Wrapper pro Octokit s helper funkcemi pro čtení .claude/ souborů z repos.
 */

import { Octokit } from '@octokit/rest'

/**
 * Struktura .claude/metrics/agent-stats.json
 */
export interface AgentStats {
  metadata: {
    version: string
    last_updated: string
    description: string
  }
  agents: {
    [agentName: string]: {
      total_runs: number
      successful_runs: number
      failed_runs: number
      success_rate: number
      avg_duration_seconds: number
      last_run: string | null
      findings?: Record<string, any>
      trend: 'improving' | 'stable' | 'regressing'
    }
  }
}

/**
 * Načte .claude/ soubory z GitHub repozitáře.
 *
 * @param accessToken - GitHub personal access token s repo scope
 * @param owner - GitHub username nebo organization
 * @param repo - Repository name
 * @returns Agent stats a další .claude/ data
 */
export async function getClaudeFiles(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ metrics: AgentStats } | null> {
  const octokit = new Octokit({ auth: accessToken })

  try {
    // Získej .claude/metrics/agent-stats.json
    const metricsPath = '.claude/metrics/agent-stats.json'
    const { data: metricsFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: metricsPath,
    })

    if ('content' in metricsFile) {
      const metrics = JSON.parse(
        Buffer.from(metricsFile.content, 'base64').toString()
      ) as AgentStats

      return { metrics }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch .claude/ files from GitHub:', error)
    return null
  }
}

/**
 * Vypíše všechny repozitáře uživatele.
 *
 * @param accessToken - GitHub personal access token
 * @returns Seznam repozitářů seřazených podle poslední aktualizace
 */
export async function listUserRepos(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken })

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
    })

    return data
  } catch (error) {
    console.error('Failed to list GitHub repos:', error)
    return []
  }
}

/**
 * Ověří, zda repo obsahuje .claude/ adresář.
 *
 * @param accessToken - GitHub personal access token
 * @param owner - GitHub username nebo organization
 * @param repo - Repository name
 * @returns true pokud .claude/ existuje
 */
export async function hasClaudeDirectory(
  accessToken: string,
  owner: string,
  repo: string
): Promise<boolean> {
  const octokit = new Octokit({ auth: accessToken })

  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path: '.claude',
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Získá informace o repozitáři.
 *
 * @param accessToken - GitHub personal access token
 * @param owner - GitHub username nebo organization
 * @param repo - Repository name
 * @returns Repository metadata
 */
export async function getRepoInfo(
  accessToken: string,
  owner: string,
  repo: string
) {
  const octokit = new Octokit({ auth: accessToken })

  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    })

    return {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      private: data.private,
      updated_at: data.updated_at,
      language: data.language,
    }
  } catch (error) {
    console.error('Failed to get repo info:', error)
    return null
  }
}
