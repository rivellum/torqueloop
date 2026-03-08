"use client"
import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OnboardingState } from '@/types/onboarding'
import { TrendingUp, DollarSign, Sparkles, Check, Pencil, Loader2, ChevronRight } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['strategy']>) => void
}

/* Brand icons */
const MetaIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/></svg>
const GoogleIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
const GDisplayIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke="#34A853" strokeWidth="1.5"/><rect x="5" y="7" width="8" height="5" rx="1" fill="#FBBC05"/><rect x="15" y="7" width="4" height="2" rx="0.5" fill="#4285F4"/></svg>
const TikTokIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .55.04.81.11V9a6.34 6.34 0 00-.81-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.49a4.82 4.82 0 01-1-.8z" fill="#000"/></svg>
const LinkedInIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>
const EmailIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#EA4335" strokeWidth="1.5"/><path d="M2 7l10 6 10-6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/></svg>
const SEOIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><circle cx="11" cy="11" r="7" stroke="#F97316" strokeWidth="1.5"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

const CHANNEL_DATA: {
  id: string
  label: string
  icon: React.ReactNode
  type: 'paid' | 'organic' | 'both'
  best_for: string
}[] = [
  { id: 'meta_ads',       label: 'Meta Ads',       icon: <MetaIcon />,       type: 'paid',    best_for: 'Lead gen, awareness, retargeting' },
  { id: 'google_search',  label: 'Google Search',  icon: <GoogleIcon />,     type: 'paid',    best_for: 'High-intent leads, bottom of funnel' },
  { id: 'google_display', label: 'Google Display', icon: <GDisplayIcon />,   type: 'paid',    best_for: 'Awareness, retargeting at scale' },
  { id: 'tiktok',         label: 'TikTok',         icon: <TikTokIcon />,     type: 'both',    best_for: 'Young demographics, viral reach' },
  { id: 'linkedin',       label: 'LinkedIn',       icon: <LinkedInIcon />,   type: 'both',    best_for: 'B2B, professional recruiting' },
  { id: 'email',          label: 'Email Drip',     icon: <EmailIcon />,      type: 'organic', best_for: 'Nurturing, re-engagement, retention' },
  { id: 'whatsapp',       label: 'WhatsApp',       icon: <WhatsAppIcon />,   type: 'both',    best_for: 'LATAM markets, high open rates' },
  { id: 'seo',            label: 'SEO / Content',  icon: <SEOIcon />,        type: 'organic', best_for: 'Long-term traffic, authority building' },
]

interface AiRec {
  organicPct: number
  split: Record<string, number>
  rationale: string
  channelReasons: Record<string, string>
}

