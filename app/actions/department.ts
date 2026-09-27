'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData: FormData): Promise<void> {
  const nameValue = formData.get('name');
  const codeValue = formData.get('code');
  const name = typeof nameValue === 'string' ? nameValue.trim() : '';
  const code = typeof codeValue === 'string' ? codeValue.trim() : '';

  if (!name || !code) {
    return;
  }

  await prisma.department.create({
    data: {
      name,
      code,
    },
  });

  revalidatePath('/dashboard/departments');
}

export async function deleteDepartment(id: string): Promise<void> {
  try {
    // Hubi haddii ay jiraan shaqaale ku dhex jira waaxdan
    const employeeCount = await prisma.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      return;
    }

    await prisma.department.delete({
      where: { id },
    });

    revalidatePath('/dashboard/departments');
  } catch (error) {
    console.error('Failed to delete department:', error);
  }
}