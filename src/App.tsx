import { useEffect, useState } from 'react'
import { LengthSelector } from './components/LengthSelector'
import { RestoredNotice } from './components/RestoredNotice'
import { ResultsDisplay } from './components/ResultsDisplay'
import { SkirtTypeSelector } from './components/SkirtTypeSelector'
import { UnitToggle } from './components/UnitToggle'
import { WaistInput } from './components/WaistInput'
import { calculateSkirt, toSkirtInput } from './lib/skirt'
import {
  DEFAULT_SAVED_INPUTS,
  clearSavedInputs,
  isDefaultSavedInputs,
  readSavedInputs,
  writeSavedInputs,
  type SavedInputs,
} from './lib/storage'
import { useMeasurementDraft } from './lib/useMeasurementDraft'
import { validateMeasurement } from './lib/validation'
import type { LengthPreset, SkirtType, Unit } from './types/skirt'

function App() {
  // Read once, before the first paint. An effect would render the empty
  // defaults and then visibly overwrite them.
  const [restored] = useState(readSavedInputs)
  const initial = restored ?? DEFAULT_SAVED_INPUTS

  // unit is initialized first on purpose: the drafts below format their opening
  // value with the unit they are handed.
  const [unit, setUnit] = useState<Unit>(initial.unit)
  const [skirtType, setSkirtType] = useState<SkirtType>(initial.skirtType)
  const [lengthPreset, setLengthPreset] = useState<LengthPreset>(
    initial.lengthPreset,
  )
  const customLength = useMeasurementDraft(unit, initial.customLength)
  const waist = useMeasurementDraft(unit, initial.waist)

  const [noticeVisible, setNoticeVisible] = useState(restored !== null)

  function handleUnitChange(next: Unit) {
    setUnit(next)
    customLength.reformat(next)
    waist.reformat(next)
  }

  // The notice explains why the fields arrived pre-filled. The moment anything
  // is edited it is describing a state that no longer exists.
  function onEdit<T>(apply: (value: T) => void) {
    return (value: T) => {
      apply(value)
      setNoticeVisible(false)
    }
  }

  function handleStartOver() {
    setUnit(DEFAULT_SAVED_INPUTS.unit)
    setSkirtType(DEFAULT_SAVED_INPUTS.skirtType)
    setLengthPreset(DEFAULT_SAVED_INPUTS.lengthPreset)
    waist.reset()
    customLength.reset()
    clearSavedInputs()
    setNoticeVisible(false)
  }

  // Derived on every render rather than stored, so the numbers cannot drift out
  // of step with the inputs they came from.
  const waistCheck = validateMeasurement(waist.input, 'waist', unit)

  // An untouched field is the app's starting state, not a mistake to report.
  const waistError =
    waist.touched && waistCheck.status !== 'valid'
      ? waistCheck.message
      : undefined

  const lengthCheck = validateMeasurement(customLength.input, 'customLength', unit)

  // No touch requirement here: choosing Custom is itself the user asserting a
  // length exists, so an empty field is already a gap to fill.
  const customLengthError =
    lengthPreset === 'custom' && lengthCheck.status !== 'valid'
      ? lengthCheck.message
      : undefined

  // Only validated values are persisted, which is what lets a restored record be
  // trusted without re-checking every field on the way back in.
  const waistCm = waistCheck.status === 'valid' ? waistCheck.cm : null
  const customLengthCm = lengthCheck.status === 'valid' ? lengthCheck.cm : null

  useEffect(() => {
    const record: SavedInputs = {
      unit,
      skirtType,
      lengthPreset,
      waist: waistCm,
      customLength: customLengthCm,
    }
    if (!isDefaultSavedInputs(record)) {
      writeSavedInputs(record)
    }
  }, [unit, skirtType, lengthPreset, waistCm, customLengthCm])

  const input = toSkirtInput({
    waistCm,
    skirtType,
    lengthPreset,
    customLengthCm,
  })
  const result = input === null ? null : calculateSkirt(input)
  const hasErrors = waistError !== undefined || customLengthError !== undefined

  return (
    <main className="mx-auto max-w-measure px-3 py-5 sm:px-5 sm:py-12">
      <header className="mb-8">
        <h1 className="mb-1 font-serif text-[30px] font-semibold tracking-[-0.01em] text-text">
          Circle Skirt Calculator
        </h1>
        <p className="text-muted">Waist to pattern, in one step.</p>
      </header>

      <section className="rounded-lg border border-border bg-surface px-3 py-5 sm:px-5 sm:py-8">
        {noticeVisible && <RestoredNotice onStartOver={handleStartOver} />}

        <div className="space-y-5">
          <UnitToggle value={unit} onChange={onEdit(handleUnitChange)} />
          <SkirtTypeSelector value={skirtType} onChange={onEdit(setSkirtType)} />
          <LengthSelector
            value={lengthPreset}
            onChange={onEdit(setLengthPreset)}
            unit={unit}
            customLength={customLength.input}
            onCustomLengthChange={onEdit(customLength.change)}
            customLengthError={customLengthError}
          />
          <WaistInput
            value={waist.input}
            onChange={onEdit(waist.change)}
            unit={unit}
            error={waistError}
          />
        </div>

        <ResultsDisplay result={result} unit={unit} hasErrors={hasErrors} />
      </section>
    </main>
  )
}

export default App
