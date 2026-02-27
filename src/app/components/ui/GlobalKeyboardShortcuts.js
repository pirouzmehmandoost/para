'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import useSelection from '@stores/selectionStore';

const clearFocus = () => {
  useSelection.getState().setIsFocused(null);
};

export default function GlobalKeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const segment = useSelectedLayoutSegment('modal');

  useEffect(() => {
    const onKeyDown = (e) => {
      let flag = false;
      if (e.key !== 'Escape') return;

      if (segment?.length) {
        router.back();
        flag = true;
      }
      else if (pathname.startsWith('/projects/')) {
        router.replace('/');
        flag = true;
      }

      if (flag) clearFocus();

      return;
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pathname, router, segment]);

  return null;
}

