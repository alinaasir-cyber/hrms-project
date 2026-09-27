import { prisma } from '../../../../../lib/prisma';
import { updateEmployee } from '../../../../actions/employee';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params for Next.js 15+ compatibility
  const { id } = await params;

  const [employee, departments] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-sm text-gray-500">Update employee details and department assignment</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg"
        >
          Cancel
        </Link>
      </div>

      {/* Edit Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form action={updateEmployee} className="space-y-4">
          <input type="hidden" name="id" value={employee.id} />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={employee.fullName}
              required
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={employee.email}
              required
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Staff Code</label>
            <input
              type="text"
              name="staffCode"
              defaultValue={employee.staffCode}
              required
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
            <select
              name="departmentId"
              defaultValue={employee.departmentId}
              required
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              defaultValue={employee.role}
              required
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Update Employee Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}