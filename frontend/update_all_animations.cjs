const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Ensure useEffectsConfig is imported and initialized
  if (!content.includes('useEffectsConfig')) {
    content = content.replace(
      /import { motion.*? } from ['"]framer-motion['"];/,
      (match) => `${match}\nimport useEffectsConfig from "@/hooks/useEffectsConfig";`
    );
  }

  // Inject hook
  if (!content.includes('const { enableEffects } = useEffectsConfig();')) {
    content = content.replace(
      /(const \w+ = \([^)]*\) => {)/,
      '$1\n  const { enableEffects } = useEffectsConfig();'
    );
  }

  // For AboutPage specific whileInView
  if (filePath.includes('AboutPage')) {
    const regexWhileInView = /initial=\{\{(.*?)\}\}\s+whileInView=\{\{(.*?)\}\}/g;
    content = content.replace(regexWhileInView, 'initial={enableEffects ? {$1} : {$2}} whileInView={enableEffects ? {$2} : undefined}');
    
    // Replace decorative animations
    content = content.replace(/animate-pulse/g, '${enableEffects ? \'animate-pulse\' : \'\'}');
    content = content.replace(/animate-\[spin_20s_linear_infinite\]/g, '${enableEffects ? \'animate-[spin_20s_linear_infinite]\' : \'\'}');
    
    // Fix className strings that contain these template literals but aren't backticks yet
    // Example: className="... ${enableEffects ? 'animate-pulse' : ''}" => className={`... ${enableEffects ? 'animate-pulse' : ''}`}
    content = content.replace(/className="([^"]*\$\{enableEffects[^"]*)"/g, 'className={`$1`}');
  }

  if (filePath.includes('ContactPage')) {
    content = content.replace(/animate-pulse/g, '${enableEffects ? \'animate-pulse\' : \'\'}');
    content = content.replace(/animate-\[spin_20s_linear_infinite\]/g, '${enableEffects ? \'animate-[spin_20s_linear_infinite]\' : \'\'}');
    content = content.replace(/className="([^"]*\$\{enableEffects[^"]*)"/g, 'className={`$1`}');
  }

  if (filePath.includes('CoreTech')) {
    content = content.replace(/animate-pulse/g, '${enableEffects ? \'animate-pulse\' : \'\'}');
    content = content.replace(/animate-\[scan_3s_ease-in-out_infinite\]/g, '${enableEffects ? \'animate-[scan_3s_ease-in-out_infinite]\' : \'\'}');
    content = content.replace(/className="([^"]*\$\{enableEffects[^"]*)"/g, 'className={`$1`}');
  }

  if (filePath.includes('BoardGameTeaser')) {
    content = content.replace(/animate-pulse/g, '${enableEffects ? \'animate-pulse\' : \'\'}');
    content = content.replace(/className="([^"]*\$\{enableEffects[^"]*)"/g, 'className={`$1`}');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const files = [
  path.join(__dirname, 'src', 'pages', 'about', 'AboutPage.jsx'),
  path.join(__dirname, 'src', 'pages', 'contact', 'ContactPage.jsx'),
  path.join(__dirname, 'src', 'features', 'home', 'components', 'CoreTech.jsx'),
  path.join(__dirname, 'src', 'features', 'home', 'components', 'BoardGameTeaser.jsx')
];

files.forEach(updateFile);
