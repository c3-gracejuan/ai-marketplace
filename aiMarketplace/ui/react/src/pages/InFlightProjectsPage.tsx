/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { listInFlight } from '@/api/marketplace';
import { Request, RequestStatus } from '@/types/marketplace';

const COLUMNS: { status: RequestStatus; label: string; color: string }[] = [
  { status: 'Triaging', label: 'Triaging', color: 'border-purple-300 dark:border-purple-700' },
  { status: 'Scoping', label: 'Scoping', color: 'border-amber-300 dark:border-amber-700' },
  { status: 'Building', label: 'Building', color: 'border-blue-400 dark:border-blue-600' },
];

function urgencyColor(urgency: string) {
  if (urgency === 'High') return 'text-red-600 dark:text-red-400';
  if (urgency === 'Medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
}

function slaDaysLeft(slaDueAt: string): number {
  const due = new Date(slaDueAt).getTime();
  const now = new Date().getTime();
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function RequestKanbanCard({ request }: { request: Request }) {
  const daysLeft = slaDaysLeft(request.slaDueAt);

  return (
    <div className="bg-primary border border-weak rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-sm text-primary leading-snug">{request.title}</p>

      <p className="text-xs text-secondary line-clamp-2">{request.problem}</p>

      <div className="flex items-center justify-between pt-1 border-t border-weak">
        <span className={`text-xs font-semibold ${urgencyColor(request.urgency)}`}>
          {request.urgency}
        </span>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            daysLeft < 2 ? 'text-red-600 dark:text-red-400' : 'text-secondary'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
        </div>
      </div>

      <div className="text-xs text-secondary">
        <span className="font-medium text-primary">{request.requesterName}</span>
        {' · '}
        {request.requesterTeam}
      </div>
    </div>
  );
}

export default function InFlightProjectsPage() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    listInFlight().then(setRequests).catch(() => {});
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
