import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QAScoreCard } from '@/components/dashboard/qa-score-card'
import type { QAScoreData } from '@/types/creative-qa'

const highScore: QAScoreData = {
  dimensions: {
    voice_text_sync: 9.0,
    timing_adjustment: 8.5,
    brand_presence: 9.2,
    audio_levels: 8.0,
    typography_congruence: 9.5,
    pivot_clarity: 8.8,
    persona_alignment: 9.1,
  },
  overall: 8.9,
}

const mixedScore: QAScoreData = {
  dimensions: {
    voice_text_sync: 3.0,
    timing_adjustment: 5.0,
    brand_presence: 8.0,
    audio_levels: 2.5,
    typography_congruence: 6.0,
    pivot_clarity: 9.0,
    persona_alignment: 4.5,
  },
  overall: 5.4,
}

describe('QAScoreCard', () => {
  it('renders all 7 dimensions', () => {
    render(<QAScoreCard scoreData={highScore} />)
    expect(screen.getByText('Sincronización Voz-Texto')).toBeInTheDocument()
    expect(screen.getByText('Ajuste de Tiempo')).toBeInTheDocument()
    expect(screen.getByText('Presencia de Marca')).toBeInTheDocument()
    expect(screen.getByText('Niveles de Audio')).toBeInTheDocument()
    expect(screen.getByText('Congruencia Tipográfica')).toBeInTheDocument()
    expect(screen.getByText('Claridad del Pivot')).toBeInTheDocument()
    expect(screen.getByText('Ajuste de Persona')).toBeInTheDocument()
  })

  it('renders overall score', () => {
    render(<QAScoreCard scoreData={highScore} />)
    expect(screen.getByText('8.9 / 10')).toBeInTheDocument()
  })

  it('renders individual dimension scores', () => {
    render(<QAScoreCard scoreData={highScore} />)
    expect(screen.getByText('9.0')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getByText('9.2')).toBeInTheDocument()
  })

  it('uses green dot for scores > 7', () => {
    const { container } = render(<QAScoreCard scoreData={highScore} />)
    const greenDots = container.querySelectorAll('.bg-green-500')
    expect(greenDots.length).toBe(7) // All high scores
  })

  it('uses red dot for scores < 4', () => {
    const { container } = render(<QAScoreCard scoreData={mixedScore} />)
    const redDots = container.querySelectorAll('.bg-red-500')
    expect(redDots.length).toBeGreaterThanOrEqual(2) // voice_text_sync(3), audio_levels(2.5)
  })

  it('uses yellow dot for scores 4-7', () => {
    const { container } = render(<QAScoreCard scoreData={mixedScore} />)
    const yellowDots = container.querySelectorAll('.bg-yellow-500')
    expect(yellowDots.length).toBeGreaterThanOrEqual(2) // timing(5), typography(6), persona(4.5)
  })

  it('renders title', () => {
    render(<QAScoreCard scoreData={highScore} />)
    expect(screen.getByText('Puntuación QA')).toBeInTheDocument()
  })

  it('renders zero score dimensions', () => {
    const zeroScore: QAScoreData = {
      dimensions: {
        voice_text_sync: 0,
        timing_adjustment: 0,
        brand_presence: 0,
        audio_levels: 0,
        typography_congruence: 0,
        pivot_clarity: 0,
        persona_alignment: 0,
      },
      overall: 0,
    }
    render(<QAScoreCard scoreData={zeroScore} />)
    expect(screen.getByText('0.0 / 10')).toBeInTheDocument()
  })
})
