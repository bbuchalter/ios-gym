// Post-build script to add .js extensions to ES6 imports
const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix relative imports: from "./module" -> from "./module.js"
      // Fix relative imports: from "../module" -> from "../module.js"
      // Special case: from "./handlers" -> from "./handlers/index.js"
      content = content.replace(/from\s+["'](\.[^"']+)["']/g, (match, p1) => {
        if (p1.endsWith('.js') || p1.endsWith('.json')) {
          return match;
        }
        // Check if this is a directory import (handlers, etc.)
        const baseName = path.basename(p1);
        if (baseName === 'handlers' || baseName === 'exercise' || baseName === 'cli') {
          return `from "${p1}/index.js"`;
        }
        return `from "${p1}.js"`;
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

console.log('Fixing ES6 imports in public/...');
fixImports(path.join(__dirname, 'public'));
console.log('✓ Done!');

