import { useState } from 'react'
import { LengthSelector } from './components/LengthSelector'
import { ResultsDisplay } from './components/ResultsDisplay'
import { SkirtTypeSelector } from './components/SkirtTypeSelector'
import { UnitToggle } from './components/UnitToggle'
import { WaistInput } from './components/WaistInput'
import { calculateSkirt, toSkirtInput } from './lib/skirt'
import { useMeasurementDraft } from './lib/useMeasurementDraft'
import type { LengthPreset, SkirtType, Unit } from './types/skirt'

function App() {
  const [unit, setUnit] = useState<Unit>('cm')
  const [skirtType, setSkirtType] = useState<SkirtType>('full')
  const [lengthPreset, setLengthPreset] = useState<LengthPreset>('midi')
  const customLength = useMeasurementDraft(unit)
  const waist = useMeasurementDraft(unit)

  function handleUnitChange(next: Unit) {
    setUnit(next)
    customLength.reformat(next)
    waist.reformat(next)
  }

  // Derived on every render rather than stored, so the numbers cannot drift out
  // of step with the inputs they came from.
  const input = toSkirtInput({
    waistCm: waist.cm,
    skirtType,
    lengthPreset,
    customLengthCm: customLength.cm,
  })
  const result = input === null ? null : calculateSkirt(input)

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
            customLength={customLength.input}
            onCustomLengthChange={customLength.change}
          />
          <WaistInput
            value={waist.input}
            onChange={waist.change}
            unit={unit}
          />
        </div>

        <ResultsDisplay result={result} unit={unit} />
      </section>
    </main>
  )
}

export default App
