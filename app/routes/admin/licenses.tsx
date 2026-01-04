import { data, Form, Link, useSearchParams } from 'react-router';
import * as React from 'react';
import { licenses } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { eq, like, desc, sql } from 'drizzle-orm';
import type { Route } from './+types/licenses';
import { database } from '~/database/context';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '~/components/table';
import { Badge } from '~/components/badge';
import { Pagination } from '~/components/pagination';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  const allLicenses = await database()
    .select()
    .from(licenses)
    .where(search ? like(licenses.email, `%${search}%`) : undefined)
    .orderBy(desc(licenses.purchasedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await database()
    .select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(search ? like(licenses.email, `%${search}%`) : undefined);

  return data({
    licenses: allLicenses,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const action = formData.get('_action');
  const licenseId = formData.get('licenseId');

  if (action === 'revoke' && licenseId) {
    await database()
      .update(licenses)
      .set({ status: 'revoked', updatedAt: new Date().toISOString() })
      .where(eq(licenses.id, String(licenseId)));

    return data({ success: true });
  }

  if (action === 'activate' && licenseId) {
    await database()
      .update(licenses)
      .set({ status: 'active', updatedAt: new Date().toISOString() })
      .where(eq(licenses.id, String(licenseId)));

    return data({ success: true });
  }

  if (action === 'resend' && licenseId) {
    // Get the license
    const [license] = await database()
      .select()
      .from(licenses)
      .where(eq(licenses.id, String(licenseId)))
      .limit(1);

    if (!license) {
      return data({ error: 'License not found' }, { status: 404 });
    }

    // Since we can't retrieve the original key (it's hashed), we need to generate a new one
    const { createLicense } = await import('~/lib/license.server');
    const { sendLicenseEmail } = await import('~/lib/email.server');

    // Create new license with same details
    const { licenseKey } = await createLicense({
      email: license.email,
      stripeCustomerId: license.stripeCustomerId,
      stripeSessionId: license.stripeSessionId,
      amount: license.amount || 0,
      currency: license.currency || 'usd',
    });

    // Revoke old license
    await database()
      .update(licenses)
      .set({
        status: 'revoked',
        metadata: JSON.stringify({
          ...(license.metadata ? JSON.parse(license.metadata) : {}),
          revokedReason: 'replaced_with_new_key',
          replacedAt: new Date().toISOString(),
        }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(licenses.id, String(licenseId)));

    // Send email with new key
    try {
      await sendLicenseEmail(license.email, licenseKey);
      return data({
        success: true,
        message: `New license key sent to ${license.email}`,
        licenseKey,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      return data(
        {
          error: 'Failed to send email',
          licenseKey,
        },
        { status: 500 },
      );
    }
  }

  if (action === 'create') {
    const email = formData.get('email') as string;
    const amount = parseFloat(formData.get('amount') as string) || 0;

    if (!email) {
      return data({ error: 'Email is required' }, { status: 400 });
    }

    // Import the createLicense function
    const { createLicense } = await import('~/lib/license.server');
    const { sendLicenseEmail } = await import('~/lib/email.server');

    // Create the license
    const { license, licenseKey } = await createLicense({
      email,
      stripeCustomerId: null,
      stripeSessionId: null,
      amount,
      currency: 'usd',
    });

    // Update metadata to indicate manual creation
    await database()
      .update(licenses)
      .set({
        metadata: JSON.stringify({
          createdVia: 'admin_panel',
          createdBy: 'admin',
          reason: amount === 0 ? 'free_license' : 'offline_payment',
          timestamp: new Date().toISOString(),
        }),
      })
      .where(eq(licenses.id, license.id));

    // Optionally send email
    const sendEmail = formData.get('sendEmail') === 'on';
    if (sendEmail) {
      try {
        await sendLicenseEmail(email, licenseKey);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }

    return data({ success: true, licenseKey });
  }

  return data({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminLicenses({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { licenses, pagination } = loaderData;
  const [searchParams] = useSearchParams();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // Extract figmaUserId from deviceId
  const extractFigmaUserId = (activations: string) => {
    try {
      const acts = JSON.parse(activations || '[]');
      for (const act of acts) {
        if (act.deviceId?.startsWith('figma-')) {
          return act.deviceId.replace('figma-', '');
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Heading>License Management</Heading>
          <Text className="mt-1">View and manage all licenses</Text>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          Create License
        </Button>
      </div>

      {actionData && 'licenseKey' in actionData && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 font-medium">
            {'message' in actionData ? String(actionData.message) : 'License created successfully!'}
          </p>
          <p className="text-green-700 dark:text-green-300 mt-1 font-mono text-sm">
            License Key: {actionData.licenseKey as string}
          </p>
        </div>
      )}

      {actionData && 'error' in actionData && !('licenseKey' in actionData) && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 font-medium">
            {actionData.error as string}
          </p>
        </div>
      )}

      {showCreateForm && (
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="create" />

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Customer Email
              </label>
              <Input
                type="email"
                name="email"
                id="email"
                required
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-2"
              >
                Amount (USD)
              </label>
              <Input
                type="number"
                name="amount"
                id="amount"
                defaultValue="29"
                step="0.01"
                min="0"
                placeholder="29.00"
              />
              <Text className="mt-1 text-sm">Enter 0 for free license</Text>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="sendEmail"
                id="sendEmail"
                defaultChecked
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <label htmlFor="sendEmail" className="text-sm">
                Send license key via email
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create License</Button>
              <Button
                type="button"
                outline
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Search */}
      <div>
        <Form method="get" className="flex gap-4">
          <Input
            type="text"
            name="search"
            defaultValue={searchParams.get('search') || ''}
            placeholder="Search by email..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </Form>
      </div>

      {/* Licenses Table */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="p-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="pl-0">License Key</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Figma User</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Activations</TableHeader>
                <TableHeader>Purchased</TableHeader>
                <TableHeader className="pr-0">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {licenses.map((license) => {
                const activations = JSON.parse(license.activations || '[]');
                const figmaUserId = extractFigmaUserId(
                  license.activations || '[]',
                );
                return (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm pl-0">
                      {license.licenseKey.substring(0, 16)}...
                    </TableCell>
                    <TableCell>{license.email}</TableCell>
                    <TableCell>
                      {figmaUserId ? (
                        <span className="font-mono text-xs">{figmaUserId}</span>
                      ) : license.figmaUserId ? (
                        <span className="font-mono text-xs">
                          {license.figmaUserId}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      ${license.amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={
                          license.status === 'active'
                            ? 'green'
                            : license.status === 'revoked'
                              ? 'red'
                              : license.status === 'refunded'
                                ? 'orange'
                                : license.status === 'disputed'
                                  ? 'red'
                                  : 'zinc'
                        }
                      >
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          activations.length >= 5
                            ? 'text-orange-600 dark:text-orange-400'
                            : ''
                        }
                      >
                        {activations.length} / 5
                      </span>
                    </TableCell>
                    <TableCell>
                      {license.purchasedAt
                        ? new Date(license.purchasedAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="licenseId"
                            value={license.id}
                          />
                          {license.status === 'active' ? (
                            <>
                              <Button
                                type="submit"
                                name="_action"
                                value="resend"
                                outline
                                className="text-sm"
                                title="Generate new key and email it"
                              >
                                Resend
                              </Button>
                              <Button
                                type="submit"
                                name="_action"
                                value="revoke"
                                outline
                                className="text-sm"
                              >
                                Revoke
                              </Button>
                            </>
                          ) : license.status === 'revoked' ? (
                            <Button
                              type="submit"
                              name="_action"
                              value="activate"
                              outline
                              className="text-sm"
                            >
                              Activate
                            </Button>
                          ) : (
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                              {license.status}
                            </span>
                          )}
                        </Form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  to={`?page=${pageNum}${searchParams.get('search') ? `&search=${searchParams.get('search')}` : ''}`}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {pageNum}
                </Link>
              ),
            )}
          </Pagination>
        </div>
      )}
    </div>
  );
}
