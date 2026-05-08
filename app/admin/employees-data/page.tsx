// /app/admin/employees-data/page.tsx

export default function EmployeesData() {
  const employees = [
    { id: 1, name: "Ayesha Khan", email: "ayesha.khan@company.com", department: "HR", status: "Active" },
    { id: 2, name: "Bilal Ahmed", email: "bilal.ahmed@company.com", department: "Operations", status: "Late" },
    { id: 3, name: "Sara Malik", email: "sara.malik@company.com", department: "Design", status: "On Leave" },
    { id: 4, name: "Usman Tariq", email: "usman.tariq@company.com", department: "Support", status: "Active" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="mt-2 text-sm text-slate-600">Static employee directory shown for admin review.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{employee.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          employee.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : employee.status === "Late"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}