const ErrorResponse = require('../utils/ErrorResponse')

const errorHandler = (error, request, response, next) => {
  let err = { ...error }

  // Log to console
  console.log(error.stack.red)

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = `Resource not found with id of ${error.value}`
    err = new ErrorResponse(message, 404)
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
