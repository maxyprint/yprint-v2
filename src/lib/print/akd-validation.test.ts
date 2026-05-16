import { describe, it, expect } from 'vitest'
import { validateAkdPayload } from './akd-validation'

const VALID_PRINT_POSITION = {
  position: 'front',
  width: 300, height: 400, unit: 'mm',
  offsetX: 100, offsetY: 80, offsetUnit: 'mm',
  referencePoint: 'top-left',
  resolution: 300,
  colorProfile: 'sRGB',
  bleed: 2,
  scaling: 'proportional',
  printQuality: 'standard',
  printFile: 'https://cdn.yprint.de/prints/abc123/view_front_print.png',
}

const VALID_ORDER_POSITION = {
  type: 'TSHIRT',
  printMethod: 'DTG',
  manufacturer: 'yprint',
  series: 'SS25',
  color: 'Black',
  size: 'M',
  quantity: 1,
  printPositions: [VALID_PRINT_POSITION],
}

const VALID_PAYLOAD = {
  orderNumber: 'YP-2024-001',
  orderDate: '2024-01-15T10:00:00Z',
  shipping: {
    recipient: {
      name: 'Max Mustermann',
      street: 'Musterstraße 1',
      city: 'Berlin',
      postalCode: '10115',
      country: 'DE',
    },
    sender: {
      name: 'YPrint',
      street: 'Rottendorfer Straße 35A',
      city: 'Würzburg',
      postalCode: '97074',
      country: 'DE',
    },
  },
  orderPositions: [VALID_ORDER_POSITION],
}

describe('validateAkdPayload', () => {
  it('accepts a fully valid payload', () => {
    const r = validateAkdPayload(VALID_PAYLOAD)
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
    expect(r.warnings).toHaveLength(0)
  })

  it('errors on missing orderNumber', () => {
    const r = validateAkdPayload({ ...VALID_PAYLOAD, orderNumber: '' })
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field === 'orderNumber')).toBe(true)
  })

  it('errors when size is null for TSHIRT', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{ ...VALID_ORDER_POSITION, size: null }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('size'))).toBe(true)
  })

  it('errors when size is empty string for TSHIRT', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{ ...VALID_ORDER_POSITION, size: '' }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('size'))).toBe(true)
  })

  it('errors on Wien PLZ with country DE (not AT)', () => {
    const payload = {
      ...VALID_PAYLOAD,
      shipping: {
        ...VALID_PAYLOAD.shipping,
        recipient: { ...VALID_PAYLOAD.shipping.recipient, postalCode: '1100', city: 'Wien', country: 'DE' },
      },
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field === 'shipping.recipient.country')).toBe(true)
  })

  it('accepts Wien PLZ with correct country AT', () => {
    const payload = {
      ...VALID_PAYLOAD,
      shipping: {
        ...VALID_PAYLOAD.shipping,
        recipient: { ...VALID_PAYLOAD.shipping.recipient, postalCode: '1100', city: 'Wien', country: 'AT' },
      },
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
    expect(r.warnings).toHaveLength(0)
  })

  it('warns on generic 4-digit PLZ with country DE (non-Wien)', () => {
    const payload = {
      ...VALID_PAYLOAD,
      shipping: {
        ...VALID_PAYLOAD.shipping,
        recipient: { ...VALID_PAYLOAD.shipping.recipient, postalCode: '9020', city: 'Klagenfurt', country: 'DE' },
      },
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(true)
    expect(r.warnings.some(w => w.field === 'shipping.recipient.country')).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it.each([
    ['D'],
    ['DEU'],
    ['de'],
    ['XX'],
    ['12'],
  ])('errors on invalid country code "%s"', (country) => {
    const payload = {
      ...VALID_PAYLOAD,
      shipping: {
        ...VALID_PAYLOAD.shipping,
        recipient: { ...VALID_PAYLOAD.shipping.recipient, country },
      },
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field === 'shipping.recipient.country')).toBe(true)
  })

  it('accepts valid country AT', () => {
    const payload = {
      ...VALID_PAYLOAD,
      shipping: {
        ...VALID_PAYLOAD.shipping,
        recipient: { ...VALID_PAYLOAD.shipping.recipient, postalCode: '6020', city: 'Innsbruck', country: 'AT' },
      },
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('errors on missing printFile URL', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{
        ...VALID_ORDER_POSITION,
        printPositions: [{ ...VALID_PRINT_POSITION, printFile: '' }],
      }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('printFile'))).toBe(true)
  })

  it('errors on http (non-https) printFile URL', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{
        ...VALID_ORDER_POSITION,
        printPositions: [{ ...VALID_PRINT_POSITION, printFile: 'http://cdn.yprint.de/test.png' }],
      }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('printFile'))).toBe(true)
  })

  it('errors on negative offsetX', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{
        ...VALID_ORDER_POSITION,
        printPositions: [{ ...VALID_PRINT_POSITION, offsetX: -5 }],
      }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('offsetX'))).toBe(true)
  })

  it('warns on unusually large offsetX', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{
        ...VALID_ORDER_POSITION,
        printPositions: [{ ...VALID_PRINT_POSITION, offsetX: 450 }],
      }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(true)
    expect(r.warnings.some(w => w.field.includes('offsetX'))).toBe(true)
  })

  it('errors on quantity 0', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{ ...VALID_ORDER_POSITION, quantity: 0 }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('quantity'))).toBe(true)
  })

  it('errors on unknown product type', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{ ...VALID_ORDER_POSITION, type: 'JACKET' }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('type'))).toBe(true)
  })

  it('errors on unknown print method', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{ ...VALID_ORDER_POSITION, printMethod: 'LASER' }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.field.includes('printMethod'))).toBe(true)
  })

  it('warns on low resolution', () => {
    const payload = {
      ...VALID_PAYLOAD,
      orderPositions: [{
        ...VALID_ORDER_POSITION,
        printPositions: [{ ...VALID_PRINT_POSITION, resolution: 72 }],
      }],
    }
    const r = validateAkdPayload(payload)
    expect(r.valid).toBe(true)
    expect(r.warnings.some(w => w.field.includes('resolution'))).toBe(true)
  })

  it('errors on non-object payload', () => {
    const r = validateAkdPayload(null)
    expect(r.valid).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
  })
})
