function getPaginationParams(req) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
  
  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, Math.min(pageSize, 100)),
    offset: (page - 1) * pageSize
  };
}

function getSortParams(req, defaultSortBy = 'created_at', defaultSortOrder = 'DESC') {
  const sortBy = req.query.sortBy || req.query.sort_by || defaultSortBy;
  const sortOrder = (req.query.sortOrder || req.query.sort_order || defaultSortOrder).toUpperCase();
  
  if (!['ASC', 'DESC'].includes(sortOrder)) {
    return {
      sortBy,
      sortOrder: defaultSortOrder
    };
  }
  
  return {
    sortBy,
    sortOrder
  };
}

function buildPaginationResponse(data, total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    data: data
  };
}

module.exports = {
  getPaginationParams,
  getSortParams,
  buildPaginationResponse
};
