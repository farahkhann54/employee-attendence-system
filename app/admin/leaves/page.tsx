// /app/admin/leaves/page.tsx

export default function AdminLeaves() {
  const leaveRequests = [
    { id: 1, name: "Sara Malik", date: "2026-05-08", reason: "Medical appointment", status: "Pending" },
    { id: 2, name: "Bilal Ahmed", date: "2026-05-10", reason: "Family emergency", status: "Approved" },
    { id: 3, name: "Usman Tariq", date: "2026-05-12", reason: "Personal work", status: "Rejected" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-2 text-sm text-slate-600">Static leave requests with review status for admin actions.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Approved</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-rose-600">1</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{leave.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{leave.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{leave.reason}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        leave.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : leave.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Approve</button>
                        <button className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                      </div>
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