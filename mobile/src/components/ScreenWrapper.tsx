import React, { ReactNode } from "react";

export const ScreenWrapper: React.FC<{ children: ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        color: "#0f172a",
        maxWidth: "480px",
        margin: "0 auto",
        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        position: "relative",
        ...style
      }}
    >
      {children}
    </div>
  );
};
