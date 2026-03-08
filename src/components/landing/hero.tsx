"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Target, BarChart3, Brain, ChevronRight, X, Play } from 'lucide-react'

interface LandingHeroProps {
  onGetStarted: () => void
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">TorqueLoop</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onGetStarted}>Sign in</Button>
      </nav>

      <section className="px-6 pt-20 pb-32 max-w-4xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Brain className="w-3.5 h-3.5" />
          AI-powered growth engine
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Marketing that optimizes<br />for <span className="text-primary">real business outcomes</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          TorqueLoop closes the loop between ad spend and actual results — hires made, deals closed, revenue earned. Not just clicks. Tell us your goals, and our AI builds, publishes, and optimizes your entire marketing operation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={onGetStarted}>
            Start your strategy <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 h-12 gap-2" onClick={() => setShowDemo(true)}>
            See how it works <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />3 active workspaces</span>
          <span className="hidden sm:block w-px h-4 bg-border" />
          <span className="hidden sm:flex items-center gap-1.5">Outcome-based optimization</span>
          <span className="hidden md:block w-px h-4 bg-border" />
          <span className="hidden md:flex items-center gap-1.5">Multi-channel publishing</span>
        </div>
      </section>

      {showDemo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setShowDemo(false)}>
          <div className="bg-card rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted" aria-label="Close demo"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-4">How TorqueLoop works</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3"><span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span><div><span className="font-medium text-foreground">Tell us your goals.</span> What outcome matters: hires, sales, signups? Set your budget and timeline.</div></div>
              <div className="flex gap-3"><span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span><div><span className="font-medium text-foreground">AI builds your strategy.</span> We analyze your personas, channels, and messaging to create an optimized campaign plan.</div></div>
              <div className="flex gap-3"><span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span><div><span className="font-medium text-foreground">We publish and optimize.</span> Creatives go live across Meta, Google, TikTok, and more. AI monitors and adjusts daily.</div></div>
              <div className="flex gap-3"><span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">4</span><div><span className="font-medium text-foreground">Close the loop.</span> Every dollar is tracked from ad impression to final business result. See your real ROAS.</div></div>
            </div>
            <Button className="w-full mt-6 gap-2" onClick={() => { setShowDemo(false); onGetStarted() }}><Play className="w-4 h-4" />Start your free strategy session</Button>
          </div>
        </div>
      )}

      <section className="px-6 pb-32 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Target className="w-5 h-5" />, title: 'Goal-first strategy', desc: 'Define what success means to you — hires, sales, signups, revenue — and we optimize for exactly that.' },
            { icon: <Brain className="w-5 h-5" />, title: 'AI creative engine', desc: 'Generate ad copy, images, video briefs, and landing pages tuned to your brand voice and emotional triggers.' },
            { icon: <BarChart3 className="w-5 h-5" />, title: 'Closed-loop attribution', desc: 'Track every dollar from ad impression through lead to final business outcome. No more guessing what works.' },
            { icon: <Zap className="w-5 h-5" />, title: 'Multi-channel publish', desc: 'Push to Meta, Google, TikTok, LinkedIn, WhatsApp, and email from one dashboard with approval workflows.' },
            { icon: <ArrowRight className="w-5 h-5" />, title: 'PUSH + PULL modes', desc: "Outbound campaigns for audiences who don't know they want you yet. Inbound capture for those who do." },
            { icon: <Target className="w-5 h-5" />, title: 'Daily optimization', desc: 'AI agent analyzes performance every day and recommends budget shifts, creative swaps, and audience adjustments.' }
          ].map((f) => (
            <div key={f.title} className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl bg-primary text-primary-foreground">
          <h2 className="text-2xl font-bold mb-3">Ready to close the loop?</h2>
          <p className="text-primary-foreground/80 mb-6">Our AI strategist will guide you through building a complete marketing operation in under 30 minutes. No credit card required.</p>
          <Button size="lg" variant="secondary" className="text-base px-8 h-12 gap-2" onClick={onGetStarted}>Start your free strategy session <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </section>

      <footer className="px-6 py-8 border-t text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center"><Zap className="w-3 h-3 text-primary-foreground" /></div>
          <span className="font-semibold text-foreground">TorqueLoop</span>
        </div>
        <p>Agentic closed-loop marketing. Built by Rivellum.</p>
      </footer>
    </div>
  )
}
