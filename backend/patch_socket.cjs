const fs = require('fs');

const orderController = './src/modules/orders/order.controller.js';
let content = fs.readFileSync(orderController, 'utf8');

// 1. Declare updatedProducts array
content = content.replace(
  /const deductedStocks = \[\]; \/\/ To track for manual rollback/,
  `const deductedStocks = []; // To track for manual rollback\n    const updatedProducts = [];`
);

// 2. Push product to updatedProducts after it's successfully modified
content = content.replace(
  /\/\/ Lưu vào ds đã trừ để Rollback nếu có lỗi phía sau\n\s*deductedStocks\.push\(\{ productId: product\._id, quantity: item\.quantity, color: item\.color \}\);/g,
  `// Lưu vào ds đã trừ để Rollback nếu có lỗi phía sau\n        deductedStocks.push({ productId: product._id, quantity: item.quantity, color: item.color });\n        updatedProducts.push(product);`
);

// 3. Emit product_updated
content = content.replace(
  /io\.emit\("admin_order_updated"\);/g,
  `io.emit("admin_order_updated");\n      updatedProducts.forEach(p => io.emit("product_updated", p));`
);

fs.writeFileSync(orderController, content);
console.log('Patched order.controller.js for socket io product updates');
