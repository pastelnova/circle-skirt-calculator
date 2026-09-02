import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SAVED_INPUTS,
  SAVED_INPUTS_KEY,
  isDefaultSavedInputs,
  parseSavedInputs,
  readSavedInputs,
  serializeSavedInputs,
  type SavedInputs,
} from './storage'

const VALID: SavedInputs = {
  unit: 'in',
  skirtType: 'threeQuarter',
  lengthPreset: 'custom',
  waist: 71.12,
  customLength: 45.72,
}

describe('parseSavedInputs', () => {
  it('reads back a record it wrote', () => {
    expect(parseSavedInputs(serializeSavedInputs(VALID))).toEqual(VALID)
  })

  it('accepts null measurements', () => {
    const empty: SavedInputs = {
      unit: 'cm',
      skirtType: 'full',
      lengthPreset: 'midi',
      waist: null,
      customLength: null,
    }
    expect(parseSavedInputs(serializeSavedInputs(empty))).toEqual(empty)
  })

  it('strips unknown keys rather than rejecting the record', () => {
    const raw = JSON.stringify({ ...VALID, hemAllowance: 3 })
    expect(parseSavedInputs(raw)).toEqual(VALID)
  })

  describe('absent or malformed input', () => {
    it.each([
      ['a missing record', null],
      ['an empty string', ''],
      ['text that is not JSON', 'not json'],
      ['an array', '[]'],
      ['an empty object', '{}'],
      ['a JSON null', 'null'],
    ])('returns null for %s', (_label, raw) => {
      expect(parseSavedInputs(raw)).toBeNull()
    })
  })

  describe('records that fail the contract', () => {
    it('rejects an unknown skirt type', () => {
      const raw = JSON.stringify({ ...VALID, skirtType: 'octagon' })
      expect(parseSavedInputs(raw)).toBeNull()
    })

    it('rejects an unknown unit', () => {
      const raw = JSON.stringify({ ...VALID, unit: 'furlong' })
      expect(parseSavedInputs(raw)).toBeNull()
    })

    it('rejects a partial record', () => {
      const raw = JSON.stringify({ unit: 'cm', skirtType: 'full' })
      expect(parseSavedInputs(raw)).toBeNull()
    })

    it('rejects a measurement sent as a string', () => {
      const raw = JSON.stringify({ ...VALID, waist: '72' })
      expect(parseSavedInputs(raw)).toBeNull()
    })

    // The case where storage and the form could otherwise disagree: 400 cm is
    // past the waist maximum the user is allowed to type.
    it.each([
      ['a waist above the maximum', { waist: 400 }],
      ['a waist below the minimum', { waist: 12 }],
      ['a custom length above the maximum', { customLength: 500 }],
      ['a custom length below the minimum', { customLength: 2 }],
    ])('rejects %s', (_label, overrides) => {
      const raw = JSON.stringify({ ...VALID, ...overrides })
      expect(parseSavedInputs(raw)).toBeNull()
    })
  })
})

describe('isDefaultSavedInputs', () => {
  it('recognizes the untouched form', () => {
    expect(isDefaultSavedInputs(DEFAULT_SAVED_INPUTS)).toBe(true)
    expect(isDefaultSavedInputs({ ...DEFAULT_SAVED_INPUTS })).toBe(true)
  })

  it.each([
    ['a changed unit', { unit: 'in' as const }],
    ['a changed skirt type', { skirtType: 'half' as const }],
    ['a changed length preset', { lengthPreset: 'maxi' as const }],
    ['a waist', { waist: 72 }],
    ['a custom length', { customLength: 45 }],
  ])('rejects a record with %s', (_label, overrides) => {
    expect(
      isDefaultSavedInputs({ ...DEFAULT_SAVED_INPUTS, ...overrides }),
    ).toBe(false)
  })
})

describe('readSavedInputs', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the stored record', () => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) =>
        key === SAVED_INPUTS_KEY ? serializeSavedInputs(VALID) : null,
    })
    expect(readSavedInputs()).toEqual(VALID)
  })

  // Safari in private mode, and any browser with site data blocked.
  it('returns null when storage itself throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('access denied')
      },
    })
    expect(readSavedInputs()).toBeNull()
  })
})
