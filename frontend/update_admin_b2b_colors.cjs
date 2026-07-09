const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'features', 'b2b', 'components', 'Admin', 'AdminB2BOrders.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace standard colors with MKHE theme variables
const replacements = [
  { search: /bg-white/g, replace: 'bg-mkhe-bg' },
  { search: /border-gray-200/g, replace: 'border-mkhe-border/30' },
  { search: /border-gray-300/g, replace: 'border-mkhe-border/50' },
  { search: /bg-gray-50/g, replace: 'bg-mkhe-primary/5' },
  { search: /bg-gray-100/g, replace: 'bg-mkhe-primary/10' },
  { search: /text-gray-800/g, replace: 'text-mkhe-text' },
  { search: /text-gray-600/g, replace: 'text-mkhe-text/80' },
  { search: /text-gray-500/g, replace: 'text-mkhe-text/60' },
  { search: /text-gray-400/g, replace: 'text-mkhe-text/40' },
  { search: /bg-blue-600/g, replace: 'bg-mkhe-primary' },
  { search: /bg-blue-500/g, replace: 'bg-mkhe-primary/90' },
  { search: /border-blue-500/g, replace: 'border-mkhe-primary' },
  { search: /border-blue-200/g, replace: 'border-mkhe-primary/30' },
  { search: /bg-blue-50/g, replace: 'bg-mkhe-primary/10' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-mkhe-primary/5' },
  { search: /text-blue-600/g, replace: 'text-mkhe-primary' },
  { search: /bg-blue-100/g, replace: 'bg-mkhe-primary/20' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(filePath, content);
console.log("Updated AdminB2BOrders.jsx colors");
