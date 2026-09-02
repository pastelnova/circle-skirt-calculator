import { useState } from 'react'
import { LengthSelector } from './components/LengthSelector'
import { SkirtTypeSelector } from './components/SkirtTypeSelector'
import { UnitToggle } from './components/UnitToggle'
import { HEM_ALLOWANCE, SEAM_ALLOWANCE } from './lib/constants'
import {
  formatMeasurement,
  fromDisplay,
  parseMeasurement,
  unitLabel,
} from './lib/units'
import type { LengthPreset, SkirtType, Unit } from './types/skirt'

function App() {
  const [unit, setUnit] = useState<Unit>('cm')
  const [skirtType, setSkirtType] = useState<SkirtType>('full')
  const [lengthPreset, setLengthPreset] = useState<LengthPreset>('midi')
  // The draft is what the field shows; the cm value is canonical and never
  // rounded for display. See the spec on why both exist.
  const [customLengthInput, setCustomLengthInput] = useState('')
  const [customLengthCm, setCustomLengthCm] = useState<number | null>(null)
  const label = unitLabel(unit)

  function handleUnitChange(next: Unit) {
    setUnit(next)
    // Rewritten from the canonical cm value, never from the rounded string
    // already in the field, or the number decays on every toggle.
    if (customLengthCm !== null) {
      setCustomLengthInput(formatMeasurement(customLengthCm, next))
    }
  }

  function handleCustomLengthChange(next: string) {
    setCustomLengthInput(next)
    const parsed = parseMeasurement(next)
    setCustomLengthCm(parsed === null ? null : fromDisplay(parsed, unit))
  }

  return (
    <main className="mx-auto max-w-measure px-3 py-5 sm:px-5 sm:py-12">
      <header className="mb-8">
        <h1 className="mb-1 font-serif text-[30px] font-semibold tracking-[-0.01em] text-text">
          Circle Skirt Calculator
        </h1>
        <p className="text-muted">Waist to pattern, in one step.</p>
      </header>

      <section className="rounded-lg border border-border bg-surface px-3 py-5 sm:px-5 sm:py-8">
        <div className="space-y-5">
          <UnitToggle value={unit} onChange={handleUnitChange} />
          <SkirtTypeSelector value={skirtType} onChange={setSkirtType} />
          <LengthSelector
            value={lengthPreset}
            onChange={setLengthPreset}
            unit={unit}
            customLength={customLengthInput}
            onCustomLengthChange={handleCustomLengthChange}
          />
        </div>

        <p className="mt-8 border-t border-border pt-8 text-[13px] text-muted">
          After a {formatMeasurement(SEAM_ALLOWANCE, unit)} {label} seam
          allowance, plus {formatMeasurement(HEM_ALLOWANCE, unit)} {label} for
          the hem.
        </p>
      </section>
    </main>
  )
}

export default App
