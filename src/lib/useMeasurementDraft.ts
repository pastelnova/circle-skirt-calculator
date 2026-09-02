import { useState } from 'react'
import { formatMeasurement, fromDisplay, parseMeasurement } from './units'
import type { Unit } from '../types/skirt'

export interface MeasurementDraft {
  /** Exactly what the user typed. The field renders it verbatim. */
  input: string
  /** Canonical value, always cm, never rounded for display. */
  cm: number | null
  /** True once the user has typed in the field, so an untouched field is not
   *  scolded for being empty on first paint. */
  touched: boolean
  change: (next: string) => void
  reformat: (nextUnit: Unit) => void
}

/**
 * State for one measurement field. A field cannot hold a number alone: reformatting
 * on every keystroke would turn `45.` into `45` and eat the decimal point mid-entry.
 * It cannot hold the string alone either, because the rewritten string is rounded to
 * display precision, so each unit toggle would read back its own rounding and decay
 * the value. Keeping both, and never deriving one from the other's rounded form, is
 * what stops that.
 */
export function useMeasurementDraft(unit: Unit): MeasurementDraft {
  const [input, setInput] = useState('')
  const [cm, setCm] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)

  function change(next: string) {
    setInput(next)
    setTouched(true)
    const parsed = parseMeasurement(next)
    setCm(parsed === null ? null : fromDisplay(parsed, unit))
  }

  // Takes the next unit rather than reading `unit`, because the caller changes the
  // unit in the same handler and the new value is not in scope for this render yet.
  function reformat(nextUnit: Unit) {
    // A null cm means the draft is empty or unparseable, and rewriting it would
    // destroy what the user typed on an accidental toggle.
    if (cm !== null) {
      setInput(formatMeasurement(cm, nextUnit))
    }
  }

  return { input, cm, touched, change, reformat }
}
