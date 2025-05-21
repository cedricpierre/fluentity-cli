#!/usr/bin/env node

try {
  await import('../dist/index.js');
} catch (error) {
  console.error('Error loading CLI:', error);
  process.exit(1);
} 