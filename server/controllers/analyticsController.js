const Expense = require('../models/Expense');
const Income = require('../models/Income');

/**
 * @desc    Get dashboard summary (total balance, total income, total expenses, recent transactions)
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate total income
    const totalIncomeResult = await Income.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;

    // Aggregate total expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;

    // Balance
    const balance = totalIncome - totalExpenses;

    // Recent transactions (fetch last 5 income and last 5 expenses, merge and sort)
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();
    
    const recentIncome = await Income.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Map items to include a 'type' field to distinguish them easily in client dashboards
    const expensesWithType = recentExpenses.map(item => ({ ...item, type: 'expense' }));
    const incomeWithType = recentIncome.map(item => ({ ...item, type: 'income' }));

    // Combine and sort by date descending, then cap at 5 total entries
    const recentTransactions = [...expensesWithType, ...incomeWithType]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.status(200).json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monthly income vs expenses trends
 * @route   GET /api/analytics/monthly
 * @access  Private
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Monthly expenses pipeline grouping by Year & Month
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalExpenses: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Monthly income pipeline grouping by Year & Month
    const monthlyIncome = await Income.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalIncome: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Combine monthly data arrays into a single dictionary
    const trendsMap = {};

    monthlyIncome.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      trendsMap[key] = {
        year: item._id.year,
        month: item._id.month,
        income: item.totalIncome,
        expenses: 0
      };
    });

    monthlyExpenses.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (trendsMap[key]) {
        trendsMap[key].expenses = item.totalExpenses;
      } else {
        trendsMap[key] = {
          year: item._id.year,
          month: item._id.month,
          income: 0,
          expenses: item.totalExpenses
        };
      }
    });

    // Convert map to array sorted chronologically (newest first)
    const monthlyTrends = Object.values(trendsMap).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    res.status(200).json(monthlyTrends);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category-wise breakdowns for expenses and source-wise breakdowns for income
 * @route   GET /api/analytics/category-breakdown
 * @access  Private
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Group expenses by category
    const expenseBreakdown = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Group income by source
    const incomeBreakdown = await Income.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      expenses: expenseBreakdown.map(item => ({
        category: item._id,
        totalAmount: item.totalAmount,
        count: item.count
      })),
      income: incomeBreakdown.map(item => ({
        source: item._id,
        totalAmount: item.totalAmount,
        count: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getMonthlyTrends,
  getCategoryBreakdown
};