/** Derive an AI recommendation from prior wizard state */
function buildRecommendation(state: OnboardingState): AiRec {
  const goal    = state.goals.primary
  const outcome = state.outcomes?.type || ''
  const worked  = new Set(state.channels.worked)
  const usedLatam = state.personas.ideal.some(p =>
    p.location?.toLowerCase().includes('mexico') ||
    p.location?.toLowerCase().includes('latam') ||
    p.location?.toLowerCase().includes('cdmx')
  )

  // Recruitment / hire
  if (outcome === 'hire' || goal === 'hire' || goal === 'recruit') {
    return {
      organicPct: 25,
      split: {
        meta_ads: worked.has('meta_ads') ? 35 : 30,
        whatsapp: usedLatam ? 25 : 15,
        tiktok:   20,
        linkedin: 15,
        email:    worked.has('email') ? 10 : 5,
        google_search: 5,
        google_display: 0,
        seo: 0,
      },
      rationale: 'Recruitment is a PUSH play — people aren\'t searching for career changes. Heavy Meta + WhatsApp gets you in front of them before they\'re looking. TikTok reaches career-switchers 25-40 at low CPM. LinkedIn adds professional credibility for higher-quality applicants.',
      channelReasons: {
        meta_ads:       'Broadest reach for career-change audiences. Lead gen forms keep friction low.',
        whatsapp:       'LATAM-first. Instant follow-up after form submission drives 3-5x show rate for interviews.',
        tiktok:         'Underpriced reach for 25-40 ambitious earners. Short-form video converts for aspirational messaging.',
        linkedin:       'Higher CPL but produces serious applicants. Worth 15% for quality filter.',
        email:          'Nurture sequence for leads who didn\'t convert in first 48h.',
        google_search:  'Low volume but captures rare "how to sell insurance" searches. Small budget, high intent.',
        google_display: 'Skipped — low intent for recruiting push campaigns.',
        seo:            'Skipped — SEO takes months; not useful for near-term recruiting sprints.',
      }
    }
  }

  // E-commerce / purchase
  if (outcome === 'purchase' || goal === 'sales' || goal === 'ecommerce') {
    return {
      organicPct: 30,
      split: {
        google_search:  30,
        meta_ads:       25,
        google_display: 15,
        tiktok:         10,
        email:          10,
        seo:            5,
        whatsapp:       5,
        linkedin:       0,
      },
      rationale: 'Purchase intent is high on Google Search — that\'s where to put the most money. Meta handles top-of-funnel awareness and retargeting. Google Display reinforces at scale. Email converts warm leads who didn\'t buy on first visit.',
      channelReasons: {
        google_search:  'Highest purchase intent. Bid on product + competitor keywords.',
        meta_ads:       'Lookalike audiences from existing buyers + retargeting cart abandoners.',
        google_display: 'Retargeting across the web. Shows your product to people who already visited.',
        tiktok:         'Discovery channel for new audiences. Works well for visual products.',
        email:          'Cart abandonment + post-purchase upsell sequences.',
        seo:            'Long-term play — product + category pages build compounding traffic.',
        whatsapp:       'Direct follow-up for high-value orders or abandoned carts (LATAM).',
        linkedin:       'Skipped — B2C purchases don\'t convert well on LinkedIn.',
      }
    }
  }

  // Booked call / B2B
  if (outcome === 'booked_call' || outcome === 'contract' || goal === 'leads') {
    return {
      organicPct: 35,
      split: {
        google_search:  25,
        meta_ads:       25,
        linkedin:       20,
        email:          15,
        tiktok:         5,
        google_display: 5,
        whatsapp:       5,
        seo:            0,
      },
      rationale: 'For booked calls and B2B deals, intent-based channels win. Google Search captures people actively looking for what you offer. LinkedIn reaches decision-makers. Meta handles retargeting and awareness. Email nurtures prospects who aren\'t ready to book yet.',
      channelReasons: {
        google_search:  'Capture prospects actively searching for your category.',
        meta_ads:       'Awareness + retargeting to warm audiences who visited your site.',
        linkedin:       'Decision-maker targeting by title, company size, industry.',
        email:          'Multi-touch nurture sequence for leads not ready to book same day.',
        tiktok:         'Thought leadership content builds trust with younger buyers.',
        google_display: 'Retargeting budget — keeps you top of mind between visits.',
        whatsapp:       'Direct outreach follow-up after lead form submission.',
        seo:            'Skipped — long timeline doesn\'t match call-booking urgency.',
      }
    }
  }

  // Default / SaaS trial / generic
  return {
    organicPct: 30,
    split: {
      meta_ads:       25,
      google_search:  20,
      email:          20,
      tiktok:         10,
      linkedin:       10,
      whatsapp:       10,
      google_display: 5,
      seo:            0,
    },
    rationale: 'Balanced split across top-performing channels based on your goal and personas. Meta and Google cover the broadest reach. Email nurtures. TikTok and LinkedIn reach specific audience segments. Adjust based on what converts best in your first 30 days.',
    channelReasons: {
      meta_ads:       'Widest reach for your audience demographics.',
      google_search:  'Captures high-intent prospects searching for your category.',
      email:          'Nurture and convert leads that need multiple touchpoints.',
      tiktok:         'Cost-effective reach for younger/aspirational demographics.',
      linkedin:       'Professional network for higher-value audiences.',
      whatsapp:       'Direct follow-up in LATAM and mobile-first markets.',
      google_display: 'Retargeting to reinforce brand with warm visitors.',
      seo:            'Organic long-term — build content while paid campaigns run.',
    }
  }
}

type Phase = 'loading' | 'recommendation' | 'editing'

