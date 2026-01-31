"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCards } from "@/components/analytics/stats-cards";
import { InquiryChart } from "@/components/analytics/inquiry-chart";
import { TopListingsTable } from "@/components/analytics/top-listings-table";
import { Loader2, RefreshCw } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalInquiries: number;
    newInquiries: number;
    activeListings: number;
    totalListings: number;
    conversionRate: number;
  };
  inquiryTrend: Array<{
    date: string;
    inquiries: number;
  }>;
  topListings: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
    photo: string | null;
    price: string;
    location: string;
  }>;
}

const dateRangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState("30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-600">
            Track your listings performance and leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAnalytics()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards
            totalViews={data.overview.totalViews}
            totalInquiries={data.overview.totalInquiries}
            newInquiries={data.overview.newInquiries}
            activeListings={data.overview.activeListings}
            conversionRate={data.overview.conversionRate}
          />

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InquiryChart data={data.inquiryTrend} />
            <TopListingsTable listings={data.topListings} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
