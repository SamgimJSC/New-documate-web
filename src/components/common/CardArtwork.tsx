import React, { useState } from "react";
import "./CardArtwork.css";

type CardArtworkTone = "green" | "purple" | "blue";

interface CardArtworkProps {
  imgUrl?: string;
  alt: string;
  tone?: CardArtworkTone;
  className?: string;
  children?: React.ReactNode;
}

const CardArtwork: React.FC<CardArtworkProps> = ({ imgUrl, alt, tone = "green", className, children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div className={`card-artwork card-artwork--${tone}${className ? ` ${className}` : ""}`}>
      {imgUrl && (
        <img
          src={imgUrl}
          alt={alt}
          className={`card-artwork__img${isPortrait ? " card-artwork__img--rotated" : ""}`}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalHeight > img.naturalWidth) setIsPortrait(true);
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {children}
    </div>
  );
};

export default CardArtwork;
