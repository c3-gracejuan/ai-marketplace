/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function listSolutions(domain, status, search, stack, requesterOrg) {
  var filter = null;

  if (domain) {
    filter = Filter.contains('domain', domain);
  }

  if (status) {
    var statusFilter = Filter.eq('status', status);
    filter = filter ? filter.and().paren(statusFilter) : statusFilter;
  }

  if (stack) {
    var stackFilter = Filter.contains('stack', stack);
    filter = filter ? filter.and().paren(stackFilter) : stackFilter;
  }

  if (requesterOrg) {
    var orgFilter = Filter.eq('requesterOrg', requesterOrg);
    filter = filter ? filter.and().paren(orgFilter) : orgFilter;
  }

  if (search) {
    var searchFilter = Filter.containsIgnoreCase('title', search).or().containsIgnoreCase('problem', search);
    filter = filter ? filter.and().paren(searchFilter) : searchFilter;
  }

  var fetchSpec = {
    include: 'this,builders.this,supportingMaterials.this',
    limit: -1,
  };

  if (filter) {
    fetchSpec.filter = filter;
  }

  var result = SwatSolution.fetch(fetchSpec);
  return result.objs || [];
}

function getSolution(id) {
  return SwatSolution.forId(id).get('this,builders.this,supportingMaterials.this');
}

function featuredSolutions(n) {
  var limit = n || 3;
  var result = SwatSolution.fetch({
    filter: Filter.eq('featured', true),
    include: 'this,builders.this,supportingMaterials.this',
    order: 'descending(dateShipped)',
    limit: limit,
  });
  return result.objs || [];
}

function recentlyShipped(n) {
  var limit = n || 6;
  var result = SwatSolution.fetch({
    filter: Filter.eq('status', 'Shipped'),
    include: 'this,builders.this,supportingMaterials.this',
    order: 'descending(dateShipped)',
    limit: limit,
  });
  return result.objs || [];
}
