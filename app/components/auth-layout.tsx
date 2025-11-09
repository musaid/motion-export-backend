import type React from 'react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <div className="flex grow items-center justify-center p-6">
        {children}
      </div>
    </main>
  );
}
