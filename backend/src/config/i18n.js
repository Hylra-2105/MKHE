import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for loaded translations
const translationCache = {};

/**
 * Load translation for a specific language and namespace
 * @param {string} lang - Language code (en, vi)
 * @param {string} namespace - File name (email, messages, etc)
 * @returns {object} Translation object
 */
export const loadTranslation = (lang = "vi", namespace = "email") => {
  const key = `${lang}.${namespace}`;

  // Return from cache if available
  if (translationCache[key]) {
    return translationCache[key];
  }

  try {
    const filePath = path.join(
      __dirname,
      `../locales/${lang}/${namespace}.json`,
    );
    const content = fs.readFileSync(filePath, "utf-8");
    const translation = JSON.parse(content);

    // Cache it
    translationCache[key] = translation;

    return translation;
  } catch (error) {
    console.error(
      `[i18n Error] Failed to load translation: ${lang}/${namespace}`,
      error.message,
    );
    // Fallback to Vietnamese
    if (lang !== "vi") {
      return loadTranslation("vi", namespace);
    }
    return {};
  }
};

/**
 * Get translated string with placeholder replacement
 * @param {object} translations - Translation object
 * @param {string} path - Dot notation path (e.g., "verification.subject")
 * @param {object} replacements - Object with replacements (e.g., {time: "13:54"})
 * @returns {string} Translated and replaced string
 */
export const getTranslation = (translations, path, replacements = {}) => {
  let value = translations;

  for (const key of path.split(".")) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return path; // Return the path itself if translation not found
    }
  }

  if (typeof value !== "string") {
    return path;
  }

  // Replace placeholders
  let result = value;
  for (const [key, val] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, val);
  }

  return result;
};
