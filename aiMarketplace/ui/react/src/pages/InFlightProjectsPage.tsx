/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { listInFlight } from '@/api/marketplace';
import { Request, RequestStatus } from '@/types/marketplace';
import { KanbanSkeleton } from '@/components/marketplace/CardGridSkeleton';

const COLUMNS: { status: RequestStatus; label: string; color: string }[] = [
  { status: 'Triaging', label: 'Triaging', color: 'border-purple-300 dark:border-purple-700' },
  { status: 'Scoping', label: 'Scoping', color: 'border-amber-300 dark:border-amber-700' },
  { status: 'Building', label: 'Building', color: 'border-blue-400 dark:border-blue-600' },
];

function RequestKanbanCard({ request }: { request: Request }) {
  return (
    <div className="bg-primary border border-weak rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-sm text-primary leading-snug">{request.title}</p>

      <p className="text-xs text-secondary line-clamp-2">{request.problem}</p>

      <div className="text-xs text-secondary pt-1 border-t border-weak">
        <span className="font-medium text-primary">{request.requesterName}</span>
        {' · '}
        {request.requesterTeam}
      </div>
    </div>
  );
}

export default function InFlightProjectsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInFlight().then(setRequests).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">In-Flight Projects</h1>
          <p className="text-secondary mt-2">
            Live view of every request SWAT is currently working on. All work is public.
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? <KanbanSkeleton columns={3} cardsPerCol={2} /> : null}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${loading ? 'hidden' : ''}`}>
          {COLUMNS.map(({ status, label, color }) => {
            const col = requests.filter((r) => r.status === status);
            return (
              <div key={status}>
                {/* Column header */}
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${color}`}>
                  <h2 className="font-semibold text-primary text-sm">{label}</h2>
                  <span className="ml-auto text-xs bg-secondary text-secondary rounded-full px-2 py-0.5 font-medium">
                    {col.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {col.length > 0 ? (
                    col.map((r) => <RequestKanbanCard key={r.id} request={r} />)
                  ) : (
                    <p className="text-xs text-secondary italic">Nothing here right now.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
