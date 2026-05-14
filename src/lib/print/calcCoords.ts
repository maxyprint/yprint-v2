export interface SizeMeasurement {
  chest_cm: number
  length_cm: number
  rib_height_cm: number
  hem_cm?: number
  shoulder_cm?: number
  sleeve_cm?: number
  sleeve_opening_cm?: number
  neck_cm?: number
  biceps_cm?: number
}

export interface MeasurementsData {
  per_size: Record<string, SizeMeasurement>
  print_y_offset_mm: number
}

export interface PrintCoords {
  offsetX_mm: number
  offsetY_mm: number
  width_mm: number
  height_mm: number
}

export function calcPrintCoords(
  m: SizeMeasurement,
  printWidthCm: number,
  printHeightCm: number,
  printYOffsetMm: number,
): PrintCoords {
  return {
    offsetX_mm:  Math.round(((m.chest_cm * 10 - printWidthCm * 10) / 2) * 10) / 10,
    offsetY_mm:  Math.round((m.rib_height_cm * 10 + printYOffsetMm) * 10) / 10,
    width_mm:    printWidthCm * 10,
    height_mm:   printHeightCm * 10,
  }
}
