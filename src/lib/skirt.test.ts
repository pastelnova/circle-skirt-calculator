import { describe, expect, it } from 'vitest'
import { HEM_ALLOWANCE, LENGTH_PRESETS, SEAM_ALLOWANCE } from './constants'
import { calculateSkirt, cutRadius, fabricLength, waistRadius } from './skirt'

describe('waistRadius', () => {
  it('derives each skirt type from a 68cm waist', () => {
    expect(waistRadius(68, 'full')).toBeCloseTo(10.82, 2)
    expect(waistRadius(68, 'threeQuarter')).toBeCloseTo(14.43, 2)
    expect(waistRadius(68, 'half')).toBeCloseTo(21.65, 2)
    expect(waistRadius(68, 'quarter')).toBeCloseTo(43.29, 2)
  })

  it('sews back to the waist it came from', () => {
    const radius = waistRadius(68, 'full')
    expect(2 * Math.PI * radius).toBeCloseTo(68, 10)
  })
})

describe('cutRadius', () => {
  it('takes the seam allowance off the radius', () => {
    expect(cutRadius(10.82)).toBeCloseTo(9.32, 2)
  })

  it('clamps to zero when the seam allowance exceeds the radius', () => {
    expect(cutRadius(SEAM_ALLOWANCE / 2)).toBe(0)
  })
})

describe('fabricLength', () => {
  it('spans the full circle, not a single radius', () => {
    expect(fabricLength(10.82, 60)).toBeCloseTo(145.64, 2)
  })

  it('stays positive when the skirt has no length', () => {
    expect(fabricLength(10.82, 0)).toBeCloseTo(2 * (10.82 + HEM_ALLOWANCE), 2)
  })
})

describe('calculateSkirt', () => {
  it('resolves a length preset', () => {
    const result = calculateSkirt({
      waistCm: 68,
      skirtType: 'full',
      lengthPreset: 'midi',
    })

    expect(result.skirtLengthCm).toBe(LENGTH_PRESETS.midi)
    expect(result.waistRadiusCm).toBeCloseTo(10.82, 2)
    expect(result.cutRadiusCm).toBeCloseTo(9.32, 2)
    // Doubling amplifies rounding error, so assert the true value here rather
    // than the one you get from a radius already rounded to 2dp (145.64).
    expect(result.fabricLengthCm).toBeCloseTo(145.6451, 3)
  })

  it('uses the custom length when one is given', () => {
    const result = calculateSkirt({
      waistCm: 72,
      skirtType: 'threeQuarter',
      lengthPreset: 'custom',
      customLengthCm: 45,
    })

    expect(result.skirtLengthCm).toBe(45)
    expect(result.waistRadiusCm).toBeCloseTo(15.2789, 3)
    expect(result.fabricLengthCm).toBeCloseTo(124.5577, 3)
  })

  it('returns zeroes for a zero waist rather than NaN', () => {
    const result = calculateSkirt({
      waistCm: 0,
      skirtType: 'full',
      lengthPreset: 'mini',
    })

    expect(result.waistRadiusCm).toBe(0)
    expect(result.cutRadiusCm).toBe(0)
    expect(Number.isNaN(result.fabricLengthCm)).toBe(false)
    expect(result.fabricLengthCm).toBeGreaterThan(0)
  })
})
