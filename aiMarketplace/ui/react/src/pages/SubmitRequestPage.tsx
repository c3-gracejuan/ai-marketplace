/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Info, ChevronLeft } from 'lucide-react';
import { submitRequest } from '@/api/marketplace';

interface FormState {
  title: string;
  problem: string;
  currentProcess: string;
  affectedTeam: string;
  affectedCount: string;
  burdenEstimate: string;
  desiredOutcome: string;
  requesterName: string;
  requesterTeam: string;
  relatedLinks: string;
}

export default function SubmitRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refSolutionId = searchParams.get('ref');

  const [form, setForm] = useState<FormState>({
    title: '',
    problem: refSolutionId ? `Similar to solution "${refSolutionId}" — ` : '',
    currentProcess: '',
    affectedTeam: '',
    affectedCount: '',
    burdenEstimate: '',
    desiredOutcome: '',
    requesterName: '',
    requesterTeam: '',
    relatedLinks: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const valid =
    form.title.trim() &&
    form.problem.trim() &&
    form.currentProcess.trim() &&
    form.affectedTeam.trim() &&
    form.requesterName.trim() &&
    form.requesterTeam.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const relatedLinks = form.relatedLinks
        ? form.relatedLinks.split(',').map((l) => l.trim()).filter(Boolean)
        : [];
      const req = await submitRequest({
        title: form.title.trim(),
        problem: form.problem.trim(),
        currentProcess: form.currentProcess.trim(),
        affectedTeam: form.affectedTeam.trim(),
        affectedCount: form.affectedCount ? parseInt(form.affectedCount, 10) : 0,
        burdenEstimate: form.burdenEstimate.trim(),
        desiredOutcome: form.desiredOutcome.trim(),
        requesterName: form.requesterName.trim(),
        requesterTeam: form.requesterTeam.trim(),
        relatedLinks,
      });
      setRequestId(req.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full flex items-center justify-center bg-primary px-6">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Request submitted!</h1>
          <p className="text-secondary mb-6">
            Your request has been received. We&apos;ll be in touch.
          </p>
          <div className="bg-secondary border border-weak rounded-xl p-5 text-left mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-secondary">Request ID</span>
              <span className="font-mono font-semibold text-primary">{requestId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Status</span>
              <span className="text-primary font-medium">Triaging</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/projects')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all requests
            </button>
            <span className="text-secondary hidden sm:inline">·</span>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-6 bg-secondary">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Submit a Request</h1>
          <p className="text-secondary mt-1">Tell us about your problem.</p>
        </div>
      </div>

      {/* Pre-fill notice */}
      {refSolutionId && (
        <div className="max-w-2xl mx-auto px-6 pt-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-700 dark:text-blue-300">
              Pre-filled from a related solution. Edit the description to describe your specific problem.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto px-6 pt-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-7">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-primary mb-1.5">
            Request title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            maxLength={120}
            placeholder="e.g., Automate monthly commission reconciliation"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
            required
          />
          <p className="text-xs text-secondary mt-1">A short name shown in triage and catalog cards.</p>
        </div>

        {/* Problem */}
        <div>
          <label htmlFor="problem" className="block text-sm font-semibold text-primary mb-1.5">
            What problem are you trying to solve? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="problem"
            value={form.problem}
            onChange={(e) => update('problem', e.target.value)}
            rows={4}
            placeholder="Describe the problem clearly. What breaks, gets stuck, or takes too long?"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
            required
          />
        </div>

        {/* Current process */}
        <div>
          <label htmlFor="currentProcess" className="block text-sm font-semibold text-primary mb-1.5">
            Current process / workaround <span className="text-red-500">*</span>
          </label>
          <textarea
            id="currentProcess"
            value={form.currentProcess}
            onChange={(e) => update('currentProcess', e.target.value)}
            rows={3}
            placeholder="How do you handle this today? Manual spreadsheet, Slack pings, no process at all?"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
            required
          />
        </div>

        {/* Who's affected */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="affectedTeam" className="block text-sm font-semibold text-primary mb-1.5">
              Affected team <span className="text-red-500">*</span>
            </label>
            <input
              id="affectedTeam"
              type="text"
              value={form.affectedTeam}
              onChange={(e) => update('affectedTeam', e.target.value)}
              placeholder="e.g., FP&A, Sales Ops"
              className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="affectedCount" className="block text-sm font-semibold text-primary mb-1.5">Approx. # of people</label>
            <input
              id="affectedCount"
              type="number"
              value={form.affectedCount}
              onChange={(e) => update('affectedCount', e.target.value)}
              placeholder="e.g., 8"
              min={1}
              className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
            />
          </div>
        </div>

        {/* Burden */}
        <div>
          <label htmlFor="burdenEstimate" className="block text-sm font-semibold text-primary mb-1.5">Estimated time or cost burden</label>
          <input
            id="burdenEstimate"
            type="text"
            value={form.burdenEstimate}
            onChange={(e) => update('burdenEstimate', e.target.value)}
            placeholder="e.g., 4 hours/week, ~$5K/month in analyst time"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
          />
        </div>

        {/* Desired outcome */}
        <div>
          <label htmlFor="desiredOutcome" className="block text-sm font-semibold text-primary mb-1.5">Desired outcome</label>
          <textarea
            id="desiredOutcome"
            value={form.desiredOutcome}
            onChange={(e) => update('desiredOutcome', e.target.value)}
            rows={3}
            placeholder="What does success look like? What would you do with the time back?"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
          />
        </div>

        {/* Requester */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="requesterName" className="block text-sm font-semibold text-primary mb-1.5">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              id="requesterName"
              type="text"
              value={form.requesterName}
              onChange={(e) => update('requesterName', e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="requesterTeam" className="block text-sm font-semibold text-primary mb-1.5">
              Your team <span className="text-red-500">*</span>
            </label>
            <input
              id="requesterTeam"
              type="text"
              value={form.requesterTeam}
              onChange={(e) => update('requesterTeam', e.target.value)}
              placeholder="e.g., Finance, CS, Eng"
              className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
              required
            />
          </div>
        </div>

        {/* Related links */}
        <div>
          <label htmlFor="relatedLinks" className="block text-sm font-semibold text-primary mb-1.5">Related links (optional)</label>
          <input
            id="relatedLinks"
            type="text"
            value={form.relatedLinks}
            onChange={(e) => update('relatedLinks', e.target.value)}
            placeholder="Paste links to sheets, tickets, docs, etc. (comma-separated)"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
          />
        </div>

        <button
          type="submit"
          disabled={!valid || submitting}
          className="self-start inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