export function StepStrategy({ state, update }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [rec, setRec] = useState<AiRec | null>(null)

  const [budgetSplit, setBudgetSplit] = useState<Record<string, number>>(
    state.strategy.budget_split && Object.keys(state.strategy.budget_split).length > 0
      ? state.strategy.budget_split
      : Object.fromEntries(CHANNEL_DATA.map(c => [c.id, 0]))
  )
  const [organicVsPaid, setOrganicVsPaid] = useState(state.strategy.organic_vs_paid || 30)

  // Auto-run AI recommendation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const recommendation = buildRecommendation(state)
      setRec(recommendation)
      setPhase('recommendation')
    }, 1800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const acceptRecommendation = () => {
    if (!rec) return
    setBudgetSplit(rec.split)
    setOrganicVsPaid(rec.organicPct)
    update({ budget_split: rec.split, organic_vs_paid: rec.organicPct })
    setPhase('editing')
  }

  const skipToEdit = () => {
    setPhase('editing')
  }

  const updateSplit = (channelId: string, pct: number) => {
    const next = { ...budgetSplit, [channelId]: pct }
    setBudgetSplit(next)
    update({ budget_split: next })
  }

  const updateOrganic = (value: number) => {
    setOrganicVsPaid(value)
    update({ organic_vs_paid: value })
  }

  const totalBudget = Object.values(budgetSplit).reduce((s, v) => s + v, 0)

  /* ── LOADING PHASE ── */
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-sm">AI is building your strategy...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Analyzing your goals, personas, and channel history
          </p>
        </div>
      </div>
    )
  }

  /* ── RECOMMENDATION PHASE ── */
  if (phase === 'recommendation' && rec) {
    const paidPct = 100 - rec.organicPct
    const topChannels = CHANNEL_DATA
      .filter(c => (rec.split[c.id] || 0) > 0)
      .sort((a, b) => (rec.split[b.id] || 0) - (rec.split[a.id] || 0))

    return (
      <div className="space-y-6">
        {/* AI badge */}
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Sparkles className="w-4 h-4" />
          AI Recommendation — based on your goals, personas &amp; channels
        </div>

        {/* Organic vs Paid recommendation */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Organic vs. Paid split</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
                style={{ width: '100%' }}
              >
                <div
                  className="h-full bg-blue-500 float-right transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span><span className="font-semibold text-emerald-600">{rec.organicPct}% Organic</span> — sustainable long-term</span>
            <span><span className="font-semibold text-blue-600">{paidPct}% Paid</span> — faster results now</span>
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <span className="font-semibold text-sm block">Recommended channel mix</span>
          {topChannels.map(ch => {
            const pct = rec.split[ch.id] || 0
            const reason = rec.channelReasons[ch.id] || ''
            return (
              <div key={ch.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center shrink-0 mt-0.5">
                  {ch.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ch.label}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{ch.type}</Badge>
                    <span className="text-sm font-bold text-primary ml-auto">{pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* AI rationale */}
        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{rec.rationale}</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <Button onClick={acceptRecommendation} className="flex-1 gap-2">
            <Check className="w-4 h-4" />
            Accept this strategy
          </Button>
          <Button variant="outline" onClick={skipToEdit} className="flex-1 gap-2">
            <Pencil className="w-4 h-4" />
            Customize it
          </Button>
        </div>
      </div>
    )
  }

  /* ── EDITING PHASE ── */
  return (
    <div className="space-y-8">
      {/* Back to recommendation */}
      {rec && (
        <button
          onClick={() => setPhase('recommendation')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          View AI recommendation
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* Organic vs Paid slider */}
      <div>
        <Label className="text-base font-semibold mb-2 block">Organic vs. Paid split</Label>
        <p className="text-sm text-muted-foreground mb-4">
          How should your budget be distributed between organic content and paid advertising?
        </p>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">Organic {organicVsPaid}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Paid {100 - organicVsPaid}%</span>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
          </div>
          <Slider
            value={[organicVsPaid]}
            onValueChange={([v]) => updateOrganic(v)}
            min={0} max={100} step={5}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>More organic (slower, sustainable)</span>
            <span>More paid (faster, scalable)</span>
          </div>
        </div>
      </div>

      {/* Channel budget allocation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Channel budget allocation</Label>
          <Badge variant={totalBudget === 100 ? 'default' : 'outline'} className="text-xs">
            {totalBudget}% / 100% allocated
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Distribute your paid budget across channels. AI will optimize these weights based on performance.
        </p>

        <div className="space-y-2">
          {CHANNEL_DATA.map(channel => {
            const pct = budgetSplit[channel.id] || 0
            const isAiPicked = rec && (rec.split[channel.id] || 0) > 0

            return (
              <div
                key={channel.id}
                className={`rounded-xl border p-3 transition-all ${
                  pct > 0
                    ? 'border-primary/30 bg-primary/5'
                    : isAiPicked
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    pct > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {channel.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{channel.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{channel.type}</Badge>
                      {isAiPicked && pct === 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
                          AI suggested
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{channel.best_for}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Slider
                      value={[pct]}
                      onValueChange={([v]) => updateSplit(channel.id, v)}
                      min={0} max={50} step={5}
                      className="w-24"
                    />
                    <span className="text-sm font-mono w-10 text-right">{pct}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {totalBudget !== 100 && totalBudget > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Budget allocation should total 100%. Currently at {totalBudget}%.
          </p>
        )}
      </div>

      {/* Budget context */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Budget context</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Monthly range</div>
            <div className="font-medium">{state.goals.budget_range || 'Not set'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Primary goal</div>
            <div className="font-medium capitalize">{state.goals.primary || 'Not set'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Timeline</div>
            <div className="font-medium">{state.goals.timeline || 'Not set'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Outcome target</div>
            <div className="font-medium capitalize">{state.outcomes?.type || 'Not set'}</div>
          </div>
        </div>
      </div>

      {/* AI note */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Once launched, TorqueLoop's optimization agent will monitor performance daily and suggest
          budget reallocation based on actual outcomes — not just clicks.
        </span>
      </div>
    </div>
  )
}
