/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { teamMembers, solutions } from '@/data/mockData';

export default function TeamPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-primary">
      {/* Header */}
      <div className="border-b border-weak px-6 py-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary">The SWAT Team</h1>
          <p className="text-secondary mt-2">
            A small, high-output engineering unit embedded within C3 AI. Every solution is credited to the engineer who built it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Team roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {teamMembers.map((member) => {
            const memberSolutions = solutions.filter((s) =>
              s.builders.some((b) => b.id === member.id)
            );
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

                {/* Expertise */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.expertise.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                      {e}
                    </span>
                  ))}
                </div>

                {/* Projects shipped */}
                <div className="border-t border-weak pt-4">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    {member.projectsShipped} solution{member.projectsShipped !== 1 ? 's' : ''} shipped
                  </p>
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
              </div>
            );
          })}
        </div>

        {/* How we work */}
        <div className="bg-secondary border border-weak rounded-2xl p-8">
          <h2 className="text-xl font-bold text-primary mb-6">How we work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Intake',
                desc: 'Anyone at C3 submits a structured request via the Marketplace. Every request gets a triage review within 5 business days.',
              },
              {
                step: '02',
                title: 'Triage',
                desc: 'We evaluate fit, scope, and capacity. We respond to every request — even with a "not now" — with transparent reasoning.',
              },
              {
                step: '03',
                title: 'Build',
                desc: 'Accepted projects are owned by a named engineer. Status is public. We ship iteratively and move fast.',
              },
              {
                step: '04',
                title: 'Ship & Compound',
                desc: 'Every shipped solution is documented and searchable. We tag reusable patterns so the next team can fork, not rebuild.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-2">
                <span className="text-3xl font-black text-blue-200 dark:text-blue-900">{step}</span>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/submit')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Submit a Request
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
