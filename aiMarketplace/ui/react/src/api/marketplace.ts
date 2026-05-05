/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import { c3Action } from '@/c3Action';
import { Solution, TeamMember, Request, MarketplaceStats, SupportingMaterial } from '@/types/marketplace';

// ---------------------------------------------------------------------------
// Internal helpers — field names now match C3 entity types exactly
// ---------------------------------------------------------------------------

function mapMember(raw: Record<string, unknown>): TeamMember {
  const rawSolutions = raw.solutions as Record<string, unknown>[] | undefined;
  return {
    id: raw.id as string,
    name: (raw.name ?? '') as string,
    role: (raw.role ?? '') as string,
    expertise: (raw.expertise as string[]) ?? [],
    avatarUrl: (raw.avatarUrl ?? '') as string,
    projectsShipped: (raw.projectsShipped ?? 0) as number,
    projectIds: (raw.projectIds as string[]) ?? [],
    solutions: rawSolutions ? rawSolutions.map(mapSolution) : undefined,
  };
}

function mapMaterial(raw: Record<string, unknown>): SupportingMaterial {
  return {
    id: raw.id as string,
    type: (raw.materialType ?? 'other') as SupportingMaterial['type'],
    title: (raw.title ?? '') as string,
    url: raw.url as string | undefined,
    content: raw.content as string | undefined,
    language: raw.language as string | undefined,
    thumbnail: raw.thumbnail as string | undefined,
    filename: raw.filename as string | undefined,
    filesize: raw.filesize as number | undefined,
    description: raw.description as string | undefined,
    order: (raw.order ?? 0) as number,
  };
}

function mapSolution(raw: Record<string, unknown>): Solution {
  const builders = ((raw.builders as Record<string, unknown>[]) ?? []).map(mapMember);
  const supportingMaterials = ((raw.supportingMaterials as Record<string, unknown>[]) ?? []).map(mapMaterial);
  return {
    id: raw.id as string,
    title: (raw.title ?? '') as string,
    problem: (raw.problem ?? '') as string,
    solutionDescription: (raw.solutionDescription ?? '') as string,
    impactSummary: (raw.impactSummary ?? '') as string,
    hoursSaved: raw.hoursSaved as number | undefined,
    dollarsSaved: raw.dollarsSaved as number | undefined,
    domain: ((raw.domain as string[]) ?? []) as Solution['domain'],
    stack: (raw.stack as string[]) ?? [],
    status: (raw.status ?? 'Triaging') as Solution['status'],
    builders,
    requesterOrg: (raw.requesterOrg ?? '') as string,
    dateShipped: raw.dateShipped as string | undefined,
    reusabilityNote: (raw.reusabilityNote ?? '') as string,
    supportingMaterials,
    featured: (raw.featured ?? false) as boolean,
  };
}

function mapRequest(raw: Record<string, unknown>): Request {
  return {
    id: raw.id as string,
    title: (raw.title ?? '') as string,
    problem: (raw.problem ?? '') as string,
    currentProcess: (raw.currentProcess ?? '') as string,
    affectedTeam: (raw.affectedTeam ?? '') as string,
    affectedCount: (raw.affectedCount ?? 0) as number,
    frequency: (raw.frequency ?? 'Ad Hoc') as Request['frequency'],
    burdenEstimate: (raw.burdenEstimate ?? '') as string,
    desiredOutcome: (raw.desiredOutcome ?? '') as string,
    urgency: (raw.urgency ?? 'Low') as Request['urgency'],
    requesterName: (raw.requesterName ?? '') as string,
    requesterTeam: (raw.requesterTeam ?? '') as string,
    relatedLinks: (raw.relatedLinks as string[]) ?? [],
    status: (raw.status ?? 'New') as Request['status'],
    decisionResponse: raw.decisionResponse as string | undefined,
    assignedOwner: raw.assignedOwner as string | undefined,
    createdAt: (raw.createdAt ?? '') as string,
    lastUpdated: (raw.lastUpdated ?? '') as string,
    slaDueAt: (raw.slaDueAt ?? '') as string,
  };
}

