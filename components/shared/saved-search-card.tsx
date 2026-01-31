"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Search, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SavedSearchCardProps {
  id: string;
  name: string;
  query: Record<string, unknown>;
  alertsOn: boolean;
  createdAt: string;
}

export function SavedSearchCard({
  id,
  name,
  query,
  alertsOn: initialAlertsOn,
  createdAt,
}: SavedSearchCardProps) {
  const router = useRouter();
  const [alertsOn, setAlertsOn] = useState(initialAlertsOn);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Build search URL from query
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", String(query.q));
    if (query.type) params.set("type", String(query.type));
    if (query.transaction) params.set("transaction", String(query.transaction));
    if (query.location) params.set("location", String(query.location));
    if (query.minPrice) params.set("minPrice", String(query.minPrice));
    if (query.maxPrice) params.set("maxPrice", String(query.maxPrice));
    if (query.beds) params.set("beds", String(query.beds));
    if (query.baths) params.set("baths", String(query.baths));
    const queryString = params.toString();
    return queryString ? `/discover?${queryString}` : "/discover";
  };

  // Format query criteria for display
  const formatCriteria = () => {
    const parts: string[] = [];
    if (query.type) parts.push(String(query.type).toLowerCase());
    if (query.transaction) parts.push(`for ${String(query.transaction).toLowerCase()}`);
    if (query.location) parts.push(`in ${query.location}`);
    if (query.minPrice || query.maxPrice) {
      const min = query.minPrice ? `₱${Number(query.minPrice).toLocaleString()}` : "";
      const max = query.maxPrice ? `₱${Number(query.maxPrice).toLocaleString()}` : "";
      if (min && max) parts.push(`${min} - ${max}`);
      else if (min) parts.push(`from ${min}`);
      else if (max) parts.push(`up to ${max}`);
    }
    if (query.beds) parts.push(`${query.beds}+ beds`);
    if (query.baths) parts.push(`${query.baths}+ baths`);
    if (query.q) parts.push(`"${query.q}"`);
    return parts.length > 0 ? parts.join(" • ") : "All properties";
  };

  const handleToggleAlerts = async () => {
    const newValue = !alertsOn;
    setAlertsOn(newValue);

    try {
      const res = await fetch(`/api/users/saved-searches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertsOn: newValue }),
      });

      if (!res.ok) {
        setAlertsOn(!newValue); // Revert on error
        throw new Error("Failed to update");
      }

      toast({
        title: newValue ? "Alerts enabled" : "Alerts disabled",
        description: newValue
          ? "You'll be notified when new listings match"
          : "You won't receive email alerts for this search",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update alert settings",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this saved search?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/users/saved-searches/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast({
        title: "Search deleted",
        description: "Your saved search has been removed",
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete saved search",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className={isDeleting ? "opacity-50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="flex items-center gap-2">
            {alertsOn ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{formatCriteria()}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Email alerts</span>
          <Switch
            checked={alertsOn}
            onCheckedChange={handleToggleAlerts}
            disabled={isDeleting}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(buildSearchUrl())}
            disabled={isDeleting}
          >
            <Search className="mr-1 h-4 w-4" />
            Run Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          Saved {new Date(createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
