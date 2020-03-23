const crypto = require('crypto')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const ErrorResponse = require('../utils/ErrorResponse')
const User = require('../models/User')

/**
 * @description Register user
 * @route       POST /api/vi/auth/register
 * @access      Public
 */
exports.register = asyncHandler(async (request, response, next) => {
  const { name, email, password, role } = request.body

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  sendTokenResponse(user, 200, response)
})

/**
 * @description Login user
 * @route       POST /api/vi/auth/login
 * @access      Public
 */
exports.login = asyncHandler(async (request, response, next) => {
  const { email, password } = request.body

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password'), 400)
  }

  // Check for user
  // NOTE: We set field 'password' to be non-selected, but now we do want to get the password, so we have to add a '+' to forcefully get the password.
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  sendTokenResponse(user, 200, response)
})

/**
 * @description Get current logged in user
 * @route       POST /api/vi/auth/me
 * @access      Private
 */
exports.getMe = asyncHandler(async (request, response, next) => {
  // Already passed the protect middleware, so there should be a user object in request
  const user = await User.findById(request.user.id)
  response.status(200).json({
    success: true,
    data: user
  })
})

/**
 * @description Forgot password
 * @route       POST /api/vi/auth/forgot-password
 * @access      Public
 */
exports.forgotPassword = asyncHandler(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email })

  if (!user) {
    return next(new ErrorResponse('There is no user with that email.', 404))
  }

  // Generate reset token into the resetPasswordToken filed.
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset url
  const resetUrl = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/auth/reset-password/${resetToken}`

  const message = `You are receiving this email because you (or someone) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    })
  } catch (error) {
    console.log(error)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorResponse('Email could not be sent.', 500))
  }

  response.status(200).json({
    success: true,
    data: 'Email Sent.'
  })
})

/**
 * @description Reset password
 * @route       PUT /api/vi/auth/reset-password/:resettoken
 * @access      Public
 */
exports.resetPassword = asyncHandler(async (request, response, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(request.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400))
  }

  // Set new password
  user.password = request.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendTokenResponse(user, 200, response)
})

/**
 * @description Update user details
 * @route       PUT /api/vi/auth/update/info
 * @access      Private
 */
exports.updateUserInfo = asyncHandler(async (request, response, next) => {
  const fieldsToUpdate = {
    name: request.body.name,
    email: request.body.email
  }
  const user = await User.findByIdAndUpdate(request.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  })

  response.status(200).json({
    success: true,
    data: user
  })
})

/**
 * @description Update password
 * @route       PUT /api/vi/auth/update/password
 * @access      Private
 */
exports.updatePassword = asyncHandler(async (request, response, next) => {
  const user = await User.findById(request.user.id).select('+password')

  // Check current password
  if (!(await user.matchPassword(request.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401))
  }

  user.password = request.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, response)
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, response) => {
  // Create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      // 30 days
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  response
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token })
}
