#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');

// Build the grammar
console.log('Building grammar...');
try {
  execSync('npm run build:grammar', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('Grammar built successfully!\n');
} catch (error) {
  console.error('Failed to build grammar:', error.message);
  process.exit(1);
}

// Start the Next.js dev server
console.log('Starting Next.js dev server...');
const child = spawn('npm run dev', [], {
  cwd: path.join(__dirname, '..', 'web'),
  stdio: 'inherit',
  shell: true
});

// Forward signals to the child process
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

child.on('exit', (code) => {
  process.exit(code);
});

