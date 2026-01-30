import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Propi
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Real Estate Co-Brokerage Platform
          </p>
          <p className="text-sm text-gray-500">
            For Philippine Real Estate Professionals
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Register as Agent
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900">AI-Powered Listings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Generate compelling property descriptions with AI
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900">Co-Brokerage Ready</h3>
            <p className="mt-1 text-sm text-gray-600">
              Find and collaborate on deals with other agents
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900">Smart Search</h3>
            <p className="mt-1 text-sm text-gray-600">
              Semantic search to find the perfect property match
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
