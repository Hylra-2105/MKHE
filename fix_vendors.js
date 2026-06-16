const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "frontend", "src", "features", "products", "components", "Admin", "AddProductModal.jsx"),
  path.join(__dirname, "frontend", "src", "features", "products", "components", "Admin", "EditProductModal.jsx")
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");

  // For EditProductModal, replace vendors array with dynamic one and add Mộc Chợ Thủ
  if (file.includes("EditProductModal")) {
    const oldVendors = `  const vendors = [
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
    { value: "MKHE", label: "MKHE" }
  ];`;

    const newVendors = `  const baseVendors = [
    { value: "MKHE", label: "MKHE" },
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
    { value: "Mộc Chợ Thủ", label: "Mộc Chợ Thủ" },
    { value: "Làng mộc Chợ Thủ", label: "Làng mộc Chợ Thủ" }
  ];

  const vendors = React.useMemo(() => {
    if (formData.vendor && !baseVendors.find(v => v.value === formData.vendor)) {
      return [...baseVendors, { value: formData.vendor, label: formData.vendor }];
    }
    return baseVendors;
  }, [formData.vendor]);`;

    content = content.replace(oldVendors, newVendors);
    
    // Also need to import React if useMemo is used via React.useMemo, or just use React.useMemo
    // The component might already import React.

  } else if (file.includes("AddProductModal")) {
    const oldVendors = `  const vendors = [
    { value: "MKHE", label: "MKHE" },
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
  ];`;

    const newVendors = `  const vendors = [
    { value: "MKHE", label: "MKHE" },
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
    { value: "Mộc Chợ Thủ", label: "Mộc Chợ Thủ" },
    { value: "Làng mộc Chợ Thủ", label: "Làng mộc Chợ Thủ" }
  ];`;

    content = content.replace(oldVendors, newVendors);
  }

  fs.writeFileSync(file, content, "utf8");
}
console.log("Done updating vendors.");
