/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, DollarSign } from 'lucide-react';
import { getSolution } from '@/api/marketplace';
import { Solution } from '@/types/marketplace';
import { formatDollars } from '@/lib/formatImpact';
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

  const showImpact = !!(solution.hoursSaved || solution.dollarsSaved);
  const shippedLabel = solution.dateShipped
    ? new Date(solution.dateShipped).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

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
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                {solution.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondary">
                {solution.domain.length > 0 && (
                  <>
                    <span>{solution.domain.join(', ')}</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <StatusPill status={solution.status} />
                {shippedLabel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{shippedLabel}</span>
                  </>
                )}
              </div>
            </div>

            {/* Draft banner for Queued solutions */}
            {solution.status === 'Queued' && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                <strong>Draft.</strong> This solution hasn&apos;t started yet — fields will be filled in once a SWAT engineer picks it up.
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

            {/* Supporting Materials */}
            {solution.supportingMaterials.length > 0 && (
              <section className="mb-10">
                <h2 className="text-base font-semibold text-primary mb-4">Supporting Materials</h2>
                <SupportingMaterialRenderer materials={solution.supportingMaterials} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-6 flex flex-col gap-5">
              {/* Impact */}
              {showImpact && (
                <div className="p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800 flex flex-col gap-4">
                  {solution.hoursSaved ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{solution.hoursSaved.toLocaleString()} hrs</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Engineer hours saved</p>
                      </div>
                    </div>
                  ) : null}
                  {solution.dollarsSaved ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatDollars(solution.dollarsSaved)}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Estimated impact</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Built by */}
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
