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
      <div className="flex">
        <Sidebar links={links} />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}