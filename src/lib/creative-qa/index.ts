/**
 * TorqueLoop Creative QA / Congruency Engine
 *
 * Orchestrates the 7 automated checks and produces a QAScoreCard.
 *
 * Vercel Serverless Limitations
 * ─────────────────────────────
 * Vercel's serverless functions do NOT ship with `ffmpeg` or `ffprobe`
 * binaries.  Checks that rely on frame extraction or LUFS audio analysis
 * (Brand Presence, Audio Levels) need a sidecar endpoint that runs on a
 * VPS or container with ffmpeg installed.
 *
 * This module exposes a `runFullQAPipeline` function that:
 *   1. Runs pure-text/AI checks synchronously (Timing, Pivot Clarity,
 *      Persona Fit).
 *   2. Calls the Whisper API for VO-Text Sync.
 *   3. Delegates ffmpeg-dependent checks to an optional
 *      `FFMPEG_SERVICE_URL` micro-service (see README for deployment).
 *   4. Falls back gracefully if ffmpeg or vision keys are missing,
 *      marking those checks with score 0 and a diagnostic message.
 */

import {
  QAScoreCard,
  QAScoreChecks,
  QACheckResult,
  QACheckName,
  QA_CHECK_WEIGHTS,
  APPROVAL_THRESHOLD,
  CreativeRow,
  TextCard,
} from '@/types/creative-qa'

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function clamp01to10(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10))
}

function weightedOverall(checks: QAScoreChecks): number {
  let totalWeight = 0
  let weightedSum = 0
  for (const key of Object.keys(checks) as QACheckName[]) {
    const w = QA_CHECK_WEIGHTS[key]
    weightedSum += checks[key].score * w
    totalWeight += w
  }
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

function passCheck(pass: boolean, passMsg: string, failMsg: string): QACheckResult {
  return { score: pass ? 10 : 0, details: pass ? passMsg : failMsg }
}

// ────────────────────────────────────────────────────────────────────
// Check 1 – VO-Text Sync  (Whisper API)
// ────────────────────────────────────────────────────────────────────

async function checkVOTextSync(
  videoUrl: string | null,
  textCards: TextCard[] | undefined,
): Promise<QACheckResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { score: 0, details: 'OPENAI_API_KEY not configured — skipped' }
  }
  if (!videoUrl) {
    return { score: 0, details: 'No video URL available' }
  }
  if (!textCards || textCards.length === 0) {
    return { score: 5, details: 'No text cards in content metadata — cannot compare' }
  }

  try {
    // Step 1: Download the video/audio
    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) {
      return { score: 0, details: `Failed to download video: ${videoRes.status}` }
    }
    const videoBlob = await videoRes.blob()

    // Step 2: Send to Whisper
    const formData = new FormData()
    formData.append('file', videoBlob, 'creative.mp4')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    })

    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      return { score: 0, details: `Whisper API error: ${whisperRes.status} ${errText}` }
    }

    const whisperData = await whisperRes.json()
    const transcript: string = (whisperData.text || '').toLowerCase()

    // Step 3: Compare transcription against text card words
    const allCardWords = textCards
      .map((c) => c.text)
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    if (allCardWords.length === 0) {
      return { score: 5, details: 'Text cards contain no words to compare' }
    }

    const transcriptWords = new Set(transcript.split(/\s+/).filter(Boolean))
    let matched = 0
    for (const w of allCardWords) {
      if (transcriptWords.has(w)) matched++
    }

    const pct = Math.round((matched / allCardWords.length) * 100)
    const score = clamp01to10(pct / 10)

    return {
      score,
      details: `${pct}% of text-card words found in VO transcript (${matched}/${allCardWords.length})`,
      meta: { transcript: transcript.slice(0, 500), matched, total: allCardWords.length },
    }
  } catch (err) {
    return {
      score: 0,
      details: `VO-Text Sync error: ${err instanceof Error ? err.message : 'unknown'}`,
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// Check 2 – Timing Fit  (pure logic)
// ────────────────────────────────────────────────────────────────────

function checkTimingFit(
  textCards: TextCard[] | undefined,
  videoDurationSec: number | undefined,
): QACheckResult {
  if (!textCards || textCards.length === 0) {
    return { score: 5, details: 'No text cards to validate timing' }
  }

  const issues: string[] = []

  // Check 1: each card ≥ 1.5s
  for (const card of textCards) {
    const dur = card.end - card.start
    if (dur < 1.5) {
      issues.push(`Card "${card.text.slice(0, 30)}…" only ${dur.toFixed(1)}s (< 1.5s minimum)`)
    }
  }

  // Check 2: no overlaps
  const sorted = [...textCards].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) {
      issues.push(
        `Overlap: "${sorted[i - 1].text.slice(0, 20)}" ends ${sorted[i - 1].end}s but "${sorted[i].text.slice(0, 20)}" starts ${sorted[i].start}s`,
      )
    }
  }

  // Check 3: cards fit within video duration
  if (videoDurationSec) {
    for (const card of textCards) {
      if (card.end > videoDurationSec + 0.5) {
        issues.push(
          `Card "${card.text.slice(0, 30)}" ends at ${card.end}s but video is ${videoDurationSec}s`,
        )
      }
    }
  }

  if (issues.length === 0) {
    return { score: 10, details: 'All timing checks passed' }
  }

  return {
    score: issues.length <= 1 ? 7 : issues.length <= 3 ? 4 : 0,
    details: `${issues.length} timing issue(s): ${issues.join('; ')}`,
    meta: { issues },
  }
}

