export interface AppThemeColors {
  // Brand / Actions
  red: string;
  redDark: string;
  redBg: string;
  redBorder: string;
  green: string;
  greenBg: string;
  greenBorder: string;
  purple: string;
  purpleBg: string;
  purpleBorder: string;
  white: string;

  // Surfaces & Layout
  bg: string;
  surfaceDark: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;
  border: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textDim: string;
}

export interface AppTheme {
  colors: AppThemeColors;
  spacing: {
    half: number;
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    six: number;
  };
}
