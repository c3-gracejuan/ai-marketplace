/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { listSolutions } from '@/api/marketplace';
import { Solution, Domain, SolutionStatus, TeamMember } from '@/types/marketplace';
import SolutionCard from '@/components/marketplace/SolutionCard';
import { CardGridSkeleton } from '@/components/marketplace/CardGridSkeleton';

const DOMAINS: Domain[] = ['FP&A', 'Sales Ops', 'Engineering', 'GTM', 'Customer Success', 'Cross-functional'];
// 'Queued' is intentionally omitted — queued solutions are pre-commitment and
// surface only after they're picked up as 'Building'.
const STATUSES: SolutionStatus[] = ['Shipped', 'Building'];

export default function BrowseSolutionsPage() {
  const [allSolutions, setAllSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SolutionStatus[]>([]);
  const [selectedBuilderIds, setSelectedBuilderIds] = useState<string[]>([]);

  useEffect(() => {
    listSolutions().then(setAllSolutions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Builders who appear on at least one catalog solution, alphabetized.
  const builders = useMemo<TeamMember[]>(() => {
    const map = new Map<string, TeamMember>();
    for (const sol of allSolutions) {
      for (const b of sol.builders) {
        if (!map.has(b.id)) map.set(b.id, b);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSolutions]);

  const toggleDomain = (d: Domain) =>
    setSelectedDomains((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleStatus = (s: SolutionStatus) =>
    setSelectedStatuses((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleBuilder = (id: string) =>
    setSelectedBuilderIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const filtered = useMemo(() => {
    return allSolutions.filter((sol) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        sol.title.toLowerCase().includes(q) ||
        sol.problem.toLowerCase().includes(q) ||
        sol.solutionDescription.toLowerCase().includes(q) ||
        sol.builders.some((b) => b.name.toLowerCase().includes(q));
      const matchDomain = !selectedDomains.length || sol.domain.some((d) => selectedDomains.includes(d));
      const matchStatus = !selectedStatuses.length || selectedStatuses.includes(sol.status);
      const matchBuilder = !selectedBuilderIds.length || sol.builders.some((b) => selectedBuilderIds.includes(b.id));
      return matchSearch && matchDomain && matchStatus && matchBuilder;
    });
  }, [allSolutions, search, selectedDomains, selectedStatuses, selectedBuilderIds]);

  const clearFilters = () => {
    setSearch('');
    setSelectedDomains([]);
    setSelectedStatuses([]);
    setSelectedBuilderIds([]);
  };

  const hasFilters = search || selectedDomains.length || selectedStatuses.length || selectedBuilderIds.length;

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">Solutions Catalog</h1>
          <p className="text-secondary mt-2">
            Browse everything SWAT has shipped. Find patterns you can fork for your problem.
          </p>
          {/* Search */}
          <div className="relative mt-5 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search solutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-weak bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-secondary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        {/* Filter rail */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-4 space-y-6">
            {/* Domain filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Domain</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map((d) => {
                  const active = selectedDomains.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleDomain(d)}
                      className={
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' +
                        (active
                          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                          : 'bg-transparent text-secondary border-weak hover:text-primary hover:border-strong')
                      }
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Builder filter */}
            {builders.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-3">Builder</p>
                <div className="flex flex-wrap gap-1.5">
                  {builders.map((b) => {
                    const active = selectedBuilderIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleBuilder(b.id)}
                        className={
                          'inline-flex items-center gap-1.5 pl-0.5 pr-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ' +
                          (active
                            ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                            : 'bg-transparent text-secondary border-weak hover:text-primary hover:border-strong')
                        }
                      >
                        <img src={b.avatarUrl} alt="" className="w-5 h-5 rounded-full shrink-0" />
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status filter */}
            <div>
              <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-3">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => {
                  const active = selectedStatuses.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleStatus(s)}
                      className={
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' +
                        (active
                          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                          : 'bg-transparent text-secondary border-weak hover:text-primary hover:border-strong')
                      }
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-secondary mb-4">
            {filtered.length} solution{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' matching your filters' : ''}
          </p>
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((s) => (
                <SolutionCard key={s.id} solution={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-secondary text-base">No solutions match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
