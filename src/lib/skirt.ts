import type {
  LengthPreset,
  SkirtInput,
  SkirtResult,
  SkirtType,
} from '../types/skirt'
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

interface FormState {
  waistCm: number | null
  skirtType: SkirtType
  lengthPreset: LengthPreset
  customLengthCm: number | null
}

/**
 * Form state to engine input, or null when there is nothing to compute yet.
 *
 * The non-positive checks are not validation, which feature 7 owns. They are the
 * minimum needed to keep nonsense off the screen: a zero waist gives a 0.0 cut
 * radius, and a negative one gives a plausible-looking fabric length beside it.
 */
export function toSkirtInput(state: FormState): SkirtInput | null {
  const { waistCm, skirtType, lengthPreset, customLengthCm } = state

  if (waistCm === null || waistCm <= 0) return null

  if (lengthPreset === 'custom') {
    if (customLengthCm === null || customLengthCm <= 0) return null
    return { waistCm, skirtType, lengthPreset, customLengthCm }
  }

  return { waistCm, skirtType, lengthPreset }
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
