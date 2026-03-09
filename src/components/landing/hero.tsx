"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Zap, Target, BarChart3, Brain, ChevronRight, X, Play,
  CheckCircle2, ChevronDown, Star, Shield, Clock, Users, TrendingUp,
  Layers, Megaphone, MousePointer, DollarSign, RefreshCw, Sparkles,
  Quote, ArrowUpRight,
} from 'lucide-react'

interface LandingHeroProps {
  onGetStarted: () => void
}

// ── Intersection Observer hook for scroll animations ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, inView } = useInView()
  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </section>
  )
}

// ── Data ──
const PAIN_POINTS = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Weeks of setup, months to see results',
    desc: "Traditional agencies take 4–6 weeks to launch a campaign. By then, your budget's burned and you're still waiting for data.",
  },
  {
    icon: <MousePointer className="w-5 h-5" />,
    title: 'You optimize for clicks, not outcomes',
    desc: "CTR looks great on a dashboard. But clicks don't hire employees, close deals, or put revenue in your bank account.",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Disconnected tools, no single source of truth',
    desc: "Google Ads says one thing, Meta says another, your CRM says a third. Nobody knows what's actually working.",
  },
]

const APPROACH_STEPS = [
  { num: '01', title: 'Define your outcome', desc: 'Tell us what matters: hires, sales, signups, bookings. We optimize for the metric that grows your business.', icon: <Target className="w-5 h-5" /> },
  { num: '02', title: 'AI builds your strategy', desc: 'Our engine analyzes your personas, channels, and emotional triggers to craft a full campaign plan in minutes.', icon: <Brain className="w-5 h-5" /> },
  { num: '03', title: 'Generate & publish creatives', desc: 'Display ads, avatar videos, voiceovers, and copy — generated and published across Meta, Google, TikTok, LinkedIn, and more.', icon: <Sparkles className="w-5 h-5" /> },
  { num: '04', title: 'Close the loop', desc: 'Every dollar tracked from impression → click → lead → outcome. AI optimizes daily. You see real ROAS, not vanity metrics.', icon: <RefreshCw className="w-5 h-5" /> },
]