// ────────────────────────────────────────────────────────────────────
// Check 3 – Brand Presence  (ffmpeg + vision — sidecar)
// ────────────────────────────────────────────────────────────────────

async function checkBrandPresence(
  videoUrl: string | null,
  brandName: string | undefined,
): Promise<QACheckResult> {
  const ffmpegService = process.env.FFMPEG_SERVICE_URL
  const visionKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!ffmpegService) {
    return {
      score: 0,
      details:
        'FFMPEG_SERVICE_URL not configured — brand presence check requires a sidecar service with ffmpeg. ' +
        'Deploy the ffmpeg-worker to a VPS and set FFMPEG_SERVICE_URL.',
    }
  }

  if (!videoUrl) {
    return { score: 0, details: 'No video URL available' }
  }

  if (!visionKey) {
    return { score: 0, details: 'No vision API key (ANTHROPIC_API_KEY or OPENAI_API_KEY) configured' }
  }

  try {
    // Extract first frame via sidecar
    const extractRes = await fetch(`${ffmpegService}/extract-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, timestamp: 0.5 }),
    })

    if (!extractRes.ok) {
      return { score: 0, details: `Frame extraction failed: ${extractRes.status}` }
    }

    const { frameBase64 } = await extractRes.json()

    // Ask Claude vision about brand presence
    if (process.env.ANTHROPIC_API_KEY) {
      return await checkBrandWithClaude(frameBase64, brandName)
    }
    return await checkBrandWithOpenAI(frameBase64, brandName)
  } catch (err) {
    return {
      score: 0,
      details: `Brand presence error: ${err instanceof Error ? err.message : 'unknown'}`,
    }
  }
}

async function checkBrandWithClaude(
  frameBase64: string,
  brandName: string | undefined,
): Promise<QACheckResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: frameBase64 },
            },
            {
              type: 'text',
              text:
                `This is the first frame of a video ad.${brandName ? ` The brand name is "${brandName}".` : ''} ` +
                'Is a brand logo or brand name visible in this frame? ' +
                'Respond JSON: {"visible": boolean, "description": string}',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    return { score: 0, details: `Claude vision error: ${res.status}` }
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))

  if (parsed.visible) {
    return { score: 10, details: `Brand visible from frame 1: ${parsed.description}` }
  }
  return { score: 0, details: `No brand element detected in first frame: ${parsed.description}` }
}

async function checkBrandWithOpenAI(
  frameBase64: string,
  brandName: string | undefined,
): Promise<QACheckResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${frameBase64}` },
            },
            {
              type: 'text',
              text:
                `This is the first frame of a video ad.${brandName ? ` The brand name is "${brandName}".` : ''} ` +
                'Is a brand logo or brand name visible? ' +
                'Respond JSON: {"visible": boolean, "description": string}',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    return { score: 0, details: `OpenAI vision error: ${res.status}` }
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))

  if (parsed.visible) {
    return { score: 10, details: `Brand visible from frame 1: ${parsed.description}` }
  }
  return { score: 0, details: `No brand element detected: ${parsed.description}` }
}

