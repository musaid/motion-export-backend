import { data, Form, Link, useSearchParams } from 'react-router';
import { licenses } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { eq, like, desc, sql } from 'drizzle-orm';
import type { Route } from './+types/licenses';
import { database } from '~/database/context';

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">License Management</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Form method="get" className="flex gap-4">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.get('search') || ''}
            placeholder="Search by email..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
        </Form>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                License Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Activations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Purchased
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {licenses.map((license) => {
              const activations = JSON.parse(license.activations || '[]');
              return (
                <tr key={license.id}>
                  <td className="px-6 py-4 text-sm font-mono">{license.key}</td>
                  <td className="px-6 py-4 text-sm">{license.email}</td>
                  <td className="px-6 py-4 text-sm">${license.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        license.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {activations.length} / 5
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(license.purchasedAt!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="licenseId"
                        value={license.id}
                      />
                      {license.status === 'active' ? (
                        <button
                          type="submit"
                          name="_action"
                          value="revoke"
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="_action"
                          value="activate"
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Link
                key={pageNum}
                to={`?page=${pageNum}${searchParams.get('search') ? `&search=${searchParams.get('search')}` : ''}`}
                className={`px-4 py-2 rounded ${
                  pageNum === pagination.page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
