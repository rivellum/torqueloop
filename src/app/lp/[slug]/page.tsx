import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLandingPageConfig, getAllLandingPageSlugs } from '@/lib/lp-configs'
import { LandingPage } from '@/components/lp/landing-page'

interface LPPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Dynamic landing page route.
 *
 * TorqueLoop serves all client landing pages at /lp/[slug].
 * The slug maps to a LandingPageConfig in the registry.
 * In production, configs would be fetched from Supabase.
 */

export async function generateStaticParams() {
  return getAllLandingPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: LPPageProps): Promise<Metadata> {
  const { slug } = await params
  const config = getLandingPageConfig(slug)
  if (!config) return {}

  return {
    title: config.meta.title,
    description: config.meta.description,
    openGraph: {
      title: config.meta.title,
      description: config.meta.description,
      type: 'website',
      ...(config.meta.ogImage ? { url: config.meta.ogImage } : {}),
    },
    robots: config.meta.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function LPPage({ params }: LPPageProps) {
  const { slug } = await params
  const config = getLandingPageConfig(slug)

  if (!config) {
    notFound()
  }

  return <LandingPage config={config} />
}
