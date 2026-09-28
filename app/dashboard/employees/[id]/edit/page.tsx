import { prisma } from '../../../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditEmployeeForm from './EditEmployeeForm';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [employee, departments, positions] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: { department: true, position: true },
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.position.findMany({
      orderBy: { title: 'asc' },
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Employee</h1>
          <p className="text-sm text-gray-500 mt-1">Update employee details, designation, and department assignment</p>
        </div>
        <Link
          href="/dashboard/employees"
          className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors font-medium"
        >
          Cancel
        </Link>
      </div>

      {/* Edit Form */}
      <EditEmployeeForm
        employee={employee}
        departments={departments}
        positions={positions}
      />
    </div>
  );
}