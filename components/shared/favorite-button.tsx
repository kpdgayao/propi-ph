"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  propertyId: string;
  variant?: "default" | "icon";
  className?: string;
}

export function FavoriteButton({
  propertyId,
  variant = "default",
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [propertyId]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch(
        `/api/users/favorites/check?propertyId=${propertyId}`
      );
      const data = await res.json();
      setIsFavorited(data.isFavorited);
      setIsLoggedIn(data.isLoggedIn);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
      });
      router.push(`/user/login?redirect=/properties/${propertyId}`);
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        const res = await fetch(
          `/api/users/favorites?propertyId=${propertyId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setIsFavorited(false);
          toast({
            title: "Removed from favorites",
            description: "Property removed from your saved list",
          });
        }
      } else {
        const res = await fetch("/api/users/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        if (res.ok) {
          setIsFavorited(true);
          toast({
            title: "Added to favorites",
            description: "Property saved to your list",
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite();
        }}
        disabled={isLoading}
        className={`rounded-full bg-white/90 p-2 transition-colors hover:bg-white ${className}`}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-5 w-5 ${
            isFavorited
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          }`}
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className}
    >
      <Heart
        className={`mr-2 h-4 w-4 ${
          isFavorited ? "fill-red-500 text-red-500" : ""
        }`}
      />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  );
}
