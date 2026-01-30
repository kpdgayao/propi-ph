import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
        </div>

        {/* Message */}
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="mb-8 max-w-md text-gray-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Discover Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
