const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

/**
 * @description Get reviews
 * @route       GET /api/vi/reviews
 * @route       GET /api/vi/bootcamps/:bootcampId/reviews
 * @access      Public
 */
exports.getReviews = asyncHandler(async (request, response, next) => {
  if (request.params.bootcampId) {
    console.log(request.params.bootcampId)

    const reviews = await Review.find({ bootcamp: request.params.bootcampId })

    return response.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  }
  response.status(200).json(response.advancedResults)
})

/**
 * @description Get single review
 * @route       GET /api/vi/reviews/:id
 * @access      Public
 */
exports.getReview = asyncHandler(async (request, response, next) => {
  const review = await Review.findById(request.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if (!review) {
    return next(
      new ErrorResponse(`Review with id ${request.params.id} not found`, 404)
    )
  }

  response.status(200).json({
    success: true,
    data: review
  })
})

/**
 * @description Add review
 * @route       POST /api/vi/bootcamps/:bootcampId/reviews
 * @access      Private
 */
exports.createReview = asyncHandler(async (request, response, next) => {
  request.body.bootcamp = request.params.bootcampId
  request.body.user = request.user.id

  const bootcamp = await Bootcamp.findById(request.params.bootcampId)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${request.params.bootcampId} not found`,
        404
      )
    )
  }

  const review = await Review.create(request.body)

  response.status(201).json({
    success: true,
    data: review
  })
})

/**
 * @description Update review
 * @route       PUT /api/vi/reviews/:id
 * @access      Private
 */
exports.updateReview = asyncHandler(async (request, response, next) => {
  let review = await Review.findById(request.params.id)

  if (!review) {
    return next(
      new ErrorResponse(`Review with id ${request.params.id} not found`, 404)
    )
  }

  // Make sure review belongs to user or the user is admin
  if (
    review.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(new ErrorResponse('Not authorized to update this review', 401))
  }

  review = await Review.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  })

  response.status(200).json({
    success: true,
    data: review
  })
})

/**
 * @description Delete review
 * @route       DELETE /api/vi/reviews/:id
 * @access      Private
 */
exports.deleteReview = asyncHandler(async (request, response, next) => {
  const review = await Review.findById(request.params.id)

  if (!review) {
    return next(
      new ErrorResponse(`Review with id ${request.params.id} not found`, 404)
    )
  }

  await review.remove()

  response.status(200).json({
    success: true,
    data: review
  })
})
