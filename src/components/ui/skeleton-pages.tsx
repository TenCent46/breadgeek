"use client";

import { Skeleton, SkeletonCard, SkeletonTable } from "./skeleton";

export function SkeletonListPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-border-light p-4">
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}

export function SkeletonCardsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border-light p-5">
            <Skeleton className="h-40 w-full rounded-xl mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border-light p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonFormPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <Skeleton className="h-7 w-48" />
      <div className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
