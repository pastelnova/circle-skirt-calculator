// Every measurement here is centimetres.

export const SEAM_ALLOWANCE = 1.5
export const HEM_ALLOWANCE = 2

// Wide enough to cover a child's skirt through a plus-size adult one. A value
// outside this is a typo or a unit mix-up, not a body.
export const WAIST_MIN_CM = 40
export const WAIST_MAX_CM = 300

// Below the minimum there is no skirt left once the hem is turned, and above the
// maximum the fabric no longer reaches the floor from any waist.
export const CUSTOM_LENGTH_MIN_CM = 10
export const CUSTOM_LENGTH_MAX_CM = 200

// Starting points, not a researched standard. Adjust once real garments are
// measured.
export const LENGTH_PRESETS = {
  mini: 40,
  midi: 60,
  maxi: 95,
} as const
