'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PayrollStatus } from '@prisma/client';

export async function generateMonthlyPayroll(monthName: string): Promise<void> {
  const employees = await prisma.employee.findMany();

  for (const emp of employees) {
    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month: {
          employeeId: emp.id,
          month: monthName,
        },
      },
    });

    if (!existing) {
      await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month: monthName,
          baseSalary: emp.baseSalary,
          allowance: 0,
          deductions: 0,
          netSalary: emp.baseSalary,
          status: PayrollStatus.PENDING,
        },
      });
    }
  }

  revalidatePath('/dashboard/payroll');
  revalidatePath('/dashboard/reports');
}

export async function processPayrollPayment(payrollId: string): Promise<void> {
  await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      status: PayrollStatus.PAID,
      paymentDate: new Date(),
    },
  });

  revalidatePath('/dashboard/payroll');
  revalidatePath('/dashboard/reports');
}

export async function updatePayrollAmounts(formData: FormData): Promise<void> {
  const payrollIdValue = formData.get('payrollId');
  const allowanceValue = formData.get('allowance');
  const deductionsValue = formData.get('deductions');

  const payrollId = typeof payrollIdValue === 'string' ? payrollIdValue : '';
  const allowance = parseFloat(typeof allowanceValue === 'string' ? allowanceValue : '0') || 0;
  const deductions = parseFloat(typeof deductionsValue === 'string' ? deductionsValue : '0') || 0;

  if (!payrollId) return;

  const current = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!current) return;

  const base = Number(current.baseSalary);
  const netSalary = Math.max(0, base + allowance - deductions);

  await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      allowance,
      deductions,
      netSalary,
    },
  });

  revalidatePath('/dashboard/payroll');
  revalidatePath('/dashboard/reports');
}
