const fs = require('fs');
const path = require('path');

const migrateFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace ReactQuill import with RichTextEditor
  content = content.replace(/import ReactQuill from \"react-quill-new\";\n/, 'import RichTextEditor from "@/components/ui/RichTextEditor";\n');
  content = content.replace(/import \"react-quill-new\/dist\/quill\.snow\.css\";\n/g, '');

  // Replace ReactQuill component block with RichTextEditor
  const quillRegex = /<div className=\"bg-mkhe-bg border border-mkhe-border\/50 rounded-xl overflow-hidden \[\&_\.ql-toolbar\]:border-none \[\&_\.ql-toolbar\]:border-b \[\&_\.ql-toolbar\]:border-mkhe-border\/30 \[\&_\.ql-container\]:border-none \[\&_\.ql-editor\]:min-h-\[150px\] \[\&_\.ql-editor\]:text-mkhe-text \[\&_\.ql-editor\]:text-sm\">\s*<ReactQuill[\s\S]*?theme=\"snow\"[\s\S]*?\/>\s*<\/div>/s;
  
  const richTextCode = `<RichTextEditor 
                    value={formData.story} 
                    onChange={(content) => setFormData(prev => ({ ...prev, story: content }))}
                    placeholder={t("modal.story_placeholder")}
                  />`;

  content = content.replace(quillRegex, richTextCode);
  fs.writeFileSync(filePath, content, 'utf8');
};

migrateFile(path.join(__dirname, 'frontend/src/features/products/components/Admin/AddProductModal.jsx'));
migrateFile(path.join(__dirname, 'frontend/src/features/products/components/Admin/EditProductModal.jsx'));

console.log('Migration complete');
