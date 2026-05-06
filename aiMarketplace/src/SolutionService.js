/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

var SOLUTION_INCLUDE = 'this,builders.this,supportingMaterials.this,originatingRequests.this';

// Catalog only shows solutions past the Queued stage.
function publishedFilter() {
  return Filter.eq('status', 'Building').or().eq('status', 'Shipped');
}

function listSolutions(domain, search, stack) {
  var filter = publishedFilter();

  if (domain) {
    filter = filter.and().paren(Filter.contains('domain', domain));
  }

  if (stack) {
    filter = filter.and().paren(Filter.contains('stack', stack));
  }

  if (search) {
    var searchFilter = Filter.containsIgnoreCase('title', search).or().containsIgnoreCase('problem', search);
    filter = filter.and().paren(searchFilter);
  }

  var result = SwatSolution.fetch({
    filter: filter,
    include: SOLUTION_INCLUDE,
    limit: -1,
  });
  return result.objs || [];
}

function getSolution(id) {
  return SwatSolution.forId(id).get(SOLUTION_INCLUDE);
}

function recentlyShipped(n) {
  var limit = n || 6;
  var result = SwatSolution.fetch({
    filter: Filter.eq('status', 'Shipped'),
    include: SOLUTION_INCLUDE,
    order: 'descending(dateShipped)',
    limit: limit,
  });
  return result.objs || [];
}

function listQueued() {
  var result = SwatSolution.fetch({
    filter: Filter.eq('status', 'Queued'),
    include: SOLUTION_INCLUDE,
    order: 'ascending(meta.created)',
    limit: -1,
  });
  return result.objs || [];
}

function updateDraft(solutionId, solutionDescription, impactSummary, hoursSaved, dollarsSaved, domain, stack, reusabilityNote) {
  var solution = SwatSolution.forId(solutionId).get('this');
  if (!solution) {
    throw new Error('SwatSolution not found with id: ' + solutionId);
  }
  return solution
    .withField('solutionDescription', solutionDescription || '')
    .withField('impactSummary', impactSummary || '')
    .withField('hoursSaved', hoursSaved || 0)
    .withField('dollarsSaved', dollarsSaved || 0)
    .withField('domain', domain || [])
    .withField('stack', stack || [])
    .withField('reusabilityNote', reusabilityNote || '')
    .merge();
}

function assignBuilders(solutionId, builderIds) {
  var solution = SwatSolution.forId(solutionId).get('this');
  if (!solution) {
    throw new Error('SwatSolution not found with id: ' + solutionId);
  }
  if (solution.status !== 'Queued') {
    throw new Error('assignBuilders only valid for Queued solutions; current status: ' + solution.status);
  }
  if (!builderIds || builderIds.length === 0) {
    throw new Error('At least one builder is required to start building.');
  }
  if (!solution.solutionDescription) {
    throw new Error('Solution description must be filled in before starting.');
  }
  if (!solution.domain || solution.domain.length === 0) {
    throw new Error('At least one domain is required before starting.');
  }
  if (!solution.stack || solution.stack.length === 0) {
    throw new Error('At least one stack item is required before starting.');
  }

  var builders = builderIds.map(function (id) { return {id: id}; });
  return solution
    .withField('builders', builders)
    .withField('status', 'Building')
    .merge();
}
