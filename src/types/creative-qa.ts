export type QADimensionKey =
  | 'voice_text_sync'
  | 'timing_adjustment'
  | 'brand_presence'
  | 'audio_levels'
  | 'typography_congruence'
  | 'pivot_clarity'
  | 'persona_alignment'

export interface QAScoreData {
  dimensions: Record<QADimensionKey, number>
  overall: number
}

export const QA_DIMENSION_LABELS: Record<QADimensionKey, string> = {
  voice_text_sync: 'Sincronización Voz-Texto',
  timing_adjustment: 'Ajuste de Tiempo',
  brand_presence: 'Presencia de Marca',
  audio_levels: 'Niveles de Audio',
  typography_congruence: 'Congruencia Tipográfica',
  pivot_clarity: 'Claridad del Pivot',
  persona_alignment: 'Ajuste de Persona',
}
