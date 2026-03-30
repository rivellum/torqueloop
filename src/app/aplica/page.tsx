import type { Metadata } from 'next'
import { veseguroAplicaConfig } from '@/lib/lp-configs/veseguro-aplica'
import { LandingPage } from '@/components/lp/landing-page'

export const metadata: Metadata = {
  title: veseguroAplicaConfig.meta.title,
  description: veseguroAplicaConfig.meta.description,
  openGraph: {
    title: veseguroAplicaConfig.meta.title,
    description: veseguroAplicaConfig.meta.description,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function AplicaPage() {
  return <LandingPage config={veseguroAplicaConfig} />
}
