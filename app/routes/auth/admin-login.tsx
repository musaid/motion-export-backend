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
import { Alert } from '~/components/alert';
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
  } catch (error) {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <Heading>Welcome back</Heading>
          <Text className="mt-2">Sign in to your admin account</Text>
        </div>

        {setupSuccess && (
          <Alert className="mb-6">
            Admin account created successfully! Please login.
          </Alert>
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
            <Alert color="red">
              {actionData.error}
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Sign in to dashboard
          </Button>
        </Form>

        <Divider className="my-8" />

        <div className="text-center">
          <Text className="text-sm">
            Motion Export Admin Panel
          </Text>
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