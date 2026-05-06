/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { listAllRequests, listSolutions, listQueuedSolutions, decideRequest } from '@/api/marketplace';
import { Request, RequestStatus, Solution } from '@/types/marketplace';
import StatusPill from '@/components/marketplace/StatusPill';
import { KanbanSkeleton } from '@/components/marketplace/CardGridSkeleton';

const COLUMNS: { status: RequestStatus; label: string; color: string }[] = [
  { status: 'Triaging', label: 'Triaging', color: 'border-gray-300 dark:border-gray-700' },
  { status: 'Accepted', label: 'Accepted', color: 'border-blue-300 dark:border-blue-700' },
  { status: 'Deferred', label: 'Deferred', color: 'border-amber-300 dark:border-amber-700' },
  { status: 'Rejected', label: 'Rejected', color: 'border-amber-300 dark:border-amber-700' },
];

interface RequestCardProps {
  request: Request;
  linkedSolutions: Solution[];
  onReopen?: (id: string) => void;
}

function RequestCard({ request, linkedSolutions, onReopen }: RequestCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-primary dark:bg-secondary border border-weak rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-sm text-primary leading-snug">{request.title}</p>

      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">{request.problem}</p>

      {(request.status === 'Deferred' || request.status === 'Rejected') && request.decisionResponse && (
        <div className="text-xs text-secondary border-l-2 border-weak pl-2.5 leading-relaxed line-clamp-3 italic">
          {request.decisionResponse}
        </div>
      )}

      {request.status === 'Accepted' && linkedSolutions.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-weak">
          {linkedSolutions.map((sol) => (
            <button
              key={sol.id}
              onClick={() => navigate(`/solutions/${sol.id}`)}
              className="flex items-center justify-between gap-2 text-left text-xs px-2 py-1.5 rounded-md hover:bg-tertiary transition-colors group"
            >
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium group-hover:underline truncate">
                <ArrowRight className="w-3 h-3 shrink-0" />
                <span className="truncate">{sol.title}</span>
              </span>
              <StatusPill status={sol.status} />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-weak text-xs text-secondary">
        <div className="truncate">
          <span className="font-medium text-primary">{request.requesterName}</span>
        </div>
        {request.status === 'Deferred' && onReopen && (
          <button
            onClick={() => onReopen(request.id)}
            className="shrink-0 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium ml-2"
            title="Move back to Triaging"
          >
            <RotateCcw className="w-3 h-3" />
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [reopenError, setReopenError] = useState('');

  useEffect(() => {
    Promise.all([
      listAllRequests().catch(() => [] as Request[]),
      listSolutions().catch(() => [] as Solution[]),
      listQueuedSolutions().catch(() => [] as Solution[]),
    ])
      .then(([reqs, active, queued]) => {
        setRequests(reqs);
        setSolutions([...active, ...queued]);
      })
      .finally(() => setLoading(false));
  }, []);

  const solutionsByRequestId = useMemo(() => {
    const map = new Map<string, Solution[]>();
    solutions.forEach((sol) => {
      sol.originatingRequests.forEach((req) => {
        const list = map.get(req.id) ?? [];
        list.push(sol);
        map.set(req.id, list);
      });
    });
    return map;
  }, [solutions]);

  const handleReopen = async (requestId: string) => {
    try {
      const updated = await decideRequest(requestId, 'Triaging', '');
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : 'Failed to reopen request.');
      setTimeout(() => setReopenError(''), 4000);
    }
  };

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Requests Received</h1>
          <p className="text-secondary mt-2">
            Status of every request the SWAT team has received. All work is public.
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? <KanbanSkeleton columns={4} cardsPerCol={2} /> : null}
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${loading ? 'hidden' : ''}`}>
          {COLUMNS.map(({ status, label, color }) => {
            const col = requests.filter((r) => r.status === status);
            return (
              <div key={status}>
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${color}`}>
                  <h2 className="font-semibold text-primary text-sm">{label}</h2>
                  <span className="ml-auto text-xs bg-secondary text-secondary rounded-full px-2 py-0.5 font-medium">
                    {col.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {col.length > 0 ? (
                    col.map((r) => (
                      <RequestCard
                        key={r.id}
                        request={r}
                        linkedSolutions={solutionsByRequestId.get(r.id) ?? []}
                        onReopen={status === 'Deferred' ? handleReopen : undefined}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-secondary italic">Nothing here right now.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reopenError && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
          {reopenError}
        </div>
      )}
    </div>
  );
}
