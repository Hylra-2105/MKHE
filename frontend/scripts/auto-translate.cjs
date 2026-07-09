const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const baseLang = 'vi';
const languages = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory() && f !== baseLang);
const viDir = path.join(localesDir, baseLang);
const files = fs.readdirSync(viDir).filter(f => f.endsWith('.json'));

// Simple helper to fetch JSON using native https
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Delay function to avoid hitting Google Translate rate limits too fast
const delay = ms => new Promise(res => setTimeout(res, ms));

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  
  // Convert standard language codes if needed for Google Translate
  let langCode = targetLang;
  if (langCode === 'zh') langCode = 'zh-CN'; // Use Simplified Chinese by default
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const data = await fetchJson(url);
    // Combine translated segments
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`[Error] Translating to ${langCode}: "${text}"`);
    return text; // Fallback to original text if API fails
  }
}

async function syncAndTranslateObject(base, target, lang) {
  let hasChanges = false;
  
  for (const key in base) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        hasChanges = true;
      }
      const childChanged = await syncAndTranslateObject(base[key], target[key], lang);
      if (childChanged) hasChanges = true;
    } else {
      // If the target key is missing, OR if it is identical to the base language (Vietnamese) 
      // (meaning it was probably just copied but not translated)
      if (target[key] === undefined || target[key] === base[key]) {
        console.log(`Translating [${lang}] key "${key}"...`);
        const translated = await translateText(base[key], lang);
        
        // Wait a bit to prevent rate limit (429 Too Many Requests)
        await delay(300);
        
        if (translated && translated !== target[key]) {
           target[key] = translated;
           hasChanges = true;
        }
      }
    }
  }
  return hasChanges;
}

async function run() {
  console.log("Starting Auto-Translation Process...");
  let totalChanges = 0;
  
  for (const lang of languages) {
    console.log(`\n--- Processing Language: ${lang.toUpperCase()} ---`);
    const langDir = path.join(localesDir, lang);
    
    for (const f of files) {
      const viPath = path.join(viDir, f);
      const targetPath = path.join(langDir, f);
      
      const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
      let targetData = {};
      
      if (fs.existsSync(targetPath)) {
        try {
          targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        } catch (e) {
          console.error(`Error reading ${targetPath}`);
        }
      }
      
      const changed = await syncAndTranslateObject(viData, targetData, lang);
      
      if (changed) {
        // Format JSON nicely with 2 spaces
        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2) + "\n", 'utf8');
        console.log(`✅ Successfully updated translations for ${lang}/${f}`);
        totalChanges++;
      }
    }
  }
  
  console.log(`\n🎉 Auto-translate complete! Total files updated: ${totalChanges}`);
}

run();
