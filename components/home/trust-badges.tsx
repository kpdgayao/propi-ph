"use client";

import { Shield, Award, Clock, Users } from "lucide-react";

const BADGES = [
  {
    icon: Shield,
    title: "PRC Licensed",
    description: "Registered Real Estate Broker",
  },
  {
    icon: Award,
    title: "Trusted Since 2020",
    description: "5+ Years of Excellence",
  },
  {
    icon: Users,
    title: "100+ Happy Clients",
    description: "Satisfied Homeowners",
  },
  {
    icon: Clock,
    title: "Fast Response",
    description: "24-48 Hour Guarantee",
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-3 p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-white">{badge.title}</h3>
                <p className="text-sm text-gray-400">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