// ────────────────────────────────────────────────────────────────────
// Check 4 – Audio Levels  (ffmpeg LUFS — sidecar)
// ────────────────────────────────────────────────────────────────────

async function checkAudioLevels(videoUrl: string | null): Promise<QACheckResult> {
  const ffmpegService = process.env.FFMPEG_SERVICE_URL

  if (!ffmpegService) {
    return {
      score: 0,
      details:
        'FFMPEG_SERVICE_URL not configured — audio level check requires ffmpeg sidecar. ' +
        'Deploy the ffmpeg-worker and set FFMPEG_SERVICE_URL.',
    }
  }

  if (!videoUrl) {
    return { score: 0, details: 'No video URL available' }
  }

  try {
    const res = await fetch(`${ffmpegService}/audio-levels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl }),
    })

    if (!res.ok) {
      return { score: 0, details: `Audio analysis failed: ${res.status}` }
    }

    const { voLufs, musicLufs, deltaDb } = await res.json()

    if (deltaDb >= 6) {
      return {
        score: 10,
        details: `VO +${deltaDb.toFixed(1)}dB above music (VO ${voLufs.toFixed(1)} LUFS, music ${musicLufs.toFixed(1)} LUFS)`,
        meta: { voLufs, musicLufs, deltaDb },
      }
    }

    const score = deltaDb >= 3 ? 5 : deltaDb >= 0 ? 2 : 0
    return {
      score,
      details: `VO only +${deltaDb.toFixed(1)}dB above music (need ≥6dB). VO ${voLufs.toFixed(1)} LUFS, music ${musicLufs.toFixed(1)} LUFS`,
      meta: { voLufs, musicLufs, deltaDb },
    }
  } catch (err) {
    return {
      score: 0,
      details: `Audio level error: ${err instanceof Error ? err.message : 'unknown'}`,
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// Check 5 – Font Congruency  (AI vision)
// ────────────────────────────────────────────────────────────────────

async function checkFontCongruency(
  videoUrl: string | null,
  contentType: 'video' | 'image',
): Promise<QACheckResult> {
  const ffmpegService = process.env.FFMPEG_SERVICE_URL
  const visionKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!visionKey) {
    return { score: 0, details: 'No vision API key configured' }
  }

  if (contentType === 'image') {
    if (!videoUrl) return { score: 0, details: 'No image URL' }
    try {
      const imgRes = await fetch(videoUrl)
      const buf = Buffer.from(await imgRes.arrayBuffer())
      const b64 = buf.toString('base64')
      return await rateTypography(b64, 'image/jpeg')
    } catch (err) {
      return { score: 0, details: `Font check error: ${err instanceof Error ? err.message : 'unknown'}` }
    }
  }

  // Video — need frame extraction
  if (!ffmpegService) {
    return {
      score: 0,
      details:
        'FFMPEG_SERVICE_URL not configured — font congruency requires frame extraction. ' +
        'Deploy ffmpeg sidecar.',
    }
  }

  if (!videoUrl) return { score: 0, details: 'No video URL' }

  try {
    // Extract 3 frames at 25%, 50%, 75%
    const res = await fetch(`${ffmpegService}/extract-frames`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, timestamps: [0.25, 0.5, 0.75] }),
    })

    if (!res.ok) return { score: 0, details: `Frame extraction failed: ${res.status}` }

    const { frames } = await res.json() as { frames: string[] }

    if (!frames || frames.length === 0) {
      return { score: 0, details: 'No frames extracted' }
    }

    return await rateTypographyMulti(frames)
  } catch (err) {
    return {
      score: 0,
      details: `Font congruency error: ${err instanceof Error ? err.message : 'unknown'}`,
    }
  }
}

async function rateTypography(frameBase64: string, mediaType: string): Promise<QACheckResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: frameBase64 },
              },
              {
                type: 'text',
                text:
                  'Does the typography style (font, weight, colour, placement) in this ad frame ' +
                  'match the visual register of the footage? Score 1-10. ' +
                  'Respond JSON: {"score": number, "reasoning": string}',
              },
            ],
          },
        ],
      }),
    })

    if (!res.ok) return { score: 0, details: `Claude vision error: ${res.status}` }
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    return { score: clamp01to10(parsed.score ?? 0), details: parsed.reasoning || 'No reasoning' }
  }

  // OpenAI fallback
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${frameBase64}` } },
            {
              type: 'text',
              text:
                'Does the typography style match the visual register? Score 1-10. ' +
                'Respond JSON: {"score": number, "reasoning": string}',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) return { score: 0, details: `OpenAI vision error: ${res.status}` }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
  return { score: clamp01to10(parsed.score ?? 0), details: parsed.reasoning || 'No reasoning' }
}

