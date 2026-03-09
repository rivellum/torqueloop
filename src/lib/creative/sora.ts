/**
 * Sora 2 — OpenAI Video Generation
 * For hero creative clips (high quality, not bulk)
 * Uses OpenAI's video generation API
 */

import {
  CreativeRequest,
  CreativeResult,
  FORMAT_DIMENSIONS,
} from './types'

const OPENAI_API_BASE = 'https://api.openai.com/v1'

interface SoraResponse {
  id: string
  status: 'pending' | 'completed' | 'failed'
  video?: {
    url: string
    duration: number
  }
  error?: { message: string }
}

/**
 * Build a video generation prompt
 */
function buildVideoPrompt(request: CreativeRequest): string {
  const persona = request.campaign.personas[0]
  const trigger = request.campaign.emotional_triggers.find(t => t.intensity > 5)

  let prompt = ''

  // Scene description
  prompt += `Create a ${request.channel === 'tiktok' ? '15-second vertical' : '15-second'} `
  prompt += `marketing video for ${request.campaign.business_name}. `
  prompt += `Style: ${request.campaign.tone}, cinematic quality, professional lighting. `

  // Target audience visual
  if (persona) {
    prompt += `Feature a person matching this profile: ${persona.age_range} year old in ${persona.location}. `
  }

  // Emotional direction
  if (trigger) {
    prompt += `The mood should evoke ${trigger.sin}: ${trigger.message}. `
  }

  // Specific creative instructions
  prompt += request.prompt

  // Format instructions
  const dims = FORMAT_DIMENSIONS[request.format]
  if (dims) {
    const isVertical = dims.height > dims.width
    prompt += ` ${isVertical ? 'Vertical (9:16) format for mobile.' : 'Widescreen (16:9) format.'}`
  }

  // Language
  if (request.language === 'es') {
    prompt += ' Any on-screen text should be in Spanish.'
  }

  return prompt
}

/**
 * Generate a video using Sora 2
 */
export async function generateVideo(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'sora',
      format: request.format,
      status: 'failed',
      error: 'OPENAI_API_KEY not configured',
    }
  }

  const prompt = buildVideoPrompt(request)
  const dims = FORMAT_DIMENSIONS[request.format]

  try {
    // Start video generation
    const response = await fetch(`${OPENAI_API_BASE}/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora',
        prompt,
        size: dims ? `${dims.width}x${dims.height}` : '1920x1080',
        duration: 15, // seconds
        n: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'sora',
        format: request.format,
        status: 'failed',
        error: `Sora API error ${response.status}: ${error}`,
      }
    }

    const data: SoraResponse = await response.json()

    if (data.status === 'failed' || data.error) {
      return {
        id: crypto.randomUUID(),
        provider: 'sora',
        format: request.format,
        status: 'failed',
        error: data.error?.message || 'Video generation failed',
      }
    }

    // If pending, return with the generation ID for polling
    if (data.status === 'pending') {
      return {
        id: data.id,
        provider: 'sora',
        format: request.format,
        status: 'generating',
        actual_prompt: prompt,
        metadata: { generation_id: data.id },
      }
    }

    // Completed
    return {
      id: data.id,
      provider: 'sora',
      format: request.format,
      status: 'ready',
      url: data.video?.url,
      mime_type: 'video/mp4',
      width: dims?.width,
      height: dims?.height,
      duration: data.video?.duration || 15,
      actual_prompt: prompt,
      cost_usd: (data.video?.duration || 15) * 0.20, // ~$0.20/sec estimate
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'sora',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Poll for video completion status
 */
export async function pollVideoStatus(generationId: string): Promise<CreativeResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      id: generationId,
      provider: 'sora',
      format: 'video_landscape',
      status: 'failed',
      error: 'OPENAI_API_KEY not configured',
    }
  }

  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      return {
        id: generationId,
        provider: 'sora',
        format: 'video_landscape',
        status: 'failed',
        error: `Poll error: ${response.status}`,
      }
    }

    const data: SoraResponse = await response.json()

    if (data.status === 'completed' && data.video) {
      return {
        id: data.id,
        provider: 'sora',
        format: 'video_landscape',
        status: 'ready',
        url: data.video.url,
        mime_type: 'video/mp4',
        duration: data.video.duration,
        cost_usd: data.video.duration * 0.20,
      }
    }

    return {
      id: data.id,
      provider: 'sora',
      format: 'video_landscape',
      status: data.status === 'failed' ? 'failed' : 'generating',
      error: data.error?.message,
    }
  } catch (err) {
    return {
      id: generationId,
      provider: 'sora',
      format: 'video_landscape',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
