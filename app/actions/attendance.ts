'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function checkIn(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingRecord = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: today,
      },
    },
  });

  if (existingRecord) {
    return { error: 'Already checked in for today.' };
  }

  const now = new Date();
  // Ka dambaynta 8:00 AM waxay noqonaysaa Late
  const isLate = now.getHours() >= 8 && now.getMinutes() > 0;

  await prisma.attendance.create({
    data: {
      employeeId,
      checkIn: now,
      isLate,
    },
  });

  revalidatePath('/dashboard/attendance');
}

export async function checkOut(attendanceId: string) {
  const record = await prisma.attendance.findUnique({
    where: { id: attendanceId },
  });

  if (!record) return { error: 'Attendance record not found.' };

  const checkOutTime = new Date();
  const checkInTime = new Date(record.checkIn);

  // Xisaabi saacadaha la shaqeeyay (Duration in hours)
  const durationInHours = parseFloat(
    ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)
  );

  await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      checkOut: checkOutTime,
      duration: durationInHours,
    },
  });

  revalidatePath('/dashboard/attendance');
}