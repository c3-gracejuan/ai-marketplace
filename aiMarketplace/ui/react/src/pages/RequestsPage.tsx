/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { listAllRequests, listSolutions, listQueuedSolutions } from '@/api/marketplace';
import { Request, RequestStatus, Solution } from '@/types/marketplace';
import StatusPill from '@/components/marketplace/StatusPill';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_STATUSES: RequestStatus[] = ['Triaging', 'Accepted', 'Deferred', 'Rejected'];

function formatRelative(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function StatBlock({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-blue-600 dark:text-blue-400' : 'text-primary'}`}>
        {value}
      </p>
      <p className="text-xs text-secondary mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

interface RequestRowProps {
  request: Request;
  linkedSolutions: Solution[];
}

function RequestRow({ request, linkedSolutions }: RequestRowProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const hasReason =
    (request.status === 'Deferred' || request.status === 'Rejected') && !!request.decisionResponse;
  const hasSolutions = request.status === 'Accepted' && linkedSolutions.length > 0;

  return (
    <div className="border border-weak rounded-xl overflow-hidden bg-primary">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-secondary transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary text-base truncate">{request.title}</p>
          <p className="text-xs text-secondary mt-0.5">
            <span className="font-medium text-primary">{request.requesterName}</span>
            <span className="mx-1.5">·</span>
            {formatRelative(request.createdAt)}
            {hasSolutions && (
              <>
                <span className="mx-1.5">·</span>
                {linkedSolutions.length} {linkedSolutions.length === 1 ? 'solution' : 'solutions'}
              </>
            )}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <StatusPill status={request.status} />
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-secondary" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-weak bg-secondary">
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">Problem</p>
              <p className="text-sm text-primary leading-relaxed whitespace-pre-line">{request.problem}</p>
            </div>

            {hasReason && (
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">SWAT response</p>
                <p className="text-sm text-primary leading-relaxed whitespace-pre-line">
                  {request.decisionResponse}
                </p>
              </div>
            )}

            {hasSolutions && (
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-2">
                  Linked {linkedSolutions.length === 1 ? 'solution' : 'solutions'}
                </p>
                <div className="flex flex-col gap-1.5">
                  {linkedSolutions.map((sol) => (
                    <button
                      key={sol.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/solutions/${sol.id}`);
                      }}
                      className="flex items-center justify-between gap-2 text-left text-sm px-3 py-2 rounded-lg border border-weak bg-primary hover:border-strong transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:underline truncate">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{sol.title}</span>
                      </span>
                      <StatusPill status={sol.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="border border-weak rounded-xl bg-primary px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      <Skeleton className="h-4 w-4 rounded shrink-0" />
    </div>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatuses, setActiveStatuses] = useState<RequestStatus[]>([]);

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

  const counts = useMemo(() => {
    const c: Record<RequestStatus, number> = { Triaging: 0, Accepted: 0, Deferred: 0, Rejected: 0 };
    requests.forEach((r) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
    });
    return c;
  }, [requests]);

  const totalShown = requests.length;
  const inFlight = counts.Triaging + counts.Accepted;

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = requests.filter((r) => {
      if (activeStatuses.length > 0 && !activeStatuses.includes(r.status)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q)
      );
    });
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    return list;
  }, [requests, search, activeStatuses]);

  const toggleStatus = (s: RequestStatus) => {
    setActiveStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const hasFilters = search || activeStatuses.length > 0;

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Requests Received</h1>
          <p className="text-secondary mt-2">
            Status of every request the SWAT team has received. All work is public.
          </p>

          {/* Metrics strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
            <StatBlock value={totalShown} label="Total received" />
            <StatBlock value={inFlight} label="In flight" accent />
            <StatBlock value={counts.Deferred} label="Deferred" />
            <StatBlock value={counts.Rejected} label="Rejected" />
          </div>
        </div>
      </div>

      {/* Controls + list */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, requester, or problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-weak bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_STATUSES.map((s) => {
              const active = activeStatuses.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  aria-pressed={active}
                  className={
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' +
                    (active
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                      : 'bg-transparent text-secondary border-weak hover:text-primary hover:border-strong')
                  }
                >
                  {s}
                  <span className={`tabular-nums ${active ? 'opacity-90' : 'opacity-60'}`}>
                    {counts[s] ?? 0}
                  </span>
                </button>
              );
            })}
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setActiveStatuses([]);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="border border-weak border-dashed rounded-xl px-6 py-16 text-center">
            <p className="text-sm text-secondary">
              {hasFilters ? 'No requests match your filters.' : 'No requests yet.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSorted.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                linkedSolutions={solutionsByRequestId.get(r.id) ?? []}
              />
            ))}
          </div>
        )}

        {!loading && filteredSorted.length > 0 && (
          <p className="text-xs text-secondary mt-4">
            Showing {filteredSorted.length} of {totalShown} request{totalShown !== 1 ? 's' : ''}
            {hasFilters ? ' matching your filters' : ''}.
          </p>
        )}
      </div>
    </div>
  );
}
