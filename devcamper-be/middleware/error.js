const ErrorResponse = require('../utils/ErrorResponse')

const errorHandler = (error, request, response, next) => {
  let err = { ...error }
  err.message = error.message // ! Parent class property is not destructible

  // Log to console
  console.log(error.stack.red)

  if (error.name === 'CastError') {
    const message = `Bad Request`
    err = new ErrorResponse(message, 400)
  }

  // Mongoose duplicated key
  if (error.code === 11000) {
    const message = 'Duplicated field value detected.'
    err = new ErrorResponse(message, 400)
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(
      (eachError) => eachError.message
    )
    err = new ErrorResponse(message, 400)
  }

  response.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  })
}

module.exports = errorHandler
