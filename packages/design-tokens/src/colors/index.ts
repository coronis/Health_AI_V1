/**
 * HealthCoachAI Brand Colors
 * Primary brand colors based on turquoise/teal and coral accents
 */

export const brandColors = {
  // Primary brand color - Turquoise/Teal
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main brand color
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  // Secondary brand color - Coral/Orange
  secondary: {
    50: '#fef7ee',
    100: '#fdecd7',
    200: '#fbd5ae',
    300: '#f8b77a',
    400: '#f59044',
    500: '#f0653e', // Main secondary color
    600: '#e14d2a',
    700: '#bb3a20',
    800: '#952f20',
    900: '#78281f',
    950: '#411110',
  },
} as const;

export const semanticColors = {
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  // Info colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

export const neutralColors = {
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  // Pure colors
  white: '#ffffff',
  black: '#000000',
} as const;

export const healthColors = {
  // Health-specific colors
  nutrition: {
    protein: '#8b5cf6', // Purple
    carbs: '#f59e0b', // Amber
    fat: '#ef4444', // Red
    fiber: '#22c55e', // Green
    sugar: '#ec4899', // Pink
  },
  fitness: {
    cardio: '#ef4444', // Red
    strength: '#3b82f6', // Blue
    flexibility: '#22c55e', // Green
    recovery: '#6366f1', // Indigo
  },
  wellness: {
    sleep: '#6366f1', // Indigo
    stress: '#f59e0b', // Amber
    energy: '#22c55e', // Green
    mood: '#ec4899', // Pink
  },
} as const;

// Theme-specific color mappings
export const lightTheme = {
  background: {
    primary: neutralColors.white,
    secondary: neutralColors.gray[50],
    tertiary: neutralColors.gray[100],
  },
  surface: {
    primary: neutralColors.white,
    secondary: neutralColors.gray[50],
    elevated: neutralColors.white,
  },
  text: {
    primary: neutralColors.gray[900],
    secondary: neutralColors.gray[600],
    tertiary: neutralColors.gray[400],
    inverse: neutralColors.white,
  },
  border: {
    primary: neutralColors.gray[200],
    secondary: neutralColors.gray[100],
    focus: brandColors.primary[500],
  },
} as const;

export const darkTheme = {
  background: {
    primary: neutralColors.gray[900],
    secondary: neutralColors.gray[800],
    tertiary: neutralColors.gray[700],
  },
  surface: {
    primary: neutralColors.gray[800],
    secondary: neutralColors.gray[700],
    elevated: neutralColors.gray[750] || neutralColors.gray[700],
  },
  text: {
    primary: neutralColors.gray[50],
    secondary: neutralColors.gray[300],
    tertiary: neutralColors.gray[400],
    inverse: neutralColors.gray[900],
  },
  border: {
    primary: neutralColors.gray[700],
    secondary: neutralColors.gray[600],
    focus: brandColors.primary[400],
  },
} as const;

// Accessibility helpers
export const contrastColors = {
  // Colors that provide proper contrast ratios
  onPrimary: neutralColors.white,
  onSecondary: neutralColors.white,
  onSuccess: neutralColors.white,
  onWarning: neutralColors.gray[900],
  onError: neutralColors.white,
  onInfo: neutralColors.white,
  onSurface: neutralColors.gray[900],
  onBackground: neutralColors.gray[900],
} as const;

export const colors = {
  brand: brandColors,
  semantic: semanticColors,
  neutral: neutralColors,
  health: healthColors,
  light: lightTheme,
  dark: darkTheme,
  contrast: contrastColors,
} as const;

export type Colors = typeof colors;
export type BrandColors = typeof brandColors;
export type SemanticColors = typeof semanticColors;
export type NeutralColors = typeof neutralColors;
export type HealthColors = typeof healthColors;