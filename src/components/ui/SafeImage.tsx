"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/hero/luxury_gift_hero.jpg",
  className = "",
  priority = false,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${props.fill ? "w-full h-full" : ""}`}>
      {/* Subtle skeleton shimmer during load */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#EFE5D9]/60 animate-pulse pointer-events-none z-10" />
      )}

      <Image
        {...props}
        src={hasError ? fallbackSrc : imgSrc}
        alt={alt || "Giftora curated gift"}
        priority={priority}
        className={`${className} transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
