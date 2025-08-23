import { data, Form, Link, useSearchParams } from 'react-router';
import { licenses } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { eq, like, desc, sql } from 'drizzle-orm';
import type { Route } from './+types/licenses';
import { database } from '~/database/context';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '~/components/table';
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
      .where(eq(licenses.id, Number(licenseId)));

    return data({ success: true });
  }

  if (action === 'activate' && licenseId) {
    await database()
      .update(licenses)
      .set({ status: 'active', updatedAt: new Date().toISOString() })
      .where(eq(licenses.id, Number(licenseId)));

    return data({ success: true });
  }

  return data({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminLicenses({ loaderData }: Route.ComponentProps) {
  const { licenses, pagination } = loaderData;
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-8">
      <div>
        <Heading>License Management</Heading>
        <Text className="mt-1">View and manage all licenses</Text>
      </div>

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
          <Button type="submit">
            Search
          </Button>
        </Form>
      </div>

      {/* Licenses Table */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>License Key</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Activations</TableHeader>
              <TableHeader>Purchased</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {licenses.map((license) => {
              const activations = JSON.parse(license.activations || '[]');
              return (
                <TableRow key={license.id}>
                  <TableCell className="font-mono text-sm">
                    {license.key}
                  </TableCell>
                  <TableCell>{license.email}</TableCell>
                  <TableCell>${license.amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge 
                      color={
                        license.status === 'active' ? 'green' :
                        license.status === 'revoked' ? 'red' :
                        license.status === 'refunded' ? 'orange' :
                        license.status === 'disputed' ? 'red' :
                        'zinc'
                      }
                    >
                      {license.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={activations.length >= 5 ? 'text-orange-600 dark:text-orange-400' : ''}>
                      {activations.length} / 5
                    </span>
                  </TableCell>
                  <TableCell>
                    {license.purchasedAt
                      ? new Date(license.purchasedAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="licenseId"
                        value={license.id}
                      />
                      {license.status === 'active' ? (
                        <Button
                          type="submit"
                          name="_action"
                          value="revoke"
                          outline
                          className="text-sm"
                        >
                          Revoke
                        </Button>
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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