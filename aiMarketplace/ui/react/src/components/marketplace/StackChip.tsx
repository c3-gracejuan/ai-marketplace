/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React from 'react';

interface StackChipProps {
  label: string;
}

export default function StackChip({ label }: StackChipProps) {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
      {label}
    </span>
  );
}
