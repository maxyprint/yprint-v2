-- yprint-v2 Initial Database Schema
-- Run in Supabase SQL Editor or via supabase db push

-- ============================================================
-- USER DATA TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  birthdate DATE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'shipping',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  street TEXT NOT NULL,
  street_nr TEXT NOT NULL,
  zip TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'DE',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL,
  stripe_payment_method_id TEXT,
  stripe_customer_id TEXT,
  method_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_orders BOOLEAN NOT NULL DEFAULT TRUE,
  email_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  sms_orders BOOLEAN NOT NULL DEFAULT FALSE,
  sms_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  personalized_ads BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_key TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DESIGN TOOL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  physical_width_cm FLOAT NOT NULL DEFAULT 30,
  physical_height_cm FLOAT NOT NULL DEFAULT 40,
  sizes JSONB NOT NULL DEFAULT '[]',
  variations JSONB NOT NULL DEFAULT '{}',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  pricing JSONB NOT NULL DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.template_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.design_templates(id) ON DELETE CASCADE,
  size_key TEXT NOT NULL,
  measurement_key TEXT NOT NULL,
  measurement_label TEXT,
  value_cm FLOAT NOT NULL,
  UNIQUE(template_id, size_key, measurement_key)
);

CREATE TABLE IF NOT EXISTS public.user_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.design_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  product_description TEXT NOT NULL DEFAULT '',
  product_images JSONB NOT NULL DEFAULT '[]',
  design_data JSONB NOT NULL DEFAULT '{}',
  variations JSONB NOT NULL DEFAULT '{}',
  product_status TEXT NOT NULL DEFAULT 'syncing',
  inventory_status TEXT NOT NULL DEFAULT 'in_stock',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  print_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'gallery',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.design_pngs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.user_designs(id) ON DELETE CASCADE,
  view_id TEXT,
  view_name TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  print_area_px JSONB NOT NULL DEFAULT '{}',
  print_area_mm JSONB NOT NULL DEFAULT '{}',
  template_id UUID,
  save_type TEXT NOT NULL DEFAULT 'auto',
  metadata JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHOP / ORDER TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  billing_address JSONB,
  shipping_address JSONB,
  coupon_code TEXT,
  notes TEXT,
  print_provider_sent_at TIMESTAMPTZ,
  print_provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.user_designs(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.design_templates(id) ON DELETE SET NULL,
  variation_id TEXT,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  design_snapshot JSONB,
  print_png_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  coupon_code TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON public.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_designs_user_id ON public.user_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_designs_template_id ON public.user_designs(template_id);
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON public.user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_design_pngs_design_id ON public.design_pngs(design_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_user_id ON public.cart_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON public.cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_template_measurements_template_id ON public.template_measurements(template_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_pngs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;

-- User profiles: own data only
CREATE POLICY "user_profiles_own" ON public.user_profiles
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Addresses: own data only
CREATE POLICY "user_addresses_own" ON public.user_addresses
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Payment methods: own data only
CREATE POLICY "payment_methods_own" ON public.payment_methods
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification settings: own data only
CREATE POLICY "notification_settings_own" ON public.notification_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Privacy settings: own data only
CREATE POLICY "privacy_settings_own" ON public.privacy_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Consents: own data, or insert for guests
CREATE POLICY "consents_own_read" ON public.consents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consents_insert" ON public.consents
  FOR INSERT WITH CHECK (TRUE);

-- User designs: own data only
CREATE POLICY "user_designs_own" ON public.user_designs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User images: own data only
CREATE POLICY "user_images_own" ON public.user_images
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Design PNGs: readable by design owner
CREATE POLICY "design_pngs_own" ON public.design_pngs
  USING (
    EXISTS (
      SELECT 1 FROM public.user_designs ud
      WHERE ud.id = design_id AND ud.user_id = auth.uid()
    )
  );

-- Orders: own data only
CREATE POLICY "orders_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Order items: readable via order ownership
CREATE POLICY "order_items_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Cart sessions: own session
CREATE POLICY "cart_sessions_own" ON public.cart_sessions
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Templates: public read for published
CREATE POLICY "templates_public_read" ON public.design_templates
  FOR SELECT USING (status = 'published');
CREATE POLICY "templates_admin_all" ON public.design_templates
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.design_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
