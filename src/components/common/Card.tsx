import React from "react";
import "./Card.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick, hoverable = false }) => {
  return (
    <div
      className={`card${hoverable ? " card--hoverable" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
