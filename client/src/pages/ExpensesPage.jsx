import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/api';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatInputDate } from '../utils/formatters';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: formatInputDate(new Date()),
    description: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch expenses from API
  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const data = await expenseService.getAll(filters);
      setExpenses(data);
    } catch (err) {
      setError(err.readableMessage || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, startDate, endDate]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      date: formatInputDate(new Date()),
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setIsEditing(true);
    setEditingId(expense._id);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: formatInputDate(expense.date),
      description: expense.description || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (formData.amount === '' || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description
      };

      if (isEditing) {
        await expenseService.update(editingId, payload);
      } else {
        await expenseService.add(payload);
      }

      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      alert(err.readableMessage || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        fetchExpenses();
      } catch (err) {
        alert(err.readableMessage || 'Failed to delete expense');
      }
    }
  };

  // Client-side search filtration matching title
  const filteredExpenses = expenses.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your spending habits</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Expense
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="filter-panel">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by description..."
            value={search}
            onChange={handleSearchChange}
          />

          <select
            name="category"
            className="form-control filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '150px', padding: '0.5rem' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '150px', padding: '0.5rem' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(selectedCategory || startDate || endDate || search) && (
            <button className="btn btn-secondary" onClick={handleResetFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Expense List Card */}
      <div className="card">
        {loading ? (
          <div className="spinner-center" style={{ padding: '3rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td style={{ fontWeight: 500 }}>{expense.title}</td>
                    <td>
                      <span className={`badge badge-category-${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(expense.date)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {expense.description || '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleOpenEditModal(expense)}
                          aria-label="Edit Expense"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-icon btn-icon-danger" 
                          onClick={() => handleDeleteExpense(expense._id)}
                          aria-label="Delete Expense"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expenses found matching the search criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Description</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              placeholder="e.g. Weekly Groceries"
              value={formData.title}
              onChange={handleFormChange}
              disabled={submitting}
            />
            {formErrors.title && <span className="form-error">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              className="form-control"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleFormChange}
              disabled={submitting}
            />
            {formErrors.amount && <span className="form-error">{formErrors.amount}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleFormChange}
              disabled={submitting}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {formErrors.category && <span className="form-error">{formErrors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleFormChange}
              disabled={submitting}
            />
            {formErrors.date && <span className="form-error">{formErrors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Notes (Optional)</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Additional details..."
              rows="3"
              style={{ resize: 'none' }}
              value={formData.description}
              onChange={handleFormChange}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
