// AI provider for proposal draft generation
// Uses Anthropic Claude or OpenAI when available; falls back to mock if env is missing.
// Never auto-approves drafts. All generated drafts require human review.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export interface GenerateRequest {
  prompt: string
  maxTokens?: number
  timeoutMs?: number
}

export interface GenerateResult {
  text: string
  provider: 'anthropic' | 'openai' | 'mock'
  model: string
  usage: { input: number; output: number }
}

// Detect which provider is available
function getProvider(): { type: 'anthropic' | 'openai' | null } {
  if (process.env.ANTHROPIC_API_KEY) return { type: 'anthropic' }
  if (process.env.OPENAI_API_KEY) return { type: 'openai' }
  return { type: null }
}

// Anthropic Claude
async function generateWithAnthropic(req: GenerateRequest): Promise<GenerateResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const maxTokens = req.maxTokens || 1024

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: req.prompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  return {
    text,
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  }
}

// OpenAI
async function generateWithOpenAI(req: GenerateRequest): Promise<GenerateResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  const maxTokens = req.maxTokens || 1024

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: req.prompt }],
  })

  const text = response.choices[0]?.message?.content || ''

  return {
    text,
    provider: 'openai',
    model: 'gpt-4o',
    usage: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
  }
}

// Generate with timeout wrapper
export async function generateDraft(req: GenerateRequest): Promise<GenerateResult> {
  const provider = getProvider()
  const timeoutMs = req.timeoutMs || 30000

  if (!provider.type) {
    throw new Error('NO_AI_PROVIDER')
  }

  const generateFn = provider.type === 'anthropic' ? generateWithAnthropic : generateWithOpenAI

  // Race against timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('AI_PROVIDER_TIMEOUT')), timeoutMs)
  })

  return Promise.race([generateFn(req), timeoutPromise])
}

export function hasAIProvider(): boolean {
  return getProvider().type !== null
}
