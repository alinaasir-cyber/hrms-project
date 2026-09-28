import { prisma } from '@/lib/prisma';
import PositionsClient from './PositionsClient';

export const dynamic = 'force-dynamic';

export default async function PositionsPage() {
  const [positions, departments] = await Promise.all([
    prisma.position.findMany({
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.department.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return <PositionsClient initialPositions={positions} departments={departments} />;
}
