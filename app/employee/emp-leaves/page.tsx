// /app/employee/emp-leaves/page.tsx

export default function EmployeeLeaves() {
  const myLeaves = [
    { id: 1, date: "2026-05-11", type: "Sick Leave", reason: "Fever and rest required", status: "Pending" },
    { id: 2, date: "2026-04-28", type: "Annual Leave", reason: "Family trip", status: "Approved" },
    { id: 3, date: "2026-04-15", type: "Unpaid Leave", reason: "Personal work", status: "Rejected" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Requests</h1>
          <p className="mt-2 text-sm text-slate-600">Submit a leave request and review your leave history.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Apply for Leave</h2>
            <div className="mt-5 grid gap-4">
              <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none" type="date" />
              <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none">
                <option>Leave Type</option>
                <option>Sick Leave</option>
                <option>Annual Leave</option>
                <option>Unpaid Leave</option>
                <option>Maternity Leave</option>
              </select>
              <textarea className="min-h-32 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none" placeholder="Provide reason for leave" />
              <button className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white">
                Submit Request
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Leave Summary</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-700">Pending</p>
                <p className="mt-2 text-2xl font-bold text-amber-900">1</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">Approved</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">1</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-sm font-medium text-rose-700">Rejected</p>
                <p className="mt-2 text-2xl font-bold text-rose-900">1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{leave.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{leave.type}</td>
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