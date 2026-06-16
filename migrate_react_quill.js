const fs = require('fs');
const path = require('path');

const migrateFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace state initialization and destructuring
  content = content.replace(/description:/g, 'story:');
  content = content.replace(/description,/g, 'story,');
  content = content.replace(/description=/g, 'story=');
  content = content.replace(/product\.description/g, 'product.story');
  content = content.replace(/formData\.description/g, 'formData.story');
  
  // Update translation keys
  content = content.replace(/t\("modal\.description"\)/g, 't("modal.story")');
  content = content.replace(/t\("modal\.description_placeholder"\)/g, 't("modal.story_placeholder")');

  // Replace textarea with ReactQuill
  const textareaRegex = /<label className="text-\[10px\].*?\{t\("modal\.story"\)\}.*?<\/label>\s*<textarea name="story" value=\{formData\.story\} onChange=\{handleChange\} .*? \/>/s;
  
  const quillCode = `<label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-2">{t("modal.story")}</label>
                  <div className="bg-mkhe-bg border border-mkhe-border/50 rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-mkhe-border/30 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-mkhe-text [&_.ql-editor]:text-sm">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.story} 
                      onChange={(content) => setFormData(prev => ({ ...prev, story: content }))}
                      placeholder={t("modal.story_placeholder")}
                    />
                  </div>`;

  content = content.replace(textareaRegex, quillCode);

  // Add import ReactQuill
  if (!content.includes('import ReactQuill')) {
    content = content.replace('import { useTranslation } from "react-i18next";', 'import { useTranslation } from "react-i18next";\nimport ReactQuill from "react-quill";\nimport "react-quill/dist/quill.snow.css";');
  }

  fs.writeFileSync(filePath, content, 'utf8');
};

const addFile = path.join(__dirname, 'frontend/src/features/products/components/Admin/AddProductModal.jsx');
const editFile = path.join(__dirname, 'frontend/src/features/products/components/Admin/EditProductModal.jsx');

migrateFile(addFile);
migrateFile(editFile);

console.log("Migration complete");
