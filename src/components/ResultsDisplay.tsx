import { HEM_ALLOWANCE, SEAM_ALLOWANCE } from '../lib/constants'
import { formatMeasurement, formatResult, unitLabel } from '../lib/units'
import type { SkirtResult, Unit } from '../types/skirt'

interface ResultsDisplayProps {
  result: SkirtResult | null
  unit: Unit
}

export function ResultsDisplay({ result, unit }: ResultsDisplayProps) {
  const label = unitLabel(unit)
  const tiles = [
    {
      name: 'Cut radius',
      value: result && formatResult(result.cutRadiusCm, unit),
    },
    {
      name: 'Fabric length',
      value: result && formatResult(result.fabricLengthCm, unit),
    },
  ]

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border pt-8">
      {tiles.map((tile) => (
        <div key={tile.name} className="rounded-md bg-sunken p-5">
          <div className="mb-2 text-[12px] font-semibold tracking-[0.04em] text-muted uppercase">
            {tile.name}
          </div>
          <div
            className={`font-mono text-[30px] leading-[1.1] tabular-nums ${
              tile.value === null ? 'text-faint' : 'text-accent'
            }`}
          >
            {tile.value ?? '--'}
            <span className="ml-1 text-[15px] text-muted">{label}</span>
          </div>
        </div>
      ))}
      <p
        className={`col-span-2 text-[13px] ${result === null ? 'text-faint' : 'text-muted'}`}
      >
        {result === null
          ? 'Enter your waist measurement to see the numbers.'
          : `After a ${formatMeasurement(SEAM_ALLOWANCE, unit)} ${label} seam allowance, plus ${formatMeasurement(HEM_ALLOWANCE, unit)} ${label} for the hem.`}
      </p>
    </div>
  )
}
