/**
 * @description Get all bootcamps
 * @route       GET /api/vi/bootcamps
 * @access      Public
 */
exports.getBootcamps = (request, response, next) => {
  response.status(200).json({ success: true, msg: 'Display all bootcamps' })
}

/**
 * @description Get single bootcamp by id
 * @route       GET /api/vi/bootcamps/:id
 * @access      Public
 */
exports.getBootcamp = (request, response, next) => {
  response.status(200).json({ success: true, msg: 'Display a bootcamp' })
}

/**
 * @description Create new bootcamp
 * @route       POST /api/vi/bootcamps
 * @access      Private
 */
exports.createBootcamp = (request, response, next) => {
  response.status(200).json({ success: true, msg: 'Create new bootcamp' })
}

/**
 * @description Update bootcamp
 * @route       PUT /api/vi/bootcamps/:id
 * @access      Private
 */
exports.updateBootcamp = (request, response, next) => {
  response.status(200).json({ success: true, msg: 'Update bootcamp' })
}

/**
 * @description Delete bootcamp
 * @route       DELETE /api/vi/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = (request, response, next) => {
  response.status(200).json({ success: true, msg: 'Delete bootcamp' })
}
