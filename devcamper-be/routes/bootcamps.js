const express = require('express')
const bootcampController = require('../controllers/bootcamps')
const router = express.Router()

// Include other resource routers
const courseRouter = require('./courses')

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
  .route('/')
  .get(bootcampController.getBootcamps)
  .post(bootcampController.createBootcamp)

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .put(bootcampController.updateBootcamp)
  .delete(bootcampController.deleteBootcamp)

router
  .route('/radius/:zipcode/:distance')
  .get(bootcampController.getBootcampsInRadius)

module.exports = router
