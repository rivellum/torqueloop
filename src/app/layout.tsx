import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "TorqueLoop — AI-Powered Closed-Loop Marketing",
    template: "%s | TorqueLoop",
  },
  description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy across every channel.",
  metadataBase: new URL("https://torqueloop.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TorqueLoop — AI-Powered Closed-Loop Marketing",
    description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy across every channel.",
    url: "https://torqueloop.com",
    siteName: "TorqueLoop",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TorqueLoop — Closed-Loop Marketing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TorqueLoop — AI-Powered Closed-Loop Marketing",
    description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#6D28D9",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
