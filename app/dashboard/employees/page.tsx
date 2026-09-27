import Link from 'next/link';
import { prisma } from '../../../lib/prisma';

export default async function EmployeesPage() {
	const employees = await prisma.employee.findMany({
		include: { department: true },
		orderBy: { fullName: 'asc' },
	});

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
				<p className="text-sm text-gray-500">View employee details and department assignments</p>
			</div>

			<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="bg-gray-50 text-gray-700 uppercase text-xs">
							<tr>
								<th className="py-3 px-4">Full Name</th>
								<th className="py-3 px-4">Staff Code</th>
								<th className="py-3 px-4">Email</th>
								<th className="py-3 px-4">Department</th>
								<th className="py-3 px-4">Role</th>
								<th className="py-3 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{employees.map((employee) => (
								<tr key={employee.id} className="hover:bg-gray-50">
									<td className="py-3 px-4 font-medium text-gray-900">{employee.fullName}</td>
									<td className="py-3 px-4">{employee.staffCode}</td>
									<td className="py-3 px-4">{employee.email}</td>
									<td className="py-3 px-4">{employee.department.name}</td>
									<td className="py-3 px-4">{employee.role}</td>
									<td className="py-3 px-4 text-right">
										<Link
											href={`/dashboard/employees/${employee.id}/edit`}
											className="text-sm font-medium text-blue-600 hover:text-blue-800"
										>
											Edit
										</Link>
									</td>
								</tr>
							))}
							{employees.length === 0 && (
								<tr>
									<td colSpan={6} className="py-6 text-center text-gray-500">
										No employees found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
