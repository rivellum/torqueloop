/**
 * ElevenLabs — Voice & Audio Generation
 * For voiceovers (multilingual TTS) and instrumental background music
 */

import {
  CreativeRequest,
  CreativeResult,
} from './types'

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1'

// ── Curated voice IDs for ad voiceovers ──
const VOICES: Record<string, Record<string, string>> = {
  en: {
    male_professional:   'pNInz6obpgDQGcFmaJgB', // Adam — deep, authoritative
    female_professional: 'EXAVITQu4vr4xnSDxMaL', // Bella — warm, confident
    male_energetic:      'VR6AewLTigWG4xSOukaG', // Arnold — energetic, bold
    female_friendly:     'MF3mGyEYCl7XYWbV9V6O', // Elli — friendly, approachable
  },
  es: {
    male_professional:   'onwK4e9ZLuTAKqWW03F9', // Carlos — Mexican Spanish, professional
    female_professional: 'XB0fDUnXU5powFXDhCwa', // Sofia — neutral Spanish, warm
    male_energetic:      'pqHfZKP75CvOlQylNhV4', // Diego — energetic Spanish
    female_friendly:     'jBpfuIE2acCO8z3wKNLl', // Maria — friendly Mexican Spanish
  },
  pt: {
    male_professional:   'g5CIjZEefAph4nQFvHAz', // Pedro — Brazilian Portuguese
    female_professional: 'jsCqWAovK2LkecY7zXl4', // Ana — Brazilian Portuguese
  },
}

interface TTSResponse {
  audio?: ArrayBuffer
}

/**
 * Get the best voice ID based on campaign tone and language
 */
function selectVoice(tone: string, language: string): string {
  const langVoices = VOICES[language] || VOICES.en

  // Map tone to voice style
  if (['bold', 'urgent', 'authoritative'].includes(tone)) {
    return langVoices.male_energetic || langVoices.male_professional
  }
  if (['friendly', 'empathetic'].includes(tone)) {
    return langVoices.female_friendly || langVoices.female_professional
  }
  if (['professional', 'aspirational'].includes(tone)) {
    return langVoices.female_professional || langVoices.male_professional
  }

  return langVoices.female_professional || Object.values(langVoices)[0]
}

/**
 * Build voiceover script from campaign context
 */
function buildVoiceoverScript(request: CreativeRequest): string {
  // If the prompt already contains a full script, use it
  if (request.prompt.length > 50) {
    return request.prompt
  }

  const persona = request.campaign.personas[0]
  const trigger = request.campaign.emotional_triggers
    .filter(t => t.intensity > 5)
    .sort((a, b) => b.intensity - a.intensity)[0]

  let script = ''

  // Hook (first 3 seconds)
  if (trigger) {
    script += trigger.message + ' '
  } else {
    script += `Are you ready to ${request.campaign.goal}? `
  }

  // Body
  script += request.prompt + ' '

  // CTA
  if (request.language === 'es') {
    script += `Visita ${request.campaign.business_name} punto com. Empieza hoy.`
  } else {
    script += `Visit ${request.campaign.business_name} dot com. Start today.`
  }

  return script
}

/**
 * Generate a voiceover using ElevenLabs TTS
 */
export async function generateVoiceover(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: request.format,
      status: 'failed',
      error: 'ELEVENLABS_API_KEY not configured',
    }
  }

  const voiceId = selectVoice(request.campaign.tone, request.language)
  const script = buildVoiceoverScript(request)

  try {
    const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'elevenlabs',
        format: request.format,
        status: 'failed',
        error: `ElevenLabs API error ${response.status}: ${error}`,
      }
    }

    // Response is audio/mpeg binary
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    // Estimate duration: ~150 words per minute, average word is 5 chars
    const wordCount = script.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60)

    // Estimate cost: ~$0.30 per 1000 characters
    const charCount = script.length
    const cost = (charCount / 1000) * 0.30

    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: 'audio_voiceover',
      status: 'ready',
      data: base64Audio,
      mime_type: 'audio/mpeg',
      duration: estimatedDuration,
      actual_prompt: script,
      cost_usd: Math.round(cost * 1000) / 1000,
      metadata: { voice_id: voiceId, char_count: charCount },
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Generate instrumental background music using ElevenLabs Music
 */
export async function generateInstrumental(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: 'audio_instrumental',
      status: 'failed',
      error: 'ELEVENLABS_API_KEY not configured',
    }
  }

  // Map tone to instrumental style
  const styleMap: Record<string, string> = {
    professional: 'Corporate background music, light piano, soft strings, 100 BPM, positive',
    bold: 'Energetic electronic background, driving beat, 128 BPM, powerful',
    friendly: 'Warm acoustic guitar, light percussion, 90 BPM, cheerful',
    urgent: 'Cinematic tension build, fast tempo, 140 BPM, urgent',
    aspirational: 'Inspiring orchestral, rising strings, 110 BPM, motivational',
    empathetic: 'Soft piano, ambient pads, 80 BPM, emotional, reflective',
  }

  const musicPrompt = styleMap[request.campaign.tone] || styleMap.professional

  try {
    // ElevenLabs Sound Effects / Music generation endpoint
    const response = await fetch(`${ELEVENLABS_API}/sound-generation`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: musicPrompt,
        duration_seconds: 30,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'elevenlabs',
        format: 'audio_instrumental',
        status: 'failed',
        error: `ElevenLabs Music API error ${response.status}: ${error}`,
      }
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: 'audio_instrumental',
      status: 'ready',
      data: base64Audio,
      mime_type: 'audio/mpeg',
      duration: 30,
      actual_prompt: musicPrompt,
      cost_usd: 0.03,
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'elevenlabs',
      format: 'audio_instrumental',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
