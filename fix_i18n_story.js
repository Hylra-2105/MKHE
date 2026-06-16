const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "frontend", "src", "locales");
const languages = ["vi", "en", "fr", "ja", "ko"];

const translations = {
  vi: { story: "Câu chuyện sản phẩm", story_placeholder: "Nhập câu chuyện chi tiết về sản phẩm (hỗ trợ in đậm, in nghiêng, chia đoạn...)" },
  en: { story: "Product Story", story_placeholder: "Enter the detailed product story (supports bold, italic, formatting...)" },
  fr: { story: "Histoire du Produit", story_placeholder: "Entrez l'histoire détaillée du produit (supporte le gras, l'italique...)" },
  ja: { story: "製品ストーリー", story_placeholder: "詳細な製品ストーリーを入力してください（太字、斜体などをサポート）" },
  ko: { story: "제품 스토리", story_placeholder: "자세한 제품 스토리를 입력하세요 (굵게, 기울임꼴 등 지원)" }
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
