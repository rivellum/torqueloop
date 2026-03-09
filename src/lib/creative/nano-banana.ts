/**
 * Nano Banana 2 / Google Gemini Image Generation
 * Uses the Gemini API with image generation capability
 * Native 4K output, best-in-class text rendering
 */

import {
  CreativeRequest,
  CreativeResult,
  FORMAT_DIMENSIONS,
} from './types'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-2.0-flash-exp' // Nano Banana 2 model

interface GeminiImageResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string
        inlineData?: {
          mimeType: string
          data: string
        }
      }>
    }
  }>
  error?: { message: string; code: number }
}

/**
 * Build an optimized image generation prompt from the creative request
 */
function buildImagePrompt(request: CreativeRequest): string {
  const dims = FORMAT_DIMENSIONS[request.format]
  const aspectRatio = dims ? `${dims.width}x${dims.height}` : '1080x1080'

  const persona = request.campaign.personas[0]
  const trigger = request.campaign.emotional_triggers.find(t => t.intensity > 5)

  let prompt = `Create a professional marketing advertisement image at ${aspectRatio} resolution.\n\n`

  // Campaign context
  prompt += `Brand: ${request.campaign.business_name}\n`
  prompt += `Goal: ${request.campaign.goal}\n`
  prompt += `Tone: ${request.campaign.tone}\n`
  prompt += `Target channel: ${request.channel}\n\n`

  // Persona targeting
  if (persona) {
    prompt += `Target audience: ${persona.name}, ${persona.age_range}, based in ${persona.location}.\n`
    if (persona.pain_points.length > 0) {
      prompt += `Their pain points: ${persona.pain_points.join(', ')}.\n`
    }
  }

  // Emotional trigger
  if (trigger) {
    prompt += `Emotional angle: ${trigger.sin} — ${trigger.message}\n`
  }

  // Specific creative instructions
  prompt += `\nCreative brief: ${request.prompt}\n\n`

  // Format-specific instructions
  if (request.format.startsWith('static_')) {
    prompt += `Style: Clean, modern marketing design. Professional typography. `
    prompt += `High contrast, vibrant colors. No stock photo feel. `
    prompt += `Include clear call-to-action text if provided in the brief. `

    if (request.format === 'static_story') {
      prompt += `Vertical format optimized for mobile viewing. Bold text at top third. `
    } else if (request.format === 'static_leaderboard' || request.format === 'static_banner') {
      prompt += `Compact display ad format. Logo on left, message center, CTA button right. `
    }
  }

  // Language
  if (request.language === 'es') {
    prompt += `\nAll text in the image must be in Spanish.`
  } else if (request.language === 'pt') {
    prompt += `\nAll text in the image must be in Portuguese.`
  }

  return prompt
}

/**
 * Generate an image using Nano Banana 2 (Gemini API)
 */
export async function generateImage(request: CreativeRequest): Promise<CreativeResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return {
      id: crypto.randomUUID(),
      provider: 'nano_banana',
      format: request.format,
      status: 'failed',
      error: 'GOOGLE_AI_API_KEY not configured',
    }
  }

  const prompt = buildImagePrompt(request)
  const dims = FORMAT_DIMENSIONS[request.format]

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            // Nano Banana 2 supports native 4K but we request optimal for ad format
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        id: crypto.randomUUID(),
        provider: 'nano_banana',
        format: request.format,
        status: 'failed',
        error: `Gemini API error ${response.status}: ${error}`,
      }
    }

    const data: GeminiImageResponse = await response.json()

    if (data.error) {
      return {
        id: crypto.randomUUID(),
        provider: 'nano_banana',
        format: request.format,
        status: 'failed',
        error: data.error.message,
      }
    }

    // Extract image from response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)

    if (!imagePart?.inlineData) {
      return {
        id: crypto.randomUUID(),
        provider: 'nano_banana',
        format: request.format,
        status: 'failed',
        error: 'No image returned from Gemini API',
      }
    }

    return {
      id: crypto.randomUUID(),
      provider: 'nano_banana',
      format: request.format,
      status: 'ready',
      data: imagePart.inlineData.data,
      mime_type: imagePart.inlineData.mimeType,
      width: dims?.width,
      height: dims?.height,
      actual_prompt: prompt,
      cost_usd: 0.045,
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      provider: 'nano_banana',
      format: request.format,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Generate multiple image variants
 */
export async function generateImageVariants(
  request: CreativeRequest,
  count: number = 3
): Promise<CreativeResult[]> {
  const results: CreativeResult[] = []

  for (let i = 0; i < count; i++) {
    // Add variation instructions
    const variedRequest = {
      ...request,
      prompt: `${request.prompt}\n\nVariation ${i + 1} of ${count}: ${
        i === 0 ? 'Primary design — bold and direct.'
        : i === 1 ? 'Alternative — softer, more emotional approach.'
        : 'Wildcard — unexpected creative angle, high contrast.'
      }`,
    }
    const result = await generateImage(variedRequest)
    results.push(result)
  }

  return results
}
