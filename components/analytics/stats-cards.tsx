import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users, Building, TrendingUp, Inbox, BarChart3 } from "lucide-react";

interface StatsCardsProps {
  totalViews: number;
  totalInquiries: number;
  newInquiries: number;
  activeListings: number;
  conversionRate: number;
}

export function StatsCards({
  totalViews,
  totalInquiries,
  newInquiries,
  activeListings,
  conversionRate,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Inquiries",
      value: totalInquiries.toLocaleString(),
      icon: Inbox,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "New Inquiries",
      value: newInquiries.toLocaleString(),
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Active Listings",
      value: activeListings.toLocaleString(),
      icon: Building,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
