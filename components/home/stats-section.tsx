"use client";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Home, Users, MapPin, TrendingUp } from "lucide-react";

interface StatsSectionProps {
  propertyCount: number;
  agentCount: number;
}

export function StatsSection({ propertyCount, agentCount }: StatsSectionProps) {
  const stats = [
    {
      icon: Home,
      value: propertyCount,
      suffix: "+",
      label: "Active Listings",
      description: "Properties available",
    },
    {
      icon: Users,
      value: agentCount,
      suffix: "+",
      label: "Licensed Agents",
      description: "Professional realtors",
    },
    {
      icon: MapPin,
      value: 4,
      suffix: "",
      label: "Provinces",
      description: "Northern Luzon coverage",
    },
    {
      icon: TrendingUp,
      value: 98,
      suffix: "%",
      label: "Client Satisfaction",
      description: "Happy homeowners",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="text-center group"
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-xl mb-3 group-hover:bg-white/30 transition-colors">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                duration={2000}
              />
            </div>
            <div className="text-white font-medium mt-1">{stat.label}</div>
            <div className="text-white/60 text-sm">{stat.description}</div>
          </div>
        );
      })}
    </div>
  );
}
