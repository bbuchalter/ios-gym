/**
 * Watch Mode Script
 * 
 * Automatically rebuilds the application when TypeScript files change.
 * 
 * Features:
 * - Watches client/ and src/ directories for .ts file changes
 * - Compiles TypeScript using tsconfig.client.json
 * - Runs fix-imports.js after successful compilation
 * - Debounced rebuilds to avoid multiple builds for rapid changes
 * - Build queue to ensure changes during builds are not missed
 * 
 * Usage:
 *   npm run watch
 * 
 * or directly:
 *   node watch.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let isBuilding = false;
let buildQueued = false;

function runBuild() {
  if (isBuilding) {
    buildQueued = true;
    return;
  }

  isBuilding = true;
  console.log('\n🔨 Building...');
  
  const tsc = spawn('npx', ['tsc', '-p', 'tsconfig.client.json'], {
    stdio: 'inherit',
    shell: true
  });

  tsc.on('close', (code) => {
    if (code === 0) {
      console.log('✅ TypeScript compiled successfully');
      
      // Run fix-imports.js
      const fixImports = spawn('node', ['fix-imports.js'], {
        stdio: 'inherit'
      });
      
      fixImports.on('close', (importCode) => {
        isBuilding = false;
        
        if (importCode === 0) {
          console.log('✅ Build complete!\n');
        } else {
          console.error('❌ Import fixing failed\n');
        }
        
        // If a build was queued while we were building, run it now
        if (buildQueued) {
          buildQueued = false;
          setTimeout(runBuild, 100);
        }
      });
    } else {
      console.error('❌ TypeScript compilation failed\n');
      isBuilding = false;
      
      if (buildQueued) {
        buildQueued = false;
        setTimeout(runBuild, 100);
      }
    }
  });
}

// Watch directories
const watchDirs = ['client', 'src'];
const watchedFiles = new Set();

function setupWatch(dir) {
  const fullPath = path.join(__dirname, dir);
  
  try {
    fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      // Only watch .ts files, ignore .d.ts and test files
      if (filename.endsWith('.ts') && 
          !filename.endsWith('.d.ts') && 
          !filename.includes('__tests__') &&
          !filename.endsWith('.test.ts')) {
        
        const fullFilePath = path.join(fullPath, filename);
        
        // Debounce: only rebuild if we haven't seen this file in the last 100ms
        if (!watchedFiles.has(fullFilePath)) {
          watchedFiles.add(fullFilePath);
          console.log(`📝 Changed: ${dir}/${filename}`);
          runBuild();
          
          // Clear the debounce after 100ms
          setTimeout(() => {
            watchedFiles.delete(fullFilePath);
          }, 100);
        }
      }
    });
    
    console.log(`👀 Watching: ${dir}/`);
  } catch (error) {
    console.error(`Failed to watch ${dir}:`, error.message);
  }
}

console.log('🚀 Starting watch mode...\n');

// Initial build
runBuild();

// Setup watches
watchDirs.forEach(setupWatch);

console.log('\n✨ Watch mode active. Press Ctrl+C to stop.\n');

