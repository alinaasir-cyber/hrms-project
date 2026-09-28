import { prisma } from '@/lib/prisma';
import { createLeaveRequest, updateLeaveStatus } from '@/app/actions/leaves';
import { LeaveStatus } from '@prisma/client';

export default async function LeavesPage() {
  const [leaves, employees] = await Promise.all([
    prisma.leaveRequest.findMany({
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.employee.findMany({
      include: { department: true },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  const totalRequests = leaves.length;
  const pendingRequests = leaves.filter((l) => l.status === LeaveStatus.PENDING).length;
  const approvedRequests = leaves.filter((l) => l.status === LeaveStatus.APPROVED).length;
  const rejectedRequests = leaves.filter((l) => l.status === LeaveStatus.REJECTED).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaves Management</h1>
          <p className="text-sm text-slate-500">
            Review, approve, and track employee time-off and leave requests
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Requests
          </p>
          <p className="text-2xl font-bold text-slate-900">{totalRequests}</p>
          <p className="text-xs text-slate-400">All recorded applications</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-sm space-y-1 bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-600">{pendingRequests}</p>
          <p className="text-xs text-amber-600/70">Awaiting manager approval</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-green-200/80 shadow-sm space-y-1 bg-green-50/20">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Approved
          </p>
          <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
          <p className="text-xs text-green-600/70">Authorized leaves</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200/80 shadow-sm space-y-1 bg-red-50/20">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Rejected
          </p>
          <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
          <p className="text-xs text-red-600/70">Declined requests</p>
        </div>
      </div>

      {/* Main Grid: Form & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Apply for Leave Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">Apply for Leave</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a formal time-off request on behalf of an employee
            </p>
          </div>

          <form action={createLeaveRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.department?.name || 'No Dept'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Leave Type
              </label>
              <select
                name="leaveType"
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="PATERNITY">Paternity Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason / Note
              </label>
              <textarea
                name="reason"
                required
                rows={3}
                placeholder="Reason for requesting time off..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 text-sm shadow-sm transition-colors cursor-pointer"
            >
              Submit Leave Request
            </button>
          </form>
        </div>

        {/* Leave Requests Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Leave Applications
            </h2>
            <span className="text-xs text-slate-500">
              Showing {leaves.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((item) => {
                  const start = new Date(item.startDate);
                  const end = new Date(item.endDate);
                  const days = Math.max(
                    1,
                    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div>{item.employee.fullName}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {item.employee.department?.name || 'Staff'} • {item.employee.staffCode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.leaveType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div>{start.toLocaleDateString()} – {end.toLocaleDateString()}</div>
                        <span className="text-slate-400">{days} {days === 1 ? 'day' : 'days'}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-600" title={item.reason}>
                        {item.reason}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.status === LeaveStatus.PENDING && (
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        )}
                        {item.status === LeaveStatus.APPROVED && (
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Approved
                          </span>
                        )}
                        {item.status === LeaveStatus.REJECTED && (
                          <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.status === LeaveStatus.PENDING ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <form
                              action={async () => {
                                'use server';
                                await updateLeaveStatus(item.id, LeaveStatus.APPROVED);
                              }}
                            >
                              <button
                                type="submit"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs px-2.5 py-1 rounded font-medium transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            </form>
                            <form
                              action={async () => {
                                'use server';
                                await updateLeaveStatus(item.id, LeaveStatus.REJECTED);
                              }}
                            >
                              <button
                                type="submit"
                                className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs px-2.5 py-1 rounded font-medium transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Resolved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      No leave requests registered. Apply for a leave using the form on the left.
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
