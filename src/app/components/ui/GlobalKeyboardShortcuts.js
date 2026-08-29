'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import useSelection from '@stores/selectionStore';

const reset = useSelection.getState().reset

export default function GlobalKeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const segment = useSelectedLayoutSegment('modal');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;

      // The modal slot reports a segment on '/' as well, so the pathname decides
      // whether there is a project route to leave.
      if (pathname.startsWith('/projects/')) {
        if (segment?.length) router.back();
        else router.replace('/');
      }

      reset();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pathname, router, segment]);

  return null;
}

