"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallback?: React.ReactNode;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  fallback,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // If no src or error, show fallback
  if (!src || error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 text-gray-400 text-sm",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        No image
      </div>
    );
  }

  // Determine if this is an external image
  const isExternal = src.startsWith("http://") || src.startsWith("https://");

  // For fill mode
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          className
        )}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        priority={priority}
        onError={() => setError(true)}
        unoptimized={isExternal}
      />
    );
  }

  // For fixed dimensions
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={cn(
        objectFit === "cover" && "object-cover",
        objectFit === "contain" && "object-contain",
        className
      )}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      unoptimized={isExternal}
    />
  );
}

// Avatar-specific optimized image
interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackInitial?: string;
}

const sizeMap = {
  sm: { pixels: 32, className: "h-8 w-8" },
  md: { pixels: 40, className: "h-10 w-10" },
  lg: { pixels: 64, className: "h-16 w-16" },
  xl: { pixels: 96, className: "h-24 w-24" },
};

export function AvatarImage({
  src,
  alt,
  size = "md",
  className,
  fallbackInitial,
}: AvatarImageProps) {
  const [error, setError] = useState(false);
  const { pixels, className: sizeClass } = sizeMap[size];

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600",
          sizeClass,
          className
        )}
      >
        {fallbackInitial || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  const isExternal = src.startsWith("http://") || src.startsWith("https://");

  return (
    <Image
      src={src}
      alt={alt}
      width={pixels}
      height={pixels}
      className={cn("rounded-full object-cover", sizeClass, className)}
      onError={() => setError(true)}
      unoptimized={isExternal}
    />
  );
}

// Property thumbnail optimized image
interface PropertyThumbnailProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  className?: string;
  priority?: boolean;
}

export function PropertyThumbnail({
  src,
  alt,
  aspectRatio = "16:9",
  className,
  priority = false,
}: PropertyThumbnailProps) {
  const [error, setError] = useState(false);

  const aspectClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 text-gray-400 text-sm",
          aspectClasses[aspectRatio],
          className
        )}
      >
        No image
      </div>
    );
  }

  const isExternal = src.startsWith("http://") || src.startsWith("https://");

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        onError={() => setError(true)}
        unoptimized={isExternal}
      />
    </div>
  );
}
