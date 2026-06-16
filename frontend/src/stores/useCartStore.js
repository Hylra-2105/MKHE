import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import i18n from "@/i18n";
import { syncCartApi, updateCartItemApi, removeCartItemApi } from "@/api/cartApi";
import { useAuthStore } from "./useAuthStore";

let updateQuantityTimeout = null;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      loadingItems: [],
      selectedItems: [],

      toggleSelectItem: (productId) => set((state) => ({
        selectedItems: state.selectedItems.includes(productId)
          ? state.selectedItems.filter((id) => id !== productId)
          : [...state.selectedItems, productId],
      })),

      selectAllItems: (isSelected) => set((state) => ({
        selectedItems: isSelected ? state.items.map((item) => item.product._id) : [],
      })),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      setLoadingItem: (productId, isLoading) => {
        set((state) => ({
          loadingItems: isLoading
            ? [...state.loadingItems, productId]
            : state.loadingItems.filter((id) => id !== productId),
        }));
      },

      syncCartToServer: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        try {
          const cart = await syncCartApi(get().items);
          if (cart.data && cart.data.items) {
            set({ items: cart.data.items });
          }
        } catch (error) {
          console.error("Lỗi đồng bộ giỏ hàng:", error);
        }
      },

      addToCart: async (product, quantity = 1) => {
        const token = useAuthStore.getState().token;
        const maxStock = product.stock;
        
        let shouldSync = false;
        let finalQuantity = quantity;

        set((state) => {
          const existingItem = state.items.find((item) => item.product._id === product._id);

          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
            finalQuantity = newQuantity;
            
            if (existingItem.quantity === maxStock) {
              toast.error(i18n.t("cart:toast.stock_limit", { maxStock }));
              return state;
            }

            toast.success(i18n.t("cart:toast.quantity_updated"));
            shouldSync = true;
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isCartOpen: true,
            };
          }

          const addQuantity = Math.min(quantity, maxStock);
          finalQuantity = addQuantity;
          if (addQuantity === 0) {
            toast.error(i18n.t("cart:toast.out_of_stock"));
            return state;
          }

          toast.success(i18n.t("cart:toast.added"));
          shouldSync = true;
          return {
            items: [...state.items, { product, quantity: addQuantity }],
            selectedItems: state.selectedItems.includes(product._id) ? state.selectedItems : [...state.selectedItems, product._id],
            isCartOpen: true,
          };
        });

        if (shouldSync && token) {
          try {
            await updateCartItemApi(product._id, finalQuantity);
          } catch (error) {
            console.error("Lỗi cập nhật giỏ hàng trên server:", error);
          }
        }
      },

      removeFromCart: async (productId) => {
        const token = useAuthStore.getState().token;
        
        if (token) {
          get().setLoadingItem(productId, true);
          try {
            await removeCartItemApi(productId);
          } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
          } finally {
            get().setLoadingItem(productId, false);
          }
        }

        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
          selectedItems: state.selectedItems.filter((id) => id !== productId),
        }));
        toast.success(i18n.t("cart:toast.removed"));
      },

      removeMultipleFromCart: async (productIds) => {
        const token = useAuthStore.getState().token;
        
        if (token) {
          try {
            await Promise.all(productIds.map(id => removeCartItemApi(id)));
          } catch (error) {
            console.error("Lỗi xóa nhiều sản phẩm:", error);
          }
        }

        set((state) => ({
          items: state.items.filter((item) => !productIds.includes(item.product._id)),
          selectedItems: state.selectedItems.filter((id) => !productIds.includes(id)),
        }));
        toast.success(i18n.t("cart:toast.removed"));
      },

      updateQuantity: (productId, quantity) => {
        const token = useAuthStore.getState().token;
        
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

        if (token) {
          get().setLoadingItem(productId, true);
          
          if (updateQuantityTimeout) {
            clearTimeout(updateQuantityTimeout);
          }
          
          updateQuantityTimeout = setTimeout(async () => {
            try {
              const item = get().items.find((i) => i.product._id === productId);
              if (item) {
                await updateCartItemApi(productId, item.quantity);
              }
            } catch (error) {
              console.error("Lỗi cập nhật số lượng:", error);
            } finally {
              get().setLoadingItem(productId, false);
            }
          }, 500);
        }
      },

      clearCart: () => set({ items: [], selectedItems: [] }),

      getCartTotal: () => {
        const { items, selectedItems } = get();
        return items
          .filter((item) => selectedItems.includes(item.product._id))
          .reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "mkhe-cart-storage",
      partialize: (state) => ({ items: state.items, selectedItems: state.selectedItems }), // Lưu items và trạng thái chọn
    }
  )
);
