const asyncHandler = require('../middleware/async')
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
