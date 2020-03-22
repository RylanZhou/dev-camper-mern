const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

/**
 * @description Get all bootcamps
 * @route       GET /api/vi/bootcamps
 * @access      Public
 */
exports.getBootcamps = asyncHandler(async (request, response, next) => {
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
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  let query = Bootcamp.find(JSON.parse(queryStr))

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
  const total = await Bootcamp.countDocuments()

  query = query.skip(startFrom).limit(limit)

  // Execute query
  const bootcamps = await query

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

  response.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  })
})

/**
 * @description Get single bootcamp by id
 * @route       GET /api/vi/bootcamps/:id
 * @access      Public
 */
exports.getBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findById(request.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }
  response.status(200).json({ success: true, data: bootcamp })
})

/**
 * @description Get bootcamps within a radius
 * @route       GET /api/vi/bootcamps/radius/:zipcode/:distance
 * @access      Private
 */
exports.getBootcampsInRadius = asyncHandler(async (request, response, next) => {
  const { zipcode, distance } = request.params

  // Get lat/lng from geocoder
  const location = await geocoder.geocode(zipcode)
  const { latitude, longitude } = location[0]

  // Calc radius using radians: Divide distance by radius of Earth
  // Earth Radius = 3,963 miles = 6,378 km
  const radius = distance / 6378
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius]
      }
    }
  })

  response.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})

/**
 * @description Create new bootcamp
 * @route       POST /api/vi/bootcamps
 * @access      Private
 */
exports.createBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.create(request.body)
  response.status(201).json({
    success: true,
    data: bootcamp
  })
})

/**
 * @description Update bootcamp
 * @route       PUT /api/vi/bootcamps/:id
 * @access      Private
 */
exports.updateBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true }
  )

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }

  response.status(200).json({ success: true, data: bootcamp })
})

/**
 * @description Delete bootcamp
 * @route       DELETE /api/vi/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(request.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }

  response.status(200).json({ success: true, data: bootcamp })
})
