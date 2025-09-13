// Utility functions for color contrast and palette filtering
// Converts a hex color string to an RGB tuple
export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");

  const HEX_SHORT_LENGTH = 3; // Length of short hex color (e.g. #fff)
  const HEX_BASE = 16; // Base for hex color parsing
  const RGB_MASK = 255; // Mask for extracting 8 bits

  if (hex.length === HEX_SHORT_LENGTH)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(hex, HEX_BASE);
  return [
    (num >> 16) & RGB_MASK || 0,
    (num >> 8) & RGB_MASK || 0,
    num & RGB_MASK || 0,
  ];
}

// Calculates the relative luminance of an RGB color
export function luminance(rgb: [number, number, number]) {
  const SRGB_THRESHOLD = 0.03928; // Threshold for sRGB linearization
  const SRGB_DIVISOR = 12.92; // Divisor for sRGB linearization below threshold
  const SRGB_OFFSET = 0.055; // Offset for sRGB linearization above threshold
  const SRGB_SCALE = 1.055; // Scale for sRGB linearization above threshold
  const SRGB_EXPONENT = 2.4; // Exponent for sRGB linearization above threshold
  const RGB_MAX = 255; // Maximum value for RGB channel

  // LUMINANCE_RED, LUMINANCE_GREEN, LUMINANCE_BLUE: Weights for luminance calculation
  const LUMINANCE_RED = 0.2126;
  const LUMINANCE_GREEN = 0.7152;
  const LUMINANCE_BLUE = 0.0722;
  const mapped = rgb.map((v) => {
    v = v ?? 0;
    v /= RGB_MAX;
    return v <= SRGB_THRESHOLD
      ? v / SRGB_DIVISOR
      : Math.pow((v + SRGB_OFFSET) / SRGB_SCALE, SRGB_EXPONENT);
  });
  const r = mapped[0] ?? 0;
  const g = mapped[1] ?? 0;
  const b = mapped[2] ?? 0;
  return LUMINANCE_RED * r + LUMINANCE_GREEN * g + LUMINANCE_BLUE * b;
}

// Calculates the contrast ratio between two luminance values
export function contrast(l1: number, l2: number) {
  const CONTRAST_EPSILON = 0.05; // Small constant added for WCAG contrast calculation
  return (
    (Math.max(l1, l2) + CONTRAST_EPSILON) /
    (Math.min(l1, l2) + CONTRAST_EPSILON)
  );
}

// Filters a palette to only include colors with sufficient contrast against the background
export function getContrastColorPalette(palette: string[], background: string) {
  const MIN_CONTRAST_RATIO = 3; // Minimum contrast ratio for non-text graphics (WCAG recommendation)
  const bgLum = luminance(hexToRgb(background));
  return palette.filter((c) => {
    try {
      const lum = luminance(hexToRgb(c));
      return contrast(lum, bgLum) >= MIN_CONTRAST_RATIO;
    } catch {
      return false;
    }
  });
}
