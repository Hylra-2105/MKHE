const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'about', 'AboutPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regexAnimate = /initial=\{\{(.*?)\}\}\s+animate=\{\{(.*?)\}\}/g;
content = content.replace(regexAnimate, 'initial={enableEffects ? {$1} : {$2}} animate={enableEffects ? {$2} : undefined}');

fs.writeFileSync(filePath, content);
console.log('Fixed AboutPage animate');
