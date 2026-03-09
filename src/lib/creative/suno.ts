/**
 * Suno — AI Music & Jingle Generation
 * For vocal jingles, ad hooks, and catchy audio branding
 * Uses Suno API (direct or via Replicate)
 */

import {
  CreativeRequest,
  CreativeResult,
} from './types'

const SUNO_API_BASE = process.env.SUNO_API_BASE || 'https://api.suno.ai/v1'

interface SunoResponse {
  id: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  audio_url?: string
  duration?: number
  title?: string
  error?: string
}

/**
 * Build a music generation prompt from campaign context
 */
function buildMusicPrompt(request: CreativeRequest): { prompt: string; style: string; title: string } {
  const persona = request.campaign.personas[0]
  const trigger = request.campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)[0]

  // Map tone to music style
  const styleMap: Record<string, string> = {
    professional: 'corporate pop, upbeat, clean production, confident',
    bold: 'energetic hip-hop beat, powerful, bass-heavy, motivational',
    friendly: 'acoustic pop, warm, friendly, light percussion',
    urgent: 'electronic, fast tempo, driving beat, energetic synths',
    aspirational: 'cinematic pop, inspiring, string section, uplifting chorus',
    empathetic: 'soft indie folk, emotional, piano, gentle vocals',
    authoritative: 'orchestral hybrid, powerful, timpani, authority',
  }

  const style = styleMap[request.campaign.tone] || styleMap.aspirational

  // Build lyric prompt
  let prompt = ''

  if (request.language === 'es') {
    prompt += `Jingle publicitario en español para ${request.campaign.business_name}. `
  } else {
    prompt += `Advertising jingle for ${request.campaign.business_name}. `
  }

  prompt += `Goal: ${request.campaign.goal}. `

  if (trigger) {
    prompt += `Emotional hook: ${trigger.sin} — ${trigger.message.substring(0, 40)}. `
  }

  if (persona) {
    prompt += `Target audience: ${persona.age_range} in ${persona.location}. `
  }

  prompt += request.prompt

  // Title for the track
  const title = `${request.campaign.business_name} - ${request.campaign.goal} Jingle`

  return { prompt, style, title }
}

/**
 * Generate a jingle using Suno
 */
export async function generateJingle(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'suno',
      format: request.format,
      status: 'failed',
      error: 'SUNO_API_KEY not configured',
    }
  }

  const { prompt, style, title } = buildMusicPrompt(request)

  try {
    const response = await fetch(`${SUNO_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        style,
        title,
        duration: 30, // 30 second jingle
        instrumental: false, // We want vocals
        make_instrumental: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'suno',
        format: request.format,
        status: 'failed',
        error: `Suno API error ${response.status}: ${error}`,
      }
    }

    const data: SunoResponse = await response.json()

    if (data.status === 'error' || data.error) {
      return {
        id: data.id || crypto.randomUUID(),
        provider: 'suno',
        format: request.format,
        status: 'failed',
        error: data.error || 'Jingle generation failed',
      }
    }

    if (data.status === 'complete' && data.audio_url) {
      return {
        id: data.id,
        provider: 'suno',
        format: 'audio_jingle',
        status: 'ready',
        url: data.audio_url,
        mime_type: 'audio/mpeg',
        duration: data.duration || 30,
        actual_prompt: prompt,
        cost_usd: 0.05,
        metadata: { title: data.title, style },
      }
    }

    // Still processing
    return {
      id: data.id,
      provider: 'suno',
      format: 'audio_jingle',
      status: 'generating',
      actual_prompt: prompt,
      metadata: { generation_id: data.id, title },
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'suno',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Poll jingle generation status
 */
export async function pollJingleStatus(generationId: string): Promise<CreativeResult> {
  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) {
    return {
      id: generationId,
      provider: 'suno',
      format: 'audio_jingle',
      status: 'failed',
      error: 'SUNO_API_KEY not configured',
    }
  }

  try {
    const response = await fetch(`${SUNO_API_BASE}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      return {
        id: generationId,
        provider: 'suno',
        format: 'audio_jingle',
        status: 'failed',
        error: `Poll error: ${response.status}`,
      }
    }

    const data: SunoResponse = await response.json()

    if (data.status === 'complete' && data.audio_url) {
      return {
        id: data.id,
        provider: 'suno',
        format: 'audio_jingle',
        status: 'ready',
        url: data.audio_url,
        mime_type: 'audio/mpeg',
        duration: data.duration || 30,
        cost_usd: 0.05,
      }
    }

    return {
      id: data.id,
      provider: 'suno',
      format: 'audio_jingle',
      status: data.status === 'error' ? 'failed' : 'generating',
      error: data.error,
    }
  } catch (err) {
    return {
      id: generationId,
      provider: 'suno',
      format: 'audio_jingle',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
