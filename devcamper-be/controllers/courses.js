const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

/**
 * @description Get all courses
 * @route       GET /api/v1/courses
 * @route       GET /api/v1/bootcamps/:bootcampId/courses
 * @access      Public
 */
exports.getCourses = asyncHandler(async (request, response, next) => {
  if (request.params.bootcampId) {
    const courses = await Course.find({ bootcamp: request.params.bootcampId })

    return response.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    response.status(200).json(response.advancedResults)
  }

  next()
})

/**
 * @description Get single course by Id
 * @route       GET /api/v1/courses/:id
 * @access      Public
 */
exports.getCourse = asyncHandler(async (request, response, next) => {
  const course = await Course.findById(request.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${request.params.id}`, 404)
    )
  }

  response.status(200).json({
    success: true,
    data: course
  })
})

/**
 * @description Add a course under a bootcamp
 * @route       POST /api/v1/bootcamps/:bootcampId/courses
 * @access      Private
 */
exports.addCourse = asyncHandler(async (request, response, next) => {
  // Have already passed the protect middleware so there should be userId in the request
  request.body.user = request.user.id
  request.body.bootcamp = request.params.bootcampId

  const bootcamp = await Bootcamp.findById(request.params.bootcampId)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id ${request.params.bootcampId}`, 404)
    )
  }

  // Make sure user is bootcamp owner
  // ! bootcamp.user is an ObjectId so we have to convert it to string
  if (
    bootcamp.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}.`,
        401
      )
    )
  }

  const course = await Course.create(request.body)

  response.status(200).json({
    success: true,
    data: course
  })
})

/**
 * @description Update a course
 * @route       POST /api/v1/courses/:id
 * @access      Private
 */
exports.updateCourse = asyncHandler(async (request, response, next) => {
  let course = await Course.findById(request.params.id)

  if (!course) {
    return next(
      new ErrorResponse(`No course with id ${request.params.id}`, 404)
    )
  }

  // Make sure user is course owner
  // ! course.user is an ObjectId so we have to convert it to string
  if (
    course.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to update course ${course._id}.`,
        401
      )
    )
  }

  course = await Course.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  })

  response.status(200).json({
    success: true,
    data: course
  })
})

/**
 * @description Delete course
 * @route       DELETE /api/vi/courses/:id
 * @access      Private
 */
exports.deleteCourse = asyncHandler(async (request, response, next) => {
  const course = await Course.findById(request.params.id)

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${request.params.id}`, 404)
    )
  }

  // Make sure user is course owner
  // ! course.user is an ObjectId so we have to convert it to string
  if (
    course.user.toString() !== request.user.id &&
    request.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${request.user.id} is not authorized to delete course ${course._id}.`,
        401
      )
    )
  }

  // In order to trigger the pre('remove') hook. findByIdAndDelete will not trigger.
  await course.remove()

  response.status(200).json({ success: true, data: course })
})
