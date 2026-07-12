import { AppTheme } from './types';

export const LightTheme: AppTheme = {
  colors: {
    // Brand / Actions (light-contrast optimized)
    red: '#C2573F',
    redDark: '#9C4737',
    redBg: 'rgba(194, 87, 63, 0.08)',
    redBorder: 'rgba(194, 87, 63, 0.25)',
    green: '#2A768A', // Darkened for better contrast on white backgrounds
    greenBg: 'rgba(42, 118, 138, 0.08)',
    greenBorder: 'rgba(42, 118, 138, 0.2)',
    purple: '#456670',
    purpleBg: 'rgba(69, 102, 112, 0.08)',
    purpleBorder: 'rgba(69, 102, 112, 0.2)',
    white: '#FFFFFF',

    // Surfaces & Layout (Light surface palette)
    bg: '#F5F7F8',
    surfaceDark: '#E4E8EA',
    surface: '#FFFFFF',
    surfaceLight: '#EDF1F2',
    surfaceBorder: '#CCD4D6',
    border: '#E1E6E8',

    // Text (Darker contrast values)
    textPrimary: '#171C1E',
    textSecondary: '#414B4E',
    textTertiary: '#6B787C',
    textMuted: '#8E9C9F',
    textDim: '#B0BABB',
  },
  spacing: {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
  },
};
