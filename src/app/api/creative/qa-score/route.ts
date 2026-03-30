/**
 * POST /api/creative/qa-score
 *
 * Run the 7-check Creative QA / Congruency Engine on a creative asset.
 *
 * Body:
 *   - creativeId: string   — UUID of the creative row in Supabase
 *   - personaDescription?: string — overrides the persona in content JSONB
 *
 * Returns a QAScoreCard and persists the result to the `creatives` table.
 *
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL      — Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (or service-role for writes)
 *   OPENAI_API_KEY                — Whisper transcription + GPT-4o fallback vision
 *   ANTHROPIC_API_KEY             — (optional) Claude vision for brand/font/persona checks
 *   FFMPEG_SERVICE_URL            — (optional) sidecar for frame extraction & LUFS analysis
 *
 * Sidecar Service (ffmpeg)
 * ─────────────────────────
 * Vercel serverless functions do NOT include ffmpeg. Checks 3 (Brand Presence)
 * and 4 (Audio Levels) require a running ffmpeg sidecar. Deploy the companion
 * `ffmpeg-worker` to a VPS and set FFMPEG_SERVICE_URL.
 *
 * If FFMPEG_SERVICE_URL is unset those checks return score 0 with a diagnostic
 * message instead of failing the whole request.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runFullQAPipeline } from '@/lib/creative-qa'
import type { QAScoreRequest, CreativeRow } from '@/types/creative-qa'

// ── Vercel config ──
export const maxDuration = 60 // seconds — AI calls + download can be slow
export const dynamic = 'force-dynamic'

// ── Lazy Supabase client ──
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, key)
}

// ── POST handler ──
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QAScoreRequest
    const { creativeId, personaDescription } = body

    if (!creativeId || typeof creativeId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid creativeId' },
        { status: 400 },
      )
    }

    const supabase = getSupabase()

    // Fetch creative row
    const { data: creative, error: fetchError } = await supabase
      .from('creatives')
      .select('id, type, content, storage_url, qa_score, qa_scored_at, created_at')
      .eq('id', creativeId)
      .single()

    if (fetchError || !creative) {
      return NextResponse.json(
        { error: `Creative not found: ${fetchError?.message || 'unknown'}` },
        { status: 404 },
      )
    }

    const creativeRow = creative as CreativeRow

    // Run the QA pipeline
    const scoreCard = await runFullQAPipeline(creativeRow, personaDescription)

    // Persist score
    const { error: updateError } = await supabase
      .from('creatives')
      .update({
        qa_score: scoreCard,
        qa_scored_at: new Date().toISOString(),
      })
      .eq('id', creativeId)

    if (updateError) {
      console.error('Failed to persist QA score:', updateError)
      // Non-blocking — still return the score
    }

    return NextResponse.json({
      creativeId,
      ...scoreCard,
      persisted: !updateError,
    })
  } catch (err) {
    console.error('QA Score error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

// ── GET handler — health check ──
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/creative/qa-score',
    checks: [
      'voTextSync',
      'timingFit',
      'brandPresence',
      'audioLevels',
      'fontCongruency',
      'pivotClarity',
      'personaFit',
    ],
    env: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      ffmpegService: !!process.env.FFMPEG_SERVICE_URL,
    },
  })
}
