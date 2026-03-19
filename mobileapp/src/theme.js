/**
 * theme.js
 * Design tokens mirroring the web app's CSS variables.
 * Warm parchment palette with saffron/brown accents.
 */

export const Colors = {
  bg:          '#faf7f2',
  surface:     '#ffffff',
  border:      '#e8e0d5',
  accent:      '#8b5e3c',
  accentLight: '#f5ede4',
  accentDark:  '#7a4f2f',
  pali:        '#7c2d12',
  english:     '#1e3a5f',
  vietnamese:  '#4a1d6b',
  text:        '#2d2420',
  muted:       '#8a7a6e',
  muted2:      '#4e69aa',
  white:       '#ffffff',
  error:       '#c0392b',
  highlight:   '#fde68a',
  overlay:     'rgba(20,12,6,0.55)',
};

export const Typography = {
  serif:  'Georgia',          // fallback; Crimson Pro via expo-font if loaded
  sans:   'System',
  sizes: {
    xs:   11,
    sm:   13,
    base: 16,
    md:   18,
    lg:   20,
    xl:   24,
    xxl:  32,
  },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const Radius = {
  sm: 6,
  md: 8,
  lg: 14,
  xl: 18,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
};
