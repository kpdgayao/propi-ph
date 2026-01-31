import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DashboardFooter } from "@/components/layout/footer";

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Desktop Header */}
      <Header user={{ name: session.name, email: session.email }} />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <DashboardFooter />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
