import type { LandingPageConfig } from '@/types/landing-page'
import { prosperaReclutaConfig } from './prospera-recluta'
import { veseguroReclutaConfig } from './veseguro-recluta'
import { veseguroAplicaConfig } from './veseguro-aplica'

/**
 * Landing Page Registry
 *
 * Maps slugs to their configs. When TorqueLoop generates a new LP
 * (via the onboarding wizard or AI engine), it adds entries here.
 * In production, this would be replaced by a Supabase query.
 */
const LP_REGISTRY: Record<string, LandingPageConfig> = {
  'prospera-recluta': prosperaReclutaConfig,
  'veseguro-recluta': veseguroReclutaConfig,
  'aplica': veseguroAplicaConfig,
}

export function getLandingPageConfig(slug: string): LandingPageConfig | null {
  return LP_REGISTRY[slug] ?? null
}

export function getAllLandingPageSlugs(): string[] {
  return Object.keys(LP_REGISTRY)
}

export { LP_REGISTRY }
