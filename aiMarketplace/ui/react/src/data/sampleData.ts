/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

// Stub data for resources/examples components only — not used by the main app.

type SelectOption = { text: string; value: string };

export const projects: SelectOption[] = [
  { text: 'Project Alpha', value: 'alpha' },
  { text: 'Project Beta', value: 'beta' },
];

export const programs: SelectOption[] = [
  { text: 'Program A', value: 'program-a' },
  { text: 'Program B', value: 'program-b' },
];

export const owners: SelectOption[] = [
  { text: 'Alice Johnson', value: 'alice' },
  { text: 'Bob Smith', value: 'bob' },
];

export const checklists: SelectOption[] = [
  { text: 'Standard Review', value: 'standard' },
  { text: 'Compliance Review', value: 'compliance' },
];

export const uploadedBy: SelectOption[] = [
  { text: 'Alice Johnson', value: 'alice' },
  { text: 'Bob Smith', value: 'bob' },
];
