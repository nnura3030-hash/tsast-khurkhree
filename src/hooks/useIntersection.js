import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal hook — fires once when element enters viewport.
 * @param {Object} options - IntersectionObserver options
 * @returns [ref, isVisible]
 */
export function useIntersection(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/**
 * Stagger reveal — returns className with delay per index.
 */
export function stagger(visible, index = 0, base = 'animate-fade-up') {
  if (!visible) return 'opacity-0 translate-y-6';
  const delays = ['', 'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600'];
  return `${base} ${delays[Math.min(index, delays.length - 1)]}`;
}
