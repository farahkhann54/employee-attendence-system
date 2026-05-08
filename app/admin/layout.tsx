// /app/admin/layout.tsx

"use client";

import Sidebar from "../components/sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Employees", href: "/admin/employees-data" },
    { label: "Attendance", href: "/admin/attendence" },
    { label: "Leaves", href: "/admin/leaves" },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen overflow-hidden">
        <Sidebar links={links} />
        <div className="flex-1 min-w-0 overflow-auto bg-gray-100 p-6">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}