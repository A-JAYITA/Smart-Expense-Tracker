const Income = require('../models/Income');

/**
 * @desc    Add a new income entry
 * @route   POST /api/income/add
 * @access  Private
 */
const addIncome = async (req, res, next) => {
  const { title, amount, source, description, date } = req.body;

  try {
    if (!title || amount === undefined || !source) {
      res.status(400);
      throw new Error('Please fill all required fields: title, amount, source');
    }

    const income = await Income.create({
      userId: req.user._id,
      title,
      amount,
      source,
      description,
      date: date || Date.now()
    });

    res.status(201).json(income);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all income entries for the logged-in user with filters
 * @route   GET /api/income/all
 * @access  Private
 */
const getIncome = async (req, res, next) => {
  try {
    const { source, startDate, endDate } = req.query;
    
    // Base query only fetching the logged-in user's data
    const query = { userId: req.user._id };

    // Apply source filter
    if (source) {
      query.source = source;
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

    const income = await Income.find(query).sort({ date: -1 });
    res.status(200).json(income);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing income entry
 * @route   PUT /api/income/update/:id
 * @access  Private
 */
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income entry not found');
    }

    // Check if the income entry belongs to the logged-in user
    if (income.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this income entry');
    }

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // ensures validation checks are run on update
    );

    res.status(200).json(updatedIncome);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an income entry
 * @route   DELETE /api/income/delete/:id
 * @access  Private
 */
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income entry not found');
    }

    // Check if the income entry belongs to the logged-in user
    if (income.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this income entry');
    }

    await Income.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
};