import { describe, expect, it } from 'vitest'
import { CM_PER_INCH, cmToInches, inchesToCm } from './units'

describe('unit conversion', () => {
  it('converts inches to cm', () => {
    expect(inchesToCm(1)).toBe(CM_PER_INCH)
    expect(inchesToCm(28)).toBeCloseTo(71.12, 10)
  })

  it('converts cm to inches', () => {
    expect(cmToInches(CM_PER_INCH)).toBe(1)
  })

  it('round-trips a waist measurement', () => {
    expect(cmToInches(inchesToCm(26.5))).toBeCloseTo(26.5, 10)
  })
})
