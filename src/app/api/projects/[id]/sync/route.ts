/**
 * Project Sync API Route
 *
 * POST /api/projects/{id}/sync - Stáhne .claude/ data z GitHub a uloží do Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase-server'
import { getClaudeFiles } from '@/lib/github'

/**
 * POST /api/projects/{id}/sync
 *
 * Synchronizuje agent metrics z GitHub repozitáře do Supabase.
 *
 * Flow:
 * 1. Ověř, že user vlastní projekt
 * 2. Načti GitHub token usera
 * 3. Stáhni .claude/metrics/agent-stats.json z GitHub
 * 4. Upsert data do agent_metrics tabulky
 * 5. Update last_synced_at
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Získej user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, github_token')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Načti projekt a ověř ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Ověř, že projekt má GitHub repo
    if (!project.github_repo) {
      return NextResponse.json(
        { error: 'Project does not have a GitHub repository configured' },
        { status: 400 }
      )
    }

    // Ověř, že user má GitHub token
    if (!user.github_token) {
      return NextResponse.json(
        {
          error: 'GitHub not connected. Please connect your GitHub account first.',
          code: 'GITHUB_NOT_CONNECTED',
        },
        { status: 400 }
      )
    }

    // Parse owner/repo
    const [owner, repo] = project.github_repo.split('/')
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Invalid github_repo format. Expected "owner/repo"' },
        { status: 400 }
      )
    }

    // Stáhni .claude/metrics/agent-stats.json z GitHub
    const claudeFiles = await getClaudeFiles(user.github_token, owner, repo)

    if (!claudeFiles || !claudeFiles.metrics) {
      return NextResponse.json(
        {
          error: '.claude/metrics/agent-stats.json not found in repository',
          code: 'CLAUDE_METRICS_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    const { metrics } = claudeFiles

    // Upsert agent metrics do databáze
    const agentNames = Object.keys(metrics.agents)
    let syncedCount = 0
    const errors: string[] = []

    for (const agentName of agentNames) {
      const agentData = metrics.agents[agentName]

      const { error: upsertError } = await supabase
        .from('agent_metrics')
        .upsert(
          {
            project_id: projectId,
            agent_name: agentName,
            total_runs: agentData.total_runs || 0,
            successful_runs: agentData.successful_runs || 0,
            failed_runs: agentData.failed_runs || 0,
            success_rate: agentData.success_rate || 0.0,
            avg_duration_seconds: agentData.avg_duration_seconds || 0.0,
            last_run: agentData.last_run || null,
            findings: agentData.findings || {},
            trend: agentData.trend || 'stable',
          },
          {
            onConflict: 'project_id,agent_name',
          }
        )

      if (upsertError) {
        errors.push(`${agentName}: ${upsertError.message}`)
      } else {
        syncedCount++
      }
    }

    // Update last_synced_at
    const { error: updateError } = await supabase
      .from('projects')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', projectId)

    if (updateError) {
      console.error('Failed to update last_synced_at:', updateError)
    }

    return NextResponse.json({
      success: true,
      synced_agents: syncedCount,
      total_agents: agentNames.length,
      errors: errors.length > 0 ? errors : undefined,
      last_synced_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('POST /api/projects/{id}/sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
