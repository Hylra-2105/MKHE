const fs = require('fs');
const path = 'src/modules/orders/order.controller.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { clearProductCache } from "../../utils/cache.js";')) {
  content = content.replace(
    'import { sendCheckoutOtpEmail, sendInvoiceEmail, sendOrderStatusEmail } from "../../utils/email.js";',
    'import { sendCheckoutOtpEmail, sendInvoiceEmail, sendOrderStatusEmail } from "../../utils/email.js";\nimport { clearProductCache } from "../../utils/cache.js";'
  );
}

// In createOrder
if (!content.includes('clearProductCache(); // Clear cache after checkout')) {
  content = content.replace(
    /updatedProducts\.forEach\(p => io\.emit\("product_updated", p\)\);/g,
    'clearProductCache(); // Clear cache after checkout\n        updatedProducts.forEach(p => io.emit("product_updated", p));'
  );
}

fs.writeFileSync(path, content);
