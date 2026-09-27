import { loginAction } from '../actions/auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Soo Gal HRMS</h2>
          <p className="text-sm text-gray-500 mt-1">
            Geli e-mail-kaaga si aad nidaamka u dhex gasho
          </p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail-ka Shaqada
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@company.com"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Soo Gal (Login)
          </button>
        </form>
      </div>
    </div>
  );
}