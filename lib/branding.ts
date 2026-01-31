// ============================================
// BRANDING CONFIGURATION
// ============================================
// This file controls the branding for the platform.
// Update these values to customize for different clients.

export type BrandingMode = "white-label" | "co-branded" | "platform";

export interface BrandingConfig {
  // Branding Mode
  mode: BrandingMode;

  // Client/Brokerage Identity
  client: {
    name: string;
    shortName: string;
    tagline: string;
    logo?: string; // URL to logo image
    logoHeight?: number; // Logo height in pixels
    favicon?: string;
  };

  // Platform Identity (shown in co-branded/platform modes)
  platform: {
    name: string;
    shortName: string;
    tagline: string;
    url: string;
  };

  // Contact Information
  contact: {
    email: string;
    phone: string;
    address?: string;
    city: string;
    province: string;
  };

  // Social Links
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Theme Colors (HSL values without the hsl() wrapper)
  // Format: "hue saturation% lightness%"
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
  };

  // Feature Flags
  features: {
    showPoweredBy: boolean;
    showPlatformInFooter: boolean;
    allowAgentSignup: boolean;
  };
}

// ============================================
// TOWERHOMES REALTY CONFIGURATION
// ============================================
// Co-branded configuration for TowerHomes Realty
// Colors: Baguio Pine Green with warm accents

export const brandingConfig: BrandingConfig = {
  mode: "co-branded",

  client: {
    name: "TowerHomes Realty",
    shortName: "TowerHomes",
    tagline: "Your Home in the City of Pines",
    // logo: "/logos/towerhomes-logo.png", // Uncomment when logo is available
    logoHeight: 40,
  },

  platform: {
    name: "Propi PH",
    shortName: "Propi",
    tagline: "AI-Powered Real Estate Platform",
    url: "https://propi.ph",
  },

  contact: {
    email: "info@towerhomesrealty.com",
    phone: "+63 917 123 4567",
    address: "Session Road",
    city: "Baguio City",
    province: "Benguet",
  },

  social: {
    facebook: "https://www.facebook.com/towerhomesrealty",
    // instagram: "https://www.instagram.com/towerhomesrealty",
  },

  // TowerHomes brand colors - Baguio Pine Green theme
  // Primary: Pine Forest Green - nature, Baguio's pine trees
  // Accent: Warm Amber - welcoming, home warmth
  colors: {
    primary: "152 45% 28%", // Pine Green (#2d5a3f)
    primaryForeground: "0 0% 100%", // White
    secondary: "35 80% 50%", // Warm Amber (#e6a020)
    secondaryForeground: "0 0% 10%", // Dark text
    accent: "35 80% 50%", // Warm Amber accent
    accentForeground: "0 0% 10%", // Dark text
  },

  features: {
    showPoweredBy: true,
    showPlatformInFooter: true,
    allowAgentSignup: true, // Set to false for invite-only
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the display name based on branding mode
 */
export function getBrandName(): string {
  const { mode, client, platform } = brandingConfig;

  switch (mode) {
    case "white-label":
      return client.name;
    case "co-branded":
      return client.name;
    case "platform":
      return platform.name;
    default:
      return client.name;
  }
}

/**
 * Get the short display name for mobile/compact views
 */
export function getBrandShortName(): string {
  const { mode, client, platform } = brandingConfig;

  switch (mode) {
    case "white-label":
      return client.shortName;
    case "co-branded":
      return client.shortName;
    case "platform":
      return platform.shortName;
    default:
      return client.shortName;
  }
}

/**
 * Get the "Powered by" text for co-branded mode
 */
export function getPoweredByText(): string | null {
  const { mode, platform, features } = brandingConfig;

  if (mode === "co-branded" && features.showPoweredBy) {
    return `Powered by ${platform.name}`;
  }

  return null;
}

/**
 * Get the full brand display (name + powered by if applicable)
 */
export function getFullBrandDisplay(): { name: string; poweredBy: string | null } {
  return {
    name: getBrandName(),
    poweredBy: getPoweredByText(),
  };
}

/**
 * Check if platform branding should be shown
 */
export function shouldShowPlatformBranding(): boolean {
  const { mode, features } = brandingConfig;
  return mode !== "white-label" && features.showPlatformInFooter;
}

/**
 * Get CSS variables for brand colors
 */
export function getBrandColorVars(): Record<string, string> {
  const { colors } = brandingConfig;

  return {
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--ring": colors.primary,
    // Keep secondary/accent as brand colors for highlights
    // "--secondary": colors.secondary,
    // "--secondary-foreground": colors.secondaryForeground,
    // "--accent": colors.accent,
    // "--accent-foreground": colors.accentForeground,
  };
}

/**
 * Get meta tags for SEO
 */
export function getBrandMeta(): { title: string; description: string } {
  const { mode, client, platform } = brandingConfig;

  const brandName = mode === "platform" ? platform.name : client.name;
  const tagline = mode === "platform" ? platform.tagline : client.tagline;

  return {
    title: brandName,
    description: tagline,
  };
}
