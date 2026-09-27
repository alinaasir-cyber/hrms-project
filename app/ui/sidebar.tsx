import Link from 'next/link';
import { getCurrentUser, logoutAction } from '@/app/actions/auth';

export default async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="w-64 bg-slate-900 min-h-screen p-4 text-slate-200 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-3 py-2 border-b border-slate-800 pb-4">
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
            href="/dashboard/reports"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Reports
          </Link>
        </nav>
      </div>

      {/* User Info & Logout Button */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="px-3 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <p className="text-xs font-semibold text-white truncate">
            {user?.name || 'Administrator'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {user?.email || 'admin@company.com'}
          </p>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {user?.role || 'SUPER_ADMIN'}
          </span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/20 transition-colors border border-red-500/20 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}