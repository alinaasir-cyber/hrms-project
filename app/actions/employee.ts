'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEmployee(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const fullNameValue = formData.get('fullName');
  const emailValue = formData.get('email');
  const staffCodeValue = formData.get('staffCode');
  const departmentIdValue = formData.get('departmentId');
  const positionIdValue = formData.get('positionId');
  const roleValue = formData.get('role');
  const baseSalaryValue = formData.get('baseSalary');

  const fullName = typeof fullNameValue === 'string' ? fullNameValue.trim() : '';
  const email = typeof emailValue === 'string' ? emailValue.trim() : '';
  const staffCode = typeof staffCodeValue === 'string' ? staffCodeValue.trim() : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue.trim() : '';
  const positionId = typeof positionIdValue === 'string' && positionIdValue.trim() !== '' ? positionIdValue.trim() : null;
  const role = (roleValue as 'SUPER_ADMIN' | 'EMPLOYEE') || 'EMPLOYEE';
  const baseSalary = baseSalaryValue ? Number(baseSalaryValue) : 0;

  if (!fullName || !email || !staffCode || !departmentId) {
    return { success: false, error: 'Full name, email, staff code, and department are required.' };
  }

  try {
    await prisma.employee.create({
      data: {
        fullName,
        email,
        staffCode,
        departmentId,
        positionId,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'EMPLOYEE',
        baseSalary,
      },
    });

    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to create employee:', error);
    const message = error instanceof Error ? error.message : 'Failed to create employee.';
    return { success: false, error: message };
  }
}

export async function updateEmployee(formData: FormData): Promise<void> {
  const idValue = formData.get('id');
  const fullNameValue = formData.get('fullName');
  const emailValue = formData.get('email');
  const staffCodeValue = formData.get('staffCode');
  const departmentIdValue = formData.get('departmentId');
  const positionIdValue = formData.get('positionId');
  const roleValue = formData.get('role');
  const baseSalaryValue = formData.get('baseSalary');

  const id = typeof idValue === 'string' ? idValue.trim() : '';
  const fullName = typeof fullNameValue === 'string' ? fullNameValue.trim() : '';
  const email = typeof emailValue === 'string' ? emailValue.trim() : '';
  const staffCode = typeof staffCodeValue === 'string' ? staffCodeValue.trim() : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue.trim() : '';
  const positionId = typeof positionIdValue === 'string' && positionIdValue.trim() !== '' ? positionIdValue.trim() : null;
  const role = (roleValue as 'ADMIN' | 'SUPER_ADMIN' | 'EMPLOYEE') || 'EMPLOYEE';

  if (!id || !fullName || !email || !staffCode || !departmentId) {
    return;
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: {
        fullName,
        email,
        staffCode,
        departmentId,
        positionId,
        role: role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'EMPLOYEE',
        ...(baseSalaryValue ? { baseSalary: Number(baseSalaryValue) } : {}),
      },
    });

    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to update employee:', error);
  }
  redirect('/dashboard/employees');
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await prisma.employee.delete({
      where: { id },
    });
    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to delete employee:', error);
  }
  redirect('/dashboard/employees');
}