"use client";

import Link from "next/link";
import { brandingConfig, getBrandShortName, getPoweredByText } from "@/lib/branding";

interface BrandLogoProps {
  href?: string;
  showPoweredBy?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function BrandLogo({
  href = "/dashboard",
  showPoweredBy = false,
  size = "md",
  className = "",
}: BrandLogoProps) {
  const { client } = brandingConfig;
  const brandName = getBrandShortName();
  const poweredBy = getPoweredByText();

  const logoContent = (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        {client.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={client.logo}
            alt={client.name}
            style={{ height: client.logoHeight || 40 }}
            className="object-contain"
          />
        ) : (
          <span className={`font-bold text-primary ${sizeClasses[size]}`}>
            {brandName}
          </span>
        )}
      </div>
      {showPoweredBy && poweredBy && (
        <span className="text-[10px] text-muted-foreground">{poweredBy}</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

/**
 * Full brand display with tagline (for landing pages, login, etc.)
 */
export function BrandHero({ className = "" }: { className?: string }) {
  const { client } = brandingConfig;
  const poweredBy = getPoweredByText();

  return (
    <div className={`text-center ${className}`}>
      {client.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={client.logo}
          alt={client.name}
          style={{ height: (client.logoHeight || 40) * 1.5 }}
          className="mx-auto object-contain"
        />
      ) : (
        <h1 className="text-3xl font-bold text-primary">{client.name}</h1>
      )}
      <p className="mt-2 text-gray-600">{client.tagline}</p>
      {poweredBy && (
        <p className="mt-1 text-xs text-muted-foreground">{poweredBy}</p>
      )}
    </div>
  );
}
