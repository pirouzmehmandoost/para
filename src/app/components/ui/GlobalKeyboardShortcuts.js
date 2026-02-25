'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useSelection from '@stores/selectionStore';

const clearFocus = () => {
  useSelection.getState().setIsFocused(null);
};

export default function GlobalKeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;

      if (pathname?.startsWith('/projects/')) {
        clearFocus();
        router.back();
        // If the user direct-loaded `/projects/[slug]`, `back()` can exit the app.
        // This fallback keeps close deterministic.
        setTimeout(() => {
          if (window.location.pathname.startsWith('/projects/')) router.push('/');
        }, 150);
        return;
      }

      clearFocus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pathname, router]);

  return null;
}

