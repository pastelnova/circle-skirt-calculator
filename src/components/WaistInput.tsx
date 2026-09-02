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
        <summary className="group flex cursor-pointer list-none items-center gap-2 text-accent hover:text-accent-hover pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
          {/* A real element, not a ::before glyph: a pseudo-element cannot be
              centered in a circle without the flex context this span gets. */}
          <span
            aria-hidden="true"
            className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-accent pt-px pl-px text-[11px] font-bold text-accent-ink group-hover:bg-accent-hover"
          >
            ?
          </span>
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
