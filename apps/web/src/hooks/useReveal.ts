import { useEffect, useRef } from "react";

/**
 * Attach an IntersectionObserver to a container. When the container enters
 * the viewport, each child matching `childSelector` gets the class `reveal-visible`
 * added with a staggered `transition-delay` so they cascade in one-by-one.
 *
 * Usage:
 *   const ref = useReveal<HTMLDivElement>(".card");
 *   return <div ref={ref} className="grid-3">…</div>;
 */
export function useReveal<T extends HTMLElement>(
  childSelector: string,
  options: { threshold?: number; stagger?: number } = {},
) {
  const ref = useRef<T>(null);
  const { threshold = 0.12, stagger = 80 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mark all children as "reveal" targets immediately so they start invisible.
    const children = Array.from(el.querySelectorAll<HTMLElement>(childSelector));
    children.forEach((child, i) => {
      child.classList.add("reveal");
      child.style.transitionDelay = `${i * stagger}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const kids = Array.from(entry.target.querySelectorAll<HTMLElement>(childSelector));
            kids.forEach((child) => child.classList.add("reveal-visible"));
            // Once triggered, we no longer need to watch.
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
