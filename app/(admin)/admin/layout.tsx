import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Allow access to login page without auth
  // The login page will be at /admin/login

  return (
    <div className="flex min-h-screen bg-gray-100">
      {session && <AdminSidebar role={session.role} />}
      <div className={`flex flex-1 flex-col ${session ? "ml-64" : ""}`}>
        {session && <AdminHeader admin={session} />}
        <main className={`flex-1 ${session ? "p-6" : ""}`}>{children}</main>
      </div>
    </div>
  );
}
