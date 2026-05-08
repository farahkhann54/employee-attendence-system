// /app/employee/emp-attendence/page.tsx

export default function EmployeeAttendance() {
  const myAttendance = [
    { id: 1, date: "2026-05-08", checkIn: "08:58 AM", checkOut: "05:03 PM", hours: "8h 05m", status: "On Time" },
    { id: 2, date: "2026-05-07", checkIn: "09:10 AM", checkOut: "05:15 PM", hours: "8h 05m", status: "Late" },
    { id: 3, date: "2026-05-06", checkIn: "08:49 AM", checkOut: "05:01 PM", hours: "8h 12m", status: "On Time" },
  ];

  return (
    <div className="h-screen overflow-auto bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
          <p className="mt-2 text-sm text-slate-600">Your recent attendance records are listed below.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check Out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((record) => (
                  <tr key={record.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.checkIn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.checkOut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.hours}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        record.status === "On Time" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {record.status}
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