/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function submitRequest(title, problem, currentProcess, affectedTeam, affectedCount, frequency, burdenEstimate, desiredOutcome, urgency, requesterName, requesterTeam, relatedLinks) {
  var now = DateTime.now();
  var slaDueAt = now.plusDays(7); // Approximation for 5 business days

  return SwatRequest.make({
    title: title,
    problem: problem,
    currentProcess: currentProcess,
    affectedTeam: affectedTeam,
    affectedCount: affectedCount,
    frequency: frequency,
    burdenEstimate: burdenEstimate,
    desiredOutcome: desiredOutcome,
    urgency: urgency,
    requesterName: requesterName,
    requesterTeam: requesterTeam,
    relatedLinks: relatedLinks || [],
    requestStatus: 'New',
    createdAt: now,
    lastUpdated: now,
    slaDueAt: slaDueAt,
  }).create();
}

function decide(requestId, newStatus, response, owner) {
  var request = SwatRequest.forId(requestId).get('this');
  if (!request) {
    throw new Error('SwatRequest not found with id: ' + requestId);
  }
  return request
    .withField('requestStatus', newStatus)
    .withField('decisionResponse', response)
    .withField('assignedOwner', owner)
    .withField('lastUpdated', DateTime.now())
    .merge();
}

function listForTriage() {
  var result = SwatRequest.fetch({
    include: 'this',
    order: 'descending(createdAt)',
    limit: -1,
  });
  return result.objs || [];
}
