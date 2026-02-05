/**
 * Projects API Route
 *
 * GET  /api/projects - List všech projektů uživatele
 * POST /api/projects - Vytvoření nového projektu
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/projects
 *
 * Vrátí seznam všech projektů současného uživatele.
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

    // Získej user ID z Supabase (mapování clerk_id -> id)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      // User ještě neexistuje v DB - vytvoř ho
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress

      if (!email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: email,
        })
        .select('id')
        .single()

      if (createError || !newUser) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      // Nový user nemá žádné projekty
      return NextResponse.json({ projects: [] })
    }

    // Načti projekty
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (projectsError) {
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 *
 * Vytvoří nový projekt.
 * Body: { name: string, github_repo?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, github_repo } = body

    // Validace
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    if (github_repo && typeof github_repo !== 'string') {
      return NextResponse.json(
        { error: 'Invalid github_repo format' },
        { status: 400 }
      )
    }

    // Ověř formát github_repo (owner/repo)
    if (github_repo && !github_repo.match(/^[\w-]+\/[\w-]+$/)) {
      return NextResponse.json(
        { error: 'github_repo must be in format "owner/repo"' },
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

    // Vytvoř projekt
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        github_repo: github_repo?.trim() || null,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { project },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
