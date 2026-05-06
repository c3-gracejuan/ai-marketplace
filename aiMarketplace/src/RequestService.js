/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

// Allowed status transitions. Self-edges are always allowed (response edits, no-op saves).
var ALLOWED_TRANSITIONS = {
  'Triaging': ['Triaging', 'Accepted', 'Deferred', 'Rejected'],
  'Deferred': ['Deferred', 'Triaging'],
  'Accepted': ['Accepted'],
  'Rejected': ['Rejected'],
};

function isTransitionAllowed(fromStatus, toStatus) {
  var allowed = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed) return false;
  return allowed.indexOf(toStatus) !== -1;
}

function submitRequest(title, problem, currentProcess, affectedTeam, affectedCount, burdenEstimate, desiredOutcome, requesterName, requesterTeam, relatedLinks) {
  return SwatRequest.make({
    title: title,
    problem: problem,
    currentProcess: currentProcess,
    affectedTeam: affectedTeam,
    affectedCount: affectedCount,
    burdenEstimate: burdenEstimate,
    desiredOutcome: desiredOutcome,
    requesterName: requesterName,
    requesterTeam: requesterTeam,
    relatedLinks: relatedLinks || [],
    status: 'Triaging',
    createdAt: DateTime.now(),
  }).create();
}

function decide(requestId, newStatus, response) {
  var request = SwatRequest.forId(requestId).get('this');
  if (!request) {
    throw new Error('SwatRequest not found with id: ' + requestId);
  }
  if (!isTransitionAllowed(request.status, newStatus)) {
    throw new Error('Invalid transition: ' + request.status + ' -> ' + newStatus);
  }

  var updated = request
    .withField('status', newStatus)
    .withField('decisionResponse', response)
    .merge();

  // Auto-create a stub Solution when transitioning into Accepted.
  // The engineer fills in remaining fields via the Admin Triage page's
  // "Queued Solutions" section before transitioning the Solution to Building.
  if (newStatus === 'Accepted' && request.status !== 'Accepted') {
    SwatSolution.make({
      title: request.title,
      problem: request.problem,
      status: 'Queued',
      originatingRequests: [{id: request.id}],
    }).create();
  }

  return updated;
}

function listForTriage() {
  var result = SwatRequest.fetch({
    filter: Filter.eq('status', 'Triaging'),
    include: 'this',
    order: 'ascending(createdAt)',
    limit: -1,
  });
  return result.objs || [];
}

function listAll() {
  var result = SwatRequest.fetch({
    include: 'this',
    order: 'descending(createdAt)',
    limit: -1,
  });
  return result.objs || [];
}
