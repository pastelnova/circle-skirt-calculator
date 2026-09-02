import { useId } from 'react'
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
  /** Render `label` above the field instead of hiding it in an `aria-label`.
   *  Never both: a visible label and an aria-label give a sighted user one name
   *  and a screen reader another. */
  showLabel?: boolean
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
  showLabel = false,
}: MeasurementInputProps) {
  const id = useId()

  return (
    <div>
      {showLabel && (
        <label
          htmlFor={id}
          className="mb-2 block text-[13px] font-semibold tracking-[0.02em] text-muted uppercase"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 rounded-md border border-border-strong bg-surface p-3 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-label={showLabel ? undefined : label}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent font-mono text-[17px] text-text tabular-nums outline-none placeholder:font-sans placeholder:text-[15px] placeholder:text-faint"
        />
        <span className="font-mono text-sm text-muted">{unitLabel(unit)}</span>
      </div>
    </div>
  )
}
