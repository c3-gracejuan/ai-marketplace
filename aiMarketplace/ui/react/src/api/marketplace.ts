/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import { c3Action } from '@/c3Action';
import { Solution, TeamMember, Request, MarketplaceStats, SupportingMaterial } from '@/types/marketplace';

// ---------------------------------------------------------------------------
// Internal helpers — field names match C3 entity types exactly
// ---------------------------------------------------------------------------

function mapMember(raw: Record<string, unknown>): TeamMember {
  const rawSolutions = raw.solutions as Record<string, unknown>[] | undefined;
  return {
    id: raw.id as string,
    name: (raw.name ?? '') as string,
    role: (raw.role ?? '') as string,
    avatarUrl: (raw.avatarUrl ?? '') as string,
    solutions: rawSolutions ? rawSolutions.map(mapSolution) : undefined,
  };
}

function mapMaterial(raw: Record<string, unknown>): SupportingMaterial {
  return {
    id: raw.id as string,
    type: (raw.materialType ?? 'other') as SupportingMaterial['type'],
    title: (raw.title ?? '') as string,
    url: raw.url as string | undefined,
    thumbnail: raw.thumbnail as string | undefined,
    filename: raw.filename as string | undefined,
    filesize: raw.filesize as number | undefined,
    description: raw.description as string | undefined,
    order: (raw.order ?? 0) as number,
  };
}

function mapRequest(raw: Record<string, unknown>): Request {
  return {
    id: raw.id as string,
    title: (raw.title ?? '') as string,
    problem: (raw.problem ?? '') as string,
    requesterName: (raw.requesterName ?? '') as string,
    status: (raw.status ?? 'Triaging') as Request['status'],
    decisionResponse: raw.decisionResponse as string | undefined,
    createdAt: (raw.createdAt ?? '') as string,
  };
}

function mapSolution(raw: Record<string, unknown>): Solution {
  const builders = ((raw.builders as Record<string, unknown>[]) ?? []).map(mapMember);
  const supportingMaterials = ((raw.supportingMaterials as Record<string, unknown>[]) ?? []).map(mapMaterial);
  const originatingRequests = ((raw.originatingRequests as Record<string, unknown>[]) ?? []).map(mapRequest);
  return {
    id: raw.id as string,
    title: (raw.title ?? '') as string,
    problem: (raw.problem ?? '') as string,
    solutionDescription: (raw.solutionDescription ?? '') as string,
    hoursSaved: raw.hoursSaved as number | undefined,
    dollarsSaved: raw.dollarsSaved as number | undefined,
    domain: ((raw.domain as string[]) ?? []) as Solution['domain'],
    status: (raw.status ?? 'Queued') as Solution['status'],
    builders,
    originatingRequests,
    dateShipped: raw.dateShipped as string | undefined,
    supportingMaterials,
  };
}

// ---------------------------------------------------------------------------
// SolutionService calls
// ---------------------------------------------------------------------------

export async function listSolutions(
  domain?: string,
  search?: string,
): Promise<Solution[]> {
  const raw: Record<string, unknown>[] = await c3Action('SolutionService', 'listSolutions', [
    domain ?? null,
    search ?? null,
  ]);
  return (raw ?? []).map(mapSolution);
}

export async function getSolution(id: string): Promise<Solution | null> {
  const raw: Record<string, unknown> | null = await c3Action('SolutionService', 'getSolution', [id]);
  if (!raw) return null;
  return mapSolution(raw);
}

export async function listQueuedSolutions(): Promise<Solution[]> {
  const raw: Record<string, unknown>[] = await c3Action('SolutionService', 'listQueued', []);
  return (raw ?? []).map(mapSolution);
}

export async function updateSolutionDraft(params: {
  solutionId: string;
  solutionDescription: string;
  hoursSaved: number;
  dollarsSaved: number;
  domain: string[];
}): Promise<Solution> {
  const raw: Record<string, unknown> = await c3Action('SolutionService', 'updateDraft', [
    params.solutionId,
    params.solutionDescription,
    params.hoursSaved,
    params.dollarsSaved,
    params.domain,
  ]);
  return mapSolution(raw);
}

export async function assignBuilders(solutionId: string, builderIds: string[]): Promise<Solution> {
  const raw: Record<string, unknown> = await c3Action('SolutionService', 'assignBuilders', [
    solutionId,
    builderIds,
  ]);
  return mapSolution(raw);
}

// ---------------------------------------------------------------------------
// TeamMember — direct fetch
// ---------------------------------------------------------------------------

export async function listTeamMembers(): Promise<TeamMember[]> {
  const result: { objs?: Record<string, unknown>[] } = await c3Action('TeamMember', 'fetch', {
    include: 'this,solutions.this',
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
  requesterName: string;
}): Promise<Request> {
  const raw: Record<string, unknown> = await c3Action('RequestService', 'submitRequest', [
    params.title,
    params.problem,
    params.requesterName,
  ]);
  return mapRequest(raw);
}

export async function decideRequest(
  requestId: string,
  newStatus: string,
  response: string,
): Promise<Request> {
  const raw: Record<string, unknown> = await c3Action('RequestService', 'decide', [
    requestId,
    newStatus,
    response,
  ]);
  return mapRequest(raw);
}

export async function listForTriage(): Promise<Request[]> {
  const raw: Record<string, unknown>[] = await c3Action('RequestService', 'listForTriage', []);
  return (raw ?? []).map(mapRequest);
}

export async function listAllRequests(): Promise<Request[]> {
  const raw: Record<string, unknown>[] = await c3Action('RequestService', 'listAll', []);
  return (raw ?? []).map(mapRequest);
}

// ---------------------------------------------------------------------------
// StatsService calls
// ---------------------------------------------------------------------------

export async function landingStats(): Promise<MarketplaceStats> {
  const raw: Record<string, unknown> = await c3Action('StatsService', 'landingStats', []);
  return {
    solutionsInProgress: (raw.solutionsInProgress ?? 0) as number,
    solutionsShipped: (raw.solutionsShipped ?? 0) as number,
    engineerHoursSaved: (raw.engineerHoursSaved ?? 0) as number,
    companyDollarsSaved: (raw.companyDollarsSaved ?? 0) as number,
  };
}
