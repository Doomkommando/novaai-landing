import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver-based reveal hook.
 * Returns a ref to attach to the element and a boolean for visibility.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            done = true;
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold }
    );

    observer.observe(el);

    // Deep-link / instant-scroll fallback: if the page loads (or scroll
    // is restored, or the tab was backgrounded while an off-screen
    // element scrolled into place) with this element already past the
    // reveal point before the observer's callback has had a chance to
    // fire, it would otherwise stay stuck at opacity 0 forever. Do a
    // manual intersection check whenever there's a reasonable chance
    // the observer was skipped or throttled.
    function manualCheck() {
      if (done || !el!.isConnected) return;
      const rect = el!.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const viewportW = window.innerWidth || document.documentElement.clientWidth;
      const visibleH = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
      const visibleW = Math.min(rect.right, viewportW) - Math.max(rect.left, 0);
      const intersects = visibleH > 0 && visibleW > 0;
      const ratio = intersects ? (visibleH * visibleW) / (rect.height * rect.width || 1) : 0;
      // Element has already scrolled fully past above the viewport.
      const scrolledPast = rect.bottom <= 0;

      if (ratio >= threshold || scrolledPast) {
        done = true;
        setVisible(true);
        observer.unobserve(el!);
      }
    }

    // Run once on the next frame (catches the normal deep-link case:
    // page loads already scrolled, e.g. via #anchor or scroll restoration).
    const rafId = requestAnimationFrame(manualCheck);

    // Re-run whenever the tab regains visibility: rAF and
    // IntersectionObserver callbacks are throttled/paused while a tab
    // is hidden, so a scroll that happens in the background can leave
    // elements stuck unrevealed until the user actually looks at the
    // page again.
    document.addEventListener("visibilitychange", manualCheck);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", manualCheck);
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, visible };
}
