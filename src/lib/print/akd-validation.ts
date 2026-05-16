export type IssueType = 'error' | 'warning'

export interface ValidationIssue {
  type: IssueType
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

const ALLOWED_TYPES = ['TSHIRT', 'HOODIE', 'ZIPPER_JACKET', 'POLO', 'LONG_SLEEVE']
const ALLOWED_METHODS = ['DTG', 'DTF', 'SCREEN']
const SIZED_PRODUCTS = ['TSHIRT', 'HOODIE', 'ZIPPER_JACKET', 'POLO', 'LONG_SLEEVE']

// Real country allowlist — phantom codes like 'XX' are genuine errors
const ALLOWED_COUNTRIES = [
  'DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'IT', 'ES', 'PL',
  'LU', 'DK', 'SE', 'FI', 'NO', 'CZ', 'SK', 'HU', 'RO',
  'BG', 'HR', 'SI', 'EE', 'LV', 'LT', 'PT', 'IE', 'GR',
]

function err(errors: ValidationIssue[], field: string, message: string) {
  errors.push({ type: 'error', field, message })
}

function warn(warnings: ValidationIssue[], field: string, message: string) {
  warnings.push({ type: 'warning', field, message })
}

function isNonEmpty(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function isHttpsUrl(v: unknown): boolean {
  if (typeof v !== 'string') return false
  try {
    const u = new URL(v)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateAkdPayload(payload: unknown): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  if (!payload || typeof payload !== 'object') {
    err(errors, 'payload', 'Payload ist kein Objekt')
    return { valid: false, errors, warnings }
  }

  const p = payload as Record<string, unknown>

  // Order-level fields
  if (!isNonEmpty(p.orderNumber)) err(errors, 'orderNumber', 'orderNumber fehlt oder ist leer')

  // Shipping
  const shipping = p.shipping as Record<string, unknown> | undefined
  const recipient = shipping?.recipient as Record<string, unknown> | undefined

  if (!recipient) {
    err(errors, 'shipping.recipient', 'shipping.recipient fehlt')
  } else {
    if (!isNonEmpty(recipient.name))       err(errors, 'shipping.recipient.name',       'Empfängername fehlt')
    if (!isNonEmpty(recipient.street))     err(errors, 'shipping.recipient.street',     'Straße fehlt')
    if (!isNonEmpty(recipient.city))       err(errors, 'shipping.recipient.city',       'Stadt fehlt')
    if (!isNonEmpty(recipient.postalCode)) err(errors, 'shipping.recipient.postalCode', 'PLZ fehlt')

    const country    = (recipient.country as string) || ''
    const postalCode = (recipient.postalCode as string) || ''
    const city       = (recipient.city as string) || ''

    if (!ALLOWED_COUNTRIES.includes(country)) {
      err(errors, 'shipping.recipient.country',
        `Ländercode "${country}" nicht erlaubt. Erlaubt: ${ALLOWED_COUNTRIES.join(', ')}`)
    }

    const is4DigitPlz = /^\d{4}$/.test(postalCode)
    const isWienCity  = /^wien$/i.test(city)

    if (is4DigitPlz && isWienCity && country !== 'AT') {
      // Wien-PLZ can only be Austria — this is a production-critical error
      err(errors, 'shipping.recipient.country',
        `Wien-PLZ (${postalCode}) mit country="${country}" — muss AT sein`)
    } else if (is4DigitPlz && country === 'DE') {
      // 4-digit PLZ suspicious in combination with DE, but not conclusive
      warn(warnings, 'shipping.recipient.country',
        `4-stellige PLZ (${postalCode}) mit country=DE — mögliche Österreich-Adresse, bitte prüfen`)
    }
  }

  // Order positions
  const positions = Array.isArray(p.orderPositions) ? p.orderPositions : []
  if (positions.length === 0) {
    err(errors, 'orderPositions', 'Keine Bestellpositionen vorhanden')
  }

  positions.forEach((pos: unknown, i: number) => {
    const op = pos as Record<string, unknown>
    const prefix = `orderPositions[${i}]`

    if (!ALLOWED_TYPES.includes(op.type as string)) {
      err(errors, `${prefix}.type`,
        `Produkttyp "${op.type}" nicht erlaubt. Erlaubt: ${ALLOWED_TYPES.join(', ')}`)
    }

    if (!ALLOWED_METHODS.includes(op.printMethod as string)) {
      err(errors, `${prefix}.printMethod`,
        `Druckverfahren "${op.printMethod}" nicht erlaubt. Erlaubt: ${ALLOWED_METHODS.join(', ')}`)
    }

    if (SIZED_PRODUCTS.includes(op.type as string)) {
      const size = op.size as string | null | undefined
      if (!size || String(size).trim() === '' || size === 'null') {
        err(errors, `${prefix}.size`, `Größe fehlt für Produkt ${op.type}`)
      }
    }

    const qty = op.quantity as number
    if (typeof qty !== 'number' || qty <= 0) {
      err(errors, `${prefix}.quantity`, `Menge muss > 0 sein (aktuell: ${qty})`)
    }

    // Print positions
    const printPositions = Array.isArray(op.printPositions) ? op.printPositions : []
    if (printPositions.length === 0) {
      err(errors, `${prefix}.printPositions`, 'Keine Druckpositionen vorhanden')
    }

    printPositions.forEach((pp: unknown, j: number) => {
      const ppp = pp as Record<string, unknown>
      const ppPrefix = `${prefix}.printPositions[${j}]`

      if (!isHttpsUrl(ppp.printFile)) {
        err(errors, `${ppPrefix}.printFile`,
          `printFile muss eine https://-URL sein (aktuell: ${String(ppp.printFile).slice(0, 60)})`)
      }

      const width  = ppp.width  as number
      const height = ppp.height as number
      const offsetX = ppp.offsetX as number
      const offsetY = ppp.offsetY as number

      if (typeof width !== 'number' || width <= 0) {
        err(errors, `${ppPrefix}.width`, `Breite muss > 0 sein (aktuell: ${width})`)
      } else if (width > 600) {
        warn(warnings, `${ppPrefix}.width`, `Breite ${width} mm erscheint ungewöhnlich groß (> 600 mm)`)
      }

      if (typeof height !== 'number' || height <= 0) {
        err(errors, `${ppPrefix}.height`, `Höhe muss > 0 sein (aktuell: ${height})`)
      } else if (height > 700) {
        warn(warnings, `${ppPrefix}.height`, `Höhe ${height} mm erscheint ungewöhnlich groß (> 700 mm)`)
      }

      if (typeof offsetX === 'number' && offsetX < 0) {
        err(errors, `${ppPrefix}.offsetX`, `offsetX ${offsetX} ist negativ — Druckbereich liegt außerhalb des Produkts`)
      } else if (typeof offsetX === 'number' && offsetX > 400) {
        warn(warnings, `${ppPrefix}.offsetX`, `offsetX ${offsetX} mm erscheint ungewöhnlich groß`)
      }

      if (typeof offsetY === 'number' && offsetY < 0) {
        err(errors, `${ppPrefix}.offsetY`, `offsetY ${offsetY} ist negativ — Druckbereich liegt außerhalb des Produkts`)
      } else if (typeof offsetY === 'number' && offsetY > 500) {
        warn(warnings, `${ppPrefix}.offsetY`, `offsetY ${offsetY} mm erscheint ungewöhnlich groß`)
      }

      const resolution = ppp.resolution as number
      if (typeof resolution === 'number' && resolution < 150) {
        warn(warnings, `${ppPrefix}.resolution`, `Auflösung ${resolution} DPI ist unter 150 — mögliche Druckqualitätsprobleme`)
      }

      // DPI check: compare actual PNG pixel dimensions against print zone size at 300 DPI.
      const PX_PER_MM = 300 / 25.4
      const pxW = ppp._px_width as number | undefined
      const pxH = ppp._px_height as number | undefined
      if (pxW && pxW > 0 && typeof width === 'number' && width > 0) {
        const actualDpi = Math.round((pxW / width) * 25.4)
        if (actualDpi < 150) {
          err(errors, `${ppPrefix}.printFile`,
            `PNG-Breite ${pxW}px für ${width}mm ergibt nur ${actualDpi} DPI — min. 150 DPI erforderlich (empfohlen: ${Math.round(width * PX_PER_MM)}px)`)
        } else if (actualDpi < 300) {
          warn(warnings, `${ppPrefix}.printFile`,
            `PNG-Breite ${pxW}px für ${width}mm ergibt ${actualDpi} DPI — 300 DPI empfohlen (${Math.round(width * PX_PER_MM)}px)`)
        }
      }
      if (pxH && pxH > 0 && typeof height === 'number' && height > 0) {
        const actualDpi = Math.round((pxH / height) * 25.4)
        if (actualDpi < 150) {
          err(errors, `${ppPrefix}.printFile`,
            `PNG-Höhe ${pxH}px für ${height}mm ergibt nur ${actualDpi} DPI — min. 150 DPI erforderlich (empfohlen: ${Math.round(height * PX_PER_MM)}px)`)
        } else if (actualDpi < 300) {
          warn(warnings, `${ppPrefix}.printFile`,
            `PNG-Höhe ${pxH}px für ${height}mm ergibt ${actualDpi} DPI — 300 DPI empfohlen (${Math.round(height * PX_PER_MM)}px)`)
        }
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
