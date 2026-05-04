/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function addBusinessDays(dateTime, days) {
  var result = dateTime;
  var added = 0;
  while (added < days) {
    result = result.plusDays(1);
    var dow = result.dayOfWeek(); // 1=Mon … 7=Sun
    if (dow !== 6 && dow !== 7) {
      added++;
    }
  }
  return result;
}

function submitRequest(title, problem, currentProcess, affectedTeam, affectedCount, frequency, burdenEstimate, desiredOutcome, urgency, requesterName, requesterTeam, relatedLinks) {
  var now = DateTime.now();
  var slaDueAt = addBusinessDays(now, 5);

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
    status: 'New',
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
    order: 'ascending(slaDueAt)',
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
    order: 'ascending(slaDueAt)',
    limit: -1,
  });
  return result.objs || [];
}
