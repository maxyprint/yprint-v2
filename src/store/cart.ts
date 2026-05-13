import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

type CartState = {
  items: CartItem[]
  couponCode: string | null
  sessionId: string
  addItem: (item: CartItem) => void
  removeItem: (designId: string, variationId: string, size: string) => void
  updateQuantity: (designId: string, variationId: string, size: string, quantity: number) => void
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      sessionId: crypto.randomUUID(),

      addItem: (item) => set((state) => {
        const existing = state.items.find(
          i => i.design_id === item.design_id && i.variation_id === item.variation_id && i.size === item.size
        )
        if (existing) {
          return {
            items: state.items.map(i =>
              i.design_id === item.design_id && i.variation_id === item.variation_id && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, item] }
      }),

      removeItem: (designId, variationId, size) => set((state) => ({
        items: state.items.filter(
          i => !(i.design_id === designId && i.variation_id === variationId && i.size === size)
        )
      })),

      updateQuantity: (designId, variationId, size, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => !(i.design_id === designId && i.variation_id === variationId && i.size === size))
          : state.items.map(i =>
              i.design_id === designId && i.variation_id === variationId && i.size === size
                ? { ...i, quantity }
                : i
            )
      })),

      applyCoupon: (code) => set({ couponCode: code }),
      removeCoupon: () => set({ couponCode: null }),
      clearCart: () => set({ items: [], couponCode: null }),

      total: () => get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'yprint-cart', version: 1 }
  )
)
