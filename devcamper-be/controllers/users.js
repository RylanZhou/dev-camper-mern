const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/ErrorResponse')
const User = require('../models/User')

/**
 * @description Get all users
 * @route       GET /api/vi/users
 * @access      Private/Admin
 */
exports.getUsers = asyncHandler(async (request, response, next) => {
  response.status(200).json(response.advancedResults)
})

/**
 * @description Get single user
 * @route       GET /api/vi/users/:id
 * @access      Private/Admin
 */
exports.getUser = asyncHandler(async (request, response, next) => {
  const user = await User.findById(request.params.id)

  if (!user) {
    return next(
      new ErrorResponse(`User with id ${request.params.id} not found.`, 404)
    )
  }

  response.status(200).json({
    success: true,
    data: user
  })
})

/**
 * @description Create user
 * @route       POST /api/vi/users
 * @access      Private/Admin
 */
exports.createUser = asyncHandler(async (request, response, next) => {
  const user = await User.create(request.body)

  response.status(201).json({
    success: true,
    data: user
  })
})

/**
 * @description Update user
 * @route       PUT /api/vi/users/:id
 * @access      Private/Admin
 */
exports.updateUser = asyncHandler(async (request, response, next) => {
  const user = await User.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  })

  response.status(200).json({
    success: true,
    data: user
  })
})

/**
 * @description Delete user
 * @route       DELETE /api/vi/users/:id
 * @access      Private/Admin
 */
exports.deleteUser = asyncHandler(async (request, response, next) => {
  const user = await User.findByIdAndRemove(request.params.id)

  response.status(200).json({
    success: true,
    data: user
  })
})
