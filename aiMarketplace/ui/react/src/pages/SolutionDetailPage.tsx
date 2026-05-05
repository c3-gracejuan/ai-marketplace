/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, DollarSign, Layers, ArrowRight } from 'lucide-react';
import { getSolution } from '@/api/marketplace';
import { Solution } from '@/types/marketplace';
import DomainChip from '@/components/marketplace/DomainChip';
import StackChip from '@/components/marketplace/StackChip';
import StatusPill from '@/components/marketplace/StatusPill';
import BuilderCard from '@/components/marketplace/BuilderCard';
import SupportingMaterialRenderer from '@/components/marketplace/SupportingMaterialRenderer';

export default function SolutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getSolution(id)
      .then(setSolution)
      .catch(() => setSolution(null));
  }, [id]);

  if (solution === undefined) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary mb-2">Solution not found</p>
          <button onClick={() => navigate('/solutions')} className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to solutions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-primary">
      {/* Breadcrumb */}
      <div className="border-b border-weak px-6 py-4 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/solutions')}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Solutions Catalog
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title block */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight flex-1">
                  {solution.title}
                </h1>
                <StatusPill status={solution.status} size="md" />
              </div>
              <div className="flex flex-wrap gap-2">
                {solution.domain.map((d) => <DomainChip key={d} domain={d} size="md" />)}
              </div>
            </div>

            {/* Draft banner for Queued solutions */}
            {solution.status === 'Queued' && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                <strong>Draft.</strong> This solution hasn&apos;t started yet — fields will be filled in once a SWAT engineer picks it up.
              </div>
            )}

            {/* Impact metrics */}
            {(solution.hoursSaved || solution.dollarsSaved) && (
              <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                {solution.hoursSaved && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{solution.hoursSaved.toLocaleString()} hrs</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Engineer hours saved</p>
                    </div>
                  </div>
                )}
                {solution.dollarsSaved && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        ${solution.dollarsSaved >= 1_000_000
                          ? `${(solution.dollarsSaved / 1_000_000).toFixed(1)}M`
                          : solution.dollarsSaved >= 1000
                          ? `${(solution.dollarsSaved / 1000).toFixed(1).replace(/\.0$/, '')}K`
                          : solution.dollarsSaved.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Estimated impact</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Problem */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-primary mb-2">Problem</h2>
              <p className="text-secondary leading-relaxed">{solution.problem}</p>
            </section>

            {/* Solution */}
            {solution.solutionDescription && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-primary mb-2">Solution</h2>
                <p className="text-secondary leading-relaxed">{solution.solutionDescription}</p>
              </section>
            )}

            {/* Impact */}
            {solution.impactSummary && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-primary mb-2">Impact</h2>
                <p className="text-secondary leading-relaxed">{solution.impactSummary}</p>
              </section>
            )}

            {/* Stack */}
            {solution.stack.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-secondary" />
                  Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {solution.stack.map((s) => <StackChip key={s} label={s} />)}
                </div>
              </section>
            )}

            {/* Reusability */}
            {solution.reusabilityNote && (
              <section className="mb-10 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  🔁 {solution.reusabilityNote}
                </p>
              </section>
            )}

            {/* Supporting Materials */}
            {solution.supportingMaterials.length > 0 && (
              <section className="mb-10">
                <h2 className="text-base font-semibold text-primary mb-4">Supporting Materials</h2>
                <SupportingMaterialRenderer materials={solution.supportingMaterials} />
              </section>
            )}

            {/* CTA */}
            <div className="p-5 bg-secondary border border-weak rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-primary">Have a similar problem?</p>
                <p className="text-sm text-secondary mt-0.5">Submit a request and we&apos;ll scope it for you.</p>
              </div>
              <button
                onClick={() => navigate(`/submit?ref=${solution.id}`)}
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Request something similar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Builder sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-6 flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">Built by</h2>
                <div className="flex flex-col gap-3">
                  {solution.builders.length > 0 ? (
                    solution.builders.map((b) => (
                      <BuilderCard key={b.id} member={b} />
                    ))
                  ) : (
                    <p className="text-xs text-secondary italic">No builders assigned yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 border border-weak">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">Details</p>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-secondary shrink-0">Originating</span>
                    <div className="text-right">
                      {solution.originatingRequests.length === 0 ? (
                        <span className="text-primary font-medium">SWAT-initiated</span>
                      ) : (
                        solution.originatingRequests.map((req) => (
                          <div key={req.id} className="text-primary text-xs leading-snug">
                            <span className="font-medium">{req.requesterTeam}</span>
                            <span className="text-secondary"> · {req.requesterName}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {solution.dateShipped && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Shipped</span>
                      <span className="text-primary font-medium">
                        {new Date(solution.dateShipped).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-secondary">Status</span>
                    <StatusPill status={solution.status} />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
