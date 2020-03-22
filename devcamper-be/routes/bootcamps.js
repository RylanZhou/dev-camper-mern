const express = require('express')
const bootcampController = require('../controllers/bootcamp')
const router = express.Router()

router
  .route('/')
  .get(bootcampController.getBootcamps)
  .post(bootcampController.createBootcamp)

router
  .route('/:id')
  .put(bootcampController.updateBootcamp)
  .delete(bootcampController.deleteBootcamp)

module.exports = router
