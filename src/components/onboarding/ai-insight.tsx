"use client"
import { Brain } from 'lucide-react'

interface AiInsightProps {
  thinking: boolean
  message: string | null
}

export function AiInsight({ thinking, message }: AiInsightProps) {
  if (!thinking && !message) return null

  return (
    <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-primary mb-1">TorqueLoop AI</div>
          {thinking ? (
            <div className="ai-typing">
              <span /><span /><span />
            </div>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
