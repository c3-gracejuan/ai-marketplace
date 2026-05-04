/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';
import { Domain } from '@/types/marketplace';

const domainColors: Record<Domain, string> = {
  'FP&A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Sales Ops': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Engineering': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'GTM': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Customer Success': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Cross-functional': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
};

interface DomainChipProps {
  domain: Domain;
  size?: 'sm' | 'md';
}

export default function DomainChip({ domain, size = 'sm' }: DomainChipProps) {
  const color = domainColors[domain] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {domain}
    </span>
  );
}
