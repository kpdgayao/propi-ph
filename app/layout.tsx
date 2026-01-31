import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { brandingConfig, getPoweredByText } from "@/lib/branding";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const { client, platform } = brandingConfig;
const poweredBy = getPoweredByText();
const fullTitle = poweredBy
  ? `${client.name} | ${poweredBy}`
  : client.name;

export const metadata: Metadata = {
  title: {
    default: fullTitle,
    template: `%s | ${client.name}`,
  },
  description: client.tagline,
  keywords: [
    "real estate",
    "Philippines",
    "co-brokerage",
    "property listing",
    client.name,
    platform.name,
    "Baguio",
    "Benguet",
    "Northern Luzon",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: client.shortName,
  },
  formatDetection: {
    telephone: true,
  },
};

// TowerHomes brand color - Baguio Pine Green
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2d5a3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
