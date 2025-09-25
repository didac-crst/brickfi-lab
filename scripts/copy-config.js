#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copy shared config to frontend
const sharedConfigPath = path.join(__dirname, '../shared/config/defaults.json');
const frontendConfigPath = path.join(__dirname, '../frontend/src/config/defaults.json');

// Ensure frontend config directory exists
const frontendConfigDir = path.dirname(frontendConfigPath);
if (!fs.existsSync(frontendConfigDir)) {
  fs.mkdirSync(frontendConfigDir, { recursive: true });
}

// Copy the config file
fs.copyFileSync(sharedConfigPath, frontendConfigPath);

console.log('✅ Copied shared config to frontend');
console.log(`   From: ${sharedConfigPath}`);
console.log(`   To: ${frontendConfigPath}`);
