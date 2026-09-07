import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Colors, RoleColor } from "../theme/colors";
import { Typography, Spacing, Radius } from "../theme/typography";

// ─────────────────────────────────────────────────────────
// HEADER & PAGEHEADER
// ─────────────────────────────────────────────────────────
export const Header: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  accentColor?: string;
}> = ({ title, subtitle, onBack, rightAction, accentColor = Colors.primary }) => {
  return (
    <View style={[styles.headerContainer, { borderBottomColor: accentColor + "20" }]}>
      <View style={styles.headerLeft}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <View style={[styles.backCircle, { backgroundColor: accentColor + "15" }]}>
              <Text style={[styles.backIcon, { color: accentColor }]}>←</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
};

export const PageHeader = Header;

// ─────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────
export const Card: React.FC<{
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onClick?: () => void;
}> = ({ children, style, onPress, onClick }) => {
  const handler = onPress || onClick;
  if (handler) {
    return (
      <TouchableOpacity
        onPress={handler}
        style={[styles.card, style]}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────
export const Badge: React.FC<{
  label: string;
  variant?: "success" | "primary" | "warning" | "danger" | "gray";
  style?: StyleProp<ViewStyle>;
}> = ({ label, variant = "primary", style }) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    success: { bg: Colors.successLight, text: Colors.successDark },
    primary: { bg: Colors.primaryLight, text: Colors.primaryDark },
    warning: { bg: Colors.warningLight, text: Colors.warningDark },
    danger: { bg: Colors.dangerLight, text: Colors.dangerDark },
    gray: { bg: Colors.surfaceElevated, text: Colors.textSecondary },
  };
  const c = colorMap[variant] || colorMap.primary;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────────────────
export const Button: React.FC<{
  title: string;
  onPress?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger" | "success";
  style?: ViewStyle;
  textStyle?: TextStyle;
}> = ({ title, onPress, onClick, disabled, loading, variant = "primary", style, textStyle }) => {
  const handler = onPress || onClick;

  const styleMap: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: Colors.primary, text: "#fff", border: Colors.primary },
    outline: { bg: "transparent", text: Colors.primary, border: Colors.primary },
    danger: { bg: Colors.dangerLight, text: Colors.danger, border: Colors.dangerLight },
    success: { bg: Colors.success, text: "#fff", border: Colors.success },
  };
  const s = styleMap[variant] || styleMap.primary;

  return (
    <TouchableOpacity
      onPress={handler}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: s.bg,
          borderColor: s.border,
          opacity: (disabled || loading) ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={s.text} />
      ) : (
        <Text style={[styles.buttonText, { color: s.text }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────
// BOTTOM TAB BAR
// ─────────────────────────────────────────────────────────
interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export const BottomTabBar: React.FC<{
  currentTab: string;
  onSelectTab: (tab: string) => void;
  tabs: TabItem[];
  accentColor?: string;
}> = ({ currentTab, onSelectTab, tabs, accentColor = Colors.primary }) => {
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => {
        const isActive = currentTab === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => onSelectTab(t.id)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: accentColor + "20" }]} />
              )}
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{t.icon}</Text>
              {t.badge && t.badge > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{t.badge > 9 ? "9+" : t.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? accentColor : Colors.textMuted },
                isActive && styles.tabLabelActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────────────────
// ROLE BANNER
// ─────────────────────────────────────────────────────────
export const RoleBanner: React.FC<{
  role: RoleColor;
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}> = ({ role, title, subtitle, rightContent }) => {
  const roleConfig = {
    student: { emoji: "👨‍🎓", color: Colors.student.primary, darkColor: Colors.student.dark },
    teacher: { emoji: "👨‍🏫", color: Colors.teacher.primary, darkColor: Colors.teacher.dark },
    admin: { emoji: "🛡️", color: Colors.admin.primary, darkColor: Colors.admin.dark },
    superadmin: { emoji: "👑", color: Colors.superadmin.primary, darkColor: Colors.superadmin.dark },
  };
  const cfg = roleConfig[role];

  return (
    <View style={[styles.banner, { backgroundColor: cfg.darkColor }]}>
      <View style={[styles.bannerAccent, { backgroundColor: cfg.color + "30" }]} />
      <View style={styles.bannerContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.bannerSubtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.bannerEmoji}>{cfg.emoji}</Text>
        {rightContent}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{
  title: string;
  action?: { label: string; onPress: () => void };
  actionText?: string;
  onAction?: () => void;
}> = ({ title, action, actionText, onAction }) => {
  const act = action || (actionText && onAction ? { label: actionText, onPress: onAction } : undefined);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {act && (
        <TouchableOpacity onPress={act.onPress} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{act.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────
export const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}> = ({ value, onChangeText, placeholder = "Search..." }) => (
  <View style={styles.searchContainer}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      autoCorrect={false}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
        <Text style={styles.searchClear}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    height: 58,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  backButton: {
    padding: 2,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  button: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 46,
  },
  buttonText: {
    ...Typography.button,
  },
  tabBar: {
    height: 64,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 30,
  },
  activeIndicator: {
    position: "absolute",
    width: 36,
    height: 28,
    borderRadius: 10,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  tabLabelActive: {
    fontWeight: "700",
  },
  banner: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    position: "relative",
  },
  bannerAccent: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    right: -20,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  bannerTitle: {
    ...Typography.h3,
    color: "#fff",
    marginBottom: 2,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
  },
  bannerEmoji: {
    fontSize: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sectionAction: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
    marginBottom: Spacing.base,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 2,
  },
  searchClear: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "700",
    padding: 2,
  },
});
