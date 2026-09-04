// IMS Mobile — Design System: Color Palette
// Professional multi-role color scheme

export const Colors = {
  // Brand
  primary: "#4F46E5",       // Indigo-600
  primaryDark: "#3730A3",   // Indigo-800
  primaryLight: "#EEF2FF",  // Indigo-50

  // Role-specific accents
  student: {
    primary: "#0EA5E9",     // Sky-500
    dark: "#0369A1",        // Sky-700
    light: "#E0F2FE",       // Sky-100
    gradient: ["#0EA5E9", "#0284C7"],
  },
  teacher: {
    primary: "#10B981",     // Emerald-500
    dark: "#065F46",        // Emerald-900
    light: "#D1FAE5",       // Emerald-100
    gradient: ["#10B981", "#059669"],
  },
  admin: {
    primary: "#F59E0B",     // Amber-500
    dark: "#92400E",        // Amber-900
    light: "#FEF3C7",       // Amber-100
    gradient: ["#F59E0B", "#D97706"],
  },
  superadmin: {
    primary: "#8B5CF6",     // Violet-500
    dark: "#4C1D95",        // Violet-900
    light: "#EDE9FE",       // Violet-100
    gradient: ["#8B5CF6", "#7C3AED"],
  },

  // Neutrals
  background: "#F8FAFC",    // Slate-50
  surface: "#FFFFFF",       // White
  surfaceElevated: "#F1F5F9", // Slate-100
  border: "#E2E8F0",        // Slate-200
  borderLight: "#F1F5F9",   // Slate-100

  // Text
  textPrimary: "#0F172A",   // Slate-900
  textSecondary: "#475569", // Slate-600
  textMuted: "#94A3B8",     // Slate-400
  textOnDark: "#FFFFFF",

  // Status
  success: "#10B981",       // Emerald-500
  successLight: "#D1FAE5",  // Emerald-100
  successDark: "#065F46",

  warning: "#F59E0B",       // Amber-500
  warningLight: "#FEF3C7",  // Amber-100
  warningDark: "#92400E",

  danger: "#EF4444",        // Red-500
  dangerLight: "#FEE2E2",   // Red-100
  dangerDark: "#991B1B",

  info: "#3B82F6",          // Blue-500
  infoLight: "#DBEAFE",     // Blue-100
  infoDark: "#1E40AF",

  // Shadows
  shadowColor: "#0F172A",
} as const;

export type RoleColor = "student" | "teacher" | "admin" | "superadmin";

export const getRoleColors = (role: RoleColor) => Colors[role];
