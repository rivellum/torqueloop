/**
 * TorqueLoop Creative Engine — Unified Orchestrator
 *
 * Takes campaign context from the wizard and generates a full creative suite:
 * - Display ads (Nano Banana 2)
 * - Hero video clips (Sora 2)
 * - Template video variants (Creatomate)
 * - Avatar videos (HeyGen)
 * - Jingles (Suno — manual workflow with prompt generation)
 * - Voiceovers (ElevenLabs)
 */

import { generateImage, generateImageVariants } from './nano-banana'
import { generateVideo } from './sora'
import { renderTemplateVideo, bulkRender } from './creatomate'
import { generateAvatarVideo } from './heygen'
import { createManualJingleTask } from './suno'
import { generateVoiceover, generateInstrumental } from './elevenlabs'
import {
  CreativeRequest,
  CreativeResult,
  CreativeBrief,
  CampaignContext,
  CopyVariant,
  CreativeFormat,
  CHANNEL_FORMATS,
  PROVIDER_REGISTRY,
} from './types'

export * from './types'

// ── Provider availability check ──
export function getAvailableProviders(): string[] {
  return PROVIDER_REGISTRY
    .filter(p => {
      const key = process.env[p.api_key_env]
      return key && key.length > 0 && key !== 'placeholder'
    })
    .map(p => p.name)
}

// ── Route a creative request to the right provider ──
async function routeRequest(request: CreativeRequest): Promise<CreativeResult> {
  const format = request.format

  // Static images → Nano Banana 2
  if (format.startsWith('static_')) {
    return generateImage(request)
  }

  // Avatar video → HeyGen
  if (format === 'video_avatar') {
    return generateAvatarVideo(request)
  }

  // Video → Sora for hero clips, Creatomate for template variants
  if (format.startsWith('video_')) {
    // Use Sora for the first variant (hero), Creatomate for the rest
    if (request.variants === 1 || !process.env.CREATOMATE_API_KEY) {
      return generateVideo(request)
    }
    return renderTemplateVideo(request)
  }

  // Jingle → Manual workflow (generates prompt for Suno web app)
  if (format === 'audio_jingle') {
    return createManualJingleTask(request)
  }

  // Voiceover → ElevenLabs
  if (format === 'audio_voiceover') {
    return generateVoiceover(request)
  }

  // Instrumental → ElevenLabs
  if (format === 'audio_instrumental') {
    return generateInstrumental(request)
  }

  return {
    id: crypto.randomUUID(),
    provider: 'nano_banana',
    format,
    status: 'failed',
    error: `No provider configured for format: ${format}`,
  }
}

// ── Build a creative brief from wizard state ──
export function buildCreativeBrief(campaign: CampaignContext): CreativeBrief {
  const copyVariants: CopyVariant[] = []
  const assetRequests: CreativeRequest[] = []

  // Generate copy variants for each active channel × trigger
  const activeChannels = campaign.channels.filter(c => CHANNEL_FORMATS[c]?.length > 0)
  const activeTriggers = campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3) // Top 3 triggers

  for (const channel of activeChannels) {
    const formats = CHANNEL_FORMATS[channel] || []

    for (const trigger of activeTriggers) {
      // Copy variant per channel × trigger combo
      copyVariants.push({
        headline: trigger.message.substring(0, 60),
        body: `${campaign.business_name} — ${campaign.goal}`,
        cta: campaign.outcome_type === 'hire' ? 'Apply Now' : 'Learn More',
        channel,
        trigger: trigger.sin,
        language: 'en', // Default, can be overridden
      })

      // Asset requests for each format this channel needs
      for (const format of formats) {
        assetRequests.push({
          format,
          campaign,
          prompt: `${trigger.message}\n\nCTA: ${campaign.outcome_type === 'hire' ? 'Apply Now' : 'Get Started'}`,
          channel,
          language: 'en',
          variants: 1,
        })
      }
    }

    // If no triggers, still generate assets with default messaging
    if (activeTriggers.length === 0) {
      for (const format of formats) {
        assetRequests.push({
          format,
          campaign,
          prompt: `${campaign.business_name} — ${campaign.goal}. Professional, clean design.`,
          channel,
          language: 'en',
          variants: 1,
        })
      }
    }
  }

  return {
    campaign,
    copy_variants: copyVariants,
    asset_requests: assetRequests,
  }
}

// ── Generate all creatives for a campaign ──
export async function generateCreativeSuite(
  campaign: CampaignContext,
  options?: {
    /** Only generate for these channels */
    channels?: string[]
    /** Only generate these formats */
    formats?: CreativeFormat[]
    /** Max total generations (cost control) */
    maxGenerations?: number
    /** Language override */
    language?: 'en' | 'es' | 'pt'
  }
): Promise<{
  results: CreativeResult[]
  brief: CreativeBrief
  total_cost_usd: number
  providers_used: string[]
}> {
  const brief = buildCreativeBrief(campaign)
  const results: CreativeResult[] = []
  const providersUsed = new Set<string>()

  // Filter requests based on options
  let requests = brief.asset_requests

  if (options?.channels) {
    requests = requests.filter(r => options.channels!.includes(r.channel))
  }
  if (options?.formats) {
    requests = requests.filter(r => options.formats!.includes(r.format))
  }
  if (options?.language) {
    requests = requests.map(r => ({ ...r, language: options.language! }))
  }

  // Cap total generations
  const maxGen = options?.maxGenerations || 20
  requests = requests.slice(0, maxGen)

  // Deduplicate: same format + channel only needs one generation
  const seen = new Set<string>()
  const uniqueRequests = requests.filter(r => {
    const key = `${r.format}:${r.channel}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Execute generations (sequential to respect rate limits)
  for (const request of uniqueRequests) {
    const result = await routeRequest(request)
    results.push(result)
    if (result.status === 'ready' || result.status === 'generating') {
      providersUsed.add(result.provider)
    }
  }

  const totalCost = results
    .filter(r => r.cost_usd)
    .reduce((sum, r) => sum + (r.cost_usd || 0), 0)

  return {
    results,
    brief,
    total_cost_usd: Math.round(totalCost * 100) / 100,
    providers_used: Array.from(providersUsed),
  }
}

// ── Quick preview: generate 1 image for a single channel ──
export async function generatePreview(
  campaign: CampaignContext,
  channel: string,
  language: 'en' | 'es' | 'pt' = 'en'
): Promise<CreativeResult> {
  const formats = CHANNEL_FORMATS[channel]
  if (!formats || formats.length === 0) {
    return {
      id: crypto.randomUUID(),
      provider: 'nano_banana',
      format: 'static_square',
      status: 'failed',
      error: `No creative formats for channel: ${channel}`,
    }
  }

  // Pick the first static format for preview
  const format = formats.find(f => f.startsWith('static_')) || formats[0]
  const trigger = campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)[0]

  return routeRequest({
    format,
    campaign,
    prompt: trigger
      ? `${trigger.message}\n\nBrand: ${campaign.business_name}`
      : `${campaign.business_name} — ${campaign.goal}. Professional marketing design.`,
    channel,
    language,
    variants: 1,
  })
}
