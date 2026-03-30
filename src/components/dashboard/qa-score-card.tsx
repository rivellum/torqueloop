import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QA_DIMENSION_LABELS, type QADimensionKey, type QAScoreData } from '@/types/creative-qa'

interface QAScoreCardProps {
  scoreData: QAScoreData
}

function getTrafficLightColor(score: number): { dot: string; bg: string; text: string } {
  if (score < 4) return { dot: 'bg-red-500', bg: 'bg-red-400/10', text: 'text-red-700' }
  if (score <= 7) return { dot: 'bg-yellow-500', bg: 'bg-yellow-400/10', text: 'text-yellow-700' }
  return { dot: 'bg-green-500', bg: 'bg-green-400/10', text: 'text-green-700' }
}

function getOverallColor(score: number): string {
  if (score < 4) return 'bg-red-400/10 text-red-600'
  if (score <= 7) return 'bg-yellow-400/10 text-yellow-600'
  return 'bg-green-400/10 text-green-600'
}

export function QAScoreCard({ scoreData }: QAScoreCardProps) {
  const { dimensions, overall } = scoreData
  const overallColors = getOverallColor(overall)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Puntuación QA</CardTitle>
        <div className={`rounded-full px-3 py-1 text-sm font-bold ${overallColors}`}>
          {overall.toFixed(1)} / 10
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(QA_DIMENSION_LABELS) as QADimensionKey[]).map((key) => {
          const score = dimensions[key] ?? 0
          const colors = getTrafficLightColor(score)

          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded-lg p-2 ${colors.bg}`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <span className="text-sm">{QA_DIMENSION_LABELS[key]}</span>
              </div>
              <span className={`text-sm font-medium ${colors.text}`}>
                {score.toFixed(1)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
