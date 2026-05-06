/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft } from 'lucide-react';
import { submitRequest } from '@/api/marketplace';

interface FormState {
  title: string;
  problem: string;
  requesterName: string;
}

export default function SubmitRequestPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: '',
    problem: '',
    requesterName: '',
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
    form.requesterName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const req = await submitRequest({
        title: form.title.trim(),
        problem: form.problem.trim(),
        requesterName: form.requesterName.trim(),
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
              onClick={() => navigate('/requests')}
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
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Submit a Request</h1>
          <p className="text-secondary mt-1">Three fields. We&apos;ll follow up for the rest.</p>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-6 pt-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
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
        </div>

        <div>
          <label htmlFor="problem" className="block text-sm font-semibold text-primary mb-1.5">
            What problem are you trying to solve? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="problem"
            value={form.problem}
            onChange={(e) => update('problem', e.target.value)}
            rows={5}
            placeholder="Describe the problem clearly. What breaks, gets stuck, or takes too long?"
            className="w-full rounded-lg border border-weak bg-primary text-primary px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary resize-none"
            required
          />
        </div>

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

        <button
          type="submit"
          disabled={!valid || submitting}
          className="mt-4 self-start inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
