/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { listForTriage, decideRequest } from '@/api/marketplace';
import { Request, RequestStatus } from '@/types/marketplace';
import StatusPill from '@/components/marketplace/StatusPill';
import { TriageListSkeleton } from '@/components/marketplace/CardGridSkeleton';

const TRIAGE_DECISIONS: RequestStatus[] = [
  'Triaging',
  'Awaiting Info',
  'Accepted',
  'Scoping',
  'Deferred',
  'Routed Elsewhere',
  "Won't Do",
];

// Statuses that take a request out of the triage queue
const NON_TRIAGE_STATUSES = new Set<RequestStatus>(['Accepted', 'Scoping', 'Building', 'Shipped', 'Deferred', 'Routed Elsewhere', "Won't Do"]);

const RESPONSE_TEMPLATES: Partial<Record<RequestStatus, (title: string) => string>> = {
  Deferred: (title) =>
    `Thanks for submitting "${title}". We're not picking this up right now due to capacity constraints. Expected revisit: Q3 2026. In the meantime, you might try reviewing existing solutions in the catalog for forkable patterns. You can re-submit if priority or resourcing changes.`,
  'Routed Elsewhere': (title) =>
    `Thanks for submitting "${title}". This is a better fit for the Platform Engineering team because it touches core infrastructure. We've flagged it to platform-eng@c3.ai. They'll be in touch.`,
  "Won't Do": (title) =>
    `Thanks for submitting "${title}". After review, this isn't something SWAT will take on because the scope exceeds our team's mandate for internal tooling. We'd suggest raising this through the standard engineering planning process.`,
  Accepted: (title) =>
    `Thanks for submitting "${title}". We're accepting this into our scoping queue. A SWAT engineer will reach out within the week to discuss requirements.`,
};

function slaDaysLeft(slaDueAt: string): number {
  const due = new Date(slaDueAt).getTime();
  const now = new Date().getTime();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function urgencyColor(urgency: string) {
  if (urgency === 'High') return 'text-red-600 dark:text-red-400';
  if (urgency === 'Medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
}

interface RequestRowProps {
  request: Request;
  onUpdate: (id: string, status: RequestStatus, response: string) => void;
}

function RequestRow({ request, onUpdate }: RequestRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<RequestStatus>(request.status);
  const [response, setResponse] = useState(request.decisionResponse || '');
  const daysLeft = slaDaysLeft(request.slaDueAt);

  const applyTemplate = (status: RequestStatus) => {
    const tpl = RESPONSE_TEMPLATES[status];
    if (tpl) setResponse(tpl(request.title));
  };

  return (
    <div className="border border-weak rounded-xl overflow-hidden">
      {/* Row header */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-secondary transition-colors"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary text-sm truncate">{request.title}</p>
          <p className="text-xs text-secondary mt-0.5">{request.requesterName} · {request.requesterTeam}</p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <span className={`text-xs font-semibold ${urgencyColor(request.urgency)}`}>
            {request.urgency}
          </span>
          <StatusPill status={request.status} />
          <div className={`flex items-center gap-1 text-xs font-medium ${daysLeft <= 0 ? 'text-red-600 dark:text-red-400' : daysLeft < 2 ? 'text-amber-600 dark:text-amber-400' : 'text-secondary'}`}>
            <Clock className="w-3.5 h-3.5" />
            {daysLeft <= 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-weak bg-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Request content */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Problem</p>
                <p className="text-sm text-primary leading-relaxed">{request.problem}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Current process</p>
                <p className="text-sm text-primary leading-relaxed">{request.currentProcess}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Team</p>
                  <p className="text-sm text-primary">{request.affectedTeam} (~{request.affectedCount} people)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Frequency</p>
                  <p className="text-sm text-primary">{request.frequency}</p>
                </div>
              </div>
              {request.burdenEstimate && (
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Burden</p>
                  <p className="text-sm text-primary">{request.burdenEstimate}</p>
                </div>
              )}
            </div>

            {/* Decision panel */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Decision</p>
                <select
                  value={decision}
                  onChange={(e) => {
                    const s = e.target.value as RequestStatus;
                    setDecision(s);
                    applyTemplate(s);
                  }}
                  className="w-full rounded-lg border border-weak bg-primary text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRIAGE_DECISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Response to requester</p>
                  <Info className="w-3.5 h-3.5 text-secondary" />
                </div>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={5}
                  placeholder="Compose a response. Templates are auto-populated for deferred/won't do/etc."
                  className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
                />
              </div>
              <button
                onClick={() => onUpdate(request.id, decision, response)}
                className="self-start inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Publish decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTriagePage() {
  const [reqs, setReqs] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    listForTriage().then(setReqs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, status: RequestStatus, response: string) => {
    try {
      const updated = await decideRequest(id, status, response, '');
      // If the new status exits triage, remove from queue; otherwise update in place
      if (NON_TRIAGE_STATUSES.has(status)) {
        setReqs((prev) => prev.filter((r) => r.id !== id));
      } else {
        setReqs((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } catch {
      // Optimistic update on error
      if (NON_TRIAGE_STATUSES.has(status)) {
        setReqs((prev) => prev.filter((r) => r.id !== id));
      } else {
        setReqs((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, decisionResponse: response, lastUpdated: new Date().toISOString() } : r))
        );
      }
    }
    setToast('Decision published.');
    setTimeout(() => setToast(''), 3000);
  };

  const sorted = [...reqs].sort((a, b) => {
    const aDaysLeft = slaDaysLeft(a.slaDueAt);
    const bDaysLeft = slaDaysLeft(b.slaDueAt);
    // Overdue items float to the top regardless of urgency
    const aOverdue = aDaysLeft <= 0 ? 1 : 0;
    const bOverdue = bDaysLeft <= 0 ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    // Then sort by urgency
    const urgOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    if (urgOrder[a.urgency] !== urgOrder[b.urgency]) return urgOrder[a.urgency] - urgOrder[b.urgency];
    // Then by SLA (soonest first)
    return aDaysLeft - bDaysLeft;
  });

  return (
    <div className="min-h-full bg-primary">
      {/* Auth gate note */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Demo mode:</strong> Auth is mocked. In production, this view is restricted to SWAT admins.
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Admin Triage</h1>
          <p className="text-secondary mt-2">
            {sorted.length} request{sorted.length !== 1 ? 's' : ''} in queue · Sorted by urgency + SLA timer
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4">
        {loading ? (
          <TriageListSkeleton count={3} />
        ) : (
          sorted.map((r) => (
            <RequestRow key={r.id} request={r} onUpdate={handleUpdate} />
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl transition-all animate-in">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
