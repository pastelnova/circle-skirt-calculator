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
  /** Message to show beneath the field. Absent means the field is fine. */
  error?: string
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
  error,
}: MeasurementInputProps) {
  const id = useId()
  const errorId = `${id}-error`

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
      <div
        className={`flex items-center gap-2 rounded-md border p-3 focus-within:ring-3 ${
          error
            ? 'border-error-border bg-error-soft focus-within:border-error focus-within:ring-error-soft'
            : 'border-border-strong bg-surface focus-within:border-accent focus-within:ring-accent-soft'
        }`}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-label={showLabel ? undefined : label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent font-mono text-[17px] text-text tabular-nums outline-none placeholder:font-sans placeholder:text-[15px] placeholder:text-faint"
        />
        <span className="font-mono text-sm text-muted">{unitLabel(unit)}</span>
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-2 flex gap-2 text-[13px] text-error before:font-bold before:content-['!']"
        >
          {error}
        </p>
      )}
    </div>
  )
}
