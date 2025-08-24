import { Form, redirect, Link } from 'react-router';
import type { Route } from './+types/setup';
import { database } from '~/database/context';
import { adminUsers } from '~/database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { AuthLayout } from '~/components/auth-layout';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Divider } from '~/components/divider';

export async function loader() {
  // Check if any admin exists
  const admins = await database().select().from(adminUsers).limit(1);

  if (admins.length > 0) {
    // If admin exists, redirect to login
    return redirect('/login');
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!username || username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Check if username already exists
  const [existing] = await database()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  if (existing) {
    return { errors: { username: 'Username already exists' } };
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(password, 10);

  await database().insert(adminUsers).values({
    username,
    passwordHash,
  });

  return redirect('/login?setup=success');
}

export default function AdminSetup({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <Heading>Welcome to Motion Export</Heading>
          <Text className="mt-2">
            Create your administrator account to get started
          </Text>
        </div>

        <Form method="post" className="space-y-6">
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
                required
                minLength={3}
                autoComplete="username"
                className="w-full"
                placeholder="Choose a username"
              />
              {errors?.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.username}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Minimum 3 characters
              </p>
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
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full"
                placeholder="Choose a strong password"
              />
              {errors?.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full"
                placeholder="Confirm your password"
              />
              {errors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Admin Account
          </Button>
        </Form>

        <Divider className="my-8" />

        <div className="text-center">
          <Text className="text-sm">Setting up Motion Export Admin</Text>
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
