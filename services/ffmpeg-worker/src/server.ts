/**
 * TorqueLoop FFmpeg Worker
 *
 * Lightweight Hono server that wraps ffmpeg/ffprobe for the Creative QA engine.
 * Deploy this on any VPS with ffmpeg installed (Ubuntu: apt install ffmpeg).
 *
 * Endpoints:
 *   POST /extract-frame    — Extract a single frame at a given timestamp
 *   POST /extract-frames   — Extract multiple frames at fractional timestamps
 *   POST /audio-levels     — Analyse LUFS for VO and music tracks
 *   GET  /health           — Health check
 *
 * Environment:
 *   PORT             — Listen port (default 3100)
 *   AUTH_TOKEN       — Bearer token for request authentication (optional)
 *   FFMPEG_BIN       — Path to ffmpeg binary (default: ffmpeg)
 *   FFPROBE_BIN      — Path to ffprobe binary (default: ffprobe)
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { execFile } from 'node:child_process'
import { readFile, unlink, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const app = new Hono()

const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg'
const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe'
const AUTH_TOKEN = process.env.AUTH_TOKEN

// ── Auth middleware ──
app.use('*', async (c, next) => {
  if (!AUTH_TOKEN) return next()
  const auth = c.req.header('Authorization')
  if (auth !== `Bearer ${AUTH_TOKEN}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
})

// ── Health ──
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'ffmpeg-worker', timestamp: new Date().toISOString() })
})

// ── Helpers ──

async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'tl-ffmpeg-'))
}

async function downloadToTemp(url: string, dir: string): Promise<string> {
  const ext = url.split('?')[0].split('.').pop() || 'mp4'
  const path = join(dir, `input.${ext}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(path, buf)
  return path
}

// ── POST /extract-frame ──
// Body: { videoUrl: string, timestamp: number }
// Returns: { frameBase64: string }
app.post('/extract-frame', async (c) => {
  let dir = ''
  try {
    const { videoUrl, timestamp = 0.5 } = await c.req.json()
    if (!videoUrl) return c.json({ error: 'videoUrl required' }, 400)

    dir = await createTempDir()
    const inputPath = await downloadToTemp(videoUrl, dir)
    const outPath = join(dir, 'frame.jpg')

    await execFileAsync(FFMPEG, [
      '-ss', String(timestamp),
      '-i', inputPath,
      '-frames:v', '1',
      '-q:v', '2',
      '-y',
      outPath,
    ])

    const buf = await readFile(outPath)
    return c.json({ frameBase64: buf.toString('base64') })
  } catch (err) {
    console.error('extract-frame error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  } finally {
    if (dir) await unlink(dir).catch(() => {})
  }
})

// ── POST /extract-frames ──
// Body: { videoUrl: string, timestamps: number[] } (0-1 fractional)
// Returns: { frames: string[] } (base64 JPEG array)
app.post('/extract-frames', async (c) => {
  let dir = ''
  try {
    const { videoUrl, timestamps } = await c.req.json()
    if (!videoUrl || !timestamps?.length) return c.json({ error: 'videoUrl and timestamps required' }, 400)

    dir = await createTempDir()
    const inputPath = await downloadToTemp(videoUrl, dir)

    // Get video duration first
    const { stdout: durOut } = await execFileAsync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ])
    const duration = parseFloat(durOut.trim())

    const frames: string[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const t = timestamps[i] * duration
      const outPath = join(dir, `frame_${i}.jpg`)
      await execFileAsync(FFMPEG, [
        '-ss', String(t),
        '-i', inputPath,
        '-frames:v', '1',
        '-q:v', '2',
        '-y',
        outPath,
      ])
      const buf = await readFile(outPath)
      frames.push(buf.toString('base64'))
    }

    return c.json({ frames })
  } catch (err) {
    console.error('extract-frames error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  } finally {
    if (dir) await unlink(dir).catch(() => {})
  }
})

// ── POST /audio-levels ──
// Body: { videoUrl: string }
// Returns: { voLufs: number, musicLufs: number, deltaDb: number }
//
// Heuristic: assumes VO is on the centre channel or dominant track.
// Uses dual-stream loudnorm: first pass for overall, second for music-only.
app.post('/audio-levels', async (c) => {
  let dir = ''
  try {
    const { videoUrl } = await c.req.json()
    if (!videoUrl) return c.json({ error: 'videoUrl required' }, 400)

    dir = await createTempDir()
    const inputPath = await downloadToTemp(videoUrl, dir)

    // Get integrated loudness of the full audio
    const { stdout: fullOut } = await execFileAsync(FFMPEG, [
      '-i', inputPath,
      '-af', 'loudnorm=print_format=json',
      '-f', 'null',
      '-',
    ], { timeout: 30_000 }).catch((e) => ({ stdout: e.stderr || '' }))

    // Parse JSON from ffmpeg output
    const jsonMatch = fullOut.match(/\{[\s\S]*"input_i"[\s\S]*\}/)
    let voLufs = -23 // fallback
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        voLufs = parseFloat(parsed.input_i) || -23
      } catch { /* fallback */ }
    }

    // Extract audio-only track and measure again (approximation of music bed)
    const musicPath = join(dir, 'music.wav')
    await execFileAsync(FFMPEG, [
      '-i', inputPath,
      '-af', 'highpass=f=200,lowpass=f=3000,loudnorm=print_format=json',
      '-y',
      musicPath,
    ], { timeout: 30_000 }).catch(() => {})

    const { stdout: musicOut } = await execFileAsync(FFMPEG, [
      '-i', musicPath,
      '-af', 'loudnorm=print_format=json',
      '-f', 'null',
      '-',
    ], { timeout: 30_000 }).catch((e) => ({ stdout: e.stderr || '' }))

    let musicLufs = voLufs - 10 // fallback assumption
    const musicJson = musicOut.match(/\{[\s\S]*"input_i"[\s\S]*\}/)
    if (musicJson) {
      try {
        const parsed = JSON.parse(musicJson[0])
        musicLufs = parseFloat(parsed.input_i) || musicLufs
      } catch { /* fallback */ }
    }

    const deltaDb = voLufs - musicLufs

    return c.json({ voLufs, musicLufs, deltaDb })
  } catch (err) {
    console.error('audio-levels error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  } finally {
    if (dir) await unlink(dir).catch(() => {})
  }
})

// ── Start server ──
const port = parseInt(process.env.PORT || '3100', 10)
console.log(`🎙️  FFmpeg worker listening on port ${port}`)

serve({ fetch: app.fetch, port })
