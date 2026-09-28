'use client';

import { useState } from 'react';
import { updateEmployee } from '@/app/actions/employee';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
}

interface Employee {
  id: string;
  fullName: string;
  email: string;
  staffCode: string;
  role: string;
  departmentId: string;
  positionId: string | null;
  baseSalary?: number | string | null;
}

interface EditEmployeeFormProps {
  employee: Employee;
  departments: Department[];
  positions: Position[];
}

export default function EditEmployeeForm({ employee, departments, positions }: EditEmployeeFormProps) {
  const [selectedDeptId, setSelectedDeptId] = useState(employee.departmentId);
  const [selectedPositionId, setSelectedPositionId] = useState<string>(employee.positionId || '');

  // Filter positions by selected department
  const filteredPositions = positions.filter((p) => p.departmentId === selectedDeptId);

  const handleDeptChange = (newDeptId: string) => {
    setSelectedDeptId(newDeptId);
    // If current selected position doesn't belong to the newly selected department, reset or re-evaluate
    const stillValid = positions.some((p) => p.id === selectedPositionId && p.departmentId === newDeptId);
    if (!stillValid) {
      setSelectedPositionId('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
      <form action={updateEmployee} className="space-y-4">
        <input type="hidden" name="id" value={employee.id} />

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            name="fullName"
            defaultValue={employee.fullName}
            required
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            name="email"
            defaultValue={employee.email}
            required
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Staff Code</label>
          <input
            type="text"
            name="staffCode"
            defaultValue={employee.staffCode}
            required
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
          <select
            name="departmentId"
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700">Position / Designation</label>
            <Link
              href="/dashboard/positions"
              target="_blank"
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              + Manage Positions
            </Link>
          </div>
          <select
            name="positionId"
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="">No Position Assigned (General Staff)</option>
            {filteredPositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
          {filteredPositions.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">
              No positions created for this department yet.{' '}
              <Link href="/dashboard/positions" className="underline font-semibold">
                Create a position
              </Link>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role / Access Level</label>
          <select
            name="role"
            defaultValue={employee.role}
            required
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="EMPLOYEE">EMPLOYEE (Standard Staff)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (System Administrator)</option>
          </select>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            href="/dashboard/employees"
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            Save Employee Updates
          </button>
        </div>
      </form>
    </div>
  );
}
