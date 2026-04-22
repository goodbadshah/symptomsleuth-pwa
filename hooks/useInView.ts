import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the observed element enters the viewport.
 * Uses IntersectionObserver - never window scroll listeners.
 * Disconnects after first intersection so it cannot re-trigger.
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<Element | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/**
 * Convenience: returns the CSS style object for a scroll-entry animation.
 * Apply to each item; pass `index` for stagger (100ms per item).
 */
export function entryStyle(inView: boolean, index = 0): React.CSSProperties {
  return {
    transform: inView ? "translateY(0)" : "translateY(2rem)",
    filter: inView ? "blur(0px)" : "blur(4px)",
    opacity: inView ? 1 : 0,
    transition: [
      `transform 600ms cubic-bezier(0.32,0.72,0,1) ${index * 100}ms`,
      `filter 600ms cubic-bezier(0.32,0.72,0,1) ${index * 100}ms`,
      `opacity 600ms cubic-bezier(0.32,0.72,0,1) ${index * 100}ms`,
    ].join(", "),
  };
}
