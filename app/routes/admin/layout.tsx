import { Form, Link, Outlet } from 'react-router';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Motion Export Admin</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/licenses"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Licenses
                </Link>
                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Form method="post" action="/admin/logout">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
