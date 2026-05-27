const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, expenseController.addExpense);
router.get('/all', protect, expenseController.getExpenses);
router.put('/update/:id', protect, expenseController.updateExpense);
router.delete('/delete/:id', protect, expenseController.deleteExpense);
router.get('/category/:category', protect, expenseController.getExpensesByCategory);

module.exports = router;