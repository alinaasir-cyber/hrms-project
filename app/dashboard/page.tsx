import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [employees, positionCount, departmentCount] = await Promise.all([
    prisma.employee.findMany({
      include: { department: true, position: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.position.count(),
    prisma.department.count(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-sm text-gray-500">Summary of personnel, organizational units, and positions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/positions"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition-colors"
          >
            Manage Positions ({positionCount})
          </Link>
          <Link
            href="/dashboard/employees"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            All Employees ({employees.length})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Workforce</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{employees.length}</p>
          <p className="text-xs text-slate-500 mt-1">Registered staff</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Departments</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{departmentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Operational divisions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configured Positions</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{positionCount}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Standard job titles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Employee Assignments</h2>
          <Link href="/dashboard/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View Full Directory →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50/70 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Code</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Position / Designation</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-700 font-medium">{emp.staffCode}</td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">{emp.fullName}</td>
                  <td className="py-3.5 px-4">
                    {emp.position ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {emp.position.title}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">General Staff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-700">{emp.department?.name || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold">{emp.role}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/employees/${emp.id}/edit`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No employee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}