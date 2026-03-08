"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { OnboardingState } from '@/types/onboarding'
import { TrendingUp, DollarSign } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['strategy']>) => void
}

/* Mini brand icons for the strategy view */
const MetaIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/></svg>
const GoogleIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
const GDisplayIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke="#34A853" strokeWidth="1.5"/><rect x="5" y="7" width="8" height="5" rx="1" fill="#FBBC05"/><rect x="15" y="7" width="4" height="2" rx="0.5" fill="#4285F4"/></svg>
const TikTokIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .55.04.81.11V9a6.34 6.34 0 00-.81-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.49a4.82 4.82 0 01-1-.8z" fill="#000"/></svg>
const LinkedInIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>
const EmailIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#EA4335" strokeWidth="1.5"/><path d="M2 7l10 6 10-6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/></svg>
const SEOIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><circle cx="11" cy="11" r="7" stroke="#F97316" strokeWidth="1.5"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/></svg>

const CHANNEL_DATA: {
  id: string
  label: string
  icon: React.ReactNode
  type: 'paid' | 'organic' | 'both'
  desc: string
  best_for: string
}[] = [
  { id: 'meta_ads', label: 'Meta Ads', icon: <MetaIcon />, type: 'paid', desc: 'Facebook & Instagram advertising', best_for: 'Lead gen, awareness, retargeting' },
  { id: 'google_search', label: 'Google Search', icon: <GoogleIcon />, type: 'paid', desc: 'Search intent capture', best_for: 'High-intent leads, bottom of funnel' },
  { id: 'google_display', label: 'Google Display', icon: <GDisplayIcon />, type: 'paid', desc: 'Banner & visual network', best_for: 'Awareness, retargeting at scale' },
  { id: 'tiktok', label: 'TikTok', icon: <TikTokIcon />, type: 'both', desc: 'Short-form video platform', best_for: 'Young demographics, viral reach' },
  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon />, type: 'both', desc: 'Professional network', best_for: 'B2B, professional recruiting' },
  { id: 'email', label: 'Email Drip', icon: <EmailIcon />, type: 'organic', desc: 'Automated email sequences', best_for: 'Nurturing, re-engagement, retention' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, type: 'both', desc: 'Direct messaging campaigns', best_for: 'LATAM markets, high open rates' },
  { id: 'seo', label: 'SEO / Content', icon: <SEOIcon />, type: 'organic', desc: 'Organic search optimization', best_for: 'Long-term traffic, authority building' },
]

export function StepStrategy({ state, update }: Props) {
  const [budgetSplit, setBudgetSplit] = useState<Record<string, number>>(
    state.strategy.budget_split && Object.keys(state.strategy.budget_split).length > 0
      ? state.strategy.budget_split
      : Object.fromEntries(CHANNEL_DATA.map(c => [c.id, 0]))
  )

  const [organicVsPaid, setOrganicVsPaid] = useState(state.strategy.organic_vs_paid || 30)

  // Channels that user marked as "worked" or neutral in step 3
  const activeChannelIds = new Set([
    ...state.channels.used,
    ...state.channels.worked
  ])

  // Auto-recommend based on goals + persona + channel history
  const recommended = CHANNEL_DATA.filter(c =>
    activeChannelIds.has(c.id) ||
    (state.goals.primary === 'hire' && ['linkedin', 'meta_ads'].includes(c.id)) ||
    (state.goals.primary === 'sales' && ['google_search', 'meta_ads', 'email'].includes(c.id)) ||
    (state.goals.primary === 'leads' && ['meta_ads', 'google_search', 'whatsapp'].includes(c.id)) ||
    c.id === 'email' // always recommend email
  )

  const totalBudget = Object.values(budgetSplit).reduce((s, v) => s + v, 0)

  const updateSplit = (channelId: string, pct: number) => {
    const next = { ...budgetSplit, [channelId]: pct }
    setBudgetSplit(next)
    update({ budget_split: next })
  }

  const updateOrganic = (value: number) => {
    setOrganicVsPaid(value)
    update({ organic_vs_paid: value })
  }

  return (
    <div className="space-y-8">
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
            min={0}
            max={100}
            step={5}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>More organic (slower, sustainable)</span>
            <span>More paid (faster, scalable)</span>
          </div>
        </div>
      </div>

      {/* Channel mix */}
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
            const isRecommended = recommended.some(r => r.id === channel.id)
            const pct = budgetSplit[channel.id] || 0

            return (
              <div
                key={channel.id}
                className={`rounded-xl border p-3 transition-all ${
                  pct > 0
                    ? 'border-primary/30 bg-primary/5'
                    : isRecommended
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
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {channel.type}
                      </Badge>
                      {isRecommended && pct === 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{channel.best_for}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Slider
                      value={[pct]}
                      onValueChange={([v]) => updateSplit(channel.id, v)}
                      min={0}
                      max={50}
                      step={5}
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
            <div className="text-muted-foreground text-xs mb-0.5">Active personas</div>
            <div className="font-medium">{state.personas.current.length + state.personas.ideal.length}</div>
          </div>
        </div>
      </div>

      {/* AI note */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Once launched, TorqueLoop's optimization agent will monitor performance daily and suggest
          budget reallocation across channels based on actual outcomes — not just clicks.
        </span>
      </div>
    </div>
  )
}
