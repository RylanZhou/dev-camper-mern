const express = require('express')
const reviewController = require('../controllers/reviews')
const Review = require('../models/Review')
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    reviewController.getReviews
  )
  .post(protect, authorize('user', 'admin'), reviewController.createReview)

router
  .route('/:id')
  .get(reviewController.getReview)
  .put(protect, authorize('user', 'admin'), reviewController.updateReview)
  .delete(protect, authorize('user', 'admin'), reviewController.deleteReview)

module.exports = router
