/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/types/marketplace';
import StatusPill from './StatusPill';

interface SolutionCardProps {
  solution: Solution;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-primary border border-weak rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col gap-3 group"
      onClick={() => navigate(`/solutions/${solution.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/solutions/${solution.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-primary text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {solution.title}
        </h3>
        <StatusPill status={solution.status} />
      </div>

      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
        {solution.problem}
      </p>

      <p className="text-xs text-green-700 dark:text-green-400 font-medium line-clamp-1 mt-auto">
        {solution.impactSummary}
      </p>
    </div>
  );
}
