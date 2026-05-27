const express = require('express');
const router = express.Router();
const {
  getSummary,
  getMonthlyTrends,
  getCategoryBreakdown
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard endpoints mapping
router.get('/summary', protect, getSummary);
router.get('/monthly', protect, getMonthlyTrends);
router.get('/category-breakdown', protect, getCategoryBreakdown);

module.exports = router;
