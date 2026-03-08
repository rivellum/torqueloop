"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { OnboardingState } from '@/types/onboarding'
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['channels']>) => void
}

/* Inline SVG brand logos — small, clean, recognizable */
const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
  </svg>
)

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GoogleDisplayLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="14" rx="2" fill="#34A853" opacity="0.15"/>
    <rect x="2" y="4" width="20" height="14" rx="2" stroke="#34A853" strokeWidth="1.5" fill="none"/>
    <rect x="5" y="7" width="8" height="5" rx="1" fill="#FBBC05"/>
    <rect x="15" y="7" width="4" height="2" rx="0.5" fill="#4285F4"/>
    <rect x="15" y="10.5" width="4" height="1.5" rx="0.5" fill="#EA4335"/>
    <line x1="8" y1="20" x2="16" y2="20" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .55.04.81.11V9a6.34 6.34 0 00-.81-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.49a4.82 4.82 0 01-1-.8z" fill="#000"/>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .55.04.81.11V9a6.34 6.34 0 00-.81-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.49a4.82 4.82 0 01-1-.8z" fill="url(#tiktok-grad)"/>
    <defs>
      <linearGradient id="tiktok-grad" x1="3" y1="2" x2="21" y2="22">
        <stop offset="0%" stopColor="#69C9D0"/>
        <stop offset="50%" stopColor="#000"/>
        <stop offset="100%" stopColor="#EE1D52"/>
      </linearGradient>
    </defs>
  </svg>
)

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
  </svg>
)

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFF"/>
  </svg>
)

const EmailLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="3" fill="#EA4335" opacity="0.12"/>
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#EA4335" strokeWidth="1.5"/>
    <path d="M2 7l10 6 10-6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
  </svg>
)

const SEOLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <circle cx="11" cy="11" r="7" stroke="#F97316" strokeWidth="1.5"/>
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 11h6M11 8v6" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const ReferralLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <circle cx="8" cy="8" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="16" cy="8" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="12" cy="16" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
    <path d="M10.5 9.5l-1 4M13.5 9.5l1 4" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

const EventsLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#EC4899" strokeWidth="1.5"/>
    <path d="M3 10h18" stroke="#EC4899" strokeWidth="1.5"/>
    <path d="M8 2v4M16 2v4" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="2" fill="#EC4899" opacity="0.3" stroke="#EC4899" strokeWidth="1"/>
  </svg>
)

const PodcastLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M12 1a5 5 0 00-5 5v4a5 5 0 0010 0V6a5 5 0 00-5-5z" stroke="#7C3AED" strokeWidth="1.5"/>
    <path d="M19 10v1a7 7 0 01-14 0v-1" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="23" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="23" x2="16" y2="23" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const CHANNELS: { id: string; name: string; sub: string; logo: () => JSX.Element }[] = [
  { id: 'meta_ads', name: 'Meta Ads', sub: 'Facebook + Instagram', logo: MetaLogo },
  { id: 'google_search', name: 'Google Search', sub: 'Search ads + PPC', logo: GoogleLogo },
  { id: 'google_display', name: 'Google Display', sub: 'Banner / remarketing', logo: GoogleDisplayLogo },
  { id: 'tiktok', name: 'TikTok', sub: 'Organic + paid', logo: TikTokLogo },
  { id: 'linkedin', name: 'LinkedIn', sub: 'Organic + sponsored', logo: LinkedInLogo },
  { id: 'youtube', name: 'YouTube', sub: 'Video ads + organic', logo: YouTubeLogo },
  { id: 'email', name: 'Email Marketing', sub: 'Newsletters + drip', logo: EmailLogo },
  { id: 'whatsapp', name: 'WhatsApp', sub: 'Direct messaging', logo: WhatsAppLogo },
  { id: 'seo', name: 'SEO / Content', sub: 'Blog + organic search', logo: SEOLogo },
  { id: 'referral', name: 'Referral / Word of mouth', sub: 'Organic growth', logo: ReferralLogo },
  { id: 'events', name: 'Events / Webinars', sub: 'Live + virtual', logo: EventsLogo },
  { id: 'podcast', name: 'Podcast / Audio', sub: 'Sponsorships + owned', logo: PodcastLogo },
]

