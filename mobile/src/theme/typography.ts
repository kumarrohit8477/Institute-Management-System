// IMS Mobile — Design System: Typography
import { TextStyle } from "react-native";

export const Typography = {
  // Display
  display: {
    fontSize: 32,
    fontWeight: "800" as TextStyle["fontWeight"],
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  // Headings
  h1: {
    fontSize: 24,
    fontWeight: "800" as TextStyle["fontWeight"],
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700" as TextStyle["fontWeight"],
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  h3: {
    fontSize: 17,
    fontWeight: "700" as TextStyle["fontWeight"],
    lineHeight: 24,
  },
  h4: {
    fontSize: 15,
    fontWeight: "600" as TextStyle["fontWeight"],
    lineHeight: 22,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as TextStyle["fontWeight"],
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as TextStyle["fontWeight"],
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: "400" as TextStyle["fontWeight"],
    lineHeight: 20,
  },

  // Labels
  label: {
    fontSize: 12,
    fontWeight: "700" as TextStyle["fontWeight"],
    letterSpacing: 0.5,
    textTransform: "uppercase" as TextStyle["textTransform"],
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: "700" as TextStyle["fontWeight"],
    letterSpacing: 0.8,
    textTransform: "uppercase" as TextStyle["textTransform"],
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: "400" as TextStyle["fontWeight"],
    lineHeight: 18,
  },

  // Button
  button: {
    fontSize: 14,
    fontWeight: "600" as TextStyle["fontWeight"],
    letterSpacing: 0.2,
  },
  buttonLarge: {
    fontSize: 16,
    fontWeight: "700" as TextStyle["fontWeight"],
    letterSpacing: 0.2,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;
