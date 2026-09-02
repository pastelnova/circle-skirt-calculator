import { unitLabel } from '../lib/units'
import type { Unit } from '../types/skirt'

interface MeasurementInputProps {
  value: string
  onChange: (value: string) => void
  unit: Unit
  placeholder: string
  /** Accessible name. The mockup shows a placeholder only, which leaves the
   *  field unnamed once text is typed. */
  label: string
}

// type="text" rather than type="number": number silently discards input it
// cannot parse, so the user's own bad value could never be shown back to them
// beside a validation message.
export function MeasurementInput({
  value,
  onChange,
  unit,
  placeholder,
  label,
}: MeasurementInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border-strong bg-surface p-3 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 border-none bg-transparent font-mono text-[17px] text-text tabular-nums outline-none placeholder:font-sans placeholder:text-[15px] placeholder:text-faint"
      />
      <span className="font-mono text-sm text-muted">{unitLabel(unit)}</span>
    </div>
  )
}
