import { useId } from 'react'

interface SegmentedControlProps<T extends string> {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Sized to its content instead of filling the row. Used by the unit toggle. */
  compact?: boolean
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  compact = false,
}: SegmentedControlProps<T>) {
  const labelId = useId()

  return (
    <div>
      <span
        id={labelId}
        className="mb-2 block text-[13px] font-semibold tracking-[0.02em] text-muted uppercase"
      >
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className={`flex gap-1 rounded-md bg-sunken p-1 ${compact ? 'w-fit' : ''}`}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-sm border py-2 text-sm whitespace-nowrap ${
                compact ? 'min-w-14 px-3' : 'flex-1 px-2 sm:px-3'
              } ${
                selected
                  ? 'border-border-strong bg-surface font-semibold text-accent'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