type ChannelStatus = 'worked' | 'failed' | 'neutral'

export function StepChannels({ state, update }: Props) {
  const [statuses, setStatuses] = useState<Record<string, ChannelStatus>>(() => {
    const s: Record<string, ChannelStatus> = {}
    state.channels.worked.forEach(c => s[c] = 'worked')
    state.channels.failed.forEach(c => s[c] = 'failed')
    state.channels.used.filter(c => !state.channels.worked.includes(c) && !state.channels.failed.includes(c))
      .forEach(c => s[c] = 'neutral')
    return s
  })

  const toggleChannel = (id: string, status: ChannelStatus) => {
    const current = statuses[id]
    const next = { ...statuses }

    if (current === status) {
      delete next[id]
    } else {
      next[id] = status
    }

    setStatuses(next)
    update({
      used: Object.keys(next),
      worked: Object.entries(next).filter(([, s]) => s === 'worked').map(([k]) => k),
      failed: Object.entries(next).filter(([, s]) => s === 'failed').map(([k]) => k),
    })
  }

  const usedCount = Object.keys(statuses).length
  const workedCount = Object.values(statuses).filter(s => s === 'worked').length
  const failedCount = Object.values(statuses).filter(s => s === 'failed').length

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base font-semibold mb-1 block">
          Rate your experience with each marketing channel
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Click a rating for every channel you've tried. Skip channels you haven't used — we'll know to test them fresh.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
              <ThumbsUp className="w-3 h-3 text-green-700" />
            </div>
            <span className="text-muted-foreground">Worked well</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-yellow-100 flex items-center justify-center">
              <Minus className="w-3 h-3 text-yellow-700" />
            </div>
            <span className="text-muted-foreground">Meh / mixed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center">
              <ThumbsDown className="w-3 h-3 text-red-700" />
            </div>
            <span className="text-muted-foreground">Didn't work</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {CHANNELS.map(ch => {
            const status = statuses[ch.id]
            const isUsed = status !== undefined
            const Logo = ch.logo

            return (
              <div
                key={ch.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isUsed ? 'border-primary/20 bg-card shadow-sm' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center shrink-0 shadow-sm">
                  <Logo />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{ch.name}</div>
                  <div className="text-xs text-muted-foreground">{ch.sub}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleChannel(ch.id, 'worked')}
                    className={`p-2 rounded-lg transition-all ${
                      status === 'worked'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-300'
                        : 'text-muted-foreground/50 hover:bg-green-50 hover:text-green-600'
                    }`}
                    title="Worked well"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleChannel(ch.id, 'neutral')}
                    className={`p-2 rounded-lg transition-all ${
                      status === 'neutral'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-300'
                        : 'text-muted-foreground/50 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                    title="Mixed results"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleChannel(ch.id, 'failed')}
                    className={`p-2 rounded-lg transition-all ${
                      status === 'failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-300'
                        : 'text-muted-foreground/50 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title="Didn't work"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {usedCount > 0 && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <Badge variant="secondary">{usedCount} rated</Badge>
            {workedCount > 0 && <span className="text-green-600 font-medium">{workedCount} worked</span>}
            {failedCount > 0 && <span className="text-red-500 font-medium">{failedCount} failed</span>}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="channelNotes" className="text-sm font-medium mb-2 block">
          Anything else about your marketing history?
        </Label>
        <Textarea
          id="channelNotes"
          placeholder="E.g., 'Meta ads worked great for awareness but leads were low quality' or 'We've never done paid marketing before'"
          value={state.channels.notes}
          onChange={(e) => update({ notes: e.target.value })}
          className="min-h-[80px] resize-none"
        />
      </div>
    </div>
  )
}