async function rateTypographyMulti(frames: string[]): Promise<QACheckResult> {
  // Score each frame and average
  const results: QACheckResult[] = []
  for (const frame of frames) {
    results.push(await rateTypography(frame, 'image/jpeg'))
  }

  const avg = results.reduce((s, r) => s + r.score, 0) / results.length
  const details = results.map((r, i) => `Frame ${i + 1}: ${r.score}/10 — ${r.details}`).join('; ')

  return {
    score: clamp01to10(avg),
    details: `Average ${avg.toFixed(1)}/10 across ${frames.length} frames. ${details}`,
  }
}

// ────────────────────────────────────────────────────────────────────
// Check 6 – Pivot Clarity  (text-only AI)
// ────────────────────────────────────────────────────────────────────

async function checkPivotClarity(script: string | undefined): Promise<QACheckResult> {
  if (!script || script.trim().length === 0) {
    return { score: 5, details: 'No script in content metadata — cannot evaluate pivot clarity' }
  }

  const prompt =
    'You are an ad creative analyst.\n\n' +
    'Below is the text-overlay script for an ad. Evaluate whether the script has a clear ' +
    'structural break between a PROBLEM section and a SOLUTION section — a distinct pivot. ' +
    'Score 1-10 (1 = no discernible structure, 10 = crystal-clear problem→solution arc).\n\n' +
    `SCRIPT:\n${script}\n\n` +
    'Respond JSON: {"score": number, "pivot_line": string, "reasoning": string}'

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) return { score: 0, details: `Claude API error: ${res.status}` }
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
      return {
        score: clamp01to10(parsed.score ?? 0),
        details: parsed.reasoning + (parsed.pivot_line ? ` (pivot: "${parsed.pivot_line}")` : ''),
      }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return { score: 0, details: `OpenAI API error: ${res.status}` }
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    return {
      score: clamp01to10(parsed.score ?? 0),
      details: parsed.reasoning + (parsed.pivot_line ? ` (pivot: "${parsed.pivot_line}")` : ''),
    }
  } catch (err) {
    return { score: 0, details: `Pivot clarity error: ${err instanceof Error ? err.message : 'unknown'}` }
  }
}

// ────────────────────────────────────────────────────────────────────
// Check 7 – Persona Fit  (AI vision + text)
// ────────────────────────────────────────────────────────────────────

async function checkPersonaFit(
  script: string | undefined,
  personaDescription: string | undefined,
  videoUrl: string | null,
  contentType: 'video' | 'image',
): Promise<QACheckResult> {
  if (!personaDescription) {
    return { score: 5, details: 'No persona description provided — skipped persona fit check' }
  }

  const visionKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
  if (!visionKey) {
    return { score: 0, details: 'No vision API key configured' }
  }

  // Build prompt
  let prompt =
    'You are an advertising creative director.\n\n' +
    `TARGET PERSONA:\n${personaDescription}\n\n` +
    `AD SCRIPT:\n${script || '(no script provided)'}\n\n`

  // Try to get a frame for visual context
  let frameBase64: string | null = null
  const ffmpegService = process.env.FFMPEG_SERVICE_URL

  if (contentType === 'video' && videoUrl && ffmpegService) {
    try {
      const res = await fetch(`${ffmpegService}/extract-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, timestamp: 3 }),
      })
      if (res.ok) {
        const { frameBase64: fb64 } = await res.json()
        frameBase64 = fb64
      }
    } catch { /* non-critical */ }
  } else if (contentType === 'image' && videoUrl) {
    try {
      const imgRes = await fetch(videoUrl)
      const buf = Buffer.from(await imgRes.arrayBuffer())
      frameBase64 = buf.toString('base64')
    } catch { /* non-critical */ }
  }

  prompt +=
    'Does this ad\'s visual world and language match the target persona? ' +
    'Does it talk UP to them or DOWN to them? Score 1-10. ' +
    'Respond JSON: {"score": number, "direction": "up"|"down"|"level", "reasoning": string}'

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const content: Array<Record<string, unknown>> = []
      if (frameBase64) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: frameBase64 },
        })
      }
      content.push({ type: 'text', text: prompt })

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content }],
        }),
      })

      if (!res.ok) return { score: 0, details: `Claude API error: ${res.status}` }
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
      const directionNote = parsed.direction ? ` (talks ${parsed.direction} to persona)` : ''
      return {
        score: clamp01to10(parsed.score ?? 0),
        details: `${parsed.reasoning}${directionNote}`,
      }
    }

    // OpenAI fallback
    const content: Array<Record<string, unknown>> = []
    if (frameBase64) {
      content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${frameBase64}` } })
    }
    content.push({ type: 'text', text: prompt })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 400, messages: [{ role: 'user', content }] }),
    })

    if (!res.ok) return { score: 0, details: `OpenAI API error: ${res.status}` }
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    const directionNote = parsed.direction ? ` (talks ${parsed.direction} to persona)` : ''
    return {
      score: clamp01to10(parsed.score ?? 0),
      details: `${parsed.reasoning}${directionNote}`,
    }
  } catch (err) {
    return { score: 0, details: `Persona fit error: ${err instanceof Error ? err.message : 'unknown'}` }
  }
}

