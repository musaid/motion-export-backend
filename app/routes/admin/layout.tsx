import { Form, Outlet, useLocation } from 'react-router';
import { SidebarLayout } from '~/components/sidebar-layout';
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem } from '~/components/sidebar';
import { Button } from '~/components/button';

export default function AdminLayout() {
  const location = useLocation();
  
  return (
    <SidebarLayout
      navbar={
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Motion Export Admin</h1>
        </div>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Admin Panel</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your licenses</p>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/admin" current={location.pathname === '/admin'}>
                Dashboard
              </SidebarItem>
              <SidebarItem href="/admin/licenses" current={location.pathname === '/admin/licenses'}>
                Licenses
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