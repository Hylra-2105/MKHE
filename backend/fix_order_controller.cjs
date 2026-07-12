const fs = require('fs');
const file = 'src/modules/orders/order.controller.js';
let content = fs.readFileSync(file, 'utf8');

// In createOrder
content = content.replace(
  /deductedStocks\.push\(\{(.*?)color: item\.color \}\);/g,
  `deductedStocks.push({$1color: item.color });\n        updatedProducts.push(product);`
);

// In cancelOrder
content = content.replace(
  /\/\/ ROLLBACK STOCK\n\s*for \(const item of order\.items\) \{/g,
  `// ROLLBACK STOCK\n    const updatedProducts = [];\n    for (const item of order.items) {`
);

content = content.replace(
  /const product = await Product\.findById\(item\.product\);\n\s*if \(product && product\.status === "OUT_OF_STOCK" && product\.stock > 0\) \{\n\s*product\.status = "PUBLISHED";\n\s*await product\.save\(\);\n\s*\}/g,
  `const product = await Product.findById(item.product);\n      if (product && product.status === "OUT_OF_STOCK" && product.stock > 0) {\n        product.status = "PUBLISHED";\n        await product.save();\n      }\n      if (product) updatedProducts.push(product);`
);

// In updateOrderStatus
content = content.replace(
  /if \(status === "CANCELLED" && previousStatus !== "CANCELLED"\) \{(\s*)for \(const item of order\.items\) \{/g,
  `const updatedProducts = [];\n    if (status === "CANCELLED" && previousStatus !== "CANCELLED") {$1for (const item of order.items) {`
);

// But wait, the second replace of OUT_OF_STOCK will apply to both cancelOrder and updateOrderStatus!
// Because the regex matches both. Let's make sure it does.

fs.writeFileSync(file, content);
