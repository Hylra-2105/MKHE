const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');
const baseLang = 'vi';

if (!fs.existsSync(localesDir)) {
  console.error("Locales directory not found!");
  process.exit(1);
}

const languages = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

const viDir = path.join(localesDir, baseLang);
const namespaces = fs.readdirSync(viDir).filter(f => f.endsWith('.json'));

// Helper to deep merge objects
function syncObject(base, target) {
  let hasChanges = false;
  for (const key in base) {
    if (typeof base[key] === 'object' && base[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        hasChanges = true;
      }
      if (syncObject(base[key], target[key])) {
        hasChanges = true;
      }
    } else {
      if (target[key] === undefined) {
        target[key] = base[key]; // Fill with vi text
        hasChanges = true;
      }
    }
  }
  return hasChanges;
}

languages.forEach(lang => {
  if (lang === baseLang) return;
  const langDir = path.join(localesDir, lang);
  
  namespaces.forEach(ns => {
    const viPath = path.join(viDir, ns);
    const targetPath = path.join(langDir, ns);
    
    const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
    
    let targetData = {};
    if (fs.existsSync(targetPath)) {
      try {
        targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (e) {
        console.error(`Error reading ${targetPath}`);
      }
    }
    
    const changed = syncObject(viData, targetData);
    if (changed || !fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2) + "\n", 'utf8');
      console.log(`Synced ${lang}/${ns}`);
    }
  });
});

console.log("Locales sync complete.");
