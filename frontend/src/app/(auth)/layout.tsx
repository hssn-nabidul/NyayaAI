'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-cream/40 text-sm animate-pulse uppercase tracking-widest">Verifying Session</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
