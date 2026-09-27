'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SessionPayload,
} from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  const emailValue = formData.get('email');
  const passwordValue = formData.get('password');

  const email =
    typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';
  const password = typeof passwordValue === 'string' ? passwordValue : '';

  if (!email || !password) {
    redirect(
      '/login?error=' +
        encodeURIComponent('Please enter both email and password.')
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    redirect(
      '/login?error=' + encodeURIComponent('Invalid email or password.')
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    employee.password || ''
  );

  if (!isPasswordValid) {
    redirect(
      '/login?error=' + encodeURIComponent('Invalid email or password.')
    );
  }

  const token = await signSessionToken({
    userId: employee.id,
    email: employee.email,
    name: employee.fullName,
    role: employee.role,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}