const fs = require('fs');
let content = fs.readFileSync('src/stores/useCartStore.js', 'utf8');

const correctTop = `import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import i18n from "@/i18n";
import { syncCartApi, updateCartItemApi, removeCartItemApi } from "@/api/cartApi";
import { useAuthStore } from "./useAuthStore";

export const getCartItemId = (item) => {
  const addOnsStr = (item.addOns || []).map(a => a.name).sort().join('|');
  return \`\${item.product._id}-\${item.color || ''}-\${addOnsStr}\`;
};

let updateQuantityTimeout = null;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      loadingItems: [],
      selectedItems: [],
      selectedVoucher: null,

      setSelectedVoucher: (voucher) => set({ selectedVoucher: voucher }),`;

const toggleIndex = content.indexOf('toggleSelectItem: (cartItemId)');
const restOfContent = content.substring(toggleIndex);

fs.writeFileSync('src/stores/useCartStore.js', correctTop + '\n\n      ' + restOfContent);
