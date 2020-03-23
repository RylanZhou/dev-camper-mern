const asyncHandler = require('./async')

// Make advanced results for any resources
const advancedResults = (model, populate) =>
  asyncHandler(async (request, response, next) => {
    const queryCopy = { ...request.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'limit', 'page']

    // Delete fields to be removed from query
    removeFields.forEach((param) => delete queryCopy[param])

    // Create mongoose operators ($gt, $in, $lte, etc.)
    // Query examples:
    //    averageCost[lt]=10000
    //    location.state=VT
    //    housing=true
    //    careers[in]=Mobile Development
    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    )

    let query = model.find(JSON.parse(queryStr))

    // If there is a 'select' field from the request, only pull out the specified fields.
    // Query examples:
    //    select=photos,housing
    if (request.query.select) {
      const fields = request.query.select.split(',').join(' ')
      query = query.select(fields)
    }

    // If there is a 'sort' field from the request, do sort
    // Query examples:
    //    sort=name&select=name
    if (request.query.sort) {
      const sortBy = request.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      // If not, sort by createdAt in descending
      query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(request.query.page, 10) || 1
    const limit = parseInt(request.query.limit, 10) || 25
    const startFrom = (page - 1) * limit
    const endAt = page * limit
    const total = await model.countDocuments()

    query = query.skip(startFrom).limit(limit)

    // Populate options
    if (populate) {
      query = query.populate(populate)
    }

    // Execute query
    const results = await query

    // Pagination result
    const pagination = {}
    if (endAt < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }
    if (startFrom > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    response.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    }

    next()
  })

module.exports = advancedResults
