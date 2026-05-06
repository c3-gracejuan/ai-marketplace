/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, Wrench } from 'lucide-react';
import {
  listForTriage,
  decideRequest,
  listQueuedSolutions,
  updateSolutionDraft,
  assignBuilders,
  listTeamMembers,
} from '@/api/marketplace';
import { Request, RequestStatus, Solution, TeamMember, Domain } from '@/types/marketplace';
import StatusPill from '@/components/marketplace/StatusPill';
import { TriageListSkeleton } from '@/components/marketplace/CardGridSkeleton';

const TRIAGE_DECISIONS: RequestStatus[] = ['Triaging', 'Accepted', 'Deferred', 'Rejected'];
const NON_TRIAGE_STATUSES = new Set<RequestStatus>(['Accepted', 'Deferred', 'Rejected']);

const ALL_DOMAINS: Domain[] = ['FP&A', 'Sales Ops', 'Engineering', 'GTM', 'Customer Success', 'Cross-functional'];

const RESPONSE_TEMPLATES: Partial<Record<RequestStatus, (title: string) => string>> = {
  Deferred: (title) =>
    `Thanks for submitting "${title}". We're not picking this up right now due to capacity constraints. Expected revisit: Q3 2026. In the meantime, you might try reviewing existing solutions in the catalog for forkable patterns. You can re-submit if priority or resourcing changes.`,
  Rejected: (title) =>
    `Thanks for submitting "${title}". After review, this isn't something SWAT will take on because the scope exceeds our team's mandate. We'd suggest raising this through the standard engineering planning process or routing to the team that owns the relevant area.`,
  Accepted: (title) =>
    `Thanks for submitting "${title}". We're accepting this. A SWAT engineer will reach out within the week to discuss requirements.`,
};

interface RequestRowProps {
  request: Request;
  onUpdate: (id: string, status: RequestStatus, response: string) => void;
}

