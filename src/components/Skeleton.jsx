import React from 'react';

/* Single skeleton block */
export function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-white/4 rounded-2xl animate-pulse ${className}`} />
  );
}

/* Card skeleton — matches GerCard / TripCard aspect */
export function CardSkeleton() {
  return (
    <div className="aspect-[3/4] rounded-3xl bg-white/4 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.8s_infinite]" />
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
        <div className="h-3 bg-white/6 rounded-full w-1/3" />
        <div className="h-5 bg-white/8 rounded-full w-2/3" />
        <div className="h-3 bg-white/4 rounded-full w-1/2 mt-3" />
      </div>
    </div>
  );
}

/* Booking card skeleton */
export function BookingSkeleton() {
  return (
    <div className="border border-white/5 rounded-2xl p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded-full w-1/4" />
        <div className="h-4 bg-white/8 rounded-full w-3/4" />
        <div className="h-3 bg-white/4 rounded-full w-1/3" />
      </div>
    </div>
  );
}

/* Grid of card skeletons */
export function CardGridSkeleton({ count = 6, cols = 3 }) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
