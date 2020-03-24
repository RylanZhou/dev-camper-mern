const express = require('express')
const userController = require('../controllers/users')
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.use(protect, authorize('admin'))

router
  .route('/')
  .get(advancedResults(User), userController.getUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
