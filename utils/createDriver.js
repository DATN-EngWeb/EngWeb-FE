/* global window, document */

/**
 * Creates a driver.js instance with a sticky-header-aware scroll offset.
 * Driver.js v1.x does not natively support scroll padding for fixed/sticky
 * headers, so we disable its built-in smooth scroll and handle it ourselves
 * in `onHighlightStarted`.
 *
 * @param {import('driver.js').Config} options - driver.js config (steps, callbacks, etc.)
 * @returns {import('driver.js').Driver}
 */
export function createDriver(options = {}) {
  const { driver } = require('driver.js');

  const EXTRA_GAP = 16;

  const scrollToElement = (element) => {
    if (!element) return;
    const header = document.querySelector('header') ?? document.querySelector('nav');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const target = Math.max(0, elementTop - headerHeight - EXTRA_GAP);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  const { onHighlightStarted, ...rest } = options;

  return driver({
    showProgress: true,
    animate: true,
    smoothScroll: false,
    doneBtnText: 'Finish',
    closeBtnText: 'Close',
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    ...rest,
    onHighlightStarted: (element, step, opts) => {
      scrollToElement(element);
      onHighlightStarted?.(element, step, opts);
    },
  });
}
