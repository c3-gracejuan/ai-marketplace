/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { solutions } from '@/data/mockData';
import { Domain, SolutionStatus } from '@/types/marketplace';
import SolutionCard from '@/components/marketplace/SolutionCard';

const DOMAINS: Domain[] = ['FP&A', 'Sales Ops', 'Engineering', 'GTM', 'Customer Success', 'Cross-functional'];
const STATUSES: SolutionStatus[] = ['Shipped', 'Building', 'Scoping', 'Triaging'];

export default function BrowseSolutionsPage() {
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SolutionStatus[]>([]);

  const toggleDomain = (d: Domain) =>
    setSelectedDomains((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleStatus = (s: SolutionStatus) =>
    setSelectedStatuses((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const filtered = useMemo(() => {
    return solutions.filter((sol) => {
      const q = search.toLowerCase();
      const matchSearch = !q || sol.title.toLowerCase().includes(q) || sol.problem.toLowerCase().includes(q);
      const matchDomain = !selectedDomains.length || sol.domain.some((d) => selectedDomains.includes(d));
      const matchStatus = !selectedStatuses.length || selectedStatuses.includes(sol.status);
      return matchSearch && matchDomain && matchStatus;
    });
  }, [search, selectedDomains, selectedStatuses]);

  const clearFilters = () => {
    setSearch('');
    setSelectedDomains([]);
    setSelectedStatuses([]);
  };

  const hasFilters = search || selectedDomains.length || selectedStatuses.length;

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
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

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filter rail */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary text-sm">Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Domain filter */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Domain</p>
              <div className="flex flex-col gap-1.5">
                {DOMAINS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(d)}
                      onChange={() => toggleDomain(d)}
                      className="w-3.5 h-3.5 rounded accent-blue-600"
                    />
                    <span className="text-sm text-primary">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Status</p>
              <div className="flex flex-col gap-1.5">
                {STATUSES.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(s)}
                      onChange={() => toggleStatus(s)}
                      className="w-3.5 h-3.5 rounded accent-blue-600"
                    />
                    <span className="text-sm text-primary">{s}</span>
                  </label>
                ))}
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
          {filtered.length > 0 ? (
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
