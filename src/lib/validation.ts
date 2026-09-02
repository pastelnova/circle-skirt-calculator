import { z } from 'zod'
import {
  CUSTOM_LENGTH_MAX_CM,
  CUSTOM_LENGTH_MIN_CM,
  WAIST_MAX_CM,
  WAIST_MIN_CM,
} from './constants'
import {
  formatMeasurement,
  fromDisplay,
  parseMeasurement,
  unitLabel,
} from './units'
import type { Unit } from '../types/skirt'

export type MeasurementField = 'waist' | 'customLength'

/**
 * An empty field still carries its message, so every user-facing string lives
 * here. Whether an empty field is currently an error is the caller's call.
 */
export type MeasurementValidation =
  | { status: 'empty'; message: string }
  | { status: 'valid'; cm: number }
  | { status: 'invalid'; message: string }

interface FieldRules {
  minCm: number
  maxCm: number
  emptyMessage: string
  subject: string
}

const RULES: Record<MeasurementField, FieldRules> = {
  waist: {
    minCm: WAIST_MIN_CM,
    maxCm: WAIST_MAX_CM,
    emptyMessage: 'Enter your waist measurement.',
    subject: 'Waist',
  },
  customLength: {
    minCm: CUSTOM_LENGTH_MIN_CM,
    maxCm: CUSTOM_LENGTH_MAX_CM,
    emptyMessage: 'Enter a custom length.',
    subject: 'Length',
  },
}

const NOT_A_NUMBER = 'Enter a number.'

// Zero and negatives share the range message. It is already true for them, and
// a separate "must be positive" would be one more string saying less.
function rangeMessage(rules: FieldRules, unit: Unit): string {
  const min = formatMeasurement(rules.minCm, unit)
  const max = formatMeasurement(rules.maxCm, unit)
  return `${rules.subject} must be between ${min} and ${max} ${unitLabel(unit)}.`
}

/**
 * Text the user typed, in their display unit, to a cm value inside the bounds.
 * Built per unit because the bounds are compared in cm but reported in the
 * display unit, so the message cannot be baked into a shared schema.
 */
function measurementSchema(rules: FieldRules, unit: Unit) {
  const outOfRange = rangeMessage(rules, unit)

  return z
    .string()
    .transform(parseMeasurement)
    // A null from the parser lands here as a type failure, which is exactly
    // what "not a number" means to the user.
    .pipe(z.number(NOT_A_NUMBER))
    .transform((value) => fromDisplay(value, unit))
    .pipe(z.number().min(rules.minCm, outOfRange).max(rules.maxCm, outOfRange))
}

export function validateMeasurement(
  input: string,
  field: MeasurementField,
  unit: Unit,
): MeasurementValidation {
  const rules = RULES[field]

  if (input.trim() === '') {
    return { status: 'empty', message: rules.emptyMessage }
  }

  const result = measurementSchema(rules, unit).safeParse(input)
  if (!result.success) {
    return { status: 'invalid', message: result.error.issues[0].message }
  }

  return { status: 'valid', cm: result.data }
}
