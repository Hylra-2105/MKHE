const fs = require('fs');

const useCartStore = './src/stores/useCartStore.js';
let content = fs.readFileSync(useCartStore, 'utf8');

// 1. Add getCartItemId function
if (!content.includes('export const getCartItemId')) {
  content = content.replace(
    /export const useCartStore = create\(/,
    `export const getCartItemId = (item) => {\n  const addOnsStr = (item.addOns || []).map(a => a.name).sort().join('|');\n  return \`\${item.product._id}-\${item.color || ''}-\${addOnsStr}\`;\n};\n\nexport const useCartStore = create(`
  );
}

// 2. Fix addToCart inserting product._id instead of getCartItemId
content = content.replace(
  /selectedItems: state\.selectedItems\.includes\(product\._id\)\n\s*\? state\.selectedItems\n\s*: \[\.\.\.state\.selectedItems, product\._id\],/g,
  `selectedItems: state.selectedItems.includes(getCartItemId({ product, color, addOns }))\n              ? state.selectedItems\n              : [...state.selectedItems, getCartItemId({ product, color, addOns })],`
);

// 3. Fix toggleSelectItem passing product._id instead of cartItemId
content = content.replace(
  /toggleSelectItem: \(productId\) => set\(\(state\) => \(\{/g,
  `toggleSelectItem: (cartItemId) => set((state) => ({`
);
content = content.replace(
  /selectedItems: state\.selectedItems\.includes\(productId\)/g,
  `selectedItems: state.selectedItems.includes(cartItemId)`
);
content = content.replace(
  /\? state\.selectedItems\.filter\(\(id\) => id !== productId\)/g,
  `? state.selectedItems.filter((id) => id !== cartItemId)`
);
content = content.replace(
  /: \[\.\.\.state\.selectedItems, productId\],/g,
  `: [...state.selectedItems, cartItemId],`
);

// 4. Fix selectAllItems mapping to product._id instead of cartItemId
content = content.replace(
  /selectAllItems: \(isSelected\) => set\(\(state\) => \(\{\n\s*selectedItems: isSelected \? state\.items\.map\(item => item\.product\._id\) : \[\],\n\s*\}\)\),/g,
  `selectAllItems: (isSelected) => set((state) => ({\n          selectedItems: isSelected ? state.items.map(item => getCartItemId(item)) : [],\n        })),`
);

// 5. Update updateProductInItems
const oldUpdate = `updateProductInItems: (updatedProduct) => set((state) => ({
        items: state.items.map((item) => 
          item.product._id === updatedProduct._id 
            ? { ...item, product: updatedProduct } 
            : item
        )
      })),`;

const newUpdate = `updateProductInItems: (updatedProduct) => set((state) => {
        const newItems = state.items.map((item) => {
          if (item.product._id === updatedProduct._id) {
            let maxStock = updatedProduct.stock;
            if (item.color) {
              const colorVariant = updatedProduct.colors?.find(c => c.name === item.color);
              if (colorVariant) maxStock = colorVariant.stock;
            }
            return {
              ...item,
              product: updatedProduct,
              quantity: Math.min(item.quantity, maxStock)
            };
          }
          return item;
        });
        return { items: newItems };
      }),`;

if (content.includes(oldUpdate)) {
    content = content.replace(oldUpdate, newUpdate);
}

fs.writeFileSync(useCartStore, content);
