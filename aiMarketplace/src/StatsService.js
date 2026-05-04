/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

function landingStats() {
  var requestsFielded = SwatRequest.fetchCount();

  var solutionsShipped = SwatSolution.fetchCount({
    filter: Filter.eq('status', 'Shipped'),
  });

  var inProgressFilter = Filter.eq('status', 'Building')
    .or().eq('status', 'Scoping')
    .or().eq('status', 'Triaging');

  var solutionsInProgress = SwatSolution.fetchCount({
    filter: inProgressFilter,
  });

  var shippedObjs = SwatSolution.fetch({
    filter: Filter.eq('status', 'Shipped'),
    include: 'hoursSaved,dollarsSaved',
    limit: -1,
  }).objs || [];

  var engineerHoursSaved = 0;
  var companyDollarsSaved = 0;
  shippedObjs.forEach(function (sol) {
    if (sol.hoursSaved) engineerHoursSaved += sol.hoursSaved;
    if (sol.dollarsSaved) companyDollarsSaved += sol.dollarsSaved;
  });

  return MarketplaceStats.make({
    requestsFielded: requestsFielded,
    solutionsInProgress: solutionsInProgress,
    solutionsShipped: solutionsShipped,
    engineerHoursSaved: engineerHoursSaved,
    companyDollarsSaved: companyDollarsSaved,
  });
}
