import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-sm text-gray-500">Manage company staff records and assignments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="py-3.5 px-4">Staff Code</th>
              <th className="py-3.5 px-4">Full Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="py-3.5 px-4 font-mono text-xs">{emp.staffCode}</td>
                <td className="py-3.5 px-4 font-medium text-gray-900">{emp.fullName}</td>
                <td className="py-3.5 px-4">{emp.email}</td>
                <td className="py-3.5 px-4">{emp.department?.name || 'N/A'}</td>
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
  );
}