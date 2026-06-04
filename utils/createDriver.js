/* global window, document */

/**
 * Creates a driver.js instance with a sticky-header-aware scroll offset.
 *
 * Root bug: driver.js v1.x fires `onHighlightStarted` FIRST, then calls
 * `element.scrollIntoView()` itself — overriding any scroll we did in the
 * callback. Fix: set `scrollIntoViewOptions: false` on every step to disable
 * driver's built-in scroll, then own all scrolling in `onHighlightStarted`
 * with instant, header-aware positioning.
 *
 * Special case: sticky/fixed elements (e.g. the actions bar) are already
 * rendered at the top of the viewport. For those, we scroll to top:0 so the
 * element sits flush below the nav header.
 *
 * @param {import('driver.js').Config} options - driver.js config (steps, callbacks, etc.)
 * @returns {import('driver.js').Driver}
 */
export function createDriver(options = {}) {
  const { driver } = require('driver.js');

  const EXTRA_GAP = 16;

  const getHeaderHeight = () => {
    const header = document.querySelector('header') ?? document.querySelector('nav');
    return header ? header.getBoundingClientRect().height : 0;
  };

  const isSticky = (element) => {
    const style = window.getComputedStyle(element);
    return style.position === 'sticky' || style.position === 'fixed';
  };

  const scrollToElement = (element) => {
    if (!element) return;

    if (isSticky(element)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const headerHeight = getHeaderHeight();
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const target = Math.max(0, elementTop - headerHeight - EXTRA_GAP);
    window.scrollTo({ top: target, behavior: 'instant' });
  };

  const { onHighlightStarted, steps = [], ...rest } = options;

  // Per-step scrollIntoViewOptions: false disables driver.js's own
  // scrollIntoView call so our onHighlightStarted scroll is not overridden.
  const stepsWithNoScroll = steps.map((step) => ({
    ...step,
    scrollIntoViewOptions: false,
  }));

  return driver({
    showProgress: true,
    animate: true,
    smoothScroll: false,
    doneBtnText: 'Finish',
    closeBtnText: 'Close',
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    ...rest,
    steps: stepsWithNoScroll,
    onHighlightStarted: (element, step, opts) => {
      scrollToElement(element);
      onHighlightStarted?.(element, step, opts);
    },
  });
}
