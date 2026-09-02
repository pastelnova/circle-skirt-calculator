import { SegmentedControl } from './SegmentedControl'
import type { Unit } from '../types/skirt'

const OPTIONS: readonly { value: Unit; label: string }[] = [
  { value: 'in', label: 'Inches' },
  { value: 'cm', label: 'cm' },
]

interface UnitToggleProps {
  value: Unit
  onChange: (unit: Unit) => void
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <SegmentedControl
      label="Units"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      compact
    />
  )
}
