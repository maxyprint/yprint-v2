export type UserProfile = {
  user_id: string
  first_name: string | null
  last_name: string | null
  birthdate: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type UserAddress = {
  id: string
  user_id: string
  address_type: 'shipping' | 'billing'
  first_name: string
  last_name: string
  company: string | null
  street: string
  street_nr: string
  address_line2: string | null
  zip: string
  city: string
  country: string
  is_default: boolean
  created_at: string
}

export type PaymentMethod = {
  id: string
  user_id: string
  method_type: 'card' | 'sepa' | 'paypal'
  stripe_payment_method_id: string | null
  stripe_customer_id: string | null
  method_data: {
    last4?: string
    brand?: string
    exp_month?: number
    exp_year?: number
    bank_name?: string
    iban_last4?: string
  }
  is_default: boolean
  created_at: string
}

export type DesignTemplate = {
  id: string
  name: string
  slug: string | null
  category: string | null
  status: 'published' | 'draft'
  physical_width_cm: number
  physical_height_cm: number
  sizes: TemplateSize[]
  variations: Record<string, TemplateVariation>
  base_price: number
  pricing: Record<string, { base: number }>
  in_stock: boolean
  created_at: string
  updated_at: string
}

export type TemplateSize = {
  id: string
  name: string
  order: number
}

export type TemplateVariation = {
  id: string
  name: string
  color: string
  is_default: boolean
  is_dark_shirt: boolean
  views: Record<string, TemplateView>
}

export type TemplateView = {
  name: string
  image_url: string
  colorOverlayEnabled: boolean
  overlayOpacity: number
  safeZone: PrintZone
  imageZone: PrintZone
  printZone: PrintZone
}

export type PrintZone = {
  left: number
  top: number
  width: number
  height: number
}

export type UserDesign = {
  id: string
  user_id: string
  template_id: string | null
  name: string
  product_name: string
  product_description: string
  product_images: { id: string; url: string; view_id: string; view_name: string }[]
  design_data: Record<string, unknown>
  variations: Record<string, unknown>
  product_status: 'syncing' | 'on' | 'off'
  inventory_status: 'in_stock' | 'out_of_stock'
  is_enabled: boolean
  print_file_url: string | null
  created_at: string
  updated_at: string
}

export type UserImage = {
  id: string
  user_id: string
  image_id: string
  filename: string
  storage_path: string
  public_url: string
  image_type: 'gallery' | 'design'
  created_at: string
}

export type DesignPNG = {
  id: string
  design_id: string
  view_id: string | null
  view_name: string | null
  storage_path: string
  public_url: string
  print_area_px: PrintZone
  print_area_mm: { width: number; height: number }
  template_id: string | null
  save_type: string
  metadata: Record<string, unknown>
  generated_at: string
}

export type Order = {
  id: string
  user_id: string | null
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'partially_refunded'
  payment_method: string | null
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  subtotal: number
  shipping_cost: number
  discount_amount: number
  tax_amount: number
  total: number
  currency: string
  billing_address: UserAddress | null
  shipping_address: UserAddress | null
  coupon_code: string | null
  notes: string | null
  print_provider_sent_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  design_id: string | null
  template_id: string | null
  variation_id: string | null
  size: string | null
  quantity: number
  unit_price: number
  total_price: number
  design_snapshot: Record<string, unknown> | null
  print_png_url: string | null
  created_at: string
}

export type CartItem = {
  design_id: string
  design_name: string
  template_id: string
  template_name: string
  variation_id: string
  variation_name: string
  size: string
  quantity: number
  unit_price: number
  preview_url?: string
}

export type CartSession = {
  id: string
  session_id: string | null
  user_id: string | null
  items: CartItem[]
  coupon_code: string | null
  expires_at: string
  updated_at: string
}

export type Consent = {
  consent_type: 'analytics' | 'marketing' | 'functional' | 'necessary'
  granted: boolean
}

export type NotificationSettings = {
  email_orders: boolean
  email_marketing: boolean
  sms_orders: boolean
  sms_marketing: boolean
}

export type PrivacySettings = {
  data_sharing: boolean
  personalized_ads: boolean
}

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}
