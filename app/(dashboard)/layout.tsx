import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Desktop Header */}
      <Header user={{ name: session.name, email: session.email }} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
