/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/** Generic card skeleton that matches the SolutionCard shape */
function CardSkeleton() {
  return (
    <div className="bg-primary border border-weak rounded-xl p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-weak mt-auto">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
    </div>
  );
}

/** Skeleton for a 3-column solution/card grid */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a single team member card */
function MemberCardSkeleton() {
  return (
    <div className="bg-secondary border border-weak rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </div>
      <div className="border-t border-weak pt-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

/** Skeleton for the team grid */
export function TeamGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for the kanban board (Admin triage rows or InFlight cards) */
export function KanbanSkeleton({ columns = 3, cardsPerCol = 2 }: { columns?: number; cardsPerCol?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: columns }).map((_, ci) => (
        <div key={ci}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-weak">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-6 rounded-full ml-auto" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: cardsPerCol }).map((_, ri) => (
              <div key={ri} className="bg-primary border border-weak rounded-xl p-4 flex flex-col gap-3">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="flex items-center justify-between pt-1 border-t border-weak">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for triage list rows */
export function TriageListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-weak rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
