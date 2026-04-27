import { useEffect, useRef, useState } from 'react';

/**
 * Animated count-up hook.
 * @param {number} target - Final number
 * @param {number} duration - Animation duration in ms
 * @param {boolean} start - Trigger flag (use with useIntersection)
 */
export function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    const numTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numTarget));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else setCount(numTarget);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [start, target, duration]);

  // Preserve suffix/prefix from original value string
  const raw = String(target);
  const suffix = raw.replace(/^[\d.,]+/, '');
  const prefix = raw.replace(/[\d.,]+.*$/, '');
  return `${prefix}${count.toLocaleString()}${suffix}`;
}
