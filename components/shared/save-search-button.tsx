"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SearchQuery {
  q?: string;
  type?: string;
  transaction?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
}

interface SaveSearchButtonProps {
  searchQuery: SearchQuery;
  className?: string;
}

export function SaveSearchButton({
  searchQuery,
  className,
}: SaveSearchButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [alertsOn, setAlertsOn] = useState(true);
  const { toast } = useToast();

  // Check if there are any search criteria
  const hasSearchCriteria = Object.values(searchQuery).some(
    (v) => v !== undefined && v !== ""
  );

  const generateDefaultName = () => {
    const parts: string[] = [];
    if (searchQuery.type) parts.push(searchQuery.type);
    if (searchQuery.transaction) parts.push(`for ${searchQuery.transaction}`);
    if (searchQuery.location) parts.push(`in ${searchQuery.location}`);
    if (searchQuery.q) parts.push(`"${searchQuery.q}"`);
    return parts.length > 0 ? parts.join(" ") : "My Search";
  };

  const handleOpen = () => {
    setName(generateDefaultName());
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your saved search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/users/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          query: searchQuery,
          alertsOn,
        }),
      });

      if (res.status === 401) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save searches",
        });
        router.push("/user/login?redirect=/discover");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save search");
      }

      toast({
        title: "Search saved!",
        description: alertsOn
          ? "You'll be notified when new listings match"
          : "You can view this search anytime",
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save search",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSearchCriteria) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className} onClick={handleOpen}>
          <Bell className="mr-2 h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save This Search</DialogTitle>
          <DialogDescription>
            Save your search criteria and get notified when new listings match.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Houses in Baguio"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new listings match
              </p>
            </div>
            <Switch
              id="alerts"
              checked={alertsOn}
              onCheckedChange={setAlertsOn}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
