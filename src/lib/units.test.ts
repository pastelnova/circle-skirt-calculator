import { describe, expect, it } from 'vitest'
import {
  CM_PER_INCH,
  cmToInches,
  formatMeasurement,
  fromDisplay,
  inchesToCm,
  toDisplay,
  unitLabel,
} from './units'

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

describe('display boundary', () => {
  it('leaves cm untouched in both directions', () => {
    expect(toDisplay(68, 'cm')).toBe(68)
    expect(fromDisplay(68, 'cm')).toBe(68)
  })

  it('converts to and from inches', () => {
    expect(toDisplay(CM_PER_INCH, 'in')).toBe(1)
    expect(fromDisplay(1, 'in')).toBe(CM_PER_INCH)
  })

  it('round-trips a value through the boundary', () => {
    expect(fromDisplay(toDisplay(68, 'in'), 'in')).toBeCloseTo(68, 10)
  })
})

describe('formatMeasurement', () => {
  it('gives one decimal place in cm', () => {
    expect(formatMeasurement(1.5, 'cm')).toBe('1.5')
  })

  it('gives two decimal places in inches', () => {
    expect(formatMeasurement(1.5, 'in')).toBe('0.59')
    expect(formatMeasurement(2, 'in')).toBe('0.79')
  })

  it('trims trailing zeros', () => {
    expect(formatMeasurement(2, 'cm')).toBe('2')
    expect(formatMeasurement(CM_PER_INCH, 'in')).toBe('1')
  })

  it('rounds rather than truncates', () => {
    expect(formatMeasurement(10.66, 'cm')).toBe('10.7')
  })

  it('renders zero without a sign or decimals', () => {
    expect(formatMeasurement(0, 'cm')).toBe('0')
    expect(formatMeasurement(0, 'in')).toBe('0')
  })
})

describe('unitLabel', () => {
  it('labels both units', () => {
    expect(unitLabel('cm')).toBe('cm')
    expect(unitLabel('in')).toBe('in')
  })
})
