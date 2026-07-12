const fs = require('fs');
const path = 'src/stores/useCartStore.js';
let content = fs.readFileSync(path, 'utf8');

const getCartItemIdCode = `
export const getCartItemId = (item) => {
  const addOnsStr = (item.addOns || []).map(a => a.name).sort().join('|');
  return \`\${item.product._id}-\${item.color || ''}-\${addOnsStr}\`;
};
`;

if (!content.includes('export const getCartItemId')) {
  content = content.replace(
    'let updateQuantityTimeout = null;',
    'let updateQuantityTimeout = null;\n' + getCartItemIdCode
  );
  fs.writeFileSync(path, content);
}
