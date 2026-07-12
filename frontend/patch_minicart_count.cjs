const fs = require('fs');

const miniCart = './src/components/layout/MiniCartDrawer.jsx';

let content = fs.readFileSync(miniCart, 'utf8');

// 1. Fix line 29: eligibility check uses getCartItemId
content = content.replace(
  /const eligibility = checkVoucherEligibility\(selectedVoucher, items\.filter\(\(item\) => selectedItems\.includes\(item\.product\._id\)\), getCartTotal\(\)\);/g,
  `const eligibility = checkVoucherEligibility(selectedVoucher, items.filter((item) => selectedItems.includes(getCartItemId(item))), getCartTotal());`
);

// 2. Add validSelectedCount before if (!isCartOpen) return null;
if (!content.includes('validSelectedCount')) {
  content = content.replace(
    'if (!isCartOpen) return null;',
    `const validSelectedCount = items.filter(item => selectedItems.includes(getCartItemId(item))).length;\n\n  if (!isCartOpen) return null;`
  );
}

// 3. Replace all selectedItems.length with validSelectedCount where it matters
content = content.replace(
  /items\.length > 0 && selectedItems\.length === items\.length/g,
  `items.length > 0 && validSelectedCount === items.length`
);

content = content.replace(
  /count: selectedItems\.length/g,
  `count: validSelectedCount`
);

content = content.replace(
  /disabled=\{selectedItems\.length === 0\}/g,
  `disabled={validSelectedCount === 0}`
);

content = content.replace(
  /selectedItems\.length > 0 && \`\(\$\{selectedItems\.length\}\)\`/g,
  `validSelectedCount > 0 && \`(\${validSelectedCount})\``
);

fs.writeFileSync(miniCart, content);
console.log('Patched MiniCartDrawer validSelectedCount');
