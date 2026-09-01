export type SkirtType = 'quarter' | 'half' | 'threeQuarter' | 'full'
export type Unit = 'cm' | 'in'
export type LengthPreset = 'mini' | 'midi' | 'maxi' | 'custom'

// Discriminated on lengthPreset so a custom skirt cannot be constructed without
// its length. The engine then has no missing-value case to handle at runtime.
export type SkirtInput = {
  waistCm: number
  skirtType: SkirtType
} & (
  | { lengthPreset: 'mini' | 'midi' | 'maxi' }
  | { lengthPreset: 'custom'; customLengthCm: number }
)

export interface SkirtResult {
  waistRadiusCm: number
  cutRadiusCm: number
  fabricLengthCm: number
  skirtLengthCm: number
}
