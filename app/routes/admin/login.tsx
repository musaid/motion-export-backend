import { data, Form, useSearchParams, redirect } from 'react-router';
import {
  verifyLogin,
  createUserSession,
  getUserSession,
} from '~/lib/auth.server';
import { z } from 'zod';
import type { Route } from './+types/login';
import { database } from '~/database/context';
import { adminUsers } from '~/database/schema';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
  // Check if any admin exists
  const admins = await database().select().from(adminUsers).limit(1);
  if (admins.length === 0) {
    // No admin exists, redirect to setup
    return redirect('/admin/setup');
  }

  const userId = await getUserSession(request);
  if (userId) {
    return redirect('/admin');
  }
  return data({});
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);

  try {
    const { username, password, redirectTo } = loginSchema.parse(submission);

    const admin = await verifyLogin(username, password);

    if (!admin) {
      return data({ error: 'Invalid username or password' }, { status: 400 });
    }

    return createUserSession(admin.id, redirectTo || '/admin');
  } catch (error) {
    return data({ error: 'Invalid form submission' }, { status: 400 });
  }
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const setupSuccess = searchParams.get('setup') === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Motion Export Dashboard</p>
          </div>

          {setupSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Admin account created successfully! Please login.
              </p>
            </div>
          )}

          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {actionData.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
