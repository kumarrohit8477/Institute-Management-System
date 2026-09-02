import React, { ReactNode } from "react";

export const Header: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}> = ({ title, subtitle, onBack, rightAction }) => {
  return (
    <div
      style={{
        height: "56px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#334155"
            }}
          >
            ←
          </button>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "11px", color: "#64748b" }}>{subtitle}</div>}
        </div>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};

export const Card: React.FC<{ children: ReactNode; style?: React.CSSProperties; onClick?: () => void }> = ({
  children,
  style,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      {children}
    </div>
  );
};

export const Badge: React.FC<{ label: string; variant?: "success" | "primary" | "warning" | "danger" | "gray" }> = ({
  label,
  variant = "primary"
}) => {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: "#dcfce7", text: "#15803d" },
    primary: { bg: "#dbeafe", text: "#1d4ed8" },
    warning: { bg: "#fef3c7", text: "#b45309" },
    danger: { bg: "#fee2e2", text: "#b91c1c" },
    gray: { bg: "#f1f5f9", text: "#475569" }
  };

  const c = colors[variant] || colors.primary;

  return (
    <span
      style={{
        backgroundColor: c.bg,
        color: c.text,
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        display: "inline-block"
      }}
    >
      {label}
    </span>
  );
};

export const Button: React.FC<{
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger" | "success";
  style?: React.CSSProperties;
}> = ({ title, onClick, disabled, variant = "primary", style }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: "#3b82f6", text: "#ffffff", border: "transparent" },
    outline: { bg: "#ffffff", text: "#0f172a", border: "#cbd5e1" },
    danger: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
    success: { bg: "#10b981", text: "#ffffff", border: "transparent" }
  };

  const s = styles[variant] || styles.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: "100%",
        textAlign: "center",
        ...style
      }}
    >
      {title}
    </button>
  );
};

export const BottomTabBar: React.FC<{
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}> = ({ currentTab, onSelectTab, unreadCount = 0 }) => {
  const tabs = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "academics", label: "Classes", icon: "📚" },
    { id: "tests", label: "Tests", icon: "📝" },
    { id: "fees", label: "Fees", icon: "💳" },
    { id: "notifications", label: "Alerts", icon: "🔔", badge: unreadCount },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <div
      style={{
        height: "60px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        position: "sticky",
        bottom: 0,
        zIndex: 20
      }}
    >
      {tabs.map((t) => {
        const isActive = currentTab === t.id;
        return (
          <div
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flex: 1,
              position: "relative",
              color: isActive ? "#3b82f6" : "#64748b"
            }}
          >
            <span style={{ fontSize: "18px" }}>{t.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, marginTop: "2px" }}>
              {t.label}
            </span>
            {Boolean(t.badge && t.badge > 0) && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "18px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: 800,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {t.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
