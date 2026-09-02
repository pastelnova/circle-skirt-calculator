import type { Unit } from '../types/skirt'

// Every calculation runs in cm. Convert at the input and output boundary only,
// so no formula ever mixes units.
export const CM_PER_INCH = 2.54

// 0.01 in is about 0.25 mm, so inches need the extra digit to stay as precise
// as cm.
const DECIMALS: Record<Unit, number> = {
  cm: 1,
  in: 2,
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH
}

/** cm out to the unit the user is working in. */
export function toDisplay(cm: number, unit: Unit): number {
  return unit === 'in' ? cmToInches(cm) : cm
}

/** A number the user typed, in to cm. */
export function fromDisplay(value: number, unit: Unit): number {
  return unit === 'in' ? inchesToCm(value) : value
}

/**
 * A string the user typed, to a number in the unit they typed it in. Its only
 * question is whether the text is a number at all: zero and negatives parse
 * fine, because range and sign are the validation layer's rules, not this one's.
 */
export function parseMeasurement(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  // Number() over parseFloat: parseFloat('45abc') returns 45, which would let a
  // typo through as a real measurement.
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

/**
 * Rounded display string, without a unit label, so the UI can render the label
 * in its own element. Trailing zeros are trimmed: 2 cm reads as "2", not "2.0".
 */
export function formatMeasurement(cm: number, unit: Unit): string {
  const rounded = toDisplay(cm, unit).toFixed(DECIMALS[unit])
  return String(Number(rounded))
}

export function unitLabel(unit: Unit): string {
  return unit
}
