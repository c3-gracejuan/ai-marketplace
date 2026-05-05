/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

export type Domain = 'FP&A' | 'Sales Ops' | 'Engineering' | 'GTM' | 'Customer Success' | 'Cross-functional';

export type SolutionStatus = 'Shipped' | 'Building' | 'Scoping' | 'Triaging';

export type RequestStatus =
  | 'New'
  | 'Triaging'
  | 'Awaiting Info'
  | 'Accepted'
  | 'Scoping'
  | 'Building'
  | 'Shipped'
  | 'Deferred'
  | 'Routed Elsewhere'
  | "Won't Do";

export type Urgency = 'Low' | 'Medium' | 'High';

export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Ad Hoc';

export type SupportingMaterialType =
  | 'app_link'
  | 'confluence_doc'
  | 'external_file'
  | 'code_snippet'
  | 'demo_video'
  | 'image'
  | 'other';

export interface SupportingMaterial {
  id: string;
  type: SupportingMaterialType;
  title: string;
  url?: string;
  content?: string;
  language?: string;
  thumbnail?: string;
  filename?: string;
  filesize?: number;
  description?: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatarUrl: string;
  projectsShipped: number;
  projectIds: string[];
  /** Solutions this member built — populated when fetching via listTeamMembers */
  solutions?: Solution[];
}

export interface Solution {
  id: string;
  title: string;
  problem: string;
  solutionDescription: string;
  impactSummary: string;
  hoursSaved?: number;
  dollarsSaved?: number;
  domain: Domain[];
  stack: string[];
  status: SolutionStatus;
  builders: TeamMember[];
  requesterOrg: string;
  dateShipped?: string;
  reusabilityNote: string;
  supportingMaterials: SupportingMaterial[];
  featured?: boolean;
}

export interface Request {
  id: string;
  title: string;
  problem: string;
  currentProcess: string;
  affectedTeam: string;
  affectedCount: number;
  frequency: Frequency;
  burdenEstimate: string;
  desiredOutcome: string;
  urgency: Urgency;
  requesterName: string;
  requesterTeam: string;
  relatedLinks: string[];
  status: RequestStatus;
  decisionResponse?: string;
  assignedOwner?: string;
  createdAt: string;
  lastUpdated: string;
  slaDueAt: string;
}

export interface MarketplaceStats {
  requestsFielded: number;
  solutionsInProgress: number;
  solutionsShipped: number;
  engineerHoursSaved: number;
  companyDollarsSaved: number;
}
