'use client';

import { useState, useTransition } from 'react';
import { createPosition, updatePosition, deletePosition } from '@/app/actions/position';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface PositionItem {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  createdAt: Date | string;
  department: Department;
  _count: {
    employees: number;
  };
}

interface PositionsClientProps {
  initialPositions: PositionItem[];
  departments: Department[];
}

export default function PositionsClient({ initialPositions, departments }: PositionsClientProps) {
  const [positions, setPositions] = useState<PositionItem[]>(initialPositions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Metrics
  const totalPositions = positions.length;
  const totalAssignedStaff = positions.reduce((acc, p) => acc + p._count.employees, 0);
  const unassignedPositions = positions.filter((p) => p._count.employees === 0).length;
  const uniqueDepartmentsCovered = new Set(positions.map((p) => p.departmentId)).size;

  // Filter positions
  const filteredPositions = positions.filter((pos) => {
    const matchesSearch =
      pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pos.description && pos.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pos.department.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'ALL' || pos.departmentId === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPosition(formData);
      if (res.success && res.position) {
        setFeedback({ type: 'success', message: `Position "${res.position.title}" created successfully.` });
        setIsAddModalOpen(false);
        form.reset();
        // Update local state
        const targetDept = departments.find((d) => d.id === res.position.departmentId) || {
          id: res.position.departmentId,
          name: 'Department',
          code: 'GEN',
        };
        setPositions((prev) => [
          {
            ...res.position,
            department: targetDept,
            _count: { employees: 0 },
          },
          ...prev,
        ]);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create position.' });
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPosition) return;
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await updatePosition(formData);
      if (res.success && res.position) {
        setFeedback({ type: 'success', message: `Position "${res.position.title}" updated successfully.` });
        const targetDept = departments.find((d) => d.id === res.position.departmentId) || editingPosition.department;
        setPositions((prev) =>
          prev.map((p) =>
            p.id === editingPosition.id
              ? {
                  ...p,
                  ...res.position,
                  department: targetDept,
                }
              : p
          )
        );
        setEditingPosition(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update position.' });
      }
    });
  };

  const handleDelete = async (pos: PositionItem) => {
    if (pos._count.employees > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot delete "${pos.title}": ${pos._count.employees} employee(s) are assigned to it.`,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the position "${pos.title}"?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await deletePosition(pos.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Position "${pos.title}" deleted successfully.` });
        setPositions((prev) => prev.filter((p) => p.id !== pos.id));
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete position.' });
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Positions & Designations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {totalPositions} Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Standardize organizational job titles, descriptions, and department hierarchy
          </p>
        </div>

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
          Add New Position
        </button>
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
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Positions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalPositions}</p>
          <p className="text-xs text-slate-500 mt-1">Defined job titles in HRMS</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Staff</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalAssignedStaff}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Staff mapped to designations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments Covered</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{uniqueDepartmentsCovered}</p>
          <p className="text-xs text-slate-500 mt-1">Across organizational units</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unassigned Roles</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{unassignedPositions}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Open/vacant positions</p>
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
            placeholder="Search by title, department or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 shrink-0">Filter Dept:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Departments ({positions.length})</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Positions Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50/70 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Position Title & Role Description</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Assigned Staff</th>
                <th className="py-3.5 px-6">Created At</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPositions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                        {pos.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block leading-tight">{pos.title}</span>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
                          {pos.description || 'No role description provided.'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {pos.department.name}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {pos._count.employees > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {pos._count.employees} Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Open / 0 Staff
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(pos.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFeedback(null);
                          setEditingPosition(pos);
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(pos)}
                        disabled={pos._count.employees > 0 || isPending}
                        title={
                          pos._count.employees > 0
                            ? 'Cannot delete position with assigned employees'
                            : 'Delete this position'
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          pos._count.employees > 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 cursor-pointer'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPositions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">No positions found</p>
                      <p className="text-xs text-gray-400">
                        {searchQuery
                          ? 'Try adjusting your search criteria or filter.'
                          : 'Create your first job designation using the button above.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Position</h3>
                <p className="text-xs text-gray-500 mt-0.5">Define a job designation and associate it with a department</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Position Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  name="departmentId"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Job Description / Role Summary
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief summary of duties, responsibilities, or qualification expectations..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                />
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
                  {isPending ? 'Saving...' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {editingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Position</h3>
                <p className="text-xs text-gray-500 mt-0.5">Modify designation details and department assignment</p>
              </div>
              <button
                onClick={() => setEditingPosition(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingPosition.id} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Position Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingPosition.title}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  name="departmentId"
                  required
                  defaultValue={editingPosition.departmentId}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Job Description / Role Summary
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingPosition.description || ''}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
