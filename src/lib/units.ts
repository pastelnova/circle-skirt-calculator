// Every calculation runs in cm. Convert at the input and output boundary only,
// so no formula ever mixes units.
export const CM_PER_INCH = 2.54

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH
}
