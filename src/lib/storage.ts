import { z } from 'zod'
import {
  CUSTOM_LENGTH_MAX_CM,
  CUSTOM_LENGTH_MIN_CM,
  WAIST_MAX_CM,
  WAIST_MIN_CM,
} from './constants'
import type { LengthPreset, SkirtType, Unit } from '../types/skirt'

// The version segment is the migration path: a later shape change bumps to :v2
// and records written by this version are simply never read again.
export const SAVED_INPUTS_KEY = 'circle-skirt-calculator:v1'

export interface SavedInputs {
  unit: Unit
  skirtType: SkirtType
  lengthPreset: LengthPreset
  /** cm, or null when the field is empty or currently invalid. */
  waist: number | null
  /** cm, or null. Legitimately null even when lengthPreset is 'custom'. */
  customLength: number | null
}

export const DEFAULT_SAVED_INPUTS: SavedInputs = {
  unit: 'cm',
  skirtType: 'full',
  lengthPreset: 'midi',
  waist: null,
  customLength: null,
}

/**
 * A record identical to the defaults is not worth storing. Writing one would
 * fake a return visit for a first-time visitor who only loaded the page.
 */
export function isDefaultSavedInputs(inputs: SavedInputs): boolean {
  return (
    inputs.unit === DEFAULT_SAVED_INPUTS.unit &&
    inputs.skirtType === DEFAULT_SAVED_INPUTS.skirtType &&
    inputs.lengthPreset === DEFAULT_SAVED_INPUTS.lengthPreset &&
    inputs.waist === DEFAULT_SAVED_INPUTS.waist &&
    inputs.customLength === DEFAULT_SAVED_INPUTS.customLength
  )
}

// The same bounds the form enforces, so a hand-edited or stale record cannot
// restore a value the user would not have been allowed to type.
const savedInputsSchema = z.object({
  unit: z.enum(['cm', 'in']),
  skirtType: z.enum(['quarter', 'half', 'threeQuarter', 'full']),
  lengthPreset: z.enum(['mini', 'midi', 'maxi', 'custom']),
  waist: z.number().min(WAIST_MIN_CM).max(WAIST_MAX_CM).nullable(),
  customLength: z
    .number()
    .min(CUSTOM_LENGTH_MIN_CM)
    .max(CUSTOM_LENGTH_MAX_CM)
    .nullable(),
})

/**
 * Stored text to a usable record, or null when there is nothing trustworthy in
 * it. Missing, unparseable, and partial records are all treated the same way:
 * absent. Salvaging half a record would mean restoring a form the user never
 * left behind.
 */
export function parseSavedInputs(raw: string | null): SavedInputs | null {
  if (raw === null) return null

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }

  const result = savedInputsSchema.safeParse(value)
  return result.success ? result.data : null
}

export function serializeSavedInputs(inputs: SavedInputs): string {
  return JSON.stringify(inputs)
}

// The three functions below are the only ones that touch the browser. A visitor
// with site data blocked gets a calculator that works and simply forgets.
export function readSavedInputs(): SavedInputs | null {
  try {
    return parseSavedInputs(localStorage.getItem(SAVED_INPUTS_KEY))
  } catch {
    return null
  }
}

export function writeSavedInputs(inputs: SavedInputs): void {
  try {
    localStorage.setItem(SAVED_INPUTS_KEY, serializeSavedInputs(inputs))
  } catch {
    // Nothing to do and nothing worth telling the user: the calculator does not
    // depend on the write succeeding.
  }
}

export function clearSavedInputs(): void {
  try {
    localStorage.removeItem(SAVED_INPUTS_KEY)
  } catch {
    // Same reasoning as writeSavedInputs.
  }
}
