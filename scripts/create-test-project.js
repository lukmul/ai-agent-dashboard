#!/usr/bin/env node
/**
 * Create Test Project Script
 *
 * Vytvoří testovací projekt s ukázkovými daty v lokální databázi.
 * Spusť: node scripts/create-test-project.js
 */

const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { join } = require('path')

// Načti .env.local manuálně
const envPath = join(__dirname, '..', '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
} catch (err) {
  console.error('⚠️  Nelze načíst .env.local, používám system env vars')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Chybí environment variables!')
  console.error('Ujisti se, že .env.local obsahuje:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestProject() {
  console.log('🚀 Vytváření testovacího projektu...\n')

  // 0. Vytvoř nebo najdi testovacího uživatele
  console.log('0️⃣ Kontrola/vytvoření testovacího uživatele...')
  let user

  // Zkus najít existujícího
  const { data: existingUsers } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (existingUsers && existingUsers.length > 0) {
    user = existingUsers[0]
    console.log(`✅ Použit existující user: ${user.email}\n`)
  } else {
    // Vytvoř nového testovacího uživatele
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_id: 'test-clerk-id',
        email: 'test@example.com',
        github_username: 'testuser',
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Chyba při vytváření uživatele:', userError.message)
      process.exit(1)
    }

    user = newUser
    console.log(`✅ Vytvořen nový testovací user: ${user.email}\n`)
  }

  // 1. Vytvoř projekt
  console.log('1️⃣ Vytváření projektu "Test Project"...')
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: 'Test Project',
      github_repo: 'lukmul/ai-agent-dashboard',
      user_id: user.id,
    })
    .select()
    .single()

  if (projectError) {
    console.error('❌ Chyba při vytváření projektu:', projectError.message)
    process.exit(1)
  }

  console.log(`✅ Projekt vytvořen: ${project.id}\n`)

  // 2. Vytvoř agent metriky
  console.log('2️⃣ Vytváření agent metrik...')
  const metrics = [
    {
      project_id: project.id,
      agent_name: 'code-reviewer',
      total_runs: 150,
      successful_runs: 145,
      success_rate: 96.67,
      avg_duration_seconds: 2.5,
      last_run: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      trend: 'improving',
    },
    {
      project_id: project.id,
      agent_name: 'security-reviewer',
      total_runs: 80,
      successful_runs: 78,
      success_rate: 97.5,
      avg_duration_seconds: 3.2,
      last_run: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      trend: 'stable',
    },
    {
      project_id: project.id,
      agent_name: 'tdd-guide',
      total_runs: 120,
      successful_runs: 110,
      success_rate: 91.67,
      avg_duration_seconds: 5.1,
      last_run: new Date().toISOString(),
      trend: 'regressing',
    },
    {
      project_id: project.id,
      agent_name: 'build-error-resolver',
      total_runs: 45,
      successful_runs: 42,
      success_rate: 93.33,
      avg_duration_seconds: 1.8,
      last_run: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      trend: 'improving',
    },
    {
      project_id: project.id,
      agent_name: 'planner',
      total_runs: 30,
      successful_runs: 28,
      success_rate: 93.33,
      avg_duration_seconds: 8.5,
      last_run: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      trend: 'stable',
    },
  ]

  const { error: metricsError } = await supabase
    .from('agent_metrics')
    .insert(metrics)

  if (metricsError) {
    console.error('❌ Chyba při vytváření metrik:', metricsError.message)
    process.exit(1)
  }

  console.log(`✅ Vytvořeno ${metrics.length} agent metrik\n`)

  // 3. Vytvoř memory entries
  console.log('3️⃣ Vytváření memory entries...')
  const memoryEntries = []
  for (let i = 1; i <= 10; i++) {
    memoryEntries.push({
      project_id: project.id,
      entity_name: 'code-reviewer',
      entity_type: 'agent',
      observation: `Found ${Math.floor(Math.random() * 10)} code issues in session ${i}`,
      metadata: {
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        file_count: Math.floor(Math.random() * 5 + 1),
        session_id: `session-${i}`,
      },
      created_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    })
  }

  const { error: memoryError } = await supabase
    .from('memory_entries')
    .insert(memoryEntries)

  if (memoryError) {
    console.error('❌ Chyba při vytváření memory entries:', memoryError.message)
    process.exit(1)
  }

  console.log(`✅ Vytvořeno ${memoryEntries.length} memory entries\n`)

  // 4. Ověř výsledek
  console.log('📊 Ověření dat...')
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: metricsCount } = await supabase
    .from('agent_metrics')
    .select('*', { count: 'exact', head: true })

  const { count: memoryCount } = await supabase
    .from('memory_entries')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Projects: ${projectCount}`)
  console.log(`✅ Agent Metrics: ${metricsCount}`)
  console.log(`✅ Memory Entries: ${memoryCount}\n`)

  console.log('🎉 Testovací data úspěšně vytvořena!')
  console.log(`\n📱 Otevři dashboard: http://localhost:3000/dashboard`)
  console.log(`   Project ID: ${project.id}`)
}

createTestProject().catch((err) => {
  console.error('❌ Neočekávaná chyba:', err)
  process.exit(1)
})
