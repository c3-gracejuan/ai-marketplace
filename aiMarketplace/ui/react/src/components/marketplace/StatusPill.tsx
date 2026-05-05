/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { SolutionStatus, RequestStatus } from '@/types/marketplace';

type AnyStatus = SolutionStatus | RequestStatus;

const statusStyles: Record<AnyStatus, string> = {
  // Request statuses
  Triaging: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Accepted: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  Deferred: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  // Solution statuses
  Queued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Building: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Shipped: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

interface StatusPillProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export default function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700 ring-1 ring-red-300';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {status}
    </span>
  );
}
