'use server';

import { prisma } from '@/lib/prisma';

export async function getReportsData() {
  try {
    const totalEmployees = await prisma.employee.count();

    // Raw or Safe query handling to bypass missing Prisma Client types
    const attendanceRecords = await prisma.attendance.findMany();
    const leaveRequests = await prisma.leaveRequest.findMany();
    const payrollRecords = await prisma.payroll.findMany();
    const employees = await prisma.employee.findMany({ select: { baseSalary: true } });

    const totalPayrollSpend =
      payrollRecords.length > 0
        ? payrollRecords.reduce((sum, item) => sum + Number(item.netSalary || 0), 0)
        : employees.reduce((sum, item) => sum + Number(item.baseSalary || 0), 0);

    const pendingLeaves = leaveRequests.filter(
      (item: any) => item.status === 'PENDING'
    ).length;

    const approvedLeaves = leaveRequests.filter(
      (item: any) => item.status === 'APPROVED'
    ).length;

    return {
      totalEmployees,
      totalPayrollSpend,
      pendingLeaves,
      approvedLeaves,
      totalAttendanceLogs: attendanceRecords.length,
    };
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return {
      totalEmployees: 0,
      totalPayrollSpend: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalAttendanceLogs: 0,
    };
  }
}