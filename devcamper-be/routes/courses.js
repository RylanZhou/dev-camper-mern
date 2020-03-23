const express = require('express')
const courseController = require('../controllers/courses')
const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')
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
  .post(protect, authorize('publisher', 'admin'), courseController.addCourse)

router
  .route('/:id')
  .get(courseController.getCourse)
  .put(protect, authorize('publisher', 'admin'), courseController.updateCourse)
  .delete(
    protect,
    authorize('publisher', 'admin'),
    courseController.deleteCourse
  )

module.exports = router
