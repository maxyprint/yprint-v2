import { describe, it, expect } from 'vitest'
import { calcPrintCoords } from './calcCoords'

describe('calcPrintCoords', () => {
  it('computes correct coords for M-size shirt (chest 104 cm, rib 20 cm)', () => {
    // printWidthCm=32, printHeightCm=40, printYOffsetMm=10
    // offsetX = (104*10 - 32*10) / 2 = (1040 - 320) / 2 = 360 mm
    // offsetY = 20*10 + 10 = 210 mm
    // width = 32*10 = 320 mm, height = 40*10 = 400 mm
    const result = calcPrintCoords(
      { chest_cm: 104, length_cm: 72, rib_height_cm: 20 },
      32, 40, 10
    )
    expect(result.offsetX_mm).toBe(360)
    expect(result.offsetY_mm).toBe(210)
    expect(result.width_mm).toBe(320)
    expect(result.height_mm).toBe(400)
  })

  it('computes correct coords for S-size shirt (chest 92 cm, rib 18 cm)', () => {
    // offsetX = (920 - 300) / 2 = 310 mm
    // offsetY = 18*10 + 0 = 180 mm
    // width = 300 mm, height = 350 mm
    const result = calcPrintCoords(
      { chest_cm: 92, length_cm: 68, rib_height_cm: 18 },
      30, 35, 0
    )
    expect(result.offsetX_mm).toBe(310)
    expect(result.offsetY_mm).toBe(180)
    expect(result.width_mm).toBe(300)
    expect(result.height_mm).toBe(350)
  })
})
