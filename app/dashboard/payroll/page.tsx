import { prisma } from '@/lib/prisma';
import { generateMonthlyPayroll, processPayrollPayment } from '@/app/actions/payroll';
import { PayrollStatus } from '@prisma/client';

export default async function PayrollPage() {
  const currentMonth = 'September 2026';

  const [payrolls, employeesCount] = await Promise.all([
    prisma.payroll.findMany({
      where: { month: currentMonth },
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { employee: { fullName: 'asc' } },
    }),
    prisma.employee.count(),
  ]);

  const totalPayrollSpend = payrolls.reduce(
    (sum, item) => sum + Number(item.netSalary),
    0
  );

  const paidRecords = payrolls.filter((p) => p.status === PayrollStatus.PAID);
  const paidSpend = paidRecords.reduce(
    (sum, item) => sum + Number(item.netSalary),
    0
  );

  const pendingRecords = payrolls.filter((p) => p.status === PayrollStatus.PENDING);
  const pendingSpend = pendingRecords.reduce(
    (sum, item) => sum + Number(item.netSalary),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Month Selector / Generation Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll & Compensation</h1>
          <p className="text-sm text-slate-500">
            Process monthly employee salaries, allowances, deductions, and payslips
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            Month: {currentMonth}
          </div>

          <form
            action={async () => {
              'use server';
              await generateMonthlyPayroll(currentMonth);
            }}
          >
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Monthly Run
            </button>
          </form>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Monthly Spend
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            ${totalPayrollSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">
            {payrolls.length} of {employeesCount} employees processed
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-green-200/80 shadow-sm space-y-1 bg-green-50/20">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Processed & Paid
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            ${paidSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-green-600/70">
            {paidRecords.length} completed transactions
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-sm space-y-1 bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pending Approvals
          </p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            ${pendingSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-600/70">
            {pendingRecords.length} payslips awaiting payment
          </p>
        </div>
      </div>

      {/* Salary Details Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Payroll Ledger ({currentMonth})
          </h2>
          <span className="text-xs text-slate-500">
            {payrolls.length} active records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Staff Code</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Allowance</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Salary</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.map((payroll) => {
                const base = Number(payroll.baseSalary);
                const allowance = Number(payroll.allowance);
                const deductions = Number(payroll.deductions);
                const net = Number(payroll.netSalary);

                return (
                  <tr key={payroll.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{payroll.employee.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {payroll.employee.department?.name || 'Unassigned'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {payroll.employee.staffCode}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs">
                      ${base.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-green-600">
                      +${allowance.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-red-600">
                      -${deductions.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${net.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {payroll.status === PayrollStatus.PAID ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                          PAID
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {payroll.status === PayrollStatus.PENDING ? (
                        <form
                          action={async () => {
                            'use server';
                            await processPayrollPayment(payroll.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        </form>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          {payroll.paymentDate
                            ? `Paid on ${new Date(payroll.paymentDate).toLocaleDateString()}`
                            : 'Paid'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {payrolls.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                    No payroll run found for {currentMonth}. Click "Generate Monthly Run" to initialize.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
