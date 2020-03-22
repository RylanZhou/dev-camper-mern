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
  let query = null

  if (request.params.bootcampId) {
    query = Course.find({ bootcamp: request.params.bootcampId })
  } else {
    query = Course.find()
  }
  // query = query.populate('bootcamp') // Together with entire bootcamp data
  // or specify the fields to pull out from bootcamp
  query = query.populate({
    path: 'bootcamp',
    select: 'name description'
  })

  const courses = await query

  response.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  })
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
  request.body.bootcamp = request.params.bootcampId

  const bootcamp = await Bootcamp.findById(request.params.bootcampId)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id ${request.params.bootcampId}`)
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
    return next(new ErrorResponse(`No course with id ${request.params.id}`))
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

  // In order to trigger the pre('remove') hook. findByIdAndDelete will not trigger.
  await course.remove()

  response.status(200).json({ success: true, data: course })
})
