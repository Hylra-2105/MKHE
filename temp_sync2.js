const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');
const baseLang = 'vi';
const languages = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory() && f !== baseLang);
const viDir = path.join(localesDir, baseLang);
const files = fs.readdirSync(viDir).filter(f => f.endsWith('.json'));

let totalChanges = 0;

function syncObject(base, target) {
  let hasChanges = false;
  for (const key in base) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        hasChanges = true;
      }
      if (syncObject(base[key], target[key])) {
        hasChanges = true;
      }
    } else {
      if (target[key] === undefined) {
        target[key] = base[key];
        hasChanges = true;
      }
    }
  }
  return hasChanges;
}

languages.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  files.forEach(f => {
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
    
    if (syncObject(viData, targetData)) {
      fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2) + "\n", 'utf8');
      console.log(`Synced ${lang}/${f}`);
      totalChanges++;
    }
  });
});

console.log(`Locales sync complete. Total files updated: ${totalChanges}`);
