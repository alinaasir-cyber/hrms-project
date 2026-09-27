import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 min-h-screen p-4 text-slate-200 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-3 py-2">
          <h1 className="text-xl font-bold text-blue-400">HRMS Enterprise</h1>
          <p className="text-xs text-slate-400">Workforce System</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/employees"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Employees
          </Link>

          <Link
            href="/dashboard/departments"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Departments
          </Link>

          <Link
            href="/dashboard/attendance"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Attendance
          </Link>

          <Link
            href="/dashboard/leaves"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Leaves
          </Link>

          <Link
            href="/dashboard/payroll"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Payroll
          </Link>

          {/* Link-ga Reports */}
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Reports
          </Link>
        </nav>
      </div>
    </aside>
  );
}