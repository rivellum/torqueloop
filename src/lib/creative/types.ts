/**
 * TorqueLoop Creative Engine — Shared Types
 * Unified interface for all creative generation APIs
 */

// ── Asset Types ──
export type CreativeFormat =
  | 'static_square'     // 1080x1080 — Instagram feed, Facebook feed
  | 'static_story'      // 1080x1920 — Stories, Reels cover, TikTok
  | 'static_landscape'  // 1200x628 — Facebook/LinkedIn link ads
  | 'static_leaderboard'// 728x90 — Google Display
  | 'static_banner'     // 300x250 — Google Display
  | 'video_short'       // 9:16, 15-30s — Reels, TikTok, Stories
  | 'video_square'      // 1:1, 15-30s — Feed video
  | 'video_landscape'   // 16:9, 15-60s — YouTube, pre-roll
  | 'video_avatar'      // Talking-head avatar — HeyGen
  | 'audio_jingle'      // 15-30s vocal jingle (manual via Suno)
  | 'audio_voiceover'   // Variable length VO
  | 'audio_instrumental'// Background music bed

export type CreativeProvider =
  | 'nano_banana'   // Google Gemini — images
  | 'sora'          // OpenAI Sora 2 — video
  | 'creatomate'    // Creatomate — template video
  | 'heygen'        // HeyGen — avatar videos
  | 'suno'          // Suno — jingles (manual workflow)
  | 'elevenlabs'    // ElevenLabs — voice/audio

export type CreativeStatus = 'pending' | 'generating' | 'ready' | 'failed'

// ── Generation Request ──
export interface CreativeRequest {
  /** What kind of asset */
  format: CreativeFormat
  /** Campaign context from wizard */
  campaign: CampaignContext
  /** Specific instructions for this creative */
  prompt: string
  /** Target channel (affects aspect ratio, tone, etc.) */
  channel: string
  /** Language for copy/voice */
  language: 'en' | 'es' | 'pt'
  /** Number of variants to generate */
  variants?: number
}

export interface CampaignContext {
  business_name: string
  goal: string
  outcome_type: string
  personas: PersonaSummary[]
  tone: string
  emotional_triggers: TriggerSummary[]
  channels: string[]
  budget_range: string
}

export interface PersonaSummary {
  name: string
  age_range: string
  location: string
  pain_points: string[]
  media_habits: string[]
}

export interface TriggerSummary {
  sin: string
  message: string
  intensity: number
}

// ── Generation Result ──
export interface CreativeResult {
  id: string
  provider: CreativeProvider
  format: CreativeFormat
  status: CreativeStatus
  /** URL to the generated asset (temporary) */
  url?: string
  /** Base64 encoded data for small assets */
  data?: string
  /** Mime type */
  mime_type?: string
  /** Dimensions for images/video */
  width?: number
  height?: number
  /** Duration in seconds for audio/video */
  duration?: number
  /** The prompt that was actually sent to the API */
  actual_prompt?: string
  /** Cost in USD for this generation */
  cost_usd?: number
  /** Error message if failed */
  error?: string
  /** Metadata from the provider */
  metadata?: Record<string, unknown>
}

// ── Creative Brief (generated from wizard state) ──
export interface CreativeBrief {
  campaign: CampaignContext
  /** Generated ad copy variants */
  copy_variants: CopyVariant[]
  /** Assets to generate */
  asset_requests: CreativeRequest[]
}

export interface CopyVariant {
  headline: string
  body: string
  cta: string
  channel: string
  trigger: string
  language: 'en' | 'es' | 'pt'
}

// ── Provider Config ──
export interface ProviderConfig {
  name: CreativeProvider
  enabled: boolean
  api_key_env: string
  formats: CreativeFormat[]
  cost_per_unit: number
  rate_limit_rpm: number
}

export const PROVIDER_REGISTRY: ProviderConfig[] = [
  {
    name: 'nano_banana',
    enabled: true,
    api_key_env: 'GOOGLE_AI_API_KEY',
    formats: ['static_square', 'static_story', 'static_landscape', 'static_leaderboard', 'static_banner'],
    cost_per_unit: 0.045,
    rate_limit_rpm: 15,
  },
  {
    name: 'sora',
    enabled: true,
    api_key_env: 'OPENAI_API_KEY',
    formats: ['video_short', 'video_square', 'video_landscape'],
    cost_per_unit: 0.30, // ~$0.10-0.50/sec, estimate for 15s clip
    rate_limit_rpm: 5,
  },
  {
    name: 'creatomate',
    enabled: true,
    api_key_env: 'CREATOMATE_API_KEY',
    formats: ['video_short', 'video_square', 'video_landscape'],
    cost_per_unit: 0.05,
    rate_limit_rpm: 60,
  },
  {
    name: 'heygen',
    enabled: true,
    api_key_env: 'HEYGEN_API_KEY',
    formats: ['video_avatar'],
    cost_per_unit: 0.50,
    rate_limit_rpm: 10,
  },
  {
    name: 'suno',
    enabled: true,
    api_key_env: '', // No API — manual workflow
    formats: ['audio_jingle'],
    cost_per_unit: 0, // User generates manually
    rate_limit_rpm: 0,
  },
  {
    name: 'elevenlabs',
    enabled: true,
    api_key_env: 'ELEVENLABS_API_KEY',
    formats: ['audio_voiceover', 'audio_instrumental'],
    cost_per_unit: 0.03,
    rate_limit_rpm: 20,
  },
]

// ── Format Dimensions ──
export const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  static_square:      { width: 1080, height: 1080 },
  static_story:       { width: 1080, height: 1920 },
  static_landscape:   { width: 1200, height: 628 },
  static_leaderboard: { width: 728,  height: 90 },
  static_banner:      { width: 300,  height: 250 },
  video_short:        { width: 1080, height: 1920 },
  video_square:       { width: 1080, height: 1080 },
  video_landscape:    { width: 1920, height: 1080 },
  video_avatar:       { width: 1080, height: 1920 }, // default portrait for avatar
}

// ── Channel → Format Mapping ──
export const CHANNEL_FORMATS: Record<string, CreativeFormat[]> = {
  meta_ads:       ['static_square', 'static_story', 'video_short', 'video_square', 'video_avatar', 'audio_voiceover'],
  google_search:  [], // text-only, no creative needed
  google_display: ['static_landscape', 'static_leaderboard', 'static_banner'],
  tiktok:         ['video_short', 'video_avatar', 'audio_jingle', 'audio_voiceover'],
  linkedin:       ['static_landscape', 'static_square', 'video_landscape', 'video_avatar'],
  youtube:        ['video_landscape', 'video_avatar', 'audio_jingle', 'audio_voiceover'],
  spotify_ads:    ['audio_jingle', 'audio_voiceover', 'static_square'],
  email:          ['static_landscape'],
  whatsapp:       ['static_square', 'audio_voiceover'],
  seo:            ['static_landscape'], // blog header images
}
