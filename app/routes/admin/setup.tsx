import { Form, redirect } from 'react-router';
import type { Route } from './+types/setup';
import { database } from '~/database/context';
import { adminUsers } from '~/database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';

export async function loader() {
  // Check if any admin exists
  const admins = await database().select().from(adminUsers).limit(1);
  
  if (admins.length > 0) {
    // If admin exists, redirect to login
    return redirect('/admin/login');
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
  
  await database()
    .insert(adminUsers)
    .values({
      username,
      passwordHash,
    });

  return redirect('/admin/login?setup=success');
}

export default function AdminSetup({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heading>Create Admin Account</Heading>
          <Text className="mt-2">
            Set up your first administrator account to access the admin panel.
          </Text>
        </div>

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
            />
            {errors?.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
            />
            {errors?.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full"
            />
            {errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Create Admin Account
          </Button>
        </Form>
      </div>
    </div>
  );
}