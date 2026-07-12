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
      selectedVoucher: null,

      setSelectedVoucher: (voucher) => set({ selectedVoucher: voucher }),

      toggleSelectItem: (productId) => set((state) => ({
        selectedItems: state.selectedItems.includes(productId)
          ? state.selectedItems.filter((id) => id !== productId)
          : [...state.selectedItems, productId],
      })),

      updateProductInItems: (updatedProduct) => set((state) => ({
        items: state.items.map((item) => 
          item.product._id === updatedProduct._id 
            ? { ...item, product: updatedProduct } 
            : item
        )
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

      addToCart: async (product, quantity = 1, options = {}) => {
        const { silent = false, color, colorImage } = options;
        const token = useAuthStore.getState().token;
        
        let maxStock = product.stock;
        let colorVariant = null;

        if (color && product.colors && product.colors.length > 0) {
          colorVariant = product.colors.find(c => c.name === color);
          if (colorVariant) {
            maxStock = colorVariant.stock;
          }
        }
        
        let shouldSync = false;
        let finalQuantity = quantity;

        set((state) => {
          // Identify cart item by productId AND color (if provided)
          const existingItem = state.items.find((item) => 
            item.product._id === product._id && 
            (item.color || undefined) === (color || undefined)
          );

          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
            finalQuantity = newQuantity;
            
            if (existingItem.quantity === maxStock) {
              if (!silent) toast.error(i18n.t("cart:toast.stock_limit", { maxStock }));
              return state;
            }

            if (!silent) toast.success(i18n.t("cart:toast.quantity_updated"));
            shouldSync = true;
            return {
              items: state.items.map((item) =>
                item.product._id === product._id && (item.color || undefined) === (color || undefined)
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isCartOpen: !silent,
            };
          }

          const addQuantity = Math.min(quantity, maxStock);
          finalQuantity = addQuantity;
          if (addQuantity === 0) {
            if (!silent) toast.error(i18n.t("cart:toast.out_of_stock"));
            return state;
          }

          if (!silent) toast.success(i18n.t("cart:toast.added"));
          shouldSync = true;
          
          // Generate a unique ID for the frontend state if needed, but since we rely on product._id and color, it's fine.
          return {
            items: [...state.items, { product, quantity: addQuantity, color, colorImage }],
            selectedItems: state.selectedItems.includes(product._id) ? state.selectedItems : [...state.selectedItems, product._id],
            isCartOpen: !silent,
          };
        });

        if (shouldSync && token) {
          try {
            await updateCartItemApi(product._id, finalQuantity, color);
          } catch (error) {
            console.error("Lỗi cập nhật giỏ hàng trên server:", error);
          }
        }
      },

      removeFromCart: async (productId, color) => {
        const token = useAuthStore.getState().token;
        
        if (token) {
          get().setLoadingItem(productId, true);
          try {
            await removeCartItemApi(productId, color);
          } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
          } finally {
            get().setLoadingItem(productId, false);
          }
        }

        set((state) => ({
          items: state.items.filter((item) => !(item.product._id === productId && (item.color || undefined) === (color || undefined))),
          selectedItems: state.selectedItems.filter((id) => state.items.find(i => i.product._id === id && !(i.product._id === productId && (i.color || undefined) === (color || undefined)))),
        }));
        toast.success(i18n.t("cart:toast.removed"));
      },

      removeMultipleFromCart: async (productIds, silent = false) => {
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
        if (!silent) {
          toast.success(i18n.t("cart:toast.removed"));
        }
      },

      updateQuantity: (productId, quantity, color) => {
        const token = useAuthStore.getState().token;
        
        set((state) => {
          const item = state.items.find((i) => i.product._id === productId && (i.color || undefined) === (color || undefined));
          if (!item) return state;

          let maxStock = item.product.stock;
          if (color && item.product.colors) {
            const colorVariant = item.product.colors.find(c => c.name === color);
            if (colorVariant) maxStock = colorVariant.stock;
          }
          const validQuantity = Math.max(1, Math.min(quantity, maxStock));

          return {
            items: state.items.map((i) =>
              i.product._id === productId && (i.color || undefined) === (color || undefined) ? { ...i, quantity: validQuantity } : i
            ),
          };
        });

        if (token) {
          
          if (updateQuantityTimeout) {
            clearTimeout(updateQuantityTimeout);
          }
          
          updateQuantityTimeout = setTimeout(async () => {
            try {
              const item = get().items.find((i) => i.product._id === productId && (i.color || undefined) === (color || undefined));
              if (item) {
                await updateCartItemApi(productId, item.quantity, color);
              }
            } catch (error) {
              console.error("Lỗi cập nhật số lượng:", error);
            }
          }, 500);
        }
      },

      clearCart: () => set({ items: [], selectedItems: [] }),

      getCartTotal: () => {
        const { items, selectedItems } = get();
        const now = new Date();
        return items
          .filter((item) => selectedItems.includes(item.product._id))
          .reduce((total, item) => {
            const product = item.product;
            const isSaleValid = product.salePrice > 0 && product.saleStartDate && product.saleEndDate 
                                && new Date(product.saleStartDate) <= now && new Date(product.saleEndDate) >= now;
            const effectivePrice = isSaleValid ? product.salePrice : product.price;
            return total + effectivePrice * item.quantity;
          }, 0);
      },

      getDiscountedTotal: () => {
        const total = get().getCartTotal();
        const voucher = get().selectedVoucher;
        if (!voucher) return total;

        if (voucher.type === "FIXED_AMOUNT") {
          return Math.max(0, total - voucher.discountValue);
        }
        if (voucher.type === "PERCENTAGE") {
          let discount = (total * voucher.discountValue) / 100;
          if (voucher.maxDiscount && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
          }
          return Math.max(0, total - discount);
        }
        return total; // FREE_SHIP does not reduce item total, just shipping fee
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
