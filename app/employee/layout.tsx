// /app/employee/layout.tsx

"use client";

import Sidebar from "../components/sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { label: "Dashboard", href: "/employee" },
    { label: "Attendance", href: "/employee/emp-attendence" },
    { label: "Leaves", href: "/employee/emp-leaves" },
  ];

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="flex h-screen overflow-hidden">
        <Sidebar links={links} />
        <div className="flex-1 min-w-0 overflow-auto bg-gray-100 p-6">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}