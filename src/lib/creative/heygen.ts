/**
 * HeyGen — AI Avatar Video Generation
 * Creates talking-head avatar videos for ads, explainers, and testimonials.
 * Uses HeyGen API v2 for avatar video generation.
 *
 * Pricing: ~$0.50-1.00/min (credit-based, varies by plan)
 * API docs: https://docs.heygen.com/reference/create-an-avatar-video-v2
 */

import {
  CreativeRequest,
  CreativeResult,
  FORMAT_DIMENSIONS,
} from './types'

const HEYGEN_API_BASE = 'https://api.heygen.com'

interface HeyGenVideoResponse {
  data: {
    video_id: string
  }
  error: string | null
}

interface HeyGenStatusResponse {
  data: {
    video_id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    video_url?: string
    duration?: number
    thumbnail_url?: string
    error?: string
  }
  error: string | null
}

// ── Curated avatar IDs by style ──
// Users should configure their own avatar IDs; these are sensible defaults
const DEFAULT_AVATARS: Record<string, string> = {
  professional_male: process.env.HEYGEN_AVATAR_PROFESSIONAL_M || 'josh_lite3_20230714',
  professional_female: process.env.HEYGEN_AVATAR_PROFESSIONAL_F || 'anna_lite3_20230714',
  energetic_male: process.env.HEYGEN_AVATAR_ENERGETIC_M || 'tyler_lite3_20230714',
  energetic_female: process.env.HEYGEN_AVATAR_ENERGETIC_F || 'kayla_lite3_20230714',
}

// ── Voice IDs by language ──
const VOICE_MAP: Record<string, string> = {
  en_professional: process.env.HEYGEN_VOICE_EN || '1bd001e7e50f421d891986aad5c1e2e',
  es_professional: process.env.HEYGEN_VOICE_ES || '2d5b0e6cf36811ed9fef00163e010a21',
  pt_professional: process.env.HEYGEN_VOICE_PT || 'e5e22c6e09ec11ee9f7100163e010a21',
}

/**
 * Select the best avatar based on tone
 */
function selectAvatar(tone: string): string {
  if (['bold', 'urgent', 'authoritative'].includes(tone)) {
    return DEFAULT_AVATARS.energetic_male
  }
  if (['friendly', 'empathetic'].includes(tone)) {
    return DEFAULT_AVATARS.professional_female
  }
  return DEFAULT_AVATARS.professional_male
}

/**
 * Select voice based on language and tone
 */
function selectVoice(language: string, tone: string): string {
  const langKey = language === 'es' ? 'es' : language === 'pt' ? 'pt' : 'en'
  return VOICE_MAP[`${langKey}_professional`] || VOICE_MAP.en_professional
}

/**
 * Build a script for the avatar to speak
 */
function buildAvatarScript(request: CreativeRequest): string {
  const { campaign, language } = request
  const trigger = campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)[0]

  // Keep scripts under 150 words for 30-60s videos
  if (language === 'es') {
    let script = `¿Sabías que ${campaign.business_name} puede ayudarte a lograr ${campaign.goal}?`
    if (trigger) {
      script += ` ${trigger.message}.`
    }
    script += ` Empieza hoy. Visita nuestro sitio para más información.`
    return script
  }

  let script = `Did you know ${campaign.business_name} can help you achieve ${campaign.goal}?`
  if (trigger) {
    script += ` ${trigger.message}.`
  }
  const persona = campaign.personas[0]
  if (persona && persona.pain_points.length > 0) {
    script += ` We understand ${persona.pain_points[0].toLowerCase()}.`
  }
  script += ` Get started today — visit us to learn more.`
  return script
}

/**
 * Generate an avatar video using HeyGen API v2
 */
export async function generateAvatarVideo(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'heygen',
      format: request.format,
      status: 'failed',
      error: 'HEYGEN_API_KEY not configured',
    }
  }

  const script = request.prompt || buildAvatarScript(request)
  const avatarId = selectAvatar(request.campaign.tone)
  const voiceId = selectVoice(request.language, request.campaign.tone)
  const dims = FORMAT_DIMENSIONS[request.format] || { width: 1080, height: 1920 }

  try {
    const response = await fetch(`${HEYGEN_API_BASE}/v2/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: voiceId,
              speed: 1.0,
            },
            background: {
              type: 'color',
              value: '#ffffff',
            },
          },
        ],
        dimension: {
          width: dims.width,
          height: dims.height,
        },
        test: process.env.NODE_ENV !== 'production', // Use test mode in dev
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'heygen',
        format: request.format,
        status: 'failed',
        error: `HeyGen API error ${response.status}: ${errText}`,
      }
    }

    const data: HeyGenVideoResponse = await response.json()

    if (data.error) {
      return {
        id: crypto.randomUUID(),
        provider: 'heygen',
        format: request.format,
        status: 'failed',
        error: data.error,
      }
    }

    return {
      id: data.data.video_id,
      provider: 'heygen',
      format: request.format,
      status: 'generating',
      actual_prompt: script,
      cost_usd: 0.50, // ~1 credit for 30s standard avatar
      metadata: {
        video_id: data.data.video_id,
        avatar_id: avatarId,
        voice_id: voiceId,
      },
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'heygen',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Poll HeyGen video generation status
 */
export async function pollAvatarVideoStatus(videoId: string): Promise<CreativeResult> {
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) {
    return {
      id: videoId,
      provider: 'heygen',
      format: 'video_short',
      status: 'failed',
      error: 'HEYGEN_API_KEY not configured',
    }
  }

  try {
    const response = await fetch(`${HEYGEN_API_BASE}/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': apiKey },
    })

    if (!response.ok) {
      return {
        id: videoId,
        provider: 'heygen',
        format: 'video_short',
        status: 'failed',
        error: `Poll error: ${response.status}`,
      }
    }

    const data: HeyGenStatusResponse = await response.json()

    if (data.data.status === 'completed' && data.data.video_url) {
      return {
        id: videoId,
        provider: 'heygen',
        format: 'video_short',
        status: 'ready',
        url: data.data.video_url,
        mime_type: 'video/mp4',
        duration: data.data.duration,
        cost_usd: 0.50,
        metadata: {
          thumbnail_url: data.data.thumbnail_url,
        },
      }
    }

    return {
      id: videoId,
      provider: 'heygen',
      format: 'video_short',
      status: data.data.status === 'failed' ? 'failed' : 'generating',
      error: data.data.error,
    }
  } catch (err) {
    return {
      id: videoId,
      provider: 'heygen',
      format: 'video_short',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
