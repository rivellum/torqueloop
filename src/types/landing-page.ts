/**
 * TorqueLoop Landing Page Configuration Schema
 *
 * This is the universal data model for ANY landing page served by TorqueLoop.
 * It supports recruiting, lead gen, SaaS signups, e-commerce, events, etc.
 * The LandingPage component renders any config that conforms to this interface.
 */

// ─── Core Config ────────────────────────────────────────────────────────────

export interface LandingPageConfig {
  /** Unique slug used in /lp/[slug] route */
  slug: string

  /** SEO & meta */
  meta: LPMeta

  /** Visual branding */
  branding: LPBranding

  /** Language for the page (html lang attribute) */
  lang: 'es' | 'en' | 'pt' | 'fr'

  /** Ordered list of sections to render. Controls layout sequence. */
  sections: LPSection[]

  /** Form configuration (if conversion involves a form) */
  form?: LPForm

  /** WhatsApp CTA (if conversion involves WhatsApp) */
  whatsappCTA?: LPWhatsAppCTA

  /** Tracking & attribution */
  tracking: LPTracking

  /** Footer content */
  footer: LPFooter
}

// ─── Meta / SEO ─────────────────────────────────────────────────────────────

export interface LPMeta {
  title: string
  description: string
  ogImage?: string
  favicon?: string
  noIndex?: boolean
}

// ─── Branding ───────────────────────────────────────────────────────────────

export interface LPBranding {
  /** Logo URL or text fallback */
  logoUrl?: string
  logoText?: string
  /** Partner/co-brand logo URL (e.g., GNP) */
  partnerLogoUrl?: string
  partnerLogoAlt?: string

  /** Color palette (hex values) */
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    cardBackground: string
  }

  /** Font family names (loaded via Google Fonts or local) */
  fonts?: {
    heading?: string
    body?: string
  }

  /** Border radius in px for cards and buttons */
  borderRadius?: number

  /** Gradient for hero or CTA backgrounds */
  heroGradient?: string
}

// ─── Sections (ordered, composable) ─────────────────────────────────────────

export type LPSection =
  | LPSectionHero
  | LPSectionValueProps
  | LPSectionStats
  | LPSectionTestimonials
  | LPSectionCTA
  | LPSectionBenefitsList
  | LPSectionFAQ
  | LPSectionLogos
  | LPSectionVideo
  | LPSectionFormEmbed

export type LPSectionType =
  | 'hero'
  | 'value-props'
  | 'stats'
  | 'testimonials'
  | 'cta'
  | 'benefits-list'
  | 'faq'
  | 'logos'
  | 'video'
  | 'form-embed'

interface LPSectionBase {
  type: LPSectionType
  id: string
}

export interface LPSectionHero extends LPSectionBase {
  type: 'hero'
  /** Max 12 words, punchy headline */
  headline: string
  /** 1-2 sentence subheadline */
  subheadline: string
  /** CTA button text (scrolls to form or triggers WhatsApp) */
  ctaText: string
  /** Secondary CTA (optional) */
  secondaryCtaText?: string
  secondaryCtaUrl?: string
  /** Background image URL (optional) */
  backgroundImage?: string
  /** Badge/pill text above headline (optional) */
  badge?: string
}

export interface LPSectionValueProps extends LPSectionBase {
  type: 'value-props'
  /** Section heading */
  heading?: string
  cards: LPValuePropCard[]
}

export interface LPValuePropCard {
  /** Lucide icon name (e.g., "DollarSign", "Clock", "Shield") */
  icon: string
  title: string
  description: string
}

export interface LPSectionStats extends LPSectionBase {
  type: 'stats'
  stats: LPStat[]
  /** Optional background style */
  variant?: 'default' | 'highlighted' | 'gradient'
}

export interface LPStat {
  value: string
  label: string
  /** Optional prefix like "$" or "+" */
  prefix?: string
  /** Optional suffix like "%" or "+" */
  suffix?: string
}

export interface LPSectionTestimonials extends LPSectionBase {
  type: 'testimonials'
  heading?: string
  testimonials: LPTestimonial[]
}

export interface LPTestimonial {
  quote: string
  name: string
  role: string
  /** Avatar URL or initials fallback */
  avatar?: string
  /** Star rating 1-5 */
  rating?: number
}

export interface LPSectionCTA extends LPSectionBase {
  type: 'cta'
  headline: string
  subheadline?: string
  ctaText: string
  /** Urgency text (e.g., "Solo quedan 15 lugares") */
  urgencyText?: string
  /** CTA variant styling */
  variant?: 'default' | 'gradient' | 'dark'
}

export interface LPSectionBenefitsList extends LPSectionBase {
  type: 'benefits-list'
  heading: string
  benefits: string[]
}

export interface LPSectionFAQ extends LPSectionBase {
  type: 'faq'
  heading: string
  questions: { question: string; answer: string }[]
}

export interface LPSectionLogos extends LPSectionBase {
  type: 'logos'
  heading?: string
  logos: { url: string; alt: string }[]
}

export interface LPSectionVideo extends LPSectionBase {
  type: 'video'
  heading?: string
  videoUrl: string
  /** YouTube, Vimeo, or direct mp4 */
  provider: 'youtube' | 'vimeo' | 'direct'
}

export interface LPSectionFormEmbed extends LPSectionBase {
  type: 'form-embed'
  heading: string
  subheadline?: string
}

// ─── Form ───────────────────────────────────────────────────────────────────

export interface LPForm {
  /** Unique form ID for tracking */
  formId: string
  heading: string
  subheadline?: string
  fields: LPFormField[]
  submitText: string
  /** Success message shown after submission */
  successMessage: string
  /** Supabase table to insert into, or webhook URL */
  destination: {
    type: 'supabase' | 'webhook' | 'email'
    target: string
  }
  /** Privacy text below form */
  privacyText?: string
}

export interface LPFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'hidden'
  placeholder?: string
  required?: boolean
  options?: string[] // for select type
  /** Hidden field default value (e.g., utm_source) */
  defaultValue?: string
}

// ─── WhatsApp CTA ───────────────────────────────────────────────────────────

export interface LPWhatsAppCTA {
  /** Phone number with country code, no spaces (e.g., "5215512345678") */
  phoneNumber: string
  /** Pre-filled message */
  message: string
  /** Button label */
  buttonText: string
  /** Floating button on mobile */
  floatingButton?: boolean
}

// ─── Tracking ───────────────────────────────────────────────────────────────

export interface LPTracking {
  /** TorqueLoop campaign ID for closed-loop attribution */
  campaignId: string
  /** UTM parameters to expect/capture */
  utmParams?: ('utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term')[]
  /** Meta Pixel ID */
  metaPixelId?: string
  /** Google Ads conversion ID */
  googleAdsId?: string
  /** TikTok Pixel ID */
  tiktokPixelId?: string
  /** Custom event name for form submission */
  conversionEventName?: string
}

// ─── Footer ─────────────────────────────────────────────────────────────────

export interface LPFooter {
  companyName: string
  legalText?: string
  privacyUrl?: string
  termsUrl?: string
  poweredBy?: string
}
