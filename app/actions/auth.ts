'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData): Promise<void> {
  const emailValue = formData.get('email');
  const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';

  if (!email) {
    redirect('/login?error=Fadlan%20e-mail-ka%20soo%20geli');
  }

  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    redirect('/login?error=E-mail-kan%20kama%20jiro%20nidaamka');
  }

  redirect('/dashboard');
}