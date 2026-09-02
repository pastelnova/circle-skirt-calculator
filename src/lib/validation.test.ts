import { describe, expect, it } from 'vitest'
import { validateMeasurement } from './validation'

describe('validateMeasurement', () => {
  describe('empty input', () => {
    it('reports empty rather than invalid, with the field-specific prompt', () => {
      expect(validateMeasurement('', 'waist', 'cm')).toEqual({
        status: 'empty',
        message: 'Enter your waist measurement.',
      })
      expect(validateMeasurement('', 'customLength', 'cm')).toEqual({
        status: 'empty',
        message: 'Enter a custom length.',
      })
    })

    it('treats whitespace as empty', () => {
      expect(validateMeasurement('   ', 'waist', 'cm').status).toBe('empty')
    })
  })

  describe('unparseable input', () => {
    it.each(['abc', '45abc', '.', '-'])('rejects %s', (input) => {
      expect(validateMeasurement(input, 'waist', 'cm')).toEqual({
        status: 'invalid',
        message: 'Enter a number.',
      })
    })
  })

  describe('waist bounds in cm', () => {
    it.each(['0', '-5', '39.9', '300.1'])('rejects %s', (input) => {
      expect(validateMeasurement(input, 'waist', 'cm')).toEqual({
        status: 'invalid',
        message: 'Waist must be between 40 and 300 cm.',
      })
    })

    it.each([
      ['40', 40],
      ['80', 80],
      ['300', 300],
    ])('accepts %s at the boundary and inside it', (input, cm) => {
      expect(validateMeasurement(input, 'waist', 'cm')).toEqual({
        status: 'valid',
        cm,
      })
    })
  })

  describe('waist bounds in inches', () => {
    it('converts before comparing, so the same text can pass in one unit and fail in the other', () => {
      // 20 in is 50.8 cm, comfortably valid. 20 cm is below the minimum.
      expect(validateMeasurement('20', 'waist', 'in').status).toBe('valid')
      expect(validateMeasurement('20', 'waist', 'cm').status).toBe('invalid')

      // 250 in is 635 cm, far past the maximum. 250 cm is a valid waist.
      expect(validateMeasurement('250', 'waist', 'in').status).toBe('invalid')
      expect(validateMeasurement('250', 'waist', 'cm').status).toBe('valid')
    })

    it('returns cm, not the typed value', () => {
      const result = validateMeasurement('31.5', 'waist', 'in')
      expect(result.status).toBe('valid')
      if (result.status === 'valid') {
        expect(result.cm).toBeCloseTo(80.01, 5)
      }
    })

    it('states the bounds in the unit the user is working in', () => {
      expect(validateMeasurement('4', 'waist', 'in')).toEqual({
        status: 'invalid',
        message: 'Waist must be between 15.75 and 118.11 in.',
      })
    })
  })

  describe('custom length', () => {
    it.each(['0', '-1', '9.9', '200.1'])('rejects %s in cm', (input) => {
      expect(validateMeasurement(input, 'customLength', 'cm')).toEqual({
        status: 'invalid',
        message: 'Length must be between 10 and 200 cm.',
      })
    })

    it.each([
      ['10', 10],
      ['55', 55],
      ['200', 200],
    ])('accepts %s in cm', (input, cm) => {
      expect(validateMeasurement(input, 'customLength', 'cm')).toEqual({
        status: 'valid',
        cm,
      })
    })

    it('applies its own bounds in inches', () => {
      // 2 in is 5.08 cm, under the minimum. 20 in is 50.8 cm, a fine midi.
      expect(validateMeasurement('2', 'customLength', 'in')).toEqual({
        status: 'invalid',
        message: 'Length must be between 3.94 and 78.74 in.',
      })
      expect(validateMeasurement('20', 'customLength', 'in').status).toBe('valid')
    })
  })
})
