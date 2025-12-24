/**
 * Japanese Design System - Golden Ratio Spacing
 * Based on Ma (間) - negative space principle
 * Uses golden ratio: φ = 1.618
 */

export const GOLDEN_RATIO = 1.618;

// Base unit: 8px
export const BASE_UNIT = 8;

// Golden ratio spacing scale (in pixels)
export const SPACING = {
  xs: 8,    // 0.5rem - Minimal Ma
  sm: 13,   // 0.8125rem - φ × 8
  md: 21,   // 1.3125rem - φ² × 8
  lg: 34,   // 2.125rem - φ³ × 8
  xl: 55,   // 3.4375rem - φ⁴ × 8
  xxl: 89,  // 5.5625rem - φ⁵ × 8
};

// Tailwind spacing mapping
export const TAILWIND_SPACING = {
  xs: 'gap-2',      // 8px
  sm: 'gap-3',      // 12px (~13px)
  md: 'gap-5',      // 20px (~21px)
  lg: 'gap-8',      // 32px (~34px)
  xl: 'gap-14',     // 56px (~55px)
  xxl: 'gap-20',    // 80px (~89px)
};

// Card sizing standards
export const CARD_HEIGHTS = {
  compact: 'h-40',     // 160px - Lists, small spaces
  standard: 'h-48',    // 192px - Default cards
  feature: 'h-64',     // 256px - Featured content
  hero: 'h-80',        // 320px - Hero sections (MAX)
};

// Card padding standards
export const CARD_PADDING = {
  compact: 'p-4',      // 16px
  standard: 'p-5',     // 20px
  comfortable: 'p-6',  // 24px
  spacious: 'p-8',     // 32px (hero only)
};

// Font sizes following golden ratio
export const FONT_SIZES = {
  xs: 'text-xs',       // 12px
  sm: 'text-sm',       // 14px
  base: 'text-base',   // 16px
  lg: 'text-lg',       // 18px
  xl: 'text-xl',       // 20px
  '2xl': 'text-2xl',   // 24px
  '3xl': 'text-3xl',   // 30px
  '4xl': 'text-4xl',   // 36px
};

// Container max widths
export const CONTAINER_MAX_WIDTH = {
  sm: 'max-w-sm',      // 384px
  md: 'max-w-md',      // 448px
  lg: 'max-w-lg',      // 512px
  xl: 'max-w-xl',      // 576px
  '2xl': 'max-w-2xl',  // 672px
  '3xl': 'max-w-3xl',  // 768px
  '4xl': 'max-w-4xl',  // 896px
  '5xl': 'max-w-5xl',  // 1024px
  '6xl': 'max-w-6xl',  // 1152px
  '7xl': 'max-w-7xl',  // 1280px
  full: 'max-w-full',
};

// Grid column standards
export const GRID_COLS = {
  mobile: 'grid-cols-1',
  tablet: 'md:grid-cols-2',
  desktop: 'lg:grid-cols-3',
  wide: 'xl:grid-cols-4',
};

/**
 * Calculate golden ratio spacing
 * @param {number} base - Base value
 * @param {number} power - Power of golden ratio (default: 1)
 * @returns {number} Calculated value
 */
export function calculateGoldenSpacing(base = BASE_UNIT, power = 1) {
  return Math.round(base * Math.pow(GOLDEN_RATIO, power));
}

/**
 * Get responsive grid classes for cards
 * @param {string} cardType - Card type: 'compact', 'standard', 'feature', 'hero'
 * @returns {string} Grid classes
 */
export function getCardGridClasses(cardType = 'standard') {
  switch (cardType) {
    case 'compact':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
    case 'standard':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
    case 'feature':
      return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    case 'hero':
      return 'grid grid-cols-1 gap-8';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
  }
}

/**
 * Get section spacing classes
 * @param {string} size - Spacing size: 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'
 * @returns {string} Spacing classes
 */
export function getSectionSpacing(size = 'md') {
  const spacingMap = {
    xs: 'py-4',
    sm: 'py-6',
    md: 'py-8',
    lg: 'py-12',
    xl: 'py-16',
    xxl: 'py-24',
  };
  return spacingMap[size] || spacingMap.md;
}

export default {
  GOLDEN_RATIO,
  BASE_UNIT,
  SPACING,
  TAILWIND_SPACING,
  CARD_HEIGHTS,
  CARD_PADDING,
  FONT_SIZES,
  CONTAINER_MAX_WIDTH,
  GRID_COLS,
  calculateGoldenSpacing,
  getCardGridClasses,
  getSectionSpacing,
};
