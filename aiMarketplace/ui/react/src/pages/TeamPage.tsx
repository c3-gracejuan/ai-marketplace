/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTeamMembers } from '@/api/marketplace';
import { TeamMember } from '@/types/marketplace';
import { TeamGridSkeleton } from '@/components/marketplace/CardGridSkeleton';

export default function TeamPage() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTeamMembers().then(setTeamMembers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">The SWAT Team</h1>
          <p className="text-secondary mt-2 leading-relaxed">
            The SWAT team is a small, high-output engineering unit embedded within C3 AI. We tackle the internal automation problems that compound the most — FP&amp;A bottlenecks, Sales Ops friction, CS tooling gaps, and cross-functional data plumbing. We triage every request, work in public, and credit every engineer by name.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Team roster */}
        {loading && <TeamGridSkeleton count={6} />}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${loading ? 'hidden' : ''}`}>
          {[...teamMembers]
            .sort((a, b) => (b.solutions?.length ?? 0) - (a.solutions?.length ?? 0))
            .map((member) => {
              const memberSolutions = member.solutions ?? [];
              const count = memberSolutions.length;
              return (
                <div
                  key={member.id}
                  className="border border-weak rounded-xl p-6 hover:border-strong transition-colors flex flex-col"
                >
                  {/* Header: identity left, hero stat right */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-11 h-11 rounded-full shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-primary text-base truncate leading-tight">{member.name}</h3>
                        <p className="text-xs text-secondary mt-0.5 truncate">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-bold text-primary tabular-nums leading-none">{count}</div>
                      <div className="text-[10px] uppercase tracking-wider text-secondary mt-1.5">
                        Shipped
                      </div>
                    </div>
                  </div>

                  {/* Solutions */}
                  {count > 0 ? (
                    <div className="border-t border-weak pt-4 flex flex-col gap-1.5">
                      {memberSolutions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/solutions/${s.id}`)}
                          className="text-left text-sm text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border-t border-weak pt-4">
                      <p className="text-xs text-secondary italic">No solutions shipped yet.</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
