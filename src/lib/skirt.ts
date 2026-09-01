import type { SkirtInput, SkirtResult, SkirtType } from '../types/skirt'
import { HEM_ALLOWANCE, LENGTH_PRESETS, SEAM_ALLOWANCE } from './constants'

// A quarter circle skirt takes its waist from a quarter of a circle, so the
// circle it is cut from must be four times the body waist. Keeping this as data
// means a new skirt type is a new entry, not a new branch.
const CIRCLE_FRACTION: Record<SkirtType, number> = {
  full: 1,
  threeQuarter: 4 / 3,
  half: 2,
  quarter: 4,
}

/** Finished waist radius: where the seamline sits, in cm. */
export function waistRadius(waistCm: number, skirtType: SkirtType): number {
  return (waistCm * CIRCLE_FRACTION[skirtType]) / (2 * Math.PI)
}

/**
 * Radius the waist hole is actually cut at. Cutting it smaller by the seam
 * allowance means sewing the seam opens it back out to the measured waist.
 */
export function cutRadius(radiusCm: number): number {
  return Math.max(0, radiusCm - SEAM_ALLOWANCE)
}

/** Fabric to buy, spanning the full circle rather than a single radius. */
export function fabricLength(radiusCm: number, skirtLengthCm: number): number {
  return 2 * (radiusCm + skirtLengthCm + HEM_ALLOWANCE)
}

export function calculateSkirt(input: SkirtInput): SkirtResult {
  const skirtLengthCm =
    input.lengthPreset === 'custom'
      ? input.customLengthCm
      : LENGTH_PRESETS[input.lengthPreset]

  const waistRadiusCm = waistRadius(input.waistCm, input.skirtType)

  return {
    waistRadiusCm,
    cutRadiusCm: cutRadius(waistRadiusCm),
    fabricLengthCm: fabricLength(waistRadiusCm, skirtLengthCm),
    skirtLengthCm,
  }
}
