/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSolutions } from '@/api/marketplace';
import { Solution, SolutionStatus } from '@/types/marketplace';
import DomainChip from '@/components/marketplace/DomainChip';
import BuilderCard from '@/components/marketplace/BuilderCard';

const COLUMNS: { status: SolutionStatus; label: string; color: string }[] = [
  { status: 'Triaging', label: 'Triaging', color: 'border-purple-300 dark:border-purple-700' },
  { status: 'Scoping', label: 'Scoping', color: 'border-amber-300 dark:border-amber-700' },
  { status: 'Building', label: 'Building', color: 'border-blue-400 dark:border-blue-600' },
  { status: 'Shipped', label: 'Shipped', color: 'border-green-400 dark:border-green-600' },
];

function ProjectKanbanCard({ solution, onClick }: { solution: Solution; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-primary border border-weak rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col gap-3"
    >
      <p className="font-semibold text-sm text-primary leading-snug">{solution.title}</p>

      <p className="text-xs text-secondary line-clamp-2">{solution.problem}</p>

      <div className="flex flex-wrap gap-1">
        {solution.domain.map((d) => <DomainChip key={d} domain={d} />)}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-weak">
        <div className="flex -space-x-1.5">
          {solution.builders.slice(0, 2).map((b) => (
            <img key={b.id} src={b.avatarUrl} alt={b.name} className="w-6 h-6 rounded-full ring-1 ring-white dark:ring-gray-800" />
          ))}
        </div>
        <span className="text-xs text-secondary truncate">
          {solution.builders.map((b) => b.name.split(' ')[0]).join(', ')}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-secondary">
        <span className="font-medium text-secondary">{solution.requesterOrg}</span>
      </div>
    </div>
  );
}

export default function InFlightProjectsPage() {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    listSolutions().then(setSolutions).catch(() => {});
  }, []);

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">In-Flight Projects</h1>
          <p className="text-secondary mt-2">
            Live view of everything SWAT is working on right now. All work is public.
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {COLUMNS.map(({ status, label, color }) => {
            const col = solutions.filter((s) => s.status === status);
            return (
              <div key={status}>
                {/* Column header */}
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${color}`}>
                  <h2 className="font-semibold text-primary text-sm">{label}</h2>
                  <span className="ml-auto text-xs bg-secondary text-secondary rounded-full px-2 py-0.5 font-medium">
                    {col.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {col.length > 0 ? (
                    col.map((s) => (
                      <ProjectKanbanCard
                        key={s.id}
                        solution={s}
                        onClick={() => navigate(`/solutions/${s.id}`)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-secondary italic">Nothing here right now.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team owners callout */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-secondary border border-weak rounded-xl p-6">
          <h2 className="font-semibold text-primary mb-4">Project Owners</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {solutions
              .filter((s) => s.status !== 'Shipped')
              .flatMap((s) => s.builders)
              .filter((b, i, arr) => arr.findIndex((x) => x.id === b.id) === i)
              .map((member) => (
                <BuilderCard key={member.id} member={member} compact />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
