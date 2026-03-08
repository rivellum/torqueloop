/**
 * Layout for landing pages.
 *
 * Provides a clean wrapper for LP rendering.
 * The root layout handles <html> and <body>.
 * LP-specific fonts and styles are loaded inline by the LandingPage component.
 */

export default function LPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
