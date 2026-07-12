const fs = require('fs');
const storePath = './src/stores/useCartStore.js';
let content = fs.readFileSync(storePath, 'utf8');

const getCartItemIdStr = `
export const getCartItemId = (item) => {
  const addOnsStr = (item.addOns || []).map(a => a.name).sort().join('|');
  return \`\${item.product._id}-\${item.color || ''}-\${addOnsStr}\`;
};
`;

if (!content.includes('getCartItemId')) {
  content = content.replace('import', getCartItemIdStr + '\nimport');
}

// 1. removeFromCart
content = content.replace(
  /removeFromCart: async \(productId, color\) => \{/g,
  `removeFromCart: async (productId, color, addOns) => {`
);

// 2. toggleSelectItem
content = content.replace(
  /toggleSelectItem: \(productId\) => set\(\(state\) => \(\{[\s\S]*?selectedItems: state\.selectedItems\.includes\(productId\)[\s\S]*?\? state\.selectedItems\.filter\(\(id\) => id !== productId\)[\s\S]*?: \[\.\.\.state\.selectedItems, productId\],[\s\S]*?\}\)\),/m,
  `toggleSelectItem: (cartItemId) => set((state) => ({
          selectedItems: state.selectedItems.includes(cartItemId)
            ? state.selectedItems.filter((id) => id !== cartItemId)
            : [...state.selectedItems, cartItemId],
        })),`
);

// 3. selectAllItems
content = content.replace(
  /selectAllItems: \(isSelected\) => set\(\(state\) => \(\{[\s\S]*?selectedItems: isSelected \? state\.items\.map\(\(item\) => item\.product\._id\) : \[\],[\s\S]*?\}\)\),/m,
  `selectAllItems: (isSelected) => set((state) => ({
          selectedItems: isSelected ? state.items.map(item => getCartItemId(item)) : [],
        })),`
);

// 4. getCartTotal filter
content = content.replace(
  /\.filter\(\(item\) => selectedItems\.includes\(item\.product\._id\)\)/g,
  `.filter((item) => selectedItems.includes(getCartItemId(item)))`
);

// 5. removeMultipleFromCart
content = content.replace(
  /removeMultipleFromCart: async \(productIds, silent = false\) => \{/g,
  `removeMultipleFromCart: async (cartItemIds, silent = false) => {`
);
content = content.replace(
  /await Promise\.all\(productIds\.map\(id => removeCartItemApi\(id\)\)\);/g,
  `
            // Phải lấy thông tin từng item để gọi API
            const itemsToRemove = get().items.filter(item => cartItemIds.includes(getCartItemId(item)));
            await Promise.all(itemsToRemove.map(item => removeCartItemApi(item.product._id, item.color, item.addOns)));
`
);
content = content.replace(
  /items: state\.items\.filter\(\(item\) => !productIds\.includes\(item\.product\._id\)\),/g,
  `items: state.items.filter((item) => !cartItemIds.includes(getCartItemId(item))),`
);
content = content.replace(
  /selectedItems: state\.selectedItems\.filter\(\(id\) => !productIds\.includes\(id\)\),/g,
  `selectedItems: state.selectedItems.filter((id) => !cartItemIds.includes(id)),`
);


// 6. updateQuantity params
content = content.replace(
  /updateQuantity: \(productId, quantity, color\) => \{/g,
  `updateQuantity: (productId, quantity, color, addOns) => {`
);

fs.writeFileSync(storePath, content);
console.log('Patched useCartStore');
