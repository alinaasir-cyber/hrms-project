import { PrismaClient, EmployeeRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, itDepartment] = await Promise.all([
    prisma.department.upsert({
      where: { code: "HR01" },
      update: { name: "Human Resources" },
      create: { name: "Human Resources", code: "HR01" },
    }),
    prisma.department.upsert({
      where: { code: "IT01" },
      update: { name: "Information Technology" },
      create: { name: "Information Technology", code: "IT01" },
    }),
  ]);

  const defaultPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await prisma.employee.upsert({
    where: { staffCode: "EMP001" },
    update: {
      fullName: "System Administrator",
      email: "admin@company.com",
      password: hashedPassword,
      baseSalary: 3000,
      role: EmployeeRole.SUPER_ADMIN,
      department: { connect: { id: itDepartment.id } },
    },
    create: {
      staffCode: "EMP001",
      fullName: "System Administrator",
      email: "admin@company.com",
      password: hashedPassword,
      baseSalary: 3000,
      role: EmployeeRole.SUPER_ADMIN,
      department: { connect: { id: itDepartment.id } },
    },
  });

  console.log("Admin seeded: admin@company.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });