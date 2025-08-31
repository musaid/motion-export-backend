import { data, Form, useSearchParams, redirect, Link } from 'react-router';
import {
  verifyLogin,
  createUserSession,
  getUserSession,
} from '~/lib/auth.server';
import { z } from 'zod';
import type { Route } from './+types/login';
import { database } from '~/database/context';
import { adminUsers } from '~/database/schema';
import { AuthLayout } from '~/components/auth-layout';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Divider } from '~/components/divider';

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
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.svg"
              alt="Motion Export"
              className="w-16 h-16"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(41%) sepia(84%) saturate(438%) hue-rotate(212deg) brightness(104%) contrast(94%)',
              }}
            />
          </div>
          <Heading>Welcome back</Heading>
          <Text className="mt-2">Sign in to your admin account</Text>
        </div>

        {setupSuccess && (
          <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200">
              Admin account created successfully! Please login.
            </p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">
                {actionData.error}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Sign in to dashboard
          </Button>
        </Form>

        <Divider className="my-8" />

        <div className="text-center">
          <Text className="text-sm">Motion Export Admin Panel</Text>
          <Link
            to="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mt-2 inline-block"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
