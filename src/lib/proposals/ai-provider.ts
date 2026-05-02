// AI provider for proposal draft generation
// Failover chain: Anthropic Claude → OpenAI GPT-4o → mock (in route layer)
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

type ProviderType = 'anthropic' | 'openai'

// Returns ordered list of available providers based on env keys
function getAvailableProviders(): ProviderType[] {
  const providers: ProviderType[] = []
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic')
  if (process.env.OPENAI_API_KEY) providers.push('openai')
  return providers
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

const PROVIDER_FNS: Record<ProviderType, (req: GenerateRequest) => Promise<GenerateResult>> = {
  anthropic: generateWithAnthropic,
  openai: generateWithOpenAI,
}

// Wrap a provider call with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('AI_PROVIDER_TIMEOUT')), ms)
  })
  return Promise.race([promise, timeoutPromise])
}

// Generate with failover: Anthropic → OpenAI → throw (route layer handles mock)
export async function generateDraft(req: GenerateRequest): Promise<GenerateResult> {
  const providers = getAvailableProviders()
  const timeoutMs = req.timeoutMs || 30000

  if (providers.length === 0) {
    throw new Error('NO_AI_PROVIDER')
  }

  let lastError: Error | null = null

  for (const providerType of providers) {
    try {
      const result = await withTimeout(PROVIDER_FNS[providerType](req), timeoutMs)
      return result
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // Continue to next provider
    }
  }

  // All providers failed
  throw lastError || new Error('ALL_PROVIDERS_FAILED')
}

export function hasAIProvider(): boolean {
  return getAvailableProviders().length > 0
}
