const fs = require('fs');

const miniCart = './src/components/layout/MiniCartDrawer.jsx';
const checkout = './src/pages/checkout/CheckoutPage.jsx';

function patchMiniCart() {
  let content = fs.readFileSync(miniCart, 'utf8');
  
  if (!content.includes('getCartItemId')) {
    content = content.replace('useCartStore";', 'useCartStore, { getCartItemId }";');
  }

  // const isSelected = selectedItems.includes(item.product._id);
  content = content.replace(
    /const isSelected = selectedItems\.includes\(item\.product\._id\);/g,
    `const isSelected = selectedItems.includes(getCartItemId(item));`
  );

  // onChange={(e) => toggleSelectItem(item.product._id)}
  content = content.replace(
    /onChange=\{\(e\) => toggleSelectItem\(item\.product\._id\)\}/g,
    `onChange={(e) => toggleSelectItem(getCartItemId(item))}`
  );

  // <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.color)}
  content = content.replace(
    /updateQuantity\(item\.product\._id, (item\.quantity [+-] 1), item\.color\)/g,
    `updateQuantity(item.product._id, $1, item.color, item.addOns)`
  );

  fs.writeFileSync(miniCart, content);
  console.log('Patched MiniCartDrawer');
}

function patchCheckout() {
  let content = fs.readFileSync(checkout, 'utf8');

  if (!content.includes('getCartItemId')) {
    content = content.replace('useCartStore";', 'useCartStore, { getCartItemId }";');
  }

  // items.filter((item) => selectedItems.includes(item.product._id))
  content = content.replace(
    /\.filter\(\(item\) => selectedItems\.includes\(item\.product\._id\)\)/g,
    `.filter((item) => selectedItems.includes(getCartItemId(item)))`
  );

  fs.writeFileSync(checkout, content);
  console.log('Patched CheckoutPage');
}

patchMiniCart();
patchCheckout();