const FEATURES = [
  { icon: <Target className="w-5 h-5" />, title: 'Goal-first strategy', desc: 'Define what success means — hires, sales, signups, revenue — and we optimize for exactly that.' },
  { icon: <Brain className="w-5 h-5" />, title: 'AI creative engine', desc: 'Generate ads, videos, jingles, and landing pages tuned to your brand voice and emotional triggers.' },
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Closed-loop attribution', desc: 'Track every dollar from ad impression through lead to final business outcome. No guessing.' },
  { icon: <Megaphone className="w-5 h-5" />, title: 'Multi-channel publishing', desc: 'Push to Meta, Google, TikTok, LinkedIn, WhatsApp, Spotify, and email from one dashboard.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'PUSH + PULL modes', desc: "Outbound campaigns for audiences who don't know you yet. Inbound capture for those who do." },
  { icon: <RefreshCw className="w-5 h-5" />, title: 'Daily AI optimization', desc: 'Our agent analyzes performance daily and recommends budget shifts, creative swaps, and audience tweaks.' },
]

const COMPARISON = [
  { dimension: 'Campaign setup', traditional: '4–6 weeks', torqueloop: 'Under 30 minutes' },
  { dimension: 'Optimization target', traditional: 'Clicks & impressions', torqueloop: 'Real business outcomes' },
  { dimension: 'Creative generation', traditional: 'Manual design rounds', torqueloop: 'AI-generated in seconds' },
  { dimension: 'Attribution', traditional: 'Last-click, siloed', torqueloop: 'Full-funnel, cross-channel' },
  { dimension: 'Reporting cadence', traditional: 'Monthly PDF decks', torqueloop: 'Real-time dashboard' },
  { dimension: 'Channel coverage', traditional: '1–2 platforms', torqueloop: '7+ channels unified' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Head of Growth, SaaS Startup', quote: "We went from spending $12K/mo with no idea what worked to knowing exactly which channel drives each signup. ROAS went from 1.2x to 4.8x in 6 weeks.", rating: 5 },
  { name: 'Carlos R.', role: 'CEO, Staffing Agency', quote: "TorqueLoop cut our cost-per-hire by 62%. The closed-loop tracking showed us our LinkedIn ads were 3x more effective than Meta for senior roles.", rating: 5 },
  { name: 'Priya K.', role: 'Marketing Director, E-commerce', quote: "The AI creative engine saved our team 40 hours per week. We're publishing more content across more channels than ever, all optimized automatically.", rating: 5 },
]

const FAQS = [
  { q: 'How quickly can I launch my first campaign?', a: 'Most users go from sign-up to live campaigns in under 30 minutes. Our AI strategy wizard guides you through goal setting, persona definition, and channel selection — then generates and publishes creatives automatically.' },
  { q: 'What channels does TorqueLoop support?', a: 'We support Meta Ads (Facebook & Instagram), Google Ads (Search & Display), TikTok, LinkedIn, YouTube, WhatsApp, Spotify Ads, Email (via Resend), and SEO content. More channels are added regularly.' },
  { q: 'What does "closed-loop" mean?', a: "It means we track the complete journey from ad impression → click → lead → final business outcome (hire, sale, booking, etc.). Traditional tools stop at the click. We connect the dots all the way to revenue, so you know your true ROAS." },
  { q: 'Do I need to connect my CRM?', a: 'We integrate with GoHighLevel, HubSpot, Zoho Bigin, and custom Supabase setups. CRM connection unlocks full closed-loop attribution. Without it, you can still run campaigns and track conversions.' },
  { q: 'How does AI creative generation work?', a: 'Our Creative Engine uses best-in-class AI providers: Nano Banana 2 for images, Sora 2 for video, HeyGen for avatar videos, ElevenLabs for voiceovers, and Creatomate for template-based video. Assets are generated based on your campaign context and published directly.' },
  { q: 'Is there a free tier?', a: 'Yes — your first strategy session is completely free. You can generate a full campaign brief, creative previews, and channel strategy without entering a credit card.' },
]

const TRUST_BADGES = [
  { icon: <Shield className="w-5 h-5" />, title: 'SOC 2 Compliant', desc: 'Enterprise-grade security' },
  { icon: <Zap className="w-5 h-5" />, title: 'Built on Vercel', desc: 'Edge-optimized, global CDN' },
  { icon: <Users className="w-5 h-5" />, title: 'Multi-tenant', desc: 'Team workspaces with RBAC' },
  { icon: <DollarSign className="w-5 h-5" />, title: 'Transparent pricing', desc: 'No hidden fees or markups' },
]

// ── Component ──
export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const [showDemo, setShowDemo] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">TorqueLoop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#compare" className="hover:text-foreground transition-colors">Compare</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            <Button size="sm" className="gap-1.5" onClick={onGetStarted}>
              Start Free <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-28 sm:pt-36 pb-24 sm:pb-32 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-7 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
          <Brain className="w-3.5 h-3.5" />
          Agentic closed-loop marketing
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-7 animate-fade-in">
          Marketing that optimizes<br />
          for{' '}
          <span className="relative">
            <span className="text-primary">real business outcomes</span>
            <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8.5C50 3 100 2 150 5S250 11 298 4" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
            </svg>
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Set your goals — hires, sales, revenue. Our AI builds, publishes, and optimizes
          your entire marketing operation across every channel. Track every dollar to its outcome.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
          <Button size="lg" className="text-base px-8 h-12 gap-2 shadow-lg shadow-primary/25" onClick={onGetStarted}>
            Start your strategy <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 h-12 gap-2" onClick={() => setShowDemo(true)}>
            See how it works <Play className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero metrics */}
        <div className="mt-16 grid grid-cols-3 max-w-lg mx-auto gap-6 animate-fade-in">
          {[
            { value: '30 min', label: 'Setup to live' },
            { value: '7+', label: 'Channels' },
            { value: '4.2x', label: 'Avg ROAS' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{m.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Phone Mockup / Dashboard Preview ── */}
      <Section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="relative rounded-2xl border bg-card shadow-2xl shadow-black/5 overflow-hidden p-1">
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-10">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-green-600 mt-1">↑ 3 this week</div>
              </div>
              <div className="rounded-xl bg-white border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Cost per Outcome</div>
                <div className="text-2xl font-bold">$24.50</div>
                <div className="text-xs text-green-600 mt-1">↓ 18% vs last month</div>
              </div>
              <div className="rounded-xl bg-white border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Real ROAS</div>
                <div className="text-2xl font-bold text-primary">4.2x</div>
                <div className="text-xs text-green-600 mt-1">↑ from 2.8x baseline</div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 overflow-hidden">
              {['Meta Ads', 'Google Search', 'LinkedIn', 'TikTok', 'YouTube'].map(ch => (
                <div key={ch} className="shrink-0 rounded-lg bg-white border px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {ch}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Problem Section ── */}
      <Section className="px-6 pb-28 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Marketing is broken for growing businesses</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {PAIN_POINTS.map(p => (
            <div key={p.title} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">{p.icon}</div>
              <h3 className="font-semibold mb-2 text-base">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section className="px-6 pb-28 max-w-5xl mx-auto" id="how-it-works">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From goals to results in four steps</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {APPROACH_STEPS.map((s) => (
            <div key={s.num} className="group rounded-2xl border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-primary/60 mb-1">STEP {s.num}</div>
                  <h3 className="font-semibold text-base mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Features Grid ── */}
      <Section className="px-6 pb-28 max-w-5xl mx-auto" id="features">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Platform Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to grow</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{f.icon}</div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Comparison Table ── */}
      <Section className="px-6 pb-28 max-w-4xl mx-auto" id="compare">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Compare</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">TorqueLoop vs. traditional marketing</h2>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 bg-muted/50 text-sm font-semibold px-6 py-3 border-b">
            <span className="text-muted-foreground">Dimension</span>
            <span className="text-muted-foreground text-center">Traditional</span>
            <span className="text-primary text-center">TorqueLoop</span>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.dimension} className={`grid grid-cols-3 px-6 py-3.5 text-sm ${i < COMPARISON.length - 1 ? 'border-b' : ''}`}>
              <span className="font-medium">{row.dimension}</span>
              <span className="text-muted-foreground text-center">{row.traditional}</span>
              <span className="text-primary font-medium text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {row.torqueloop}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section className="px-6 pb-28 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Trusted by growth teams</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={`star-${t.name}-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="w-5 h-5 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.quote}</p>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Trust Badges ── */}
      <Section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRUST_BADGES.map(b => (
            <div key={b.title} className="text-center rounded-xl border bg-card px-4 py-5 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5">{b.icon}</div>
              <div className="text-sm font-semibold">{b.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FAQ Accordion ── */}
      <Section className="px-6 pb-28 max-w-3xl mx-auto" id="faq">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Common Questions</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={`faq-${i}`} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <Section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center p-10 sm:p-14 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to close the loop?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Build a complete marketing strategy in under 30 minutes. Our AI wizard guides you from goals to live campaigns. No credit card required.
            </p>
            <Button size="lg" variant="secondary" className="text-base px-8 h-12 gap-2 shadow-lg" onClick={onGetStarted}>
              Start your free strategy session <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Persistent CTA (mobile) ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-all duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-background/90 backdrop-blur-lg border-t px-4 py-3">
          <Button className="w-full gap-2" onClick={onGetStarted}>
            Start your strategy <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-base">TorqueLoop</span>
              </div>
              <p className="text-sm text-muted-foreground">Agentic closed-loop marketing. Built by Rivellum.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Rivellum LLC. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Demo Modal ── */}
      {showDemo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowDemo(false)}>
          <div className="bg-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close demo"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-6">How TorqueLoop works</h3>
            <div className="space-y-5 text-sm text-muted-foreground">
              {APPROACH_STEPS.map(s => (
                <div key={s.num} className="flex gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{s.num}</span>
                  <div>
                    <span className="font-medium text-foreground">{s.title}.</span> {s.desc}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8 gap-2" onClick={() => { setShowDemo(false); onGetStarted() }}>
              <Play className="w-4 h-4" /> Start your free strategy session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
