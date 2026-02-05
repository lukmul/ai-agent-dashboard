/**
 * Metrics API Route
 *
 * GET /api/metrics?projectId={id} - Načte agent metrics pro projekt
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/metrics?projectId={id}
 *
 * Vrátí agent metrics pro zadaný projekt.
 * Pouze pokud uživatel projekt vlastní (security check).
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      )
    }

    // Získej user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Ověř, že user vlastní projekt (security check)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Načti agent metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('agent_metrics')
      .select('*')
      .eq('project_id', projectId)
      .order('agent_name', { ascending: true })

    if (metricsError) {
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      metrics: metrics || [],
      project_id: projectId,
    })
  } catch (error) {
    console.error('GET /api/metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
