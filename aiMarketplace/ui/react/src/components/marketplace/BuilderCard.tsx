/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { TeamMember } from '@/types/marketplace';

interface BuilderCardProps {
  member: TeamMember;
}

export default function BuilderCard({ member }: BuilderCardProps) {
  return (
    <div className="bg-secondary rounded-xl p-5 border border-weak">
      <div className="flex items-start gap-4">
        <img
          src={member.avatarUrl}
          alt={member.name}
          className="w-14 h-14 rounded-full shrink-0"
        />
        <div className="min-w-0">
          <p className="font-semibold text-primary text-base">{member.name}</p>
          <p className="text-sm text-secondary">{member.role}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {member.expertise.map((e) => (
              <span
                key={e}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
              >
                {e}
              </span>
            ))}
          </div>
          <p className="text-xs text-secondary mt-2">
            {member.projectsShipped} solution{member.projectsShipped !== 1 ? 's' : ''} shipped
          </p>
        </div>
      </div>
    </div>
  );
}
