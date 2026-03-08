"use client"
import { Button } from '@/components/ui/button'
import { Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist. Let's get you back on track.</p>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to TorqueLoop
          </Button>
        </Link>
      </div>
    </div>
  )
}
