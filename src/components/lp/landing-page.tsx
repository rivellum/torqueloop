'use client'

import { useState, useEffect, type FormEvent } from 'react'
import {
  DollarSign,
  GraduationCap,
  Users,
  Smartphone,
  MapPin,
  Repeat,
  Rocket,
  Shield,
  Clock,
  Target,
  Zap,
  Star,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  Send,
} from 'lucide-react'
import type {
  LandingPageConfig,
  LPSectionHero,
  LPSectionValueProps,
  LPSectionStats,
  LPSectionTestimonials,
  LPSectionCTA,
  LPSectionBenefitsList,
  LPSectionFormEmbed,
  LPValuePropCard,
  LPTestimonial,
  LPStat,
  LPForm,
  LPFormField,
  LPWhatsAppCTA,
  LPBranding,
  LPFooter,
} from '@/types/landing-page'

// ─── Icon Map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  GraduationCap,
  Users,
  Smartphone,
  MapPin,
  Repeat,
  Rocket,
  Shield,
  Clock,
  Target,
  Zap,
  Star,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Send,
}

function getIcon(name: string) {
  return ICON_MAP[name] ?? Zap
}

// ─── Main Component ────────────────────────────────────────────────────────

interface LandingPageProps {
  config: LandingPageConfig
}

