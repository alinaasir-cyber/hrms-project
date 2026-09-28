'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPosition(formData: FormData) {
  const titleValue = formData.get('title');
  const departmentIdValue = formData.get('departmentId');
  const descriptionValue = formData.get('description');

  const title = typeof titleValue === 'string' ? titleValue.trim() : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue.trim() : '';
  const description = typeof descriptionValue === 'string' ? descriptionValue.trim() : '';

  if (!title || !departmentId) {
    return { success: false, error: 'Title and Department are required.' };
  }

  try {
    const position = await prisma.position.create({
      data: {
        title,
        departmentId,
        description: description || null,
      },
    });

    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard');

    return { success: true, position };
  } catch (error: unknown) {
    console.error('Failed to create position:', error);
    const message = error instanceof Error ? error.message : 'Failed to create position.';
    return { success: false, error: message };
  }
}

export async function updatePosition(formData: FormData) {
  const idValue = formData.get('id');
  const titleValue = formData.get('title');
  const departmentIdValue = formData.get('departmentId');
  const descriptionValue = formData.get('description');

  const id = typeof idValue === 'string' ? idValue.trim() : '';
  const title = typeof titleValue === 'string' ? titleValue.trim() : '';
  const departmentId = typeof departmentIdValue === 'string' ? departmentIdValue.trim() : '';
  const description = typeof descriptionValue === 'string' ? descriptionValue.trim() : '';

  if (!id || !title || !departmentId) {
    return { success: false, error: 'Position ID, Title, and Department are required.' };
  }

  try {
    const position = await prisma.position.update({
      where: { id },
      data: {
        title,
        departmentId,
        description: description || null,
      },
    });

    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard');

    return { success: true, position };
  } catch (error: unknown) {
    console.error('Failed to update position:', error);
    const message = error instanceof Error ? error.message : 'Failed to update position.';
    return { success: false, error: message };
  }
}

export async function deletePosition(id: string) {
  if (!id) {
    return { success: false, error: 'Position ID is required.' };
  }

  try {
    const assignedCount = await prisma.employee.count({
      where: { positionId: id },
    });

    if (assignedCount > 0) {
      return {
        success: false,
        error: `Cannot delete position: ${assignedCount} employee(s) are currently assigned to it. Please reassign them first.`,
      };
    }

    await prisma.position.delete({
      where: { id },
    });

    revalidatePath('/dashboard/positions');
    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete position:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete position.';
    return { success: false, error: message };
  }
}

export async function getPositions(departmentId?: string) {
  try {
    return await prisma.position.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { title: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return [];
  }
}
