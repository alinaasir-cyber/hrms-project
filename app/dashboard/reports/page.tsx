import { getReportsData } from '@/app/actions/reports';

export default async function ReportsPage() {
  const stats = await getReportsData();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">Overview of HR metrics, payroll expenses, and leave statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Workforce</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Payroll Spend</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${stats.totalPayrollSpend.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Pending Leave Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingLeaves}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Approved Leaves</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.approvedLeaves}</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Export HR Data</h2>
        <p className="text-sm text-gray-600">Download executive reports for auditing and compliance.</p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            Export Payroll (CSV)
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
            Export Attendance Log
          </button>
        </div>
      </div>
    </div>
  );
}