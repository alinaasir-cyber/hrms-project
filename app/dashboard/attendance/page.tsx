import { prisma } from '@/lib/prisma';
import { checkIn, checkOut } from '@/actions/attendance';

export default async function AttendancePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employees = await prisma.employee.findMany({
    include: {
      department: true,
      attendances: {
        where: {
          date: {
            gte: today,
          },
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time & Attendance Engine</h1>
          <p className="text-sm text-gray-500">Track daily employee check-ins, check-outs, and late arrivals</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Check In</th>
              <th className="py-3.5 px-4">Check Out</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => {
              const todayRecord = emp.attendances[0];

              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-medium text-gray-900">{emp.fullName}</td>
                  <td className="py-3.5 px-4">{emp.department.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {todayRecord ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {todayRecord?.duration ? `${todayRecord.duration} hrs` : '--'}
                  </td>
                  <td className="py-3.5 px-4">
                    {!todayRecord ? (
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                        Absent
                      </span>
                    ) : todayRecord.isLate ? (
                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        Late Arrival
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        On Time
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {!todayRecord ? (
                      <form action={async () => { 'use server'; await checkIn(emp.id); }}>
                        <button type="submit" className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700">
                          Clock In
                        </button>
                      </form>
                    ) : !todayRecord.checkOut ? (
                      <form action={async () => { 'use server'; await checkOut(todayRecord.id); }}>
                        <button type="submit" className="bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-orange-700">
                          Clock Out
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}