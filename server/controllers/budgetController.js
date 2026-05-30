const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

/**
 * @desc    Get all budgets for a specific month and year
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    const budgets = await Budget.find({ userId, month, year });
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set or update a budget limit for a category and month/year
 * @route   POST /api/budgets
 * @access  Private
 */
const setBudget = async (req, res, next) => {
  const { category, limit, month, year } = req.body;

  try {
    if (!category || limit === undefined || !month || !year) {
      res.status(400);
      throw new Error('Please fill all fields: category, limit, month, year');
    }

    const userId = req.user._id;

    // Create or update existing budget settings
    const budget = await Budget.findOneAndUpdate(
      { userId, category, month, year },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a budget limit setting
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this budget limit');
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Budget limit removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get status of budgets against current expenditures
 * @route   GET /api/budgets/status
 * @access  Private
 */
const getBudgetStatus = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    // Define current month boundaries
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch budget definitions
    const budgets = await Budget.find({ userId, month, year });

    // Aggregate monthly expenses by category
    const expensesGrouped = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    // Construct spent values dictionary map
    const spentMap = {};
    let totalSpent = 0;

    expensesGrouped.forEach(item => {
      spentMap[item._id] = item.totalSpent;
      totalSpent += item.totalSpent;
    });

    // Map each budget item to current usage metrics
    const budgetStatuses = budgets.map(budget => {
      const spent = spentMap[budget.category] || 0;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      let status = 'normal';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 90) status = 'warning_90';
      else if (percentage >= 75) status = 'warning_75';

      return {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        spent,
        percentage: parseFloat(percentage.toFixed(2)),
        status
      };
    });

    // Calculate overall budget progress
    const overallBudget = budgets.find(b => b.category === 'Overall');
    let overallStatus = null;

    if (overallBudget) {
      const spent = totalSpent;
      const limit = overallBudget.limit;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      let status = 'normal';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 90) status = 'warning_90';
      else if (percentage >= 75) status = 'warning_75';

      overallStatus = {
        limit,
        spent,
        percentage: parseFloat(percentage.toFixed(2)),
        status
      };
    } else {
      overallStatus = {
        limit: 0,
        spent: totalSpent,
        percentage: 0,
        status: 'normal'
      };
    }

    // Compile active notification warnings
    const alerts = [];

    budgetStatuses.forEach(item => {
      if (item.category === 'Overall') return;
      
      if (item.status === 'exceeded') {
        alerts.push({
          category: item.category,
          type: 'danger',
          message: `Budget Exceeded: Spent $${item.spent.toFixed(2)} of your $${item.limit.toFixed(2)} limit for ${item.category}.`
        });
      } else if (item.status === 'warning_90') {
        alerts.push({
          category: item.category,
          type: 'warning',
          message: `Critical Alert (90%): Spent $${item.spent.toFixed(2)} of your $${item.limit.toFixed(2)} limit for ${item.category}.`
        });
      } else if (item.status === 'warning_75') {
        alerts.push({
          category: item.category,
          type: 'info',
          message: `Warning (75%): Spent $${item.spent.toFixed(2)} of your $${item.limit.toFixed(2)} limit for ${item.category}.`
        });
      }
    });

    if (overallBudget && overallStatus) {
      if (overallStatus.status === 'exceeded') {
        alerts.push({
          category: 'Overall',
          type: 'danger',
          message: `Overall Limit Exceeded: Total spending has reached $${totalSpent.toFixed(2)} (Limit: $${overallStatus.limit.toFixed(2)}).`
        });
      } else if (overallStatus.status === 'warning_90') {
        alerts.push({
          category: 'Overall',
          type: 'warning',
          message: `Overall Budget Warning (90%): Total spending has reached $${totalSpent.toFixed(2)} (Limit: $${overallStatus.limit.toFixed(2)}).`
        });
      } else if (overallStatus.status === 'warning_75') {
        alerts.push({
          category: 'Overall',
          type: 'info',
          message: `Overall Budget Warning (75%): Total spending has reached $${totalSpent.toFixed(2)} (Limit: $${overallStatus.limit.toFixed(2)}).`
        });
      }
    }

    res.status(200).json({
      month,
      year,
      budgets: budgetStatuses,
      overallStatus,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
  getBudgetStatus
};
