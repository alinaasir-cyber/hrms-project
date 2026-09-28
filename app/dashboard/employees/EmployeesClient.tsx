'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createEmployee, deleteEmployee } from '@/app/actions/employee';

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

interface EmployeeItem {
  id: string;
  fullName: string;
  email: string;
  staffCode: string;
  role: string;
  baseSalary: number | string | null;
  departmentId: string;
  positionId: string | null;
  department: Department;
  position: Position | null;
}

interface EmployeesClientProps {
  initialEmployees: EmployeeItem[];
  departments: Department[];
  positions: Position[];
}

export default function EmployeesClient({
  initialEmployees,
  departments,
  positions,
}: EmployeesClientProps) {
  const [employees, setEmployees] = useState<EmployeeItem[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal dynamic form state
  const [modalDeptId, setModalDeptId] = useState<string>(departments[0]?.id || '');
  const [modalPositionId, setModalPositionId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Positions filtered for the modal
  const modalPositions = positions.filter((p) => p.departmentId === modalDeptId);

  const handleModalDeptChange = (newDeptId: string) => {
    setModalDeptId(newDeptId);
    // Reset selected position if it doesn't match new department
    const valid = positions.some((p) => p.id === modalPositionId && p.departmentId === newDeptId);
    if (!valid) {
      setModalPositionId('');
    }
  };

  // Metrics
  const totalEmployees = employees.length;
  const staffWithPositions = employees.filter((e) => e.position !== null).length;
  const adminCount = employees.filter((e) => e.role === 'SUPER_ADMIN').length;

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.staffCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.position && emp.position.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      emp.department.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDeptFilter === 'ALL' || emp.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createEmployee(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Employee added successfully!' });
        setIsAddModalOpen(false);

        // Fetch / update optimistic employee
        const deptObj = departments.find((d) => d.id === modalDeptId) || {
          id: modalDeptId,
          name: 'Department',
          code: 'GEN',
        };
        const posObj = positions.find((p) => p.id === modalPositionId) || null;

        const newEmp: EmployeeItem = {
          id: `temp-${Date.now()}`,
          fullName: String(formData.get('fullName') || ''),
          email: String(formData.get('email') || ''),
          staffCode: String(formData.get('staffCode') || ''),
          role: String(formData.get('role') || 'EMPLOYEE'),
          baseSalary: Number(formData.get('baseSalary') || 0),
          departmentId: modalDeptId,
          positionId: modalPositionId || null,
          department: deptObj,
          position: posObj,
        };

        setEmployees((prev) => [newEmp, ...prev]);
        form.reset();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create employee.' });
      }
    });
  };

  const handleDelete = async (emp: EmployeeItem) => {
    if (!confirm(`Are you sure you want to delete ${emp.fullName} (${emp.staffCode})?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteEmployee(emp.id);
        setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
        setFeedback({ type: 'success', message: `Employee ${emp.fullName} deleted.` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete employee.';
        setFeedback({ type: 'error', message });
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {totalEmployees} Staff Records
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage company personnel, departmental assignments, and job designations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/positions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Manage Positions
          </Link>

          <button
            onClick={() => {
              setFeedback(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Headcount</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
          <p className="text-xs text-slate-500 mt-1">Active company staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Designated Roles</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{staffWithPositions}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">
            {totalEmployees > 0 ? Math.round((staffWithPositions / totalEmployees) * 100) : 0}% mapped to position
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{departments.length}</p>
          <p className="text-xs text-slate-500 mt-1">Operational divisions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Admins</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{adminCount}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Elevated privileges</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, code, email, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 shrink-0">Department:</label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Departments ({employees.length})</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50/70 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Employee Profile</th>
                <th className="py-3.5 px-6">Position / Designation</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {emp.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block leading-tight">{emp.fullName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {emp.staffCode}
                          </span>
                          <span className="text-xs text-gray-400">{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Position / Designation Column */}
                  <td className="py-4 px-6">
                    {emp.position ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{emp.position.title}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200/50">
                        <span>General Staff</span>
                      </span>
                    )}
                  </td>

                  {/* Department Column */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      {emp.department?.name || 'Unassigned'}
                    </span>
                  </td>

                  {/* Role Column */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        emp.role === 'SUPER_ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/dashboard/employees/${emp.id}/edit`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(emp)}
                        disabled={isPending}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">No employees found</p>
                      <p className="text-xs text-gray-400">
                        {searchQuery
                          ? 'Try changing your search term or department filter.'
                          : 'Get started by adding your first employee.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
                <p className="text-xs text-gray-500 mt-0.5">Register an employee and assign their department and designation</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Staff Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="staffCode"
                    required
                    placeholder="e.g. EMP004"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. alex.morgan@company.com"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={modalDeptId}
                  onChange={(e) => handleModalDeptChange(e.target.value)}
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

              {/* Dynamic Position / Designation Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Position / Designation
                  </label>
                  <Link
                    href="/dashboard/positions"
                    target="_blank"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Define New Position
                  </Link>
                </div>
                <select
                  name="positionId"
                  value={modalPositionId}
                  onChange={(e) => setModalPositionId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">No Position Assigned (General Staff)</option>
                  {modalPositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
                {modalPositions.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No positions created for this department yet.{' '}
                    <Link href="/dashboard/positions" className="underline font-semibold">
                      Add one in Positions
                    </Link>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role / Access</label>
                  <select
                    name="role"
                    defaultValue="EMPLOYEE"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Monthly Base Salary ($)</label>
                  <input
                    type="number"
                    name="baseSalary"
                    min="0"
                    step="50"
                    placeholder="3000"
                    defaultValue="3000"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
