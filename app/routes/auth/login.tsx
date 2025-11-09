import { data, Form, useSearchParams, redirect, Link } from 'react-router';
import {
  verifyLogin,
  createUserSession,
  getUserSession,
} from '~/lib/auth.server';
import { z } from 'zod';
import type { Route } from './+types/login';
import { database } from '~/database/context';
import { admins } from '~/database/schema';
import { AuthLayout } from '~/components/auth-layout';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
  // Check if any admin exists
  const adminList = await database().select().from(admins).limit(1);
  if (adminList.length === 0) {
    // No admin exists, redirect to setup
    return redirect('/setup');
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
  } catch {
    return data({ error: 'Invalid form submission' }, { status: 400 });
  }
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const setupSuccess = searchParams.get('setup') === 'success';

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          {/* Logo/Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-plum rounded-full border-2 border-black dark:border-white mb-6">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Sign in to your admin account
            </p>
          </div>

          {setupSuccess && (
            <div className="mb-8 rounded-2xl bg-plum/10 dark:bg-plum/20 p-6 border-2 border-plum">
              <p className="font-bold text-center">
                ✓ Admin account created successfully! Please login.
              </p>
            </div>
          )}

          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-base font-bold mb-3"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full px-6 py-4 text-base font-medium bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl focus:outline-none focus:border-plum transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-bold mb-3"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-6 py-4 text-base font-medium bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl focus:outline-none focus:border-plum transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {actionData?.error && (
              <div className="rounded-2xl bg-white dark:bg-black p-6 border-2 border-red-500">
                <p className="font-bold text-red-500 text-center">
                  ✗ {actionData.error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-8 py-3 bg-plum hover:bg-plum-dark text-white dark:text-black font-bold rounded-full border-2 border-black dark:border-white transition-all hover:translate-y-[-2px] text-base"
            >
              Sign in to dashboard →
            </button>
          </Form>

          <div className="mt-10 pt-8 border-t-2 border-black dark:border-white">
            <div className="text-center space-y-3">
              <p className="text-sm font-bold opacity-60">
                Motion Export Admin Panel
              </p>
              <Link
                to="/"
                className="text-base font-bold text-plum hover:opacity-70 transition-opacity inline-block"
              >
                ← Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
