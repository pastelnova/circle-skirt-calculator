import type { Unit } from '../types/skirt'

const OPTIONS: { unit: Unit; label: string }[] = [
  { unit: 'in', label: 'Inches' },
  { unit: 'cm', label: 'cm' },
]

interface UnitToggleProps {
  value: Unit
  onChange: (unit: Unit) => void
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="flex w-fit gap-1 rounded-md bg-sunken p-1">
      {OPTIONS.map(({ unit, label }) => {
        const selected = unit === value
        return (
          <button
            key={unit}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(unit)}
            className={`min-w-14 rounded-sm border px-3 py-2 text-sm ${
              selected
                ? 'border-border-strong bg-surface font-semibold text-accent'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
