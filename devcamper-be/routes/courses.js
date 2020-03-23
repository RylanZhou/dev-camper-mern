const express = require('express')
const courseController = require('../controllers/courses')
const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')

// Set mergeParams to true in order to receive params redirected from other routers
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(
    advancedResults(
      Course,
      // query = query.populate('bootcamp') // Together with entire bootcamp data
      // or specify the fields to pull out from bootcamp
      {
        path: 'bootcamp',
        select: 'name description'
      }
    ),
    courseController.getCourses
  )
  .post(courseController.addCourse)

router
  .route('/:id')
  .get(courseController.getCourse)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse)

module.exports = router