// ────────────────────────────────────────────────────────────────────
// Recommendations Generator
// ────────────────────────────────────────────────────────────────────

function generateRecommendations(checks: QAScoreChecks): string[] {
  const recs: string[] = []

  if (checks.voTextSync.score < 7) {
    recs.push('VO and text overlay are misaligned — consider re-recording VO or updating text cards')
  }
  if (checks.timingFit.score < 7) {
    recs.push('Text card timing issues detected — review overlaps and minimum display durations (1.5s)')
  }
  if (checks.brandPresence.score < 5) {
    recs.push('Brand element missing in first 2 seconds — add logo or brand name earlier')
  }
  if (checks.audioLevels.score < 7) {
    recs.push('Voice-over should be ≥6dB above music bed — adjust mix levels')
  }
  if (checks.fontCongruency.score < 6) {
    recs.push('Typography does not match the visual register — consider font family or weight changes')
  }
  if (checks.pivotClarity.score < 6) {
    recs.push('Script lacks a clear problem→solution pivot — restructure with a distinct turn')
  }
  if (checks.personaFit.score < 6) {
    recs.push('Creative tone or visuals may not align with the target persona — review messaging direction')
  }

  // Generic CTA recommendation if everything else is good
  if (recs.length === 0) {
    recs.push('Consider visual differentiation for CTA card to increase scroll-stopping power')
  }

  return recs
}

// ────────────────────────────────────────────────────────────────────
// Main Pipeline
// ────────────────────────────────────────────────────────────────────

export async function runFullQAPipeline(
  creative: CreativeRow,
  personaDescription?: string,
): Promise<QAScoreCard> {
  const textCards = creative.content?.text_cards
  const script = creative.content?.script
  const brandName = creative.content?.brand_name
  const videoUrl = creative.storage_url
  const contentType = creative.type

  // Estimate video duration from text cards if available
  const videoDurationSec = textCards && textCards.length > 0
    ? Math.max(...textCards.map((c) => c.end))
    : undefined

  // Run checks — AI checks can run in parallel
  const [voTextSync, timingFit, brandPresence, audioLevels, fontCongruency, pivotClarity, personaFit] =
    await Promise.all([
      checkVOTextSync(videoUrl, textCards),
      Promise.resolve(checkTimingFit(textCards, videoDurationSec)),
      checkBrandPresence(videoUrl, brandName),
      checkAudioLevels(videoUrl),
      checkFontCongruency(videoUrl, contentType),
      checkPivotClarity(script),
      checkPersonaFit(script, personaDescription || creative.content?.persona_description, videoUrl, contentType),
    ])

  const checks: QAScoreChecks = {
    voTextSync,
    timingFit,
    brandPresence,
    audioLevels,
    fontCongruency,
    pivotClarity,
    personaFit,
  }

  const overallScore = weightedOverall(checks)
  const recommendations = generateRecommendations(checks)

  return {
    overallScore,
    approved: overallScore >= APPROVAL_THRESHOLD,
    checks,
    recommendations,
  }
}
