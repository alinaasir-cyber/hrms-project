'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEmployee(formData: FormData): Promise<void> {
  const fullNameValue = formData.get('fullName');
  const emailValue = formData.get('email');
  const staffCodeValue = formData.get('staffCode');
  const departmentIdValue = formData.get('departmentId');
  const fullName = typeof fullNameValue === 'string' ? fullNameValue : '';
  const email = typeof emailValue === 'string' ? emailValue : '';
  const staffCode = typeof staffCodeValue === 'string' ? staffCodeValue : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue : '';

  if (!fullName || !email || !staffCode || !departmentId) {
    return;
  }

  await prisma.employee.create({
    data: {
      fullName,
      email,
      staffCode,
      departmentId,
      role: 'EMPLOYEE',
      baseSalary: 0,
    },
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateEmployee(formData: FormData): Promise<void> {
  const idValue = formData.get('id');
  const fullNameValue = formData.get('fullName');
  const emailValue = formData.get('email');
  const staffCodeValue = formData.get('staffCode');
  const departmentIdValue = formData.get('departmentId');
  const roleValue = formData.get('role');
  const id = typeof idValue === 'string' ? idValue : '';
  const fullName = typeof fullNameValue === 'string' ? fullNameValue : '';
  const email = typeof emailValue === 'string' ? emailValue : '';
  const staffCode = typeof staffCodeValue === 'string' ? staffCodeValue : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue : '';
  const role = (roleValue as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE';

  if (!id || !fullName || !email || !staffCode || !departmentId) {
    return;
  }

  await prisma.employee.update({
    where: { id },
    data: {
      fullName,
      email,
      staffCode,
      departmentId,
      role: role === 'ADMIN' ? 'SUPER_ADMIN' : role,
    },
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await prisma.employee.delete({
      where: { id },
    });
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to delete employee:', error);
  }
  redirect('/dashboard');
}