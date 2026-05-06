/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/solutions')}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Solutions Catalog
        </button>

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
            <div className="sticky top-6 flex flex-col">
              {/* Impact */}
              {showImpact && (
                <div className="pb-8">
                  {solution.hoursSaved ? (
                    <div className={solution.dollarsSaved ? 'mb-7' : ''}>
                      <p className="text-5xl font-bold tabular-nums text-green-600 dark:text-green-400 tracking-tight leading-none">
                        {solution.hoursSaved.toLocaleString()}
                        <span className="text-2xl font-semibold ml-1.5 tracking-normal">hrs</span>
                      </p>
                      <p className="text-xs text-secondary uppercase tracking-wide mt-2.5 font-medium">Engineer hours saved</p>
                    </div>
                  ) : null}
                  {solution.dollarsSaved ? (
                    <div>
                      <p className="text-5xl font-bold tabular-nums text-green-600 dark:text-green-400 tracking-tight leading-none">
                        {formatDollars(solution.dollarsSaved)}
                      </p>
                      <p className="text-xs text-secondary uppercase tracking-wide mt-2.5 font-medium">Estimated impact</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Built by */}
              <div className={showImpact ? 'pt-8 border-t border-weak' : ''}>
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