function RequestRow({ request, onUpdate }: RequestRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<RequestStatus>(request.status);
  const [response, setResponse] = useState(request.decisionResponse || '');

  const applyTemplate = (status: RequestStatus) => {
    const tpl = RESPONSE_TEMPLATES[status];
    if (tpl) setResponse(tpl(request.title));
  };

  return (
    <div className="border border-weak rounded-xl overflow-hidden">
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
          <StatusPill status={request.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-weak bg-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Problem</p>
                <p className="text-sm text-primary leading-relaxed">{request.problem}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Current process</p>
                <p className="text-sm text-primary leading-relaxed">{request.currentProcess}</p>
              </div>
              {request.desiredOutcome && (
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Desired outcome</p>
                  <p className="text-sm text-primary leading-relaxed">{request.desiredOutcome}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Team</p>
                <p className="text-sm text-primary">{request.affectedTeam} (~{request.affectedCount} people)</p>
              </div>
              {request.burdenEstimate && (
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Burden</p>
                  <p className="text-sm text-primary">{request.burdenEstimate}</p>
                </div>
              )}
              {request.relatedLinks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Related links</p>
                  <ul className="flex flex-col gap-1">
                    {request.relatedLinks.map((link) => (
                      <li key={link} className="text-sm">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

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
                  placeholder="Compose a response. Templates auto-populate for Accepted/Deferred/Rejected."
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

interface QueuedSolutionRowProps {
  solution: Solution;
  team: TeamMember[];
  onChange: (updated: Solution) => void;
  onAssigned: (id: string) => void;
}

function QueuedSolutionRow({ solution, team, onChange, onAssigned }: QueuedSolutionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [solutionDescription, setSolutionDescription] = useState(solution.solutionDescription);
  const [hoursSaved, setHoursSaved] = useState(solution.hoursSaved?.toString() ?? '');
  const [dollarsSaved, setDollarsSaved] = useState(solution.dollarsSaved?.toString() ?? '');
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>(solution.domain);
  const [selectedBuilderIds, setSelectedBuilderIds] = useState<string[]>(solution.builders.map((b) => b.id));
  const [savingDraft, setSavingDraft] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  const originating = solution.originatingRequests[0];

  const toggleDomain = (d: Domain) =>
    setSelectedDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const toggleBuilder = (id: string) =>
    setSelectedBuilderIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canAssign =
    solutionDescription.trim().length > 0 &&
    selectedDomains.length > 0 &&
    selectedBuilderIds.length > 0;

  const handleSaveDraft = async () => {
    setError('');
    setSavingDraft(true);
    try {
      const updated = await updateSolutionDraft({
        solutionId: solution.id,
        solutionDescription,
        hoursSaved: hoursSaved ? parseInt(hoursSaved, 10) || 0 : 0,
        dollarsSaved: dollarsSaved ? parseInt(dollarsSaved, 10) || 0 : 0,
        domain: selectedDomains,
      });
      onChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleAssign = async () => {
    if (!canAssign) return;
    setError('');
    setAssigning(true);
    try {
      await updateSolutionDraft({
        solutionId: solution.id,
        solutionDescription,
        hoursSaved: hoursSaved ? parseInt(hoursSaved, 10) || 0 : 0,
        dollarsSaved: dollarsSaved ? parseInt(dollarsSaved, 10) || 0 : 0,
        domain: selectedDomains,
      });
      await assignBuilders(solution.id, selectedBuilderIds);
      onAssigned(solution.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign failed.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="border border-weak rounded-xl overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-secondary transition-colors"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary text-sm truncate">{solution.title}</p>
          {originating && (
            <p className="text-xs text-secondary mt-0.5">
              From {originating.requesterName} · {originating.requesterTeam}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <StatusPill status={solution.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-weak bg-secondary">
          <div className="mt-4 mb-5 text-xs text-secondary leading-relaxed">
            <strong className="text-primary">Inherited problem:</strong> {solution.problem}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                  Solution description <span className="text-red-500">*</span>
                </p>
                <textarea
                  value={solutionDescription}
                  onChange={(e) => setSolutionDescription(e.target.value)}
                  rows={4}
                  placeholder="What's being built. Include the approach, key components, integrations."
                  className="w-full rounded-lg border border-weak bg-primary text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
                />
              </div>

              <div>
                <p className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                  Domain <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DOMAINS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomain(d)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedDomains.includes(d)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-primary text-primary border-weak hover:border-blue-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                  Builders <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {team.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBuilderIds.includes(m.id)}
                        onChange={() => toggleBuilder(m.id)}
                        className="w-3.5 h-3.5 rounded accent-blue-600"
                      />
                      <span className="text-sm text-primary">{m.name}</span>
                      <span className="text-xs text-secondary">· {m.role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    Hours saved
                  </p>
                  <input
                    type="number"
                    value={hoursSaved}
                    onChange={(e) => setHoursSaved(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full rounded-lg border border-weak bg-primary text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
                  />
                </div>
                <div>
                  <p className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    Dollars saved
                  </p>
                  <input
                    type="number"
                    value={dollarsSaved}
                    onChange={(e) => setDollarsSaved(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full rounded-lg border border-weak bg-primary text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={savingDraft || assigning}
              className="inline-flex items-center bg-secondary border border-weak hover:border-blue-300 text-primary font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {savingDraft ? 'Saving…' : 'Save draft'}
            </button>
            <button
              onClick={handleAssign}
              disabled={!canAssign || assigning || savingDraft}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              <Wrench className="w-4 h-4" />
              {assigning ? 'Starting…' : 'Assign and start building'}
            </button>
            {!canAssign && (
              <span className="text-xs text-secondary italic">
                Description, domain, and at least one builder are required to start.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTriagePage() {
  const [reqs, setReqs] = useState<Request[]>([]);
  const [queued, setQueued] = useState<Solution[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingQueued, setLoadingQueued] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    listForTriage().then(setReqs).catch(() => {}).finally(() => setLoadingReqs(false));
    listQueuedSolutions().then(setQueued).catch(() => {}).finally(() => setLoadingQueued(false));
    listTeamMembers().then(setTeam).catch(() => {});
  }, []);

  const handleDecide = async (id: string, status: RequestStatus, response: string) => {
    try {
      const updated = await decideRequest(id, status, response);
      if (NON_TRIAGE_STATUSES.has(status)) {
        setReqs((prev) => prev.filter((r) => r.id !== id));
        if (status === 'Accepted') {
          listQueuedSolutions().then(setQueued).catch(() => {});
        }
      } else {
        setReqs((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
      setToast('Decision published.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to publish decision.');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSolutionUpdate = (updated: Solution) => {
    setQueued((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setToast('Draft saved.');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSolutionAssigned = (id: string) => {
    setQueued((prev) => prev.filter((s) => s.id !== id));
    setToast('Solution moved to Building.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="min-h-full bg-primary">
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Demo mode:</strong> Auth is mocked. In production, this view is restricted to SWAT admins.
          </span>
        </div>
      </div>

      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Admin Triage</h1>
          <p className="text-secondary mt-2">
            New requests waiting for triage, plus queued solutions awaiting assignment.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-12">
        <section>
          <div className="flex items-baseline gap-3 mb-5">
            <h2 className="text-lg font-semibold text-primary">Triage queue</h2>
            <span className="text-sm text-secondary">
              {reqs.length} request{reqs.length !== 1 ? 's' : ''} awaiting decision
            </span>
          </div>
          {loadingReqs ? (
            <TriageListSkeleton count={3} />
          ) : reqs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reqs.map((r) => (
                <RequestRow key={r.id} request={r} onUpdate={handleDecide} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary italic">Nothing to triage right now.</p>
          )}
        </section>

        <section>
          <div className="flex items-baseline gap-3 mb-5">
            <h2 className="text-lg font-semibold text-primary">Queued solutions</h2>
            <span className="text-sm text-secondary">
              {queued.length} solution{queued.length !== 1 ? 's' : ''} awaiting assignment
            </span>
          </div>
          {loadingQueued ? (
            <TriageListSkeleton count={2} />
          ) : queued.length > 0 ? (
            <div className="flex flex-col gap-4">
              {queued.map((s) => (
                <QueuedSolutionRow
                  key={s.id}
                  solution={s}
                  team={team}
                  onChange={handleSolutionUpdate}
                  onAssigned={handleSolutionAssigned}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary italic">No solutions queued. Accept a request to create one.</p>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl transition-all animate-in">
          {toast}
        </div>
      )}
    </div>
  );
}
