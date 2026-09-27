import { prisma } from '../../../lib/prisma';
import { createDepartment, deleteDepartment } from '../../actions/department';

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { employees: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-sm text-gray-500">Create and oversee organizational departments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: Add Department */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Department</h2>
          <form action={createDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Human Resources"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Save Department
            </button>
          </form>
        </div>

        {/* Directory Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">All Departments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Total Employees</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full text-xs">
                        {dept._count.employees} Staff
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <form
                        action={async () => {
                          'use server';
                          await deleteDepartment(dept.id);
                        }}
                        className="inline"
                      >
                        <button
                          type="submit"
                          disabled={dept._count.employees > 0}
                          title={dept._count.employees > 0 ? "Cannot delete department with assigned employees" : ""}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            dept._count.employees > 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800'
                          }`}
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 text-sm">
                      No departments found. Create your first department above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}