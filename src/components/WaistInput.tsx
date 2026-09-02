import { MeasurementInput } from './MeasurementInput'
import type { Unit } from '../types/skirt'

interface WaistInputProps {
  value: string
  onChange: (value: string) => void
  unit: Unit
  error?: string
}

export function WaistInput({ value, onChange, unit, error }: WaistInputProps) {
  return (
    <div>
      <MeasurementInput
        value={value}
        onChange={onChange}
        unit={unit}
        placeholder="Enter your waist"
        label="Waist measurement"
        showLabel
        error={error}
      />
      {/* Native details, so the keyboard and screen reader behavior comes for
          free. The marker is replaced rather than hidden, per the mockup. */}
      <details className="mt-2 text-[13px] text-muted">
        <summary className="cursor-pointer list-none text-accent before:font-bold before:content-['?_'] hover:text-accent-hover [&::-webkit-details-marker]:hidden">
          How to measure your waist
        </summary>
        <div className="mt-2 rounded-sm bg-sunken p-3">
          Measure around the narrowest part of your torso, usually just above the
          navel. Keep the tape snug but not tight, and level all the way around.
          Measure where the skirt will actually sit.
        </div>
      </details>
    </div>
  )
}
