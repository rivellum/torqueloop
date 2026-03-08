import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TorqueLoop — AI-Powered Closed-Loop Marketing",
  description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy across every channel.",
  openGraph: {
    title: "TorqueLoop — AI-Powered Closed-Loop Marketing",
    description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy across every channel.",
    url: "https://torqueloop.com",
    siteName: "TorqueLoop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TorqueLoop — AI-Powered Closed-Loop Marketing",
    description: "Set your goals. Let AI build, publish, and optimize your entire marketing strategy.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
