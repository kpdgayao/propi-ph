import Link from "next/link";
import {
  brandingConfig,
  shouldShowPlatformBranding,
  getPoweredByText,
} from "@/lib/branding";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { client, platform, contact, social, features } = brandingConfig;
  const showPlatform = shouldShowPlatformBranding();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-primary">{client.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{client.tagline}</p>
            {getPoweredByText() && (
              <p className="mt-2 text-xs text-muted-foreground">
                {getPoweredByText()}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/discover" className="text-gray-600 hover:text-primary">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-600 hover:text-primary">
                  Find Agents
                </Link>
              </li>
              {features.allowAgentSignup && (
                <li>
                  <Link href="/register" className="text-gray-600 hover:text-primary">
                    Join as Agent
                  </Link>
                </li>
              )}
              <li>
                <Link href="/login" className="text-gray-600 hover:text-primary">
                  Agent Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900">Contact Us</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.city && (
                <li className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {contact.address && `${contact.address}, `}
                  {contact.city}, {contact.province}
                </li>
              )}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-gray-900">Follow Us</h4>
            <div className="mt-4 flex gap-3">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-500 md:flex-row md:text-left">
            <p>
              &copy; {currentYear} {client.name}. All rights reserved.
            </p>
            {showPlatform && (
              <p>
                Platform by{" "}
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {platform.name}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Minimal footer for dashboard pages
 */
export function DashboardFooter() {
  const { client, platform } = brandingConfig;
  const showPlatform = shouldShowPlatformBranding();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
      <p>
        &copy; {currentYear} {client.name}
        {showPlatform && (
          <>
            {" "}
            &middot; Powered by{" "}
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {platform.name}
            </a>
          </>
        )}
      </p>
    </footer>
  );
}
