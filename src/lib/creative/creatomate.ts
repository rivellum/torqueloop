/**
 * Creatomate — Template-Based Video Generation
 * For bulk ad format variations (50+ variants from one concept)
 * Uses pre-defined templates, swaps copy/images/colors
 */

import {
  CreativeRequest,
  CreativeResult,
  FORMAT_DIMENSIONS,
} from './types'

const CREATOMATE_API = 'https://api.creatomate.com/v1'

// ── Template IDs (to be configured in Vercel env or created via Creatomate dashboard) ──
const TEMPLATES: Record<string, string> = {
  // These are placeholder IDs — replace with actual template IDs after creating them in Creatomate
  video_short: process.env.CREATOMATE_TEMPLATE_SHORT || '',
  video_square: process.env.CREATOMATE_TEMPLATE_SQUARE || '',
  video_landscape: process.env.CREATOMATE_TEMPLATE_LANDSCAPE || '',
}

interface CreatomateRender {
  id: string
  status: 'planned' | 'rendering' | 'succeeded' | 'failed'
  url?: string
  error_message?: string
}

interface CreatomateModification {
  [key: string]: string | number | boolean | null
}

/**
 * Build template modifications from the creative request
 */
function buildModifications(request: CreativeRequest): CreatomateModification {
  const persona = request.campaign.personas[0]
  const trigger = request.campaign.emotional_triggers.find(t => t.intensity > 5)

  const mods: CreatomateModification = {
    // Text layers (these match template element names in Creatomate)
    'headline.text': extractHeadline(request.prompt),
    'body.text': extractBody(request.prompt),
    'cta.text': extractCTA(request.prompt, request.language),
    'brand.text': request.campaign.business_name,

    // Dynamic content
    'persona_name.text': persona?.name || '',
    'location.text': persona?.location || '',

    // Colors (from campaign tone)
    'background.fill': getToneColor(request.campaign.tone),
    'accent.fill': getToneAccent(request.campaign.tone),
  }

  // Emotional trigger overlay
  if (trigger) {
    mods['trigger_badge.text'] = trigger.message.substring(0, 50)
  }

  return mods
}

/**
 * Extract headline from prompt (first sentence or before first period)
 */
function extractHeadline(prompt: string): string {
  const firstLine = prompt.split('\n')[0] || prompt.split('.')[0] || prompt
  return firstLine.substring(0, 60)
}

/**
 * Extract body text from prompt
 */
function extractBody(prompt: string): string {
  const lines = prompt.split('\n')
  return (lines[1] || lines[0] || prompt).substring(0, 120)
}

/**
 * Get CTA text based on language
 */
function extractCTA(prompt: string, language: string): string {
  // Check if prompt contains a CTA
  const ctaMatch = prompt.match(/CTA:\s*(.+)/i)
  if (ctaMatch) return ctaMatch[1].trim()

  // Default CTAs by language
  const defaults: Record<string, string> = {
    en: 'Learn More',
    es: 'Saber Mas',
    pt: 'Saiba Mais',
  }
  return defaults[language] || defaults.en
}

/**
 * Map campaign tone to primary brand color
 */
function getToneColor(tone: string): string {
  const colors: Record<string, string> = {
    professional: '#1a1a2e',
    bold: '#e63946',
    friendly: '#457b9d',
    urgent: '#ff6b35',
    aspirational: '#6D28D9',
    empathetic: '#2d6a4f',
    authoritative: '#14213d',
  }
  return colors[tone] || '#1a1a2e'
}

/**
 * Map campaign tone to accent color
 */
function getToneAccent(tone: string): string {
  const accents: Record<string, string> = {
    professional: '#e2e8f0',
    bold: '#ffd166',
    friendly: '#a8dadc',
    urgent: '#ffd166',
    aspirational: '#c4b5fd',
    empathetic: '#95d5b2',
    authoritative: '#fca311',
  }
  return accents[tone] || '#e2e8f0'
}

/**
 * Render a video using Creatomate template
 */
export async function renderTemplateVideo(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.CREATOMATE_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'creatomate',
      format: request.format,
      status: 'failed',
      error: 'CREATOMATE_API_KEY not configured',
    }
  }

  const templateId = TEMPLATES[request.format]
  if (!templateId) {
    return {
      id: crypto.randomUUID(),
      provider: 'creatomate',
      format: request.format,
      status: 'failed',
      error: `No Creatomate template configured for format: ${request.format}`,
    }
  }

  const modifications = buildModifications(request)
  const dims = FORMAT_DIMENSIONS[request.format]

  try {
    const response = await fetch(`${CREATOMATE_API}/renders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        modifications,
        // Output settings
        output_format: 'mp4',
        width: dims?.width || 1080,
        height: dims?.height || 1920,
        frame_rate: 30,
        max_duration: 30,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'creatomate',
        format: request.format,
        status: 'failed',
        error: `Creatomate API error ${response.status}: ${error}`,
      }
    }

    const renders: CreatomateRender[] = await response.json()
    const render = renders[0]

    if (!render) {
      return {
        id: crypto.randomUUID(),
        provider: 'creatomate',
        format: request.format,
        status: 'failed',
        error: 'No render returned from Creatomate',
      }
    }

    if (render.status === 'succeeded' && render.url) {
      return {
        id: render.id,
        provider: 'creatomate',
        format: request.format,
        status: 'ready',
        url: render.url,
        mime_type: 'video/mp4',
        width: dims?.width,
        height: dims?.height,
        cost_usd: 0.05,
      }
    }

    // Still rendering — return pending for polling
    return {
      id: render.id,
      provider: 'creatomate',
      format: request.format,
      status: 'generating',
      metadata: { render_id: render.id },
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'creatomate',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Poll render status
 */
export async function pollRenderStatus(renderId: string): Promise<CreativeResult> {
  const apiKey = process.env.CREATOMATE_API_KEY
  if (!apiKey) {
    return {
      id: renderId,
      provider: 'creatomate',
      format: 'video_short',
      status: 'failed',
      error: 'CREATOMATE_API_KEY not configured',
    }
  }

  try {
    const response = await fetch(`${CREATOMATE_API}/renders/${renderId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      return {
        id: renderId,
        provider: 'creatomate',
        format: 'video_short',
        status: 'failed',
        error: `Poll error: ${response.status}`,
      }
    }

    const render: CreatomateRender = await response.json()

    if (render.status === 'succeeded' && render.url) {
      return {
        id: render.id,
        provider: 'creatomate',
        format: 'video_short',
        status: 'ready',
        url: render.url,
        mime_type: 'video/mp4',
        cost_usd: 0.05,
      }
    }

    return {
      id: render.id,
      provider: 'creatomate',
      format: 'video_short',
      status: render.status === 'failed' ? 'failed' : 'generating',
      error: render.error_message,
    }
  } catch (err) {
    return {
      id: renderId,
      provider: 'creatomate',
      format: 'video_short',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Bulk render: generate multiple variants from one template
 */
export async function bulkRender(
  request: CreativeRequest,
  count: number = 5
): Promise<CreativeResult[]> {
  const results: CreativeResult[] = []
  const tones = ['bold', 'professional', 'urgent', 'friendly', 'aspirational']

  for (let i = 0; i < count; i++) {
    const variant = {
      ...request,
      campaign: {
        ...request.campaign,
        // Vary the tone slightly for each variant
        tone: i < tones.length ? tones[i] : request.campaign.tone,
      },
    }
    const result = await renderTemplateVideo(variant)
    results.push(result)
  }

  return results
}
