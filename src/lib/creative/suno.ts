/**
 * Suno — Manual Jingle Workflow
 *
 * Suno doesn't have a public API, so we generate an optimized prompt
 * for the user to paste into suno.com, then they upload the resulting
 * MP3 back into TorqueLoop for distribution.
 */

import {
  CreativeRequest,
  CreativeResult,
  CampaignContext,
} from './types'

// ── Style mapping ──
const TONE_STYLES: Record<string, string> = {
  professional: 'corporate pop, upbeat, clean production, confident vocals',
  bold: 'energetic hip-hop beat, powerful, bass-heavy, motivational hook',
  friendly: 'acoustic pop, warm, light percussion, catchy melody',
  urgent: 'electronic, fast tempo, driving beat, energetic synths',
  aspirational: 'cinematic pop, inspiring, string section, uplifting chorus',
  empathetic: 'soft indie folk, emotional, piano, gentle vocals',
  authoritative: 'orchestral hybrid, powerful, timpani, authority',
}

/**
 * Build an optimized prompt for manual Suno generation
 */
export function buildSunoPrompt(campaign: CampaignContext, language: 'en' | 'es' | 'pt' = 'en'): {
  prompt: string
  style: string
  title: string
  instructions: string
} {
  const persona = campaign.personas[0]
  const trigger = campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)[0]

  const style = TONE_STYLES[campaign.tone] || TONE_STYLES.aspirational

  // Build the generation prompt
  let prompt = ''

  if (language === 'es') {
    prompt += `Jingle publicitario en español para ${campaign.business_name}. `
    prompt += `Objetivo: ${campaign.goal}. `
    if (trigger) {
      prompt += `Gancho emocional: ${trigger.message.substring(0, 60)}. `
    }
    if (persona) {
      prompt += `Audiencia: ${persona.age_range}, ${persona.location}. `
    }
    prompt += `Duración: 30 segundos. Incluir nombre de marca al menos 2 veces.`
  } else if (language === 'pt') {
    prompt += `Jingle publicitário em português para ${campaign.business_name}. `
    prompt += `Objetivo: ${campaign.goal}. `
    if (trigger) {
      prompt += `Gancho emocional: ${trigger.message.substring(0, 60)}. `
    }
    prompt += `Duração: 30 segundos. Incluir nome da marca pelo menos 2 vezes.`
  } else {
    prompt += `Advertising jingle for ${campaign.business_name}. `
    prompt += `Goal: ${campaign.goal}. `
    if (trigger) {
      prompt += `Emotional hook: ${trigger.sin} — ${trigger.message.substring(0, 60)}. `
    }
    if (persona) {
      prompt += `Target audience: ${persona.age_range} in ${persona.location}. `
    }
    prompt += `Duration: 30 seconds. Include brand name at least twice.`
  }

  const title = `${campaign.business_name} - ${campaign.goal} Jingle`

  const instructions = [
    '1. Go to suno.com and sign in',
    '2. Click "Create" and paste the prompt below',
    `3. Set style to: "${style}"`,
    '4. Set duration to 30 seconds',
    '5. Generate 2-3 variations and pick the best one',
    '6. Download the MP3 file',
    '7. Upload it below to add to your campaign assets',
  ].join('\n')

  return { prompt, style, title, instructions }
}

/**
 * Instead of calling an API, return a "manual" result with the prompt
 * and instructions for the user to generate in Suno's web app.
 */
export function createManualJingleTask(request: CreativeRequest): CreativeResult {
  const { prompt, style, title, instructions } = buildSunoPrompt(
    request.campaign,
    request.language,
  )

  return {
    id: crypto.randomUUID(),
    provider: 'suno',
    format: 'audio_jingle',
    status: 'pending',
    actual_prompt: prompt,
    cost_usd: 0,
    metadata: {
      workflow: 'manual',
      title,
      style,
      instructions,
      suno_url: 'https://suno.com/create',
      prompt_ready: true,
    },
  }
}
