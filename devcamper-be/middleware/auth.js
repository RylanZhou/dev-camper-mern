const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/ErrorResponse')
const User = require('../models/User')

// Protect routes
exports.protect = asyncHandler(async (request, response, next) => {
  const { authorization } = request.headers
  let token = null

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route.', 401))
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    request.user = await User.findById(decoded.id)
    next()
  } catch (error) {
    next(new ErrorResponse('Not authorized to access this route.', 401))
  }
})

// Grant access to specific roles
exports.authorize = (...roles) => (request, response, next) => {
  if (!roles.includes(request.user.role)) {
    return next(
      new ErrorResponse(
        `User role "${request.user.role}" is not authorized to access this route`,
        403
      )
    )
  }
  next()
}
