import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import i18n from "@/i18n";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product._id === product._id);
          const maxStock = product.stock;

          if (existingItem) {
            // Cập nhật số lượng nếu đã có trong giỏ
            const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
            
            if (existingItem.quantity === maxStock) {
              toast.error(i18n.t("common:cart.toast.stock_limit", { maxStock }));
              return state;
            }

            toast.success(i18n.t("common:cart.toast.quantity_updated"));
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isCartOpen: true,
            };
          }

          // Thêm mới vào giỏ
          const addQuantity = Math.min(quantity, maxStock);
          if (addQuantity === 0) {
            toast.error(i18n.t("common:cart.toast.out_of_stock"));
            return state;
          }

          toast.success(i18n.t("common:cart.toast.added"));
          return {
            items: [...state.items, { product, quantity: addQuantity }],
            isCartOpen: true,
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
        toast.success(i18n.t("common:cart.toast.removed"));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const item = state.items.find((i) => i.product._id === productId);
          if (!item) return state;

          const maxStock = item.product.stock;
          const validQuantity = Math.max(1, Math.min(quantity, maxStock));

          return {
            items: state.items.map((i) =>
              i.product._id === productId ? { ...i, quantity: validQuantity } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "mkhe-cart-storage",
    }
  )
);
