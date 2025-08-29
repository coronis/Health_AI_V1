const fs = require('fs-extra');
const path = require('path');

// Simple script to build design tokens
async function buildTokens() {
  const tokensDir = path.join(__dirname, '../src/tokens');
  const distDir = path.join(__dirname, '../dist');
  
  // Ensure dist directory exists
  await fs.ensureDir(distDir);
  
  // Read token files
  const colors = await fs.readJson(path.join(tokensDir, 'colors.json'));
  const typography = await fs.readJson(path.join(tokensDir, 'typography.json'));
  const spacing = await fs.readJson(path.join(tokensDir, 'spacing.json'));
  
  // Create combined tokens
  const tokens = {
    colors,
    typography,
    spacing
  };
  
  // Write combined tokens
  await fs.writeJson(path.join(distDir, 'tokens.json'), tokens, { spaces: 2 });
  
  console.log('✅ Design tokens built successfully');
}

buildTokens().catch(console.error);