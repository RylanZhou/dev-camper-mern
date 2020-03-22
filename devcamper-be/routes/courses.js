const express = require('express')
const courseController = require('../controllers/courses')

// Set mergeParams to true in order to receive params redirected from other routers
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(courseController.getCourses)
  .post(courseController.addCourse)

router
  .route('/:id')
  .get(courseController.getCourse)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse)

module.exports = router
