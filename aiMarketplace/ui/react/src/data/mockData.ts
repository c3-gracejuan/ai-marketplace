/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import { Solution, TeamMember, Request, MarketplaceStats } from '@/types/marketplace';

export const teamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Priya Anand',
    role: 'Senior Software Engineer',
    expertise: ['Data Pipelines', 'FP&A Automation', 'Python', 'C3 AI'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya+Anand&backgroundColor=3b82f6&textColor=ffffff',
    projectsShipped: 7,
    projectIds: ['sol1', 'sol3', 'sol5'],
  },
  {
    id: 'tm2',
    name: 'Marcus Webb',
    role: 'Staff Engineer',
    expertise: ['ML Ops', 'Revenue Analytics', 'JavaScript', 'Platform Engineering'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Marcus+Webb&backgroundColor=8b5cf6&textColor=ffffff',
    projectsShipped: 5,
    projectIds: ['sol2', 'sol6'],
  },
  {
    id: 'tm3',
    name: 'Leila Nouri',
    role: 'Software Engineer',
    expertise: ['Sales Ops', 'CRM Integrations', 'React', 'REST APIs'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Leila+Nouri&backgroundColor=10b981&textColor=ffffff',
    projectsShipped: 4,
    projectIds: ['sol4', 'sol7'],
  },
  {
    id: 'tm4',
    name: 'Derek Hwang',
    role: 'Senior Software Engineer',
    expertise: ['ETL', 'Data Engineering', 'Go', 'Kubernetes'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Derek+Hwang&backgroundColor=f59e0b&textColor=ffffff',
    projectsShipped: 6,
    projectIds: ['sol1', 'sol8'],
  },
  {
    id: 'tm5',
    name: 'Sofia Reyes',
    role: 'Software Engineer',
    expertise: ['CS Tooling', 'Support Automation', 'TypeScript', 'NLP'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Sofia+Reyes&backgroundColor=ef4444&textColor=ffffff',
    projectsShipped: 3,
    projectIds: ['sol5', 'sol6'],
  },
  {
    id: 'tm6',
    name: 'Tariq Osei',
    role: 'Staff Engineer',
    expertise: ['Platform', 'GTM Analytics', 'Data Modeling', 'C3 AI'],
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tariq+Osei&backgroundColor=06b6d4&textColor=ffffff',
    projectsShipped: 8,
    projectIds: ['sol2', 'sol3', 'sol4', 'sol7'],
  },
];

export const solutions: Solution[] = [
  {
    id: 'sol1',
    title: 'Automated Headcount Variance Report',
    problem:
      'The FP&A team spent 6–8 hours every month manually reconciling headcount data across Workday, Adaptive, and internal spreadsheets. Discrepancies went undetected until close, causing last-minute reforecasts.',
    solutionDescription:
      'Built a C3 AI pipeline that pulls from Workday and Adaptive APIs on a nightly schedule, computes variance by department and cost center, and surfaces a self-refreshing dashboard. Threshold alerts flag anomalies >2% before month-end close.',
    impactSummary: 'Eliminated 8 hours/month of manual reconciliation. Zero close-day surprises in the 3 months since launch.',
    hourssaved: 96,
    dollarsSaved: 48000,
    domain: ['FP&A'],
    stack: ['Python', 'C3 AI', 'Adaptive', 'Workday'],
    status: 'Shipped',
    builders: [teamMembers[0], teamMembers[3]],
    requesterOrg: 'Finance',
    dateShipped: '2025-11-15',
    reusabilityNote: 'Forkable for any team reconciling data across two or more HR/planning systems.',
    featured: true,
    supportingMaterials: [
      {
        id: 'sm1a',
        type: 'app_link',
        title: 'Live Headcount Dashboard',
        url: 'https://app.c3.ai/headcount-variance',
        description: 'Production dashboard used by FP&A every month-end close.',
        order: 1,
      },
      {
        id: 'sm1b',
        type: 'confluence_doc',
        title: 'Technical Design — Headcount Variance Pipeline',
        url: 'https://confluence.c3.ai/pages/headcount-variance-design',
        description: 'Architecture decisions, data model, and runbook.',
        order: 2,
      },
      {
        id: 'sm1c',
        type: 'code_snippet',
        title: 'Variance Computation Logic',
        content: `def compute_variance(workday_df, adaptive_df):
    """
    Compute headcount variance between Workday actuals and Adaptive forecast.
    Returns a DataFrame with dept, cost_center, actual, forecast, delta, pct_delta.
    """
    merged = workday_df.merge(adaptive_df, on=['dept', 'cost_center'], suffixes=('_actual', '_forecast'))
    merged['delta'] = merged['headcount_actual'] - merged['headcount_forecast']
    merged['pct_delta'] = (merged['delta'] / merged['headcount_forecast'].replace(0, float('nan'))) * 100
    return merged[abs(merged['pct_delta']) > 2.0]`,
        language: 'python',
        order: 3,
      },
      {
        id: 'sm1d',
        type: 'image',
        title: 'Dashboard Screenshot — Month-End View',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
        description: 'The variance table view showing FP&A the delta by cost center.',
        order: 4,
      },
    ],
  },
  {
    id: 'sol2',
    title: 'Deal Desk Approval Automation',
    problem:
      'Sales Ops was bottlenecking 30+ deals per quarter waiting for manual Deal Desk approvals via email chains. Average approval latency was 4.2 days, delaying close and degrading rep satisfaction.',
    solutionDescription:
      'Implemented a rules-based approval router that ingests deal attributes from Salesforce, runs them through a tiered policy engine, and either auto-approves low-risk deals or routes complex deals to the right approver with structured context. Built-in escalation paths and SLA timers.',
    impactSummary:
      '68% of deals now auto-approved. Average approval latency down from 4.2 days to 11 hours for routed deals.',
    hourssaved: 240,
    dollarsSaved: 320000,
    domain: ['Sales Ops'],
    stack: ['JavaScript', 'Salesforce', 'C3 AI', 'REST APIs'],
    status: 'Shipped',
    builders: [teamMembers[1], teamMembers[5]],
    requesterOrg: 'Sales Operations',
    dateShipped: '2025-12-02',
    reusabilityNote: 'The policy engine pattern is forkable for any multi-tier approval workflow.',
    featured: true,
    supportingMaterials: [
      {
        id: 'sm2a',
        type: 'demo_video',
        title: 'Deal Flow Demo — End-to-End Walkthrough',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        description: '3-minute demo showing the full approval flow from deal creation to approval notification.',
        order: 1,
      },
      {
        id: 'sm2b',
        type: 'code_snippet',
        title: 'Policy Engine — Tier Classification',
        content: `function classifyDeal(deal) {
  const { arr, discountPct, nonStandardTerms, region } = deal;

  if (arr < 50_000 && discountPct <= 0.10 && !nonStandardTerms) {
    return { tier: 'auto_approve', reason: 'Standard small deal' };
  }

  if (arr >= 500_000 || nonStandardTerms || region === 'APAC') {
    return { tier: 'vp_review', reason: 'High-value or non-standard' };
  }

  return { tier: 'manager_review', reason: 'Mid-market standard' };
}`,
        language: 'javascript',
        order: 2,
      },
      {
        id: 'sm2c',
        type: 'confluence_doc',
        title: 'Deal Desk Policy Rules v2.1',
        url: 'https://confluence.c3.ai/pages/deal-desk-policy',
        description: 'Full policy matrix maintained by Sales Ops leadership.',
        order: 3,
      },
    ],
  },
  {
    id: 'sol3',
    title: 'Quota Attainment Digest',
    problem:
      'Sales leadership had no single view of real-time quota attainment by rep, segment, and region. The weekly deck took a quota analyst 5 hours to build from three disconnected exports.',
    solutionDescription:
      'Built a weekly auto-generated digest that pulls Salesforce opportunity data, applies quota bookings logic, and emails a formatted summary to each regional VP every Monday at 7am. Includes sparklines, segment drill-downs, and YTD trend.',
    impactSummary:
      'Eliminated 5 hours/week of analyst time. Sales leadership has data by Monday 7am instead of Tuesday afternoon.',
    hourssaved: 260,
    dollarsSaved: 130000,
    domain: ['Sales Ops', 'FP&A'],
    stack: ['Python', 'Salesforce', 'C3 AI'],
    status: 'Shipped',
    builders: [teamMembers[0], teamMembers[5]],
    requesterOrg: 'Sales',
    dateShipped: '2025-10-28',
    reusabilityNote: 'Digest template is forkable for any recurring operational report.',
    featured: true,
    supportingMaterials: [
      {
        id: 'sm3a',
        type: 'image',
        title: 'Digest Email Sample',
        thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&auto=format&fit=crop',
        description: 'The Monday morning email sent to each VP with their regional view.',
        order: 1,
      },
      {
        id: 'sm3b',
        type: 'confluence_doc',
        title: 'Quota Bookings Logic Documentation',
        url: 'https://confluence.c3.ai/pages/quota-bookings-logic',
        description: 'How bookings are attributed across segments, and edge case handling.',
        order: 2,
      },
    ],
  },
  {
    id: 'sol4',
    title: 'CS Health Score Automation',
    problem:
      'Customer Success Managers were manually computing health scores for 200+ accounts in a shared spreadsheet. Updates happened monthly at best, creating blind spots for at-risk accounts.',
    solutionDescription:
      'Automated health score computation using C3 AI time-series + entity types. Pulls usage telemetry, support ticket volume, NPS data, and contract renewal date proximity. Scores refresh daily. Escalation alerts are routed to the owning CSM via Slack.',
    impactSummary:
      'Health scores now refresh daily. CSMs caught 4 at-risk accounts in Q4 that would have churned without intervention. Estimated $2.1M ARR protected.',
    hourssaved: 400,
    dollarsSaved: 2100000,
    domain: ['Customer Success'],
    stack: ['Python', 'C3 AI', 'Salesforce', 'Slack API'],
    status: 'Shipped',
    builders: [teamMembers[2], teamMembers[5]],
    requesterOrg: 'Customer Success',
    dateShipped: '2025-09-12',
    reusabilityNote: 'Health score framework forkable for any account-based risk scoring use case.',
    supportingMaterials: [
      {
        id: 'sm4a',
        type: 'app_link',
        title: 'CS Health Score Dashboard',
        url: 'https://app.c3.ai/cs-health',
        description: 'Live health score view used by all CSMs.',
        order: 1,
      },
      {
        id: 'sm4b',
        type: 'code_snippet',
        title: 'Health Score Computation',
        content: `def compute_health_score(account_id: str, as_of: datetime) -> float:
    """
    Composite health score [0, 100].
    Weights: usage 40%, support 25%, nps 20%, renewal_proximity 15%
    """
    usage   = get_usage_score(account_id, as_of)      # 0-100
    support = get_support_score(account_id, as_of)    # 0-100
    nps     = get_nps_score(account_id, as_of)        # 0-100
    renewal = get_renewal_proximity_score(account_id) # 0-100

    return 0.40*usage + 0.25*support + 0.20*nps + 0.15*renewal`,
        language: 'python',
        order: 2,
      },
      {
        id: 'sm4c',
        type: 'confluence_doc',
        title: 'Health Score Methodology',
        url: 'https://confluence.c3.ai/pages/cs-health-score',
        description: 'Signal selection, weight rationale, and threshold definitions.',
        order: 3,
      },
    ],
  },
  {
    id: 'sol5',
    title: 'Pipeline Coverage Alerting',
    problem:
      'GTM leadership had no early warning when pipeline coverage dropped below 3x in any segment. By the time the weekly forecast was built, the window to respond had already closed.',
    solutionDescription:
      'Built a real-time pipeline coverage monitor that refreshes hourly from Salesforce and fires a structured Slack alert to the regional VP and RevOps lead whenever coverage drops below configurable thresholds. Alert includes the coverage ratio, the gap-to-target, and top deals at risk.',
    impactSummary:
      'GTM leaders now get coverage alerts within the hour instead of discovering gaps at the weekly forecast review.',
    hourssaved: 180,
    dollarsSaved: 90000,
    domain: ['GTM', 'Sales Ops'],
    stack: ['Python', 'Salesforce', 'Slack API', 'C3 AI'],
    status: 'Shipped',
    builders: [teamMembers[0], teamMembers[4]],
    requesterOrg: 'GTM Strategy',
    dateShipped: '2025-08-30',
    reusabilityNote: 'Alert pattern is forkable for any threshold-based operational monitoring.',
    supportingMaterials: [
      {
        id: 'sm5a',
        type: 'image',
        title: 'Sample Slack Alert',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop',
        description: 'The Slack message sent to VPs when coverage drops below threshold.',
        order: 1,
      },
      {
        id: 'sm5b',
        type: 'other',
        title: 'Coverage Thresholds Runbook',
        url: 'https://notion.so/c3ai/pipeline-coverage-thresholds',
        description: 'How to adjust thresholds per segment and fiscal quarter.',
        order: 2,
      },
    ],
  },
  {
    id: 'sol6',
    title: 'Eng Incident Cost Estimator',
    problem:
      'Engineering leadership had no way to quantify the cost of incidents — downtime was tracked in PagerDuty, but the business impact (eng hours, customer ARR at risk, support load) was never rolled up.',
    solutionDescription:
      'Built an incident cost model that joins PagerDuty data with ARR exposure, support ticket surge metrics, and eng time estimates. Generates a cost report for every P1/P2 within 48 hours of resolution.',
    impactSummary:
      'Every major incident now has a quantified cost within 48 hours. Engineering and Finance use the data to prioritize reliability investments.',
    hourssaved: 120,
    dollarsSaved: 600000,
    domain: ['Engineering'],
    stack: ['Python', 'PagerDuty', 'C3 AI'],
    status: 'Shipped',
    builders: [teamMembers[1], teamMembers[4]],
    requesterOrg: 'Engineering',
    dateShipped: '2026-01-14',
    reusabilityNote: 'Cost model is forkable for any operational process where you need to attach a dollar figure to a time-series event.',
    supportingMaterials: [
      {
        id: 'sm6a',
        type: 'external_file',
        title: 'Incident Cost Model — Sample Report',
        filename: 'incident_cost_report_sample.xlsx',
        filesize: 245000,
        description: 'Anonymized sample output from a real P1 incident.',
        order: 1,
      },
      {
        id: 'sm6b',
        type: 'confluence_doc',
        title: 'Incident Cost Model Architecture',
        url: 'https://confluence.c3.ai/pages/incident-cost-model',
        description: 'Data sources, cost formulas, and update cadence.',
        order: 2,
      },
    ],
  },
  {
    id: 'sol7',
    title: 'Partner QBR Deck Automation',
    problem:
      'The Alliances team spent 2–3 days before every QBR manually compiling partner-specific metrics from Salesforce, Tableau, and email threads into a PowerPoint.',
    solutionDescription:
      'Built a data pipeline + templating system that pulls partner ARR, pipeline, co-sell activity, and support health from multiple sources and populates a standardized QBR deck template. Output is a fully formatted PPTX ready for review.',
    impactSummary: 'QBR prep time reduced from 3 days to 2 hours. Partners are receiving more consistent, data-rich decks.',
    hourssaved: 160,
    dollarsSaved: 80000,
    domain: ['GTM', 'Cross-functional'],
    stack: ['Python', 'Salesforce', 'Tableau', 'C3 AI'],
    status: 'Shipped',
    builders: [teamMembers[2], teamMembers[5]],
    requesterOrg: 'Alliances',
    dateShipped: '2026-02-20',
    reusabilityNote: 'PPTX templating approach forkable for any recurring stakeholder-facing report.',
    supportingMaterials: [
      {
        id: 'sm7a',
        type: 'external_file',
        title: 'Partner QBR Deck Template',
        filename: 'partner_qbr_template_v3.pptx',
        filesize: 1200000,
        description: 'The PowerPoint template used by the pipeline.',
        order: 1,
      },
      {
        id: 'sm7b',
        type: 'demo_video',
        title: 'QBR Automation Demo',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop',
        description: '5-minute demo of the pipeline generating a QBR deck end-to-end.',
        order: 2,
      },
    ],
  },
  {
    id: 'sol8',
    title: 'AR Collections Prioritization Engine',
    problem:
      'The Finance AR team was working collections with no systematic prioritization. High-value overdue accounts were treated the same as low-value ones, and the team had no data on which outreach method worked best.',
    solutionDescription:
      'Built a collections scoring model that ranks overdue accounts by ARR, days past due, historical pay behavior, and customer health score. Daily priority queue surfaced in a C3 dashboard. A/B tested outreach cadences are tracked for efficacy.',
    impactSummary: 'Days Sales Outstanding reduced by 8 days in 2 quarters. $4.2M in aged AR collected in Q1.',
    hourssaved: 300,
    dollarsSaved: 4200000,
    domain: ['FP&A', 'Cross-functional'],
    stack: ['Python', 'C3 AI', 'NetSuite'],
    status: 'Building',
    builders: [teamMembers[3]],
    requesterOrg: 'Finance',
    reusabilityNote: 'Collections scoring pattern is forkable for any prioritization-by-value problem.',
    supportingMaterials: [
      {
        id: 'sm8a',
        type: 'confluence_doc',
        title: 'Collections Scoring Model — Design Doc',
        url: 'https://confluence.c3.ai/pages/ar-collections-scoring',
        description: 'In-progress design document for the scoring model.',
        order: 1,
      },
    ],
  },
];

export const requests: Request[] = [
  {
    id: 'req1',
    title: 'Automate monthly commission reconciliation',
    problem:
      'Our commission reconciliation takes 3 people 2 full days every month. We pull from Salesforce, Xactly, and a manual override sheet, reconcile discrepancies, and have each rep sign off. Any automation here would be massive.',
    currentProcess:
      'Manual export from Salesforce → Xactly reconciliation spreadsheet → manual override tracking → email signoff chain.',
    affectedTeam: 'Sales Compensation',
    affectedCount: 4,
    frequency: 'Monthly',
    burdenEstimate: '6 person-days/month, ~$18k/month in analyst time',
    desiredOutcome: 'A dashboard and automated reconciliation that flags discrepancies only, reducing effort to <4 hours.',
    urgency: 'High',
    requesterName: 'Jordan Kim',
    requesterTeam: 'Sales Compensation',
    relatedLinks: ['https://docs.google.com/spreadsheets/commission-recon'],
    status: 'Triaging',
    createdAt: '2026-04-28',
    lastUpdated: '2026-04-29',
    slaDueAt: '2026-05-05',
  },
  {
    id: 'req2',
    title: 'Customer onboarding milestone tracker',
    problem:
      'Our PS team manages 20+ concurrent onboardings and has no single view of milestone status. Every update is a Slack ping to the CSM. Customers are asking for progress visibility we can\'t give.',
    currentProcess: 'Manual status updates in a shared Notion doc, updated ad hoc.',
    affectedTeam: 'Professional Services',
    affectedCount: 12,
    frequency: 'Daily',
    burdenEstimate: '~45 min/day per PM in status coordination',
    desiredOutcome:
      'A structured milestone tracker with customer-facing view and automated status updates when key events complete.',
    urgency: 'Medium',
    requesterName: 'Taylor Chen',
    requesterTeam: 'Professional Services',
    relatedLinks: [],
    status: 'Awaiting Info',
    decisionResponse: 'Thanks for submitting. We need more detail on the milestone taxonomy before we can scope this. Can you share the current milestone list and what triggers completion?',
    createdAt: '2026-04-22',
    lastUpdated: '2026-04-25',
    slaDueAt: '2026-04-29',
  },
  {
    id: 'req3',
    title: 'Marketing attribution for inbound trials',
    problem:
      'Marketing has no reliable attribution data for which campaigns are driving trial signups that convert to ARR. We\'re spending blind on paid channels.',
    currentProcess: 'UTM tracking in Hubspot with manual Salesforce matching — ~60% attribution accuracy.',
    affectedTeam: 'Marketing',
    affectedCount: 6,
    frequency: 'Weekly',
    burdenEstimate: '~4 hours/week in manual matching + $X in misspent ad budget',
    desiredOutcome: 'Full-funnel attribution from first touch to closed-won, with dashboard for CMO and channel owners.',
    urgency: 'High',
    requesterName: 'Alex Rivera',
    requesterTeam: 'Marketing',
    relatedLinks: ['https://app.hubspot.com/reports/marketing-attribution'],
    status: 'New',
    createdAt: '2026-05-02',
    lastUpdated: '2026-05-02',
    slaDueAt: '2026-05-09',
  },
];

export const stats: MarketplaceStats = {
  requestsFielded: 47,
  solutionsInProgress: 4,
  solutionsShipped: 8,
  engineerHoursSaved: 1796,
  companydollarsSaved: 7368000,
};
