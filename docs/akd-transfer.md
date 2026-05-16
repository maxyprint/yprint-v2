# AllesKlarDruck (AKD) API Transfer

## Zweck

Übermittlung von Druckaufträgen an die AllesKlarDruck-Druckerei (Kornit Atlas Max, DTG).
Der Admin öffnet einen Auftrag unter `/admin/orders/[id]`, prüft die Vorschau und bestätigt die Übermittlung.

---

## Endpunkte

| Method | URL | Funktion |
|---|---|---|
| GET | `/api/admin/orders/[id]/print-provider` | Payload + Validierung anzeigen (kein Senden) |
| POST | `/api/admin/orders/[id]/print-provider` | Payload validieren und an AKD senden |
| POST | `/api/admin/orders/[id]/print-provider?force=true` | Senden trotz Warnungen (nie trotz Errors) |

---

## AKD-Payload-Struktur

```json
{
  "orderNumber": "YP-2024-001",
  "orderDate": "2024-01-15T10:00:00Z",
  "shipping": {
    "recipient": {
      "name": "Max Mustermann",
      "street": "Musterstraße 10, Top 4 Stiege 2",
      "city": "Wien",
      "postalCode": "1100",
      "country": "AT"
    },
    "sender": {
      "name": "YPrint",
      "street": "Rottendorfer Straße 35A",
      "city": "Würzburg",
      "postalCode": "97074",
      "country": "DE"
    }
  },
  "orderPositions": [
    {
      "type": "TSHIRT",
      "printMethod": "DTG",
      "manufacturer": "yprint",
      "series": "SS25",
      "color": "Black",
      "size": "M",
      "quantity": 1,
      "printPositions": [
        {
          "position": "front",
          "width": 320,
          "height": 400,
          "unit": "mm",
          "offsetX": 100,
          "offsetY": 80,
          "offsetUnit": "mm",
          "referencePoint": "top-left",
          "resolution": 300,
          "colorProfile": "sRGB",
          "bleed": 2,
          "scaling": "proportional",
          "printQuality": "standard",
          "printFile": "https://cdn.supabase.yprint.de/print-pngs/view_front_print.png"
        }
      ]
    }
  ]
}
```

---

## Erlaubte Werte

| Feld | Erlaubte Werte |
|---|---|
| `orderPositions[].type` | `TSHIRT`, `HOODIE`, `ZIPPER_JACKET`, `POLO`, `LONG_SLEEVE` |
| `orderPositions[].printMethod` | `DTG`, `DTF`, `SCREEN` |
| `shipping.*.country` | ISO 3166-1 Alpha-2 aus Allowlist (DE, AT, CH, FR, NL, BE, IT, ES, PL, LU, DK, SE, FI, NO, CZ, SK, HU, RO, BG, HR, SI, EE, LV, LT, PT, IE, GR) |
| `printPositions[].unit` | `mm` |
| `printPositions[].offsetUnit` | `mm` |
| `printPositions[].referencePoint` | `top-left` |
| `printPositions[].colorProfile` | `sRGB` |
| `printPositions[].scaling` | `proportional` |
| `printPositions[].printQuality` | `standard` |

---

## Validierungsregeln

Implementiert in `src/lib/print/akd-validation.ts`.

### Errors (blockieren immer — auch mit `force=true`)

| Feld | Regel |
|---|---|
| `orderNumber` | nicht leer |
| `shipping.recipient.name` | nicht leer |
| `shipping.recipient.street` | nicht leer |
| `shipping.recipient.city` | nicht leer |
| `shipping.recipient.postalCode` | nicht leer |
| `shipping.recipient.country` | in Allowlist |
| PLZ 4-stellig + city=Wien + country≠AT | Wien-PLZ ist immer AT |
| `orderPositions[].type` | in ALLOWED_TYPES |
| `orderPositions[].printMethod` | in ALLOWED_METHODS |
| `orderPositions[].size` | nicht null/leer für sized products |
| `orderPositions[].quantity` | > 0 |
| `printPositions[].printFile` | gültige https://-URL |
| `printPositions[].width` | > 0 |
| `printPositions[].height` | > 0 |
| `printPositions[].offsetX` | ≥ 0 |
| `printPositions[].offsetY` | ≥ 0 |

### Warnings (blockieren ohne `force=true`, können per UI-Override übergangen werden)

| Feld | Regel |
|---|---|
| PLZ 4-stellig + country=DE | mögliche AT-Adresse |
| `printPositions[].width` | > 600 mm |
| `printPositions[].height` | > 700 mm |
| `printPositions[].offsetX` | > 400 mm |
| `printPositions[].offsetY` | > 500 mm |
| `printPositions[].resolution` | < 150 DPI |

---

## Adressmodell

`user_addresses` enthält jetzt `address_line2 TEXT` (Stiege, Top, Etage, c/o).

**Mapping in AKD-Payload:**
- `address_line2` wird intern getrennt gespeichert
- Für die AKD-API (kein eigenes Feld) wird es kontrolliert an `street` angehängt: `Straße Nr, address_line2`
- `company` bleibt für echte Firmen — `address_line2` darf hier nicht landen

**Migration:** `supabase/migrations/003_add_address_line2.sql` — manuell in Supabase SQL Editor ausführen.

---

## HTTP-Status der POST-Antworten

| Status | Bedeutung |
|---|---|
| 200 | Erfolg — Payload gesendet, `data` enthält AKD-Antwort |
| 400 | Payload-Aufbau fehlgeschlagen (Template nicht gefunden, etc.) |
| 403 | Kein Admin-Zugriff |
| 409 | Warnungen vorhanden — mit `?force=true` erneut senden |
| 422 | Kritische Fehler — Senden unmöglich, `validation` enthält Details |
| 500 | Env-Vars fehlen oder interner Fehler |
| 502 | AKD-API hat Fehler zurückgegeben |

---

## Offene Punkte

- **Dateinamen-Konvention**: Erwartet AKD/Kornit spezifische Dateinamen wie `job-123-front.png`? Aktuell werden Supabase-Storage-URLs übergeben.
- **AKD-Feld `addressLine2`**: Hat die AKD-API ein eigenes `addressLine2`-Feld? Dann Mapping in `print-provider/route.ts` anpassen.
- **Position-Werte**: Welche `position`-Werte akzeptiert AKD genau? Bekannt: `front`, `back`. Weitere?
- **HEAD-Check**: Optionaler Erreichbarkeitscheck auf `printFile`-URLs vor Versand (mit Timeout ~3s).
- **Stornierung**: Unterstützt AKD eine Stornierung per API?
- **Retry-Verhalten**: Timeout-/Retry-Logik bei AKD-Antwortfehlern.
- **print_provider_status**: Eigene Spalte für Druckstatus (pending/sent/accepted/rejected) sinnvoll?

---

## Koordinatenberechnung

Implementiert in `src/lib/print/calcCoords.ts`.

```
offsetX_mm = (chest_cm * 10 - printWidthCm * 10) / 2
offsetY_mm = rib_height_cm * 10 + printYOffsetMm
width_mm   = printWidthCm * 10
height_mm  = printHeightCm * 10
```

Varianten je nach Datenlage:
1. `_measurements.per_size[size]` vorhanden → `calcPrintCoords()` mit größenspezifischen Maßen
2. `design_pngs.print_area_mm` + `printZone` → prozentuale Offset-Berechnung
3. Fallback → volle physische Abmessungen des Produkts