export function LandingPage({ config }: LandingPageProps) {
  const { branding, sections, form, whatsappCTA, footer } = config

  const cssVars = brandingToCssVars(branding)

  return (
    <div style={cssVars} className="lp-root">
      <style>{`
        .lp-root {
          --lp-primary: ${branding.colors.primary};
          --lp-primary-fg: ${branding.colors.primaryForeground};
          --lp-secondary: ${branding.colors.secondary};
          --lp-secondary-fg: ${branding.colors.secondaryForeground};
          --lp-accent: ${branding.colors.accent};
          --lp-accent-fg: ${branding.colors.accentForeground};
          --lp-bg: ${branding.colors.background};
          --lp-fg: ${branding.colors.foreground};
          --lp-muted: ${branding.colors.muted};
          --lp-muted-fg: ${branding.colors.mutedForeground};
          --lp-card-bg: ${branding.colors.cardBackground};
          --lp-radius: ${branding.borderRadius ?? 12}px;
          --lp-font-heading: ${branding.fonts?.heading ?? 'DM Sans'}, system-ui, sans-serif;
          --lp-font-body: ${branding.fonts?.body ?? 'DM Sans'}, system-ui, sans-serif;

          font-family: var(--lp-font-body);
          color: var(--lp-fg);
          background-color: var(--lp-bg);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        .lp-root * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--lp-font-heading)',
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--lp-primary)',
          }}
        >
          {branding.logoText ?? ''}
        </span>
        {whatsappCTA && (
          <a
            href={buildWhatsAppUrl(whatsappCTA)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--lp-radius)',
              backgroundColor: '#25D366',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} />
            WhatsApp
          </a>
        )}
      </nav>

      {/* Sections */}
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                section={section}
                branding={branding}
                hasWhatsApp={!!whatsappCTA}
                whatsappCTA={whatsappCTA}
              />
            )
          case 'stats':
            return <StatsSection key={section.id} section={section} branding={branding} />
          case 'value-props':
            return <ValuePropsSection key={section.id} section={section} branding={branding} />
          case 'testimonials':
            return <TestimonialsSection key={section.id} section={section} branding={branding} />
          case 'benefits-list':
            return <BenefitsListSection key={section.id} section={section} branding={branding} />
          case 'form-embed':
            return form ? (
              <FormSection key={section.id} section={section} form={form} branding={branding} config={config} />
            ) : null
          case 'cta':
            return (
              <CTASection
                key={section.id}
                section={section}
                branding={branding}
                whatsappCTA={whatsappCTA}
              />
            )
          default:
            return null
        }
      })}

      {/* Footer */}
      <FooterBlock footer={footer} branding={branding} />

      {/* Floating WhatsApp button (mobile) */}
      {whatsappCTA?.floatingButton && (
        <a
          href={buildWhatsAppUrl(whatsappCTA)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            zIndex: 1000,
          }}
          aria-label="WhatsApp"
        >
          <MessageCircle style={{ width: 28, height: 28, color: '#fff' }} />
        </a>
      )}
    </div>
  )
}

// ─── Section Components ────────────────────────────────────────────────────

function HeroSection({
  section,
  branding,
  hasWhatsApp,
  whatsappCTA,
}: {
  section: LPSectionHero
  branding: LPBranding
  hasWhatsApp: boolean
  whatsappCTA?: LPWhatsAppCTA
}) {
  return (
    <section
      style={{
        background: branding.heroGradient ?? branding.colors.primary,
        color: branding.colors.primaryForeground,
        padding: '64px 24px 80px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {section.badge && (
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: branding.colors.accent,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 20,
              backdropFilter: 'blur(4px)',
            }}
          >
            {section.badge}
          </span>
        )}

        <h1
          style={{
            fontFamily: 'var(--lp-font-heading)',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {section.headline}
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: 640,
            margin: '0 auto 32px',
          }}
        >
          {section.subheadline}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <a
            href="#form-section"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 'var(--lp-radius)',
              backgroundColor: branding.colors.accent,
              color: branding.colors.accentForeground,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {section.ctaText}
            <ArrowRight style={{ width: 18, height: 18 }} />
          </a>

          {hasWhatsApp && whatsappCTA && section.secondaryCtaText && (
            <a
              href={buildWhatsAppUrl(whatsappCTA)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 'var(--lp-radius)',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
                color: branding.colors.primaryForeground,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <MessageCircle style={{ width: 18, height: 18 }} />
              {section.secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function StatsSection({
  section,
  branding,
}: {
  section: LPSectionStats
  branding: LPBranding
}) {
  const bgStyle =
    section.variant === 'gradient'
      ? { background: branding.heroGradient ?? branding.colors.primary, color: branding.colors.primaryForeground }
      : section.variant === 'highlighted'
        ? { background: branding.colors.muted, color: branding.colors.foreground }
        : { background: branding.colors.background, color: branding.colors.foreground }

  return (
    <section style={{ padding: '40px 24px', ...bgStyle }}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          textAlign: 'center',
        }}
      >
        {section.stats.map((stat, i) => (
          <StatItem key={i} stat={stat} branding={branding} light={section.variant === 'gradient'} />
        ))}
      </div>
    </section>
  )
}

function StatItem({
  stat,
  branding,
  light,
}: {
  stat: LPStat
  branding: LPBranding
  light: boolean
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--lp-font-heading)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800,
          color: light ? branding.colors.accent : branding.colors.primary,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {stat.prefix}
        {stat.value}
        {stat.suffix}
      </div>
      <div
        style={{
          fontSize: 14,
          opacity: 0.8,
        }}
      >
        {stat.label}
      </div>
    </div>
  )
}

function ValuePropsSection({
  section,
  branding,
}: {
  section: LPSectionValueProps
  branding: LPBranding
}) {
  return (
    <section style={{ padding: '64px 24px', background: branding.colors.background }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {section.heading && (
          <h2
            style={{
              fontFamily: 'var(--lp-font-heading)',
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 40,
              color: branding.colors.foreground,
            }}
          >
            {section.heading}
          </h2>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
          }}
        >
          {section.cards.map((card, i) => (
            <ValuePropCard key={i} card={card} branding={branding} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuePropCard({ card, branding }: { card: LPValuePropCard; branding: LPBranding }) {
  const Icon = getIcon(card.icon)
  return (
    <div
      style={{
        background: branding.colors.cardBackground,
        borderRadius: 'var(--lp-radius)',
        padding: 24,
        border: `1px solid ${branding.colors.muted}`,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: branding.colors.primary + '14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <span style={{ color: branding.colors.primary, display: 'flex' }}>
          <Icon className="w-[22px] h-[22px]" />
        </span>
      </div>
      <h3
        style={{
          fontFamily: 'var(--lp-font-heading)',
          fontWeight: 700,
          fontSize: 17,
          marginBottom: 6,
          color: branding.colors.foreground,
        }}
      >
        {card.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: branding.colors.mutedForeground,
        }}
      >
        {card.description}
      </p>
    </div>
  )
}

function TestimonialsSection({
  section,
  branding,
}: {
  section: LPSectionTestimonials
  branding: LPBranding
}) {
  return (
    <section style={{ padding: '64px 24px', background: branding.colors.muted }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {section.heading && (
          <h2
            style={{
              fontFamily: 'var(--lp-font-heading)',
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 40,
              color: branding.colors.foreground,
            }}
          >
            {section.heading}
          </h2>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {section.testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} branding={branding} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  branding,
}: {
  testimonial: LPTestimonial
  branding: LPBranding
}) {
  return (
    <div
      style={{
        background: branding.colors.cardBackground,
        borderRadius: 'var(--lp-radius)',
        padding: 24,
        border: `1px solid ${branding.colors.muted}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {testimonial.rating && (
        <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              style={{ width: 16, height: 16, color: '#FBBF24', fill: '#FBBF24' }}
            />
          ))}
        </div>
      )}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: branding.colors.foreground,
          marginBottom: 16,
          flex: 1,
          fontStyle: 'italic',
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryForeground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{testimonial.name}</div>
          <div style={{ fontSize: 12, color: branding.colors.mutedForeground }}>
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitsListSection({
  section,
  branding,
}: {
  section: LPSectionBenefitsList
  branding: LPBranding
}) {
  return (
    <section style={{ padding: '64px 24px', background: branding.colors.background }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--lp-font-heading)',
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 32,
            color: branding.colors.foreground,
          }}
        >
          {section.heading}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {section.benefits.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                backgroundColor: branding.colors.cardBackground,
                borderRadius: 'var(--lp-radius)',
                border: `1px solid ${branding.colors.muted}`,
              }}
            >
              <CheckCircle2
                style={{
                  width: 20,
                  height: 20,
                  color: branding.colors.primary,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <span style={{ fontSize: 15, lineHeight: 1.5, color: branding.colors.foreground }}>
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FormSection({
  section,
  form,
  branding,
  config,
}: {
  section: LPSectionFormEmbed
  form: LPForm
  branding: LPBranding
  config: LandingPageConfig
}) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Capture UTM params from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const utmDefaults: Record<string, string> = {}
    form.fields
      .filter((f) => f.type === 'hidden')
      .forEach((f) => {
        const val = params.get(f.name) ?? f.defaultValue ?? ''
        utmDefaults[f.name] = val
      })
    setFormData((prev) => ({ ...prev, ...utmDefaults }))
  }, [form.fields])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Add metadata
    const payload = {
      ...formData,
      _form_id: form.formId,
      _campaign_id: config.tracking.campaignId,
      _slug: config.slug,
      _submitted_at: new Date().toISOString(),
      _page_url: typeof window !== 'undefined' ? window.location.href : '',
    }

    try {
      // POST to API route that writes to Supabase leads table
      const res = await fetch('/api/lp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      console.log('[TorqueLoop LP Submission]', payload, await res.json())

      // Fire conversion event
      if (typeof window !== 'undefined') {
        // Meta Pixel
        if (config.tracking.metaPixelId && (window as any).fbq) {
          ;(window as any).fbq('track', 'Lead', {
            content_name: config.tracking.conversionEventName,
          })
        }
        // Google Ads
        if (config.tracking.googleAdsId && (window as any).gtag) {
          ;(window as any).gtag('event', 'conversion', {
            send_to: config.tracking.googleAdsId,
          })
        }
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section
        id="form-section"
        style={{ padding: '64px 24px', background: branding.colors.muted }}
      >
        <div
          style={{
            maxWidth: 500,
            margin: '0 auto',
            textAlign: 'center',
            padding: 40,
            backgroundColor: branding.colors.cardBackground,
            borderRadius: 'var(--lp-radius)',
            border: `1px solid ${branding.colors.muted}`,
          }}
        >
          <CheckCircle2
            style={{
              width: 48,
              height: 48,
              color: branding.colors.primary,
              margin: '0 auto 16px',
            }}
          />
          <h3
            style={{
              fontFamily: 'var(--lp-font-heading)',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              color: branding.colors.foreground,
            }}
          >
            Solicitud enviada
          </h3>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: branding.colors.mutedForeground,
            }}
          >
            {form.successMessage}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="form-section"
      style={{ padding: '64px 24px', background: branding.colors.muted }}
    >
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--lp-font-heading)',
            fontSize: 'clamp(24px, 3.5vw, 30px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 8,
            color: branding.colors.foreground,
          }}
        >
          {section.heading}
        </h2>
        {section.subheadline && (
          <p
            style={{
              textAlign: 'center',
              color: branding.colors.mutedForeground,
              fontSize: 15,
              marginBottom: 28,
            }}
          >
            {section.subheadline}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: branding.colors.cardBackground,
            borderRadius: 'var(--lp-radius)',
            padding: 28,
            border: `1px solid ${branding.colors.muted}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {form.fields
            .filter((f) => f.type !== 'hidden')
            .map((field) => (
              <FormFieldInput
                key={field.name}
                field={field}
                value={formData[field.name] ?? ''}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, [field.name]: val }))
                }
                branding={branding}
              />
            ))}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 'var(--lp-radius)',
              backgroundColor: branding.colors.primary,
              color: branding.colors.primaryForeground,
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            {submitting ? 'Enviando...' : form.submitText}
            {!submitting && <Send style={{ width: 16, height: 16 }} />}
          </button>

          {form.privacyText && (
            <p
              style={{
                fontSize: 12,
                color: branding.colors.mutedForeground,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {form.privacyText}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

function FormFieldInput({
  field,
  value,
  onChange,
  branding,
}: {
  field: LPFormField
  value: string
  onChange: (val: string) => void
  branding: LPBranding
}) {
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
    color: branding.colors.foreground,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'calc(var(--lp-radius) - 4px)',
    border: `1px solid ${branding.colors.muted}`,
    fontSize: 15,
    color: branding.colors.foreground,
    backgroundColor: branding.colors.background,
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          style={{
            ...inputStyle,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: 36,
          }}
        >
          <option value="">Seleccionar...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
        />
      </div>
    )
  }

  return (
    <div>
      <label style={labelStyle}>{field.label}</label>
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        style={inputStyle}
      />
    </div>
  )
}

function CTASection({
  section,
  branding,
  whatsappCTA,
}: {
  section: LPSectionCTA
  branding: LPBranding
  whatsappCTA?: LPWhatsAppCTA
}) {
  const isDark = section.variant === 'dark'
  const isGradient = section.variant === 'gradient'

  const bgStyle = isGradient
    ? { background: branding.heroGradient ?? branding.colors.primary }
    : isDark
      ? { background: branding.colors.secondary }
      : { background: branding.colors.primary }

  const textColor = branding.colors.primaryForeground

  return (
    <section style={{ padding: '64px 24px', ...bgStyle }}>
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--lp-font-heading)',
            fontSize: 'clamp(22px, 3.5vw, 30px)',
            fontWeight: 700,
            color: textColor,
            marginBottom: 12,
          }}
        >
          {section.headline}
        </h2>
        {section.subheadline && (
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: textColor,
              opacity: 0.85,
              marginBottom: 24,
            }}
          >
            {section.subheadline}
          </p>
        )}

        {section.urgencyText && (
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: branding.colors.accent,
              marginBottom: 20,
            }}
          >
            {section.urgencyText}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <a
            href="#form-section"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 'var(--lp-radius)',
              backgroundColor: branding.colors.accent,
              color: branding.colors.accentForeground,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {section.ctaText}
            <ArrowRight style={{ width: 18, height: 18 }} />
          </a>

          {whatsappCTA && (
            <a
              href={buildWhatsAppUrl(whatsappCTA)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 'var(--lp-radius)',
                backgroundColor: '#25D366',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <MessageCircle style={{ width: 18, height: 18 }} />
              {whatsappCTA.buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function FooterBlock({ footer, branding }: { footer: LPFooter; branding: LPBranding }) {
  return (
    <footer
      style={{
        padding: '32px 24px',
        borderTop: `1px solid ${branding.colors.muted}`,
        textAlign: 'center',
        backgroundColor: branding.colors.background,
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: branding.colors.foreground,
            marginBottom: 8,
          }}
        >
          {footer.companyName}
        </p>
        {footer.legalText && (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: branding.colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            {footer.legalText}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12 }}>
          {footer.privacyUrl && (
            <a
              href={footer.privacyUrl}
              style={{ color: branding.colors.mutedForeground, textDecoration: 'underline' }}
            >
              Aviso de privacidad
            </a>
          )}
          {footer.termsUrl && (
            <a
              href={footer.termsUrl}
              style={{ color: branding.colors.mutedForeground, textDecoration: 'underline' }}
            >
              Terminos y condiciones
            </a>
          )}
        </div>
        {footer.poweredBy && (
          <p
            style={{
              fontSize: 11,
              color: branding.colors.mutedForeground,
              marginTop: 16,
              opacity: 0.6,
            }}
          >
            Powered by {footer.poweredBy}
          </p>
        )}
      </div>
    </footer>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildWhatsAppUrl(cta: LPWhatsAppCTA): string {
  return `https://wa.me/${cta.phoneNumber}?text=${encodeURIComponent(cta.message)}`
}

function brandingToCssVars(branding: LPBranding): React.CSSProperties {
  return {
    // CSS vars are set via the <style> block for broader reach
  } as React.CSSProperties
}
