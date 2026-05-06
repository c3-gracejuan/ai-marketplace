/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

export function formatDollars(n: number): string {
  if (n >= 1_000_000) {
    return '$' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return '$' + (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return '$' + n.toLocaleString();
}
