#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { generateiOSTokens } from '../src/generators/ios.js';
import { generateAndroidTokens } from '../src/generators/android.js';
import { generateWebTokens } from '../src/generators/web.js';

const tokensDir = join(__dirname, '../src/tokens');
const distDir = join(__dirname, '../dist');

// Load all token files
const colors = JSON.parse(readFileSync(join(tokensDir, 'colors.json'), 'utf8'));
const typography = JSON.parse(readFileSync(join(tokensDir, 'typography.json'), 'utf8'));
const spacing = JSON.parse(readFileSync(join(tokensDir, 'spacing.json'), 'utf8'));
const breakpoints = JSON.parse(readFileSync(join(tokensDir, 'breakpoints.json'), 'utf8'));
const shadows = JSON.parse(readFileSync(join(tokensDir, 'shadows.json'), 'utf8'));

const allTokens = {
  ...colors,
  ...typography,
  ...spacing,
  ...breakpoints,
  ...shadows
};

// Generate tokens for each platform
generateiOSTokens({
  outputPath: join(distDir, 'ios'),
  tokens: allTokens
});

generateAndroidTokens({
  outputPath: join(distDir, 'android'),
  tokens: allTokens
});

generateWebTokens({
  outputPath: join(distDir, 'web'),
  tokens: allTokens
});

console.log('All design tokens generated successfully!');