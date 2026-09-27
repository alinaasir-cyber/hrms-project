'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { LeaveType, LeaveStatus } from '@prisma/client';

export async function createLeaveRequest(formData: FormData): Promise<void> {
  const employeeIdValue = formData.get('employeeId');
  const leaveTypeValue = formData.get('leaveType');
  const startDateValue = formData.get('startDate');
  const endDateValue = formData.get('endDate');
  const reasonValue = formData.get('reason');

  const employeeId = typeof employeeIdValue === 'string' ? employeeIdValue : '';
  const leaveType = typeof leaveTypeValue === 'string' ? (leaveTypeValue as LeaveType) : LeaveType.ANNUAL;
  const startDateStr = typeof startDateValue === 'string' ? startDateValue : '';
  const endDateStr = typeof endDateValue === 'string' ? endDateValue : '';
  const reason = typeof reasonValue === 'string' ? reasonValue.trim() : '';

  if (!employeeId || !startDateStr || !endDateStr || !reason) {
    return;
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      reason,
      status: LeaveStatus.PENDING,
    },
  });

  revalidatePath('/dashboard/leaves');
  revalidatePath('/dashboard/reports');
}

export async function updateLeaveStatus(
  leaveId: string,
  status: LeaveStatus
): Promise<void> {
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status },
  });

  revalidatePath('/dashboard/leaves');
  revalidatePath('/dashboard/reports');
}
