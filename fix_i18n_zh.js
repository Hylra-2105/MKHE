const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "frontend", "src", "locales");
const languages = ["zh", "fr"];

const translations = {
  zh: { story: "产品故事", story_placeholder: "输入详细的产品故事（支持粗体、斜体、格式化...）" },
  fr: { story: "Histoire du Produit", story_placeholder: "Entrez l'histoire détaillée du produit (supporte le gras, l'italique...)" }
};

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, "product.json");
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      // Update modal keys
      if (data.modal) {
        data.modal.story = translations[lang].story;
        data.modal.story_placeholder = translations[lang].story_placeholder;
        
        // Remove old description keys if present
        delete data.modal.description;
        delete data.modal.description_placeholder;
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Updated ${lang}/product.json`);
    } catch (err) {
      console.error(`Error updating ${lang}/product.json:`, err);
    }
  }
});
