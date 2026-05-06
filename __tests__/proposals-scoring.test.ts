import { describe, expect, it } from 'vitest'

// Import the scoring functions directly for unit testing
// We replicate the core logic here since the API route exports from Next.js

const ICP_KEYWORDS = [
  'google ads', 'ppc', 'paid search', 'paid social', 'meta ads', 'facebook ads',
  'landing page', 'conversion rate', 'cro', 'lead generation', 'lead gen',
  'performance marketing', 'digital marketing', 'ad spend', 'roas',
  'seo', 'organic traffic', 'content strategy',
  'brand', 'branding', 'rebrand', 'positioning',
  'growth', 'scaling', 'user acquisition',
  'saas', 'e-commerce', 'ecommerce', 'd2c', 'dtc',
  'startup', 'series a', 'funded', 'funding',
]

const RED_FLAG_SIGNALS = [
  { pattern: /test\s*work\s*(for\s*free|unpaid)/i, flag: 'Requests unpaid test work' },
  { pattern: /free\s*(trial|sample|test)/i, flag: 'Expects free work before engagement' },
  { pattern: /\$[0-9]+\/(hour|hr).*\b(va|virtual assistant|data entry)\b/i, flag: 'Task-only buyer at VA rates' },
  { pattern: /cheapest|lowest\s*(price|rate|cost)|budget\s*(friendly|option)/i, flag: 'Price-driven buyer' },
  { pattern: /no\s*budget|zero\s*budget|bootstrap/i, flag: 'No stated budget' },
  { pattern: /i\s*(need|want)\s*(someone|anyone)\s*who\s*can\s*do\s*everything/i, flag: 'Vague scope, no specific outcome' },
]

function scoreCategory(text: string, keywords: string[], maxPoints: number): number {
  const lower = text.toLowerCase()
  let matches = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) matches++
  }
  const ratio = Math.min(matches / 5, 1)
  return Math.round(ratio * maxPoints)
}

function extractRedFlags(text: string): string[] {
  const flags: string[] = []
  for (const { pattern, flag } of RED_FLAG_SIGNALS) {
    if (pattern.test(text)) flags.push(flag)
  }
  return flags
}

describe('Proposal scoring engine', () => {
  describe('scoreCategory', () => {
    it('returns 0 for no keyword matches', () => {
      expect(scoreCategory('hello world', ICP_KEYWORDS, 20)).toBe(0)
    })

    it('returns partial score for some matches', () => {
      const text = 'We need Google Ads management and PPC optimization for our SaaS'
      const score = scoreCategory(text, ICP_KEYWORDS, 20)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(20)
    })

    it('caps at maxPoints even with many matches', () => {
      const text = ICP_KEYWORDS.join(' ') // all keywords
      const score = scoreCategory(text, ICP_KEYWORDS, 20)
      expect(score).toBe(20)
    })

    it('is case insensitive', () => {
      expect(scoreCategory('GOOGLE ADS', ICP_KEYWORDS, 20)).toBe(
        scoreCategory('google ads', ICP_KEYWORDS, 20)
      )
    })
  })

  describe('extractRedFlags', () => {
    it('returns empty for clean descriptions', () => {
      expect(extractRedFlags('We need a marketing agency for our B2B SaaS')).toEqual([])
    })

    it('detects unpaid test work', () => {
      const flags = extractRedFlags('Please do some test work for free first')
      expect(flags).toContain('Requests unpaid test work')
    })

    it('detects cheapest/lowest price', () => {
      const flags = extractRedFlags('Looking for the cheapest option available')
      expect(flags).toContain('Price-driven buyer')
    })

    it('detects no budget', () => {
      const flags = extractRedFlags('We have no budget but need help')
      expect(flags).toContain('No stated budget')
    })

    it('detects multiple red flags', () => {
      const flags = extractRedFlags('I need someone who can do everything. Looking for the cheapest option. No budget.')
      expect(flags.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('scoring integration', () => {
    it('scores a strong Volt opportunity high', () => {
      const text = `
        We're a funded SaaS startup looking for Google Ads and PPC management.
        Current ad spend is $10k/month but ROAS is terrible.
        Need someone to optimize our landing pages and conversion rate.
        Budget: $3k-5k/month. CEO is the decision maker. Need to launch ASAP.
      `
      const icp = scoreCategory(text, ICP_KEYWORDS, 20)
      expect(icp).toBeGreaterThanOrEqual(10)
    })

    it('scores a weak opportunity low', () => {
      const text = 'Need a virtual assistant for data entry. $5/hr.'
      const icp = scoreCategory(text, ICP_KEYWORDS, 20)
      expect(icp).toBe(0)
    })
  })
})
