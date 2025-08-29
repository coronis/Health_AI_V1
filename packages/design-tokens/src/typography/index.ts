/**
 * HealthCoachAI Typography Design Tokens
 * Typography system based on Inter and Poppins font families
 */

export const fontFamilies = {
  // Primary font family - Inter (for body text, UI elements)
  primary: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],

  // Secondary font family - Poppins (for headings, emphasis)
  secondary: [
    'Poppins',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],

  // Monospace for code and data
  mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
} as const;

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const;

export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography scale definitions
export const typographyScale = {
  // Display headings (Poppins)
  display: {
    large: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes['6xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    medium: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    small: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Headings (Poppins)
  heading: {
    h1: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h2: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h3: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontFamily: fontFamilies.secondary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Body text (Inter)
  body: {
    large: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Labels and UI text (Inter)
  label: {
    large: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Caption and helper text (Inter)
  caption: {
    large: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontFamily: fontFamilies.primary,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Code and monospace text
  code: {
    large: {
      fontFamily: fontFamilies.mono,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontFamily: fontFamilies.mono,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontFamily: fontFamilies.mono,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
} as const;

// Button typography variants
export const buttonTypography = {
  large: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.normal,
  },
  medium: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  },
} as const;

// Mobile-specific typography adjustments
export const mobileTypography = {
  // Larger touch targets and readability on mobile
  display: {
    large: {
      ...typographyScale.display.large,
      fontSize: fontSizes['5xl'], // Slightly smaller on mobile
    },
    medium: {
      ...typographyScale.display.medium,
      fontSize: fontSizes['4xl'],
    },
    small: {
      ...typographyScale.display.small,
      fontSize: fontSizes['3xl'],
    },
  },
  heading: {
    h1: {
      ...typographyScale.heading.h1,
      fontSize: fontSizes['2xl'],
    },
    h2: {
      ...typographyScale.heading.h2,
      fontSize: fontSizes.xl,
    },
    h3: {
      ...typographyScale.heading.h3,
      fontSize: fontSizes.lg,
    },
  },
} as const;

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  scale: typographyScale,
  button: buttonTypography,
  mobile: mobileTypography,
} as const;

export type Typography = typeof typography;
export type FontFamilies = typeof fontFamilies;
export type FontWeights = typeof fontWeights;
export type FontSizes = typeof fontSizes;
