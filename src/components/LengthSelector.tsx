import { MeasurementInput } from './MeasurementInput'
import { SegmentedControl } from './SegmentedControl'
import { LENGTH_PRESETS } from '../lib/constants'
import { formatMeasurement, unitLabel } from '../lib/units'
import type { LengthPreset, Unit } from '../types/skirt'

// Split from the option list so the helper sentence can name the selected
// preset without looking it up in an array.
const LABELS: Record<LengthPreset, string> = {
  mini: 'Mini',
  midi: 'Midi',
  maxi: 'Maxi',
  custom: 'Custom',
}

const ORDER: readonly LengthPreset[] = ['mini', 'midi', 'maxi', 'custom']

const OPTIONS = ORDER.map((value) => ({ value, label: LABELS[value] }))

interface LengthSelectorProps {
  value: LengthPreset
  onChange: (preset: LengthPreset) => void
  unit: Unit
  customLength: string
  onCustomLengthChange: (value: string) => void
  customLengthError?: string
}

export function LengthSelector({
  value,
  onChange,
  unit,
  customLength,
  onCustomLengthChange,
  customLengthError,
}: LengthSelectorProps) {
  return (
    <div>
      <SegmentedControl
        label="Length"
        options={OPTIONS}
        value={value}
        onChange={onChange}
      />
      {value === 'custom' ? (
        <div className="mt-2">
          <MeasurementInput
            value={customLength}
            onChange={onCustomLengthChange}
            unit={unit}
            placeholder="Custom length"
            label="Custom length"
            error={customLengthError}
          />
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-muted">
          {LABELS[value]} falls at {formatMeasurement(LENGTH_PRESETS[value], unit)}{' '}
          {unitLabel(unit)} from the waist.
        </p>
      )}
    </div>
  )
}
