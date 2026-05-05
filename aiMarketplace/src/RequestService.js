/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function submitRequest(title, problem, currentProcess, affectedTeam, affectedCount, burdenEstimate, desiredOutcome, requesterName, requesterTeam, relatedLinks) {
  var now = DateTime.now();

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
    status: 'New',
    createdAt: now,
    lastUpdated: now,
  }).create();
}

function decide(requestId, newStatus, response, owner) {
  var request = SwatRequest.forId(requestId).get('this');
  if (!request) {
    throw new Error('SwatRequest not found with id: ' + requestId);
  }
  return request
    .withField('status', newStatus)
    .withField('decisionResponse', response)
    .withField('assignedOwner', owner)
    .withField('lastUpdated', DateTime.now())
    .merge();
}

function listForTriage() {
  var filter = Filter.eq('status', 'New')
    .or().eq('status', 'Triaging')
    .or().eq('status', 'Awaiting Info');
  var result = SwatRequest.fetch({
    filter: filter,
    include: 'this',
    order: 'descending(createdAt)',
    limit: -1,
  });
  return result.objs || [];
}

function listInFlight() {
  var filter = Filter.eq('status', 'Triaging')
    .or().eq('status', 'Scoping')
    .or().eq('status', 'Building');
  var result = SwatRequest.fetch({
    filter: filter,
    include: 'this',
    order: 'descending(createdAt)',
    limit: -1,
  });
  return result.objs || [];
}
