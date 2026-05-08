// /app/employee/page.tsx

export default function EmployeeDashboard() {
  const history = [
    { id: 1, date: "2026-05-08", checkIn: "08:58 AM", checkOut: "05:03 PM", breakTime: "45m", status: "Working" },
    { id: 2, date: "2026-05-07", checkIn: "09:14 AM", checkOut: "05:15 PM", breakTime: "30m", status: "Checked Out" },
    { id: 3, date: "2026-05-06", checkIn: "08:50 AM", checkOut: "05:01 PM", breakTime: "40m", status: "Working" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Static employee controls and current-day attendance snapshot.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Attendance</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Check In</h2>
            <p className="mt-2 text-sm text-slate-600">Start your work day</p>
          </button>
          <button className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Attendance</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Check Out</h2>
            <p className="mt-2 text-sm text-slate-600">End your work day</p>
          </button>
          <button className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Break</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Start Break</h2>
            <p className="mt-2 text-sm text-slate-600">Pause your session</p>
          </button>
          <button className="rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Break</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">End Break</h2>
            <p className="mt-2 text-sm text-slate-600">Resume work</p>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Current Status</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">Working</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Work Hours</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">7h 42m</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Break Time</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">45m</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check Out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Break</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.checkIn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.checkOut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.breakTime}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        entry.status === "Working" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {entry.status}
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