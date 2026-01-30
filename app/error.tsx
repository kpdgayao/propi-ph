"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 max-w-md text-gray-600">
          We encountered an unexpected error. Please try again or return to the
          dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
