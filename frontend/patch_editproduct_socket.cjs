const fs = require('fs');

const file = './src/features/products/components/Admin/EditProductModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import useSocketStore
if (!content.includes('useSocketStore')) {
  content = content.replace(
    /import React from "react";\n/,
    `import React from "react";\nimport { useSocketStore } from "@/stores/useSocketStore";\n`
  );
}

// 2. Add socket hook and useEffect inside component
const targetInsert = `  const [formData, setFormData] = useState({`;
const hookCode = `  const { socket } = useSocketStore();
  
  useEffect(() => {
    if (!socket || !product?._id || !isOpen) return;

    const handleProductUpdated = (updatedProduct) => {
      if (updatedProduct._id === product._id) {
        setFormData((prev) => ({
          ...prev,
          stock: updatedProduct.stock,
          colors: updatedProduct.colors || prev.colors,
        }));
      }
    };

    socket.on("product_updated", handleProductUpdated);

    return () => {
      socket.off("product_updated", handleProductUpdated);
    };
  }, [socket, product, isOpen]);

`;

if (!content.includes('socket.on("product_updated"')) {
  content = content.replace(targetInsert, hookCode + targetInsert);
}

fs.writeFileSync(file, content);
console.log('Patched EditProductModal.jsx with socket listener');