// ---------------------------------------------------------------------------
// SolutionService calls
// ---------------------------------------------------------------------------

export async function listSolutions(
  domain?: string,
  status?: string,
  search?: string,
  stack?: string,
  requesterOrg?: string,
): Promise<Solution[]> {
  const raw: Record<string, unknown>[] = await c3Action('SolutionService', 'listSolutions', [
    domain ?? null,
    status ?? null,
    search ?? null,
    stack ?? null,
    requesterOrg ?? null,
  ]);
  return (raw ?? []).map(mapSolution);
}

export async function getSolution(id: string): Promise<Solution | null> {
  const raw: Record<string, unknown> | null = await c3Action('SolutionService', 'getSolution', [id]);
  if (!raw) return null;
  return mapSolution(raw);
}

export async function featuredSolutions(n = 3): Promise<Solution[]> {
  const raw: Record<string, unknown>[] = await c3Action('SolutionService', 'featuredSolutions', [n]);
  return (raw ?? []).map(mapSolution);
}

export async function recentlyShipped(n = 6): Promise<Solution[]> {
  const raw: Record<string, unknown>[] = await c3Action('SolutionService', 'recentlyShipped', [n]);
  return (raw ?? []).map(mapSolution);
}

// ---------------------------------------------------------------------------
// TeamMember — direct fetch
// ---------------------------------------------------------------------------

export async function listTeamMembers(): Promise<TeamMember[]> {
  const result: { objs?: Record<string, unknown>[] } = await c3Action('TeamMember', 'fetch', {
    include: 'this,projectsShipped,solutions.this',
    order: 'ascending(name)',
    limit: -1,
  });
  return (result?.objs ?? []).map(mapMember);
}

// ---------------------------------------------------------------------------
// RequestService calls
// ---------------------------------------------------------------------------

export async function submitRequest(params: {
  title: string;
  problem: string;
  currentProcess: string;
  affectedTeam: string;
  affectedCount: number;
  frequency: string;
  burdenEstimate: string;
  desiredOutcome: string;
  urgency: string;
  requesterName: string;
  requesterTeam: string;
  relatedLinks: string[];
}): Promise<Request> {
  const raw: Record<string, unknown> = await c3Action('RequestService', 'submitRequest', [
    params.title,
    params.problem,
    params.currentProcess,
    params.affectedTeam,
    params.affectedCount,
    params.frequency,
    params.burdenEstimate,
    params.desiredOutcome,
    params.urgency,
    params.requesterName,
    params.requesterTeam,
    params.relatedLinks,
  ]);
  return mapRequest(raw);
}

export async function decideRequest(
  requestId: string,
  newStatus: string,
  response: string,
  owner: string,
): Promise<Request> {
  const raw: Record<string, unknown> = await c3Action('RequestService', 'decide', [
    requestId,
    newStatus,
    response,
    owner,
  ]);
  return mapRequest(raw);
}

export async function listForTriage(): Promise<Request[]> {
  const raw: Record<string, unknown>[] = await c3Action('RequestService', 'listForTriage', []);
  return (raw ?? []).map(mapRequest);
}

export async function listInFlight(): Promise<Request[]> {
  const raw: Record<string, unknown>[] = await c3Action('RequestService', 'listInFlight', []);
  return (raw ?? []).map(mapRequest);
}

// ---------------------------------------------------------------------------
// StatsService calls
// ---------------------------------------------------------------------------

export async function landingStats(): Promise<MarketplaceStats> {
  const raw: Record<string, unknown> = await c3Action('StatsService', 'landingStats', []);
  return {
    requestsFielded: (raw.requestsFielded ?? 0) as number,
    solutionsInProgress: (raw.solutionsInProgress ?? 0) as number,
    solutionsShipped: (raw.solutionsShipped ?? 0) as number,
    engineerHoursSaved: (raw.engineerHoursSaved ?? 0) as number,
    companyDollarsSaved: (raw.companyDollarsSaved ?? 0) as number,
  };
}
