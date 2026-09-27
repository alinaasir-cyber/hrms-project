import { PrismaClient, EmployeeRole, LeaveType, LeaveStatus, PayrollStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [hrDepartment, itDepartment] = await Promise.all([
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

  // 1. Admin Employee
  const admin = await prisma.employee.upsert({
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

  // 2. HR Specialist
  const sarah = await prisma.employee.upsert({
    where: { staffCode: "EMP002" },
    update: {
      fullName: "Sarah Connor",
      email: "sarah.connor@company.com",
      password: hashedPassword,
      baseSalary: 2500,
      role: EmployeeRole.EMPLOYEE,
      department: { connect: { id: hrDepartment.id } },
    },
    create: {
      staffCode: "EMP002",
      fullName: "Sarah Connor",
      email: "sarah.connor@company.com",
      password: hashedPassword,
      baseSalary: 2500,
      role: EmployeeRole.EMPLOYEE,
      department: { connect: { id: hrDepartment.id } },
    },
  });

  // 3. Software Engineer
  const john = await prisma.employee.upsert({
    where: { staffCode: "EMP003" },
    update: {
      fullName: "John Doe",
      email: "john.doe@company.com",
      password: hashedPassword,
      baseSalary: 3500,
      role: EmployeeRole.EMPLOYEE,
      department: { connect: { id: itDepartment.id } },
    },
    create: {
      staffCode: "EMP003",
      fullName: "John Doe",
      email: "john.doe@company.com",
      password: hashedPassword,
      baseSalary: 3500,
      role: EmployeeRole.EMPLOYEE,
      department: { connect: { id: itDepartment.id } },
    },
  });

  // Sample Leave Requests
  await prisma.leaveRequest.deleteMany({
    where: { employeeId: { in: [admin.id, sarah.id, john.id] } },
  });

  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: sarah.id,
        leaveType: LeaveType.ANNUAL,
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-05"),
        reason: "Family vacation to coastal resort",
        status: LeaveStatus.APPROVED,
      },
      {
        employeeId: john.id,
        leaveType: LeaveType.SICK,
        startDate: new Date("2026-09-28"),
        endDate: new Date("2026-09-30"),
        reason: "Seasonal flu and doctor appointment",
        status: LeaveStatus.PENDING,
      },
      {
        employeeId: admin.id,
        leaveType: LeaveType.UNPAID,
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-12"),
        reason: "Personal seminar participation",
        status: LeaveStatus.REJECTED,
      },
    ],
  });

  // Sample Payroll entries for current month
  const currentMonth = "September 2026";
  await prisma.payroll.deleteMany({
    where: { month: currentMonth },
  });

  await prisma.payroll.createMany({
    data: [
      {
        employeeId: admin.id,
        month: currentMonth,
        baseSalary: 3000,
        allowance: 200,
        deductions: 100,
        netSalary: 3100,
        status: PayrollStatus.PAID,
        paymentDate: new Date(),
      },
      {
        employeeId: sarah.id,
        month: currentMonth,
        baseSalary: 2500,
        allowance: 150,
        deductions: 50,
        netSalary: 2600,
        status: PayrollStatus.PAID,
        paymentDate: new Date(),
      },
      {
        employeeId: john.id,
        month: currentMonth,
        baseSalary: 3500,
        allowance: 300,
        deductions: 150,
        netSalary: 3650,
        status: PayrollStatus.PENDING,
        paymentDate: null,
      },
    ],
  });

  console.log("Seeding completed successfully with employees, leaves, and payroll records!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });