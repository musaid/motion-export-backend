import { redirect, createCookieSessionStorage } from 'react-router';
import bcrypt from 'bcryptjs';
import { adminUsers } from '~/database/schema';
import { eq } from 'drizzle-orm';
import { database } from '~/database/context';

// Session storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export async function createUserSession(userId: number, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );

  const userId = session.get('userId');
  if (!userId) return null;

  return userId;
}

export async function requireAdmin(request: Request) {
  const userId = await getUserSession(request);

  if (!userId) {
    throw redirect('/admin/login');
  }

  const [admin] = await database()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);

  if (!admin) {
    throw redirect('/admin/login');
  }

  return admin;
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );

  return redirect('/admin/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function verifyLogin(username: string, password: string) {
  const [admin] = await database()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isValid) {
    return null;
  }

  return admin;
}

// Initialize admin user if doesn't exist
export async function initializeAdmin() {
  const [existingAdmin] = await database()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, process.env.ADMIN_USERNAME || 'admin'))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'changeme',
      10,
    );

    await database()
      .insert(adminUsers)
      .values({
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash,
      });

    console.log('Admin user created');
  }
}
