const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
require('colors')

const connectDB = require('./config/db')

// Customized middlewares
const errorHandler = require('./middleware/error')
const logger = require('./middleware/logger')

// Load env variables
dotenv.config({ path: './config/config.env' })

// Connect to database
connectDB()

// Create server instance
const app = express()

// Body Parser and Cookie Parser
app.use(express.json())
app.use(cookieParser())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(logger)
  app.use(morgan('dev'))
}

// File upload
app.use(fileUpload())

// Set static folder, visit this static folder by localhost:5000/uploads
app.use(express.static(path.join(__dirname, 'public')))

// Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)

// Error handler middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue
  )
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (error, promise) => {
  console.log(`${error.name}: ${error.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
