import { prisma } from '../../../lib/prisma';
import EmployeesClient from './EmployeesClient';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  const [employees, departments, positions] = await Promise.all([
    prisma.employee.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        position: { select: { id: true, title: true, departmentId: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.department.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    prisma.position.findMany({
      select: { id: true, title: true, departmentId: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  // Safely serialize Prisma Decimal (baseSalary) and Date objects for React Client Component boundary
  const serializedEmployees = JSON.parse(JSON.stringify(employees));
  const serializedDepartments = JSON.parse(JSON.stringify(departments));
  const serializedPositions = JSON.parse(JSON.stringify(positions));

  return (
    <EmployeesClient
      initialEmployees={serializedEmployees}
      departments={serializedDepartments}
      positions={serializedPositions}
    />
  );
}
