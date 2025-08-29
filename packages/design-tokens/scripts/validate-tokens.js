const fs = require('fs-extra');
const path = require('path');

// Simple validation script for design tokens
async function validateTokens() {
  const tokensDir = path.join(__dirname, '../src/tokens');
  
  try {
    // Check if token files exist and are valid JSON
    const colors = await fs.readJson(path.join(tokensDir, 'colors.json'));
    const typography = await fs.readJson(path.join(tokensDir, 'typography.json'));
    const spacing = await fs.readJson(path.join(tokensDir, 'spacing.json'));
    
    console.log('✅ All token files are valid JSON');
    
    // Basic structure validation
    if (!colors.colors) {
      throw new Error('Colors tokens missing colors object');
    }
    
    if (!typography.fontFamilies || !typography.fontSizes) {
      throw new Error('Typography tokens missing required objects');
    }
    
    if (!spacing.spacing) {
      throw new Error('Spacing tokens missing spacing object');
    }
    
    console.log('✅ Token structure validation passed');
    console.log('✅ Design tokens validation completed successfully');
    
  } catch (error) {
    console.error('❌ Token validation failed:', error.message);
    process.exit(1);
  }
}

validateTokens();