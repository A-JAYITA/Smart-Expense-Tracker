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
 */
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    
    // Base query only fetching the logged-in user's data
    const query = { userId: req.user._id };

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply date range filters
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
        // Set end time to 23:59:59.999 to cover the complete end day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
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

    // Check if the expense belongs to the logged-in user
    if (expense.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this expense');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // runValidators: true ensures Mongoose schema validation still runs on updates
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

    // Check if the expense belongs to the logged-in user
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