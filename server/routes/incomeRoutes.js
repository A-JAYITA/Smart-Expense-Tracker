const express = require('express');
const router = express.Router();
const {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addIncome);
router.get('/all', protect, getIncome);
router.put('/update/:id', protect, updateIncome);
router.delete('/delete/:id', protect, deleteIncome);

module.exports = router;