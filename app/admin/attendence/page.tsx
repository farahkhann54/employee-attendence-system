// /app/admin/attendence/page.tsx

export default function AdminAttendance() {
  const attendanceRows = [
    { id: 1, name: "Ayesha Khan", checkIn: "08:55 AM", checkOut: "05:02 PM", hours: "8h 07m", status: "On Time" },
    { id: 2, name: "Bilal Ahmed", checkIn: "09:18 AM", checkOut: "05:22 PM", hours: "8h 04m", status: "Late" },
    { id: 3, name: "Sara Malik", checkIn: "--", checkOut: "--", hours: "--", status: "Absent" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Attendance Records</h1>
            <p className="mt-2 text-sm text-slate-600">Static logs for admin monitoring and late tracking.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none" type="date" />
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none">
              <option>All Status</option>
              <option>On Time</option>
              <option>Late</option>
              <option>Absent</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Present Today</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">2</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Late Users</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Absent</p>
            <p className="mt-2 text-3xl font-bold text-rose-600">1</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check Out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.checkIn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.checkOut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.hours}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "On Time"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "Late"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {row.status}
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