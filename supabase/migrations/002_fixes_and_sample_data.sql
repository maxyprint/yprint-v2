-- Migration 002: Fix missing unique constraint + sample template data
-- Run this in Supabase SQL editor

-- ─── Fix: unique constraint on design_pngs for upsert to work ─────────────────
ALTER TABLE design_pngs
  ADD CONSTRAINT design_pngs_design_view_unique UNIQUE (design_id, view_id);

-- ─── Sample Template: Classic T-Shirt ─────────────────────────────────────────
INSERT INTO design_templates (
  id,
  name,
  slug,
  category,
  status,
  physical_width_cm,
  physical_height_cm,
  sizes,
  variations,
  base_price,
  pricing,
  in_stock
) VALUES (
  gen_random_uuid(),
  'Classic T-Shirt',
  'classic-t-shirt',
  't-shirt',
  'published',
  30,
  40,
  '[
    {"id": "XS", "name": "XS", "order": 1},
    {"id": "S",  "name": "S",  "order": 2},
    {"id": "M",  "name": "M",  "order": 3},
    {"id": "L",  "name": "L",  "order": 4},
    {"id": "XL", "name": "XL", "order": 5},
    {"id": "XXL","name": "XXL","order": 6}
  ]'::jsonb,
  '{
    "white": {
      "id": "white",
      "name": "Weiß",
      "color": "#FFFFFF",
      "is_default": true,
      "is_dark_shirt": false,
      "views": {
        "front": {
          "id": "front",
          "name": "Vorderseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 130, "top": 100, "width": 560, "height": 750},
          "imageZone": {"left": 150, "top": 120, "width": 520, "height": 700},
          "printZone": {"left": 180, "top": 180, "width": 460, "height": 560}
        },
        "back": {
          "id": "back",
          "name": "Rückseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 130, "top": 100, "width": 560, "height": 750},
          "imageZone": {"left": 150, "top": 120, "width": 520, "height": 700},
          "printZone": {"left": 180, "top": 180, "width": 460, "height": 560}
        }
      }
    },
    "black": {
      "id": "black",
      "name": "Schwarz",
      "color": "#1A1A1A",
      "is_default": false,
      "is_dark_shirt": true,
      "views": {
        "front": {
          "id": "front",
          "name": "Vorderseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 130, "top": 100, "width": 560, "height": 750},
          "imageZone": {"left": 150, "top": 120, "width": 520, "height": 700},
          "printZone": {"left": 180, "top": 180, "width": 460, "height": 560}
        },
        "back": {
          "id": "back",
          "name": "Rückseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 130, "top": 100, "width": 560, "height": 750},
          "imageZone": {"left": 150, "top": 120, "width": 520, "height": 700},
          "printZone": {"left": 180, "top": 180, "width": 460, "height": 560}
        }
      }
    }
  }'::jsonb,
  24.99,
  '{
    "XS":  {"base": 24.99},
    "S":   {"base": 24.99},
    "M":   {"base": 24.99},
    "L":   {"base": 24.99},
    "XL":  {"base": 26.99},
    "XXL": {"base": 28.99}
  }'::jsonb,
  true
);

-- ─── Sample Template: Hoodie ───────────────────────────────────────────────────
INSERT INTO design_templates (
  id,
  name,
  slug,
  category,
  status,
  physical_width_cm,
  physical_height_cm,
  sizes,
  variations,
  base_price,
  pricing,
  in_stock
) VALUES (
  gen_random_uuid(),
  'Premium Hoodie',
  'premium-hoodie',
  'hoodie',
  'published',
  32,
  44,
  '[
    {"id": "XS", "name": "XS", "order": 1},
    {"id": "S",  "name": "S",  "order": 2},
    {"id": "M",  "name": "M",  "order": 3},
    {"id": "L",  "name": "L",  "order": 4},
    {"id": "XL", "name": "XL", "order": 5},
    {"id": "XXL","name": "XXL","order": 6}
  ]'::jsonb,
  '{
    "white": {
      "id": "white",
      "name": "Weiß",
      "color": "#F5F5F5",
      "is_default": true,
      "is_dark_shirt": false,
      "views": {
        "front": {
          "id": "front",
          "name": "Vorderseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 140, "top": 160, "width": 540, "height": 600},
          "imageZone": {"left": 160, "top": 180, "width": 500, "height": 560},
          "printZone": {"left": 200, "top": 220, "width": 420, "height": 460}
        }
      }
    },
    "black": {
      "id": "black",
      "name": "Schwarz",
      "color": "#1A1A1A",
      "is_default": false,
      "is_dark_shirt": true,
      "views": {
        "front": {
          "id": "front",
          "name": "Vorderseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 140, "top": 160, "width": 540, "height": 600},
          "imageZone": {"left": 160, "top": 180, "width": 500, "height": 560},
          "printZone": {"left": 200, "top": 220, "width": 420, "height": 460}
        }
      }
    },
    "grey": {
      "id": "grey",
      "name": "Grau",
      "color": "#9E9E9E",
      "is_default": false,
      "is_dark_shirt": false,
      "views": {
        "front": {
          "id": "front",
          "name": "Vorderseite",
          "image_url": "",
          "colorOverlayEnabled": false,
          "overlayOpacity": 0,
          "safeZone":  {"left": 140, "top": 160, "width": 540, "height": 600},
          "imageZone": {"left": 160, "top": 180, "width": 500, "height": 560},
          "printZone": {"left": 200, "top": 220, "width": 420, "height": 460}
        }
      }
    }
  }'::jsonb,
  39.99,
  '{
    "XS":  {"base": 39.99},
    "S":   {"base": 39.99},
    "M":   {"base": 39.99},
    "L":   {"base": 39.99},
    "XL":  {"base": 41.99},
    "XXL": {"base": 43.99}
  }'::jsonb,
  true
);
