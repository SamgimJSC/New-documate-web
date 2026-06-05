import React from "react";
import "./Badge.css";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "danger" | "warning" | "pro";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", children }) => {
  return <span className={`badge badge--${variant}`}>{children}</span>;
};

export default Badge;
