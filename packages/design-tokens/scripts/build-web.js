const fs = require('fs-extra');
const path = require('path');

// Build web tokens
async function buildWeb() {
  const distDir = path.join(__dirname, '../dist/web');
  await fs.ensureDir(distDir);
  
  // Read combined tokens
  const tokens = await fs.readJson(path.join(__dirname, '../dist/tokens.json'));
  
  // Generate CSS custom properties
  let cssContent = `/* HealthCoachAI Design Tokens */
/* Generated automatically - do not edit */

:root {
  /* Colors */
  --color-primary-teal: #14B8A6;
  --color-secondary-orange: #F0653E;
  --color-text-primary: #18181B;
  --color-text-secondary: #52525B;
  --color-background-primary: #FFFFFF;
  --color-background-secondary: #FAFAFA;
  
  /* Typography */
  --font-size-heading-large: 1.875rem; /* 30px */
  --font-size-heading-medium: 1.5rem; /* 24px */
  --font-size-body-large: 1.125rem; /* 18px */
  --font-size-body-medium: 1rem; /* 16px */
  --font-size-caption: 0.75rem; /* 12px */
  
  /* Font Families */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-heading: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-s: 0.5rem; /* 8px */
  --spacing-m: 1rem; /* 16px */
  --spacing-l: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
  --spacing-xxl: 3rem; /* 48px */
}
`;
  
  await fs.writeFile(path.join(distDir, 'tokens.css'), cssContent);
  
  // Also generate TypeScript definitions
  let tsContent = `// HealthCoachAI Design Tokens
// Generated automatically - do not edit

export const designTokens = {
  colors: {
    primary: {
      teal: '#14B8A6',
    },
    secondary: {
      orange: '#F0653E',
    },
    text: {
      primary: '#18181B',
      secondary: '#52525B',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
    },
  },
  typography: {
    fontSize: {
      headingLarge: '1.875rem',
      headingMedium: '1.5rem',
      bodyLarge: '1.125rem',
      bodyMedium: '1rem',
      caption: '0.75rem',
    },
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  },
  spacing: {
    xs: '0.25rem',
    s: '0.5rem',
    m: '1rem',
    l: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
} as const;

export type DesignTokens = typeof designTokens;
`;
  
  await fs.writeFile(path.join(distDir, 'tokens.ts'), tsContent);
  console.log('✅ Web tokens built successfully');
}

buildWeb().catch(console.error);