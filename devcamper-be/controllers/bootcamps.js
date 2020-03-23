const path = require('path')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

/**
 * @description Get all bootcamps
 * @route       GET /api/vi/bootcamps
 * @access      Public
 */
exports.getBootcamps = (request, response, next) => {
  response.status(200).json(response.advancedResults)
}

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
  let bootcamp = await Bootcamp.findById(request.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  })

  response.status(200).json({ success: true, data: bootcamp })
})

/**
 * @description Delete bootcamp
 * @route       DELETE /api/vi/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = asyncHandler(async (request, response, next) => {
  const bootcamp = await Bootcamp.findById(request.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }

  // In order to trigger the pre('remove') hook. findByIdAndDelete will not trigger.
  await bootcamp.remove()

  response.status(200).json({ success: true, data: bootcamp })
})

/**
 * @description Upload photo for bootcamp
 * @route       PUT /api/vi/bootcamps/:id/photo
 * @access      Private
 */
exports.uploadBootcampPhoto = asyncHandler(async (request, response, next) => {
  if (!request.files) {
    next(new ErrorResponse('Please upload a file', 400))
  }

  const bootcamp = await Bootcamp.findById(request.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${request.params.id}`,
        404
      )
    )
  }

  const { file } = request.files

  // Make sure the file is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Unsupported file type`, 415))
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorResponse(`File is too large`), 400)
  }

  // Create custom filename, photo_5d725a1b7b292f5f8ceff788.jpg
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
    if (error) {
      console.log(error)
      return next(new ErrorResponse('Problem with uploading.', 500))
    }

    await Bootcamp.findByIdAndUpdate(request.params.id, { photo: file.name })

    response.status(200).json({
      success: true,
      data: file.name
    })
  })
})
