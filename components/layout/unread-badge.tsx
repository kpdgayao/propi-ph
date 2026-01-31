"use client";

import { useState, useEffect } from "react";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return unreadCount;
}

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className = "" }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
