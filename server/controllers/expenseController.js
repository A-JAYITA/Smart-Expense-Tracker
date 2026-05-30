const Expense = require('../models/Expense');

/**
 * @desc    Add a new expense
 * @route   POST /api/expenses/add
 * @access  Private
 */
const addExpense = async (req, res, next) => {
  const { title, amount, category, description, date } = req.body;

  try {
    if (!title || amount === undefined || !category) {
      res.status(400);
      throw new Error('Please fill all required fields: title, amount, category');
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all expenses for the logged-in user with filters
 * @route   GET /api/expenses/all
 * @access  Private
 * @query   category, startDate, endDate, month, year
 */
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, month, year } = req.query;

    // Base query — only the logged-in user's data
    const query = { userId: req.user._id };

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Priority: explicit date range > month+year shortcut > year-only
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          res.status(400);
          throw new Error('Invalid start date format (use YYYY-MM-DD)');
        }
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          res.status(400);
          throw new Error('Invalid end date format (use YYYY-MM-DD)');
        }
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else if (month && year) {
      // Auto-generate boundaries for the entire month
      const m = parseInt(month);
      const y = parseInt(year);
      query.date = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59, 999)
      };
    } else if (year) {
      // Year-only filter
      const y = parseInt(year);
      query.date = {
        $gte: new Date(y, 0, 1),
        $lte: new Date(y, 11, 31, 23, 59, 59, 999)
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing expense
 * @route   PUT /api/expenses/update/:id
 * @access  Private
 */
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this expense');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExpense);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/delete/:id
 * @access  Private
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this expense');
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expenses by category
 * @route   GET /api/expenses/category/:category
 * @access  Private
 */
const getExpensesByCategory = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      userId: req.user._id,
      category: req.params.category
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpensesByCategory
};