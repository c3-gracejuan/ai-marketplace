/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function listSolutions(domain, solutionStatus, search) {
  var filter = null;

  if (domain) {
    filter = Filter.contains('domain', domain);
  }

  if (solutionStatus) {
    var statusFilter = Filter.eq('solutionStatus', solutionStatus);
    filter = filter ? filter.and().lit(statusFilter) : statusFilter;
  }

  if (search) {
    var searchFilter = Filter.containsIgnoreCase('title', search).or().containsIgnoreCase('problem', search);
    filter = filter ? filter.and().lit(searchFilter) : searchFilter;
  }

  var fetchSpec = {
    include: 'this,builders.this',
    limit: -1,
  };

  if (filter) {
    fetchSpec.filter = filter;
  }

  var result = SwatSolution.fetch(fetchSpec);
  return result.objs || [];
}

function getSolution(id) {
  return SwatSolution.forId(id).get('this,builders.this');
}

function featuredSolutions(n) {
  var limit = n || 6;
  var result = SwatSolution.fetch({
    filter: Filter.eq('featured', true),
    include: 'this,builders.this',
    order: 'descending(dateShipped)',
    limit: limit,
  });
  return result.objs || [];
}

function recentlyShipped(n) {
  var limit = n || 6;
  var result = SwatSolution.fetch({
    filter: Filter.eq('solutionStatus', 'Shipped'),
    include: 'this,builders.this',
    order: 'descending(dateShipped)',
    limit: limit,
  });
  return result.objs || [];
}
