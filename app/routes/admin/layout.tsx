import { Form, Link, Outlet, useLocation } from 'react-router';
import { SidebarLayout } from '~/components/sidebar-layout';
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarSection,
  SidebarItem,
} from '~/components/sidebar';
import { Button } from '~/components/button';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarLayout
      navbar={
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/admin" className="flex items-center gap-3 group">
            <img
              src="/logo.svg"
              alt="Motion Export"
              className="w-8 h-8 transition-transform group-hover:scale-110"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(41%) sepia(84%) saturate(438%) hue-rotate(212deg) brightness(104%) contrast(94%)',
              }}
            />
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Motion Export Admin
            </h1>
          </Link>
        </div>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo.svg"
                alt="Motion Export"
                className="w-6 h-6"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(41%) sepia(84%) saturate(438%) hue-rotate(212deg) brightness(104%) contrast(94%)',
                }}
              />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Admin Panel
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage your licenses
            </p>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem
                href="/admin"
                current={location.pathname === '/admin'}
              >
                Dashboard
              </SidebarItem>
              <SidebarItem
                href="/admin/licenses"
                current={location.pathname === '/admin/licenses'}
              >
                Licenses
              </SidebarItem>
              <SidebarItem
                href="/admin/usage"
                current={location.pathname === '/admin/usage'}
              >
                Usage
              </SidebarItem>
              <SidebarItem
                href="/admin/usage-analytics"
                current={location.pathname === '/admin/usage-analytics'}
              >
                Usage Analytics
              </SidebarItem>
            </SidebarSection>
            <SidebarSection className="mt-auto pb-4">
              <Form method="post" action="/logout">
                <Button type="submit" outline className="w-full">
                  Logout
                </Button>
              </Form>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </SidebarLayout>
  );
}
