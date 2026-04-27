import React, { useState, useRef, useEffect } from 'react';

/**
 * Blur-up lazy image with IntersectionObserver.
 * Shows a blurred placeholder while loading, then fades in full image.
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClass = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"%3E%3C/svg%3E',
  onError,
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleError = () => {
    setErrored(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${wrapperClass}`}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/4 animate-pulse" />
      )}

      {inView && (
        <img
          src={errored ? '/placeholder.jpg' : src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
