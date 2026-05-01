// POST /api/proposals/score — score an opportunity without saving it
// Deterministic scoring engine — no AI calls, pure rules
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const scoreRequestSchema = z.object({
  title: z.string().min(1),
  company_name: z.string().optional().nullable(),
  description: z.string().min(1),
  budget_min: z.number().nullable().optional(),
  budget_max: z.number().nullable().optional(),
  source: z.string().optional().nullable(),
})

// ─── Scoring rules ──────────────────────────────────────────────────────────

// Volt's strongest service signals
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

const PROBLEM_KEYWORDS = [
  'increase roas', 'reduce cpl', 'cost per lead', 'scale', 'scaling',
  'optimize campaigns', 'underperforming', 'wasting ad spend',
  'need more leads', 'low conversion', 'conversion optimization',
  'traffic', 'organic growth', 'search ranking',
  'brand awareness', 'market positioning',
  'launch', 'new product', 'go-to-market', 'gtm',
]

const URGENCY_SIGNALS = [
  'asap', 'urgent', 'immediately', 'this week', 'this month',
  'deadline', 'launch date', 'q1', 'q2', 'q3', 'q4',
  'hiring', 'need to launch', 'time-sensitive',
]

const AUTHORITY_SIGNALS = [
  'ceo', 'founder', 'cmo', 'vp marketing', 'head of marketing',
  'marketing director', 'decision maker', 'budget approved',
  'funded', 'series a', 'series b', 'venture backed',
  '$', 'k/month', 'monthly budget',
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
  // Diminishing returns: each match is worth less
  const ratio = Math.min(matches / 5, 1)
  return Math.round(ratio * maxPoints)
}

function extractRedFlags(text: string): string[] {
  const flags: string[] = []
  for (const { pattern, flag } of RED_FLAG_SIGNALS) {
    if (pattern.test(text)) flags.push(flag)
  }

  // Budget-based red flags
  const budgetFloor = 1500 // Volt's rough minimum
  // Check for very low budget signals in text
  const lowBudgetMatch = text.match(/\$([0-9,]+)\s*\/?\s*(month|mo|project)/i)
  if (lowBudgetMatch) {
    const amount = parseInt(lowBudgetMatch[1].replace(/,/g, ''))
    if (amount < budgetFloor) {
      flags.push(`Stated budget ($${amount}) below Volt's floor`)
    }
  }

  return flags
}

function buildRecommendation(total: number, redFlags: string[]): string {
  if (redFlags.length >= 3) return 'Too many red flags — skip unless strategic'
  if (total >= 80) return 'Strong fit — bid now. Strategy lock + send gate required.'
  if (total >= 65) return 'Worth reviewing. One human check before drafting.'
  if (total >= 45) return 'Consider only if pipeline is light or strategic value is high.'
  return 'Skip or nurture. Not worth human time right now.'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = scoreRequestSchema.parse(body)

    const fullText = `${parsed.title} ${parsed.company_name ?? ''} ${parsed.description}`

    // Score each category
    const icp_fit = scoreCategory(fullText, ICP_KEYWORDS, 20)
    const problem_fit = scoreCategory(fullText, PROBLEM_KEYWORDS, 20)

    // Budget fit: check explicit budget ranges
    let budget_fit = 0
    if (parsed.budget_max && parsed.budget_max >= 3000) budget_fit = 15
    else if (parsed.budget_max && parsed.budget_max >= 1500) budget_fit = 10
    else if (parsed.budget_max && parsed.budget_max >= 500) budget_fit = 5
    else if (!parsed.budget_max) budget_fit = 7 // unknown = neutral

    // Proof match: if description mentions something we have proof for
    const proof_match = scoreCategory(fullText, [
      'roas', 'return on ad', 'cost per lead', 'cpl',
      'organic traffic', 'search ranking', 'seo',
      'brand', 'funding', 'users', 'growth',
    ], 15)

    const urgency = scoreCategory(fullText, URGENCY_SIGNALS, 10)
    const authority_signal = scoreCategory(fullText, AUTHORITY_SIGNALS, 10)
    const competition_edge = scoreCategory(fullText, [
      'unique', 'differentiat', 'innovative', 'no one else',
      'specialized', 'expert', 'proven', 'case study',
    ], 10)

    const red_flags = extractRedFlags(fullText)

    // Red flag penalty
    const flagPenalty = red_flags.length * 5

    const rawTotal = icp_fit + problem_fit + budget_fit + proof_match + urgency + authority_signal + competition_edge
    const total_score = Math.max(0, Math.min(100, rawTotal - flagPenalty))

    let band: string
    if (total_score >= 80) band = 'bid_now'
    else if (total_score >= 65) band = 'review'
    else if (total_score >= 45) band = 'consider'
    else band = 'skip'

    const recommendation = buildRecommendation(total_score, red_flags)

    return NextResponse.json({
      total_score,
      icp_fit,
      problem_fit,
      budget_fit,
      proof_match,
      urgency,
      authority_signal,
      competition_edge,
      red_flags,
      recommendation,
      band,
      model_version: 'deterministic-v1',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
