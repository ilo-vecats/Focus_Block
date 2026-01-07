/**
 * Pagination helper
 * Returns paginated results with metadata
 */
const paginate = async (Model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = null
  } = options;

  const skip = (page - 1) * limit;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    Model.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    }
  };
};

module.exports = { paginate };

