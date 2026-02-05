/**
 * Memory API Route
 *
 * GET /api/memory?projectId={id} - Načte memory entries pro projekt
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase-server'

/**
 * GET /api/memory?projectId={id}
 *
 * Vrátí memory entries pro zadaný projekt.
 * Podporuje filtrování podle entity_name a entity_type.
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
    const entityName = searchParams.get('entity_name')
    const entityType = searchParams.get('entity_type')

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

    // Ověř, že user vlastní projekt
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

    // Načti memory entries s optional filtrací
    let query = supabase
      .from('memory_entries')
      .select('*')
      .eq('project_id', projectId)

    if (entityName) {
      query = query.eq('entity_name', entityName)
    }

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data: memories, error: memoriesError } = await query
      .order('created_at', { ascending: false })
      .limit(100) // Limit pro performance

    if (memoriesError) {
      return NextResponse.json(
        { error: memoriesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      memories: memories || [],
      project_id: projectId,
    })
  } catch (error) {
    console.error('GET /api/memory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
