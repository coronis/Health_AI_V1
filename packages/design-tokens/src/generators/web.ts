// Web token generator (CSS/JS)
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TokenGeneratorOptions {
  outputPath: string;
  tokens: any;
}

export function generateWebTokens({ outputPath, tokens }: TokenGeneratorOptions) {
  let cssCode = `/* Auto-generated design tokens for Web */
/* DO NOT EDIT MANUALLY */

:root {
`;

  // Generate CSS custom properties
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([colorName, colorValues]: [string, any]) => {
      Object.entries(colorValues).forEach(([shade, value]: [string, any]) => {
        cssCode += `  --color-${colorName}-${shade}: ${value};\n`;
      });
    });
  }

  if (tokens.typography?.fontSizes) {
    Object.entries(tokens.typography.fontSizes).forEach(([sizeName, sizeValue]: [string, any]) => {
      cssCode += `  --font-size-${sizeName}: ${sizeValue};\n`;
    });
  }

  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([spaceName, spaceValue]: [string, any]) => {
      cssCode += `  --spacing-${spaceName}: ${spaceValue};\n`;
    });
  }

  cssCode += `}
`;

  // Generate JavaScript/TypeScript tokens
  let jsCode = `// Auto-generated design tokens for Web
// DO NOT EDIT MANUALLY

export const tokens = ${JSON.stringify(tokens, null, 2)};

export default tokens;
`;

  writeFileSync(join(outputPath, 'tokens.css'), cssCode);
  writeFileSync(join(outputPath, 'tokens.js'), jsCode);
  console.log('Web tokens generated successfully');
}