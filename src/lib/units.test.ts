import { describe, expect, it } from 'vitest'
import {
  CM_PER_INCH,
  cmToInches,
  formatMeasurement,
  formatResult,
  fromDisplay,
  inchesToCm,
  parseMeasurement,
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

describe('parseMeasurement', () => {
  it('parses whole numbers and decimals', () => {
    expect(parseMeasurement('45')).toBe(45)
    expect(parseMeasurement('45.5')).toBe(45.5)
  })

  it('trims surrounding whitespace', () => {
    expect(parseMeasurement(' 45 ')).toBe(45)
  })

  it('accepts a trailing decimal point, so typing does not break', () => {
    expect(parseMeasurement('45.')).toBe(45)
  })

  it('accepts zero and negatives, leaving range rules to validation', () => {
    expect(parseMeasurement('0')).toBe(0)
    expect(parseMeasurement('-5')).toBe(-5)
  })

  it('rejects empty and whitespace-only input rather than reading it as zero', () => {
    expect(parseMeasurement('')).toBeNull()
    expect(parseMeasurement('   ')).toBeNull()
  })

  it('rejects text, including a number with trailing text', () => {
    expect(parseMeasurement('abc')).toBeNull()
    expect(parseMeasurement('45abc')).toBeNull()
  })

  it('rejects non-finite values so they never reach a calculation', () => {
    expect(parseMeasurement('Infinity')).toBeNull()
    expect(parseMeasurement('-Infinity')).toBeNull()
    expect(parseMeasurement('NaN')).toBeNull()
  })
})

describe('formatResult', () => {
  it('rounds to one decimal in cm', () => {
    expect(formatResult(10.8225, 'cm')).toBe('10.8')
    expect(formatResult(145.645, 'cm')).toBe('145.6')
  })

  it('keeps a trailing zero, unlike formatMeasurement', () => {
    expect(formatResult(15, 'cm')).toBe('15.0')
    expect(formatResult(0, 'cm')).toBe('0.0')
    expect(formatMeasurement(15, 'cm')).toBe('15')
  })

  it('converts before rounding, to two decimals in inches', () => {
    expect(formatResult(9.3225, 'in')).toBe('3.67')
    expect(formatResult(10, 'in')).toBe('3.94')
  })
})

describe('unitLabel', () => {
  it('labels both units', () => {
    expect(unitLabel('cm')).toBe('cm')
    expect(unitLabel('in')).toBe('in')
  })
})
