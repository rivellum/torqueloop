/**
 * POST /api/creative/generate
 *
 * Generate creative assets for a campaign.
 * Accepts campaign context from the wizard and returns generated assets.
 *
 * Body:
 *   - campaign: CampaignContext
 *   - mode: 'preview' | 'full' | 'single'
 *   - channel?: string (for preview/single mode)
 *   - format?: CreativeFormat (for single mode)
 *   - language?: 'en' | 'es' | 'pt'
 *   - maxGenerations?: number
 *
 * GET /api/creative/generate?providers=true
 *   Returns available providers based on configured API keys
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateCreativeSuite,
  generatePreview,
  getAvailableProviders,
  type CampaignContext,
  type CreativeFormat,
} from '@/lib/creative'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('providers') === 'true') {
    const providers = getAvailableProviders()
    return NextResponse.json({
      providers,
      count: providers.length,
      ready: providers.length > 0,
    })
  }

  return NextResponse.json({ status: 'ok', endpoint: '/api/creative/generate' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      campaign,
      mode = 'preview',
      channel,
      format,
      language = 'en',
      maxGenerations = 10,
    } = body as {
      campaign: CampaignContext
      mode: 'preview' | 'full' | 'single'
      channel?: string
      format?: CreativeFormat
      language?: 'en' | 'es' | 'pt'
      maxGenerations?: number
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Missing campaign context' },
        { status: 400 }
      )
    }

    // Check if any providers are available
    const providers = getAvailableProviders()
    if (providers.length === 0) {
      return NextResponse.json({
        error: 'No creative providers configured. Add API keys to environment variables.',
        required_keys: [
          'GOOGLE_AI_API_KEY (Nano Banana 2 — images)',
          'OPENAI_API_KEY (Sora 2 — video)',
          'CREATOMATE_API_KEY (template video)',
          'SUNO_API_KEY (jingles)',
          'ELEVENLABS_API_KEY (voiceover)',
        ],
      }, { status: 503 })
    }

    // ── Preview mode: single image for a channel ──
    if (mode === 'preview') {
      if (!channel) {
        return NextResponse.json(
          { error: 'Preview mode requires a channel parameter' },
          { status: 400 }
        )
      }

      const result = await generatePreview(campaign, channel, language)
      return NextResponse.json({
        mode: 'preview',
        result,
        providers_available: providers,
      })
    }

    // ── Full mode: generate complete creative suite ──
    if (mode === 'full') {
      const suite = await generateCreativeSuite(campaign, {
        channels: channel ? [channel] : undefined,
        formats: format ? [format] : undefined,
        maxGenerations,
        language,
      })

      return NextResponse.json({
        mode: 'full',
        ...suite,
        providers_available: providers,
      })
    }

    // ── Single mode: one specific asset ──
    if (mode === 'single') {
      if (!channel || !format) {
        return NextResponse.json(
          { error: 'Single mode requires channel and format parameters' },
          { status: 400 }
        )
      }

      const result = await generatePreview(campaign, channel, language)
      return NextResponse.json({
        mode: 'single',
        result,
        providers_available: providers,
      })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (err) {
    console.error('Creative generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
