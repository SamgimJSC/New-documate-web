import React from "react";
import "./Button.css";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size}${fullWidth ? " btn--full" : ""}${loading ? " btn--loading" : ""}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="btn__spinner" />}
      {children}
    </button>
  );
};

export default Button;
