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
      <div className="border-b border-weak px-6 py-8 bg-secondary">
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
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'hidden' : ''}`}>
          {teamMembers.map((member) => {
            const memberSolutions = member.solutions ?? [];
            return (
              <div key={member.id} className="bg-secondary border border-weak rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-full shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary text-base">{member.name}</h3>
                    <p className="text-sm text-secondary">{member.role}</p>
                  </div>
                </div>

                {/* Solutions */}
                {memberSolutions.length > 0 && (
                  <div className="border-t border-weak pt-4">
                    <div className="flex flex-col gap-1">
                      {memberSolutions.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/solutions/${s.id}`)}
                          className="text-xs text-left text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          → {s.title}
                        </button>
                      ))}
                      {memberSolutions.length > 3 && (
                        <span className="text-xs text-secondary">+{memberSolutions.length - 3} more</span>
                      )}
                    </div>
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
