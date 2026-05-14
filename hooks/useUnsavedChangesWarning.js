'use client';

import { useEffect } from 'react';

/**
 * A hook to show the browser's native 'beforeunload' confirmation dialog
 * when the user tries to close the tab or refresh the page, to prevent them
 * from accidentally losing unsaved test progress.
 *
 * @param {boolean} shouldWarn - Whether to show the warning (e.g. true if taking test, false if readonly/submitting)
 */
export default function useUnsavedChangesWarning(shouldWarn) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!shouldWarn) return;

      e.preventDefault();
      // In modern browsers, returnValue must be set to show the dialog
      // The actual text is controlled by the browser, we cannot customize it
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldWarn]);
}
