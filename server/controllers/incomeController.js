const Income = require('../models/Income');

// Add Income
const addIncome = async (req, res) => {
  const { title, amount, source, description, date } = req.body;

  try {
    if (!title || !amount || !source) {
      return res.status(400).json({ message: 'Please fill all required fields' });
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
    res.status(500).json({ message: error.message });
  }
};

// Get All Income
const getIncome = async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user._id })
      .sort({ date: -1 });

    res.status(200).json(income);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Income
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedIncome);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Income
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Income.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Income deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
};