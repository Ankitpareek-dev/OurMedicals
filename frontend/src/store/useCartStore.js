import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      
      addToCart: (med, quantityToPurchase = 1) => set((state) => {
        const existing = state.cart.find((item) => item.id === med.id)
        if (existing) {
          const newQty = Math.min(med.stock, existing.quantity + quantityToPurchase)
          return {
            cart: state.cart.map((item) => item.id === med.id ? { ...item, quantity: newQty } : item)
          }
        } else {
          // If a new item is added, respect the Minimum Order Quantity (MOQ)
          const initialQty = Math.max(med.min_order_quantity || 10, quantityToPurchase)
          return {
            cart: [...state.cart, { ...med, quantity: initialQty }]
          }
        }
      }),

      updateQuantity: (medId, newQuantity) => set((state) => ({
        cart: state.cart.map((item) => item.id === medId ? { ...item, quantity: newQuantity } : item)
      })),

      removeFromCart: (medId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== medId)
      })),

      clearCart: () => set({ cart: [] })
    }),
    {
      name: 'wholesale_cart', // localStorage key
    }
  )
)
