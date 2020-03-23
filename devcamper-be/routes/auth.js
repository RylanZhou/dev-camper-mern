const express = require('express')
const authController = require('../controllers/auth')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', protect, authController.getMe)
router.post('/forgot-password', authController.forgotPassword)
router.put('/reset-password/:resettoken', authController.resetPassword)
router.put('/update/info', protect, authController.updateUserInfo)
router.put('/update/password', protect, authController.updatePassword)

module.exports = router
