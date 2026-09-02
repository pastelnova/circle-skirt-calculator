import { SegmentedControl } from './SegmentedControl'
import type { SkirtType } from '../types/skirt'

const OPTIONS: readonly { value: SkirtType; label: string }[] = [
  { value: 'quarter', label: 'Quarter' },
  { value: 'half', label: 'Half' },
  { value: 'threeQuarter', label: '3/4' },
  { value: 'full', label: 'Full' },
]

interface SkirtTypeSelectorProps {
  value: SkirtType
  onChange: (skirtType: SkirtType) => void
}

export function SkirtTypeSelector({ value, onChange }: SkirtTypeSelectorProps) {
  return (
    <SegmentedControl
      label="Skirt type"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  )
}
