import React, { useEffect, useState } from 'react';
import { incomeService } from '../services/api';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatInputDate } from '../utils/formatters';

const SOURCES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'];

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'Salary',
    date: formatInputDate(new Date()),
    description: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch incomes from API
  const fetchIncomes = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (selectedSource) filters.source = selectedSource;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const data = await incomeService.getAll(filters);
      setIncomes(data);
    } catch (err) {
      setError(err.readableMessage || 'Failed to fetch income list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [selectedSource, startDate, endDate]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleResetFilters = () => {
    setSelectedSource('');
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
      source: 'Salary',
      date: formatInputDate(new Date()),
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setIsEditing(true);
    setEditingId(income._id);
    setFormData({
      title: income.title,
      amount: income.amount,
      source: income.source,
      date: formatInputDate(income.date),
      description: income.description || ''
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
    if (!formData.source) {
      errors.source = 'Source is required';
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
        source: formData.source,
        date: formData.date,
        description: formData.description
      };

      if (isEditing) {
        await incomeService.update(editingId, payload);
      } else {
        await incomeService.add(payload);
      }

      setIsModalOpen(false);
      fetchIncomes();
    } catch (err) {
      alert(err.readableMessage || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await incomeService.delete(id);
        fetchIncomes();
      } catch (err) {
        alert(err.readableMessage || 'Failed to delete income entry');
      }
    }
  };

  // Client side search filtration matching title
  const filteredIncomes = incomes.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your revenue streams</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Income
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
            name="source"
            className="form-control filter-select"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="">All Sources</option>
            {SOURCES.map(src => (
              <option key={src} value={src}>{src}</option>
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

          {(selectedSource || startDate || endDate || search) && (
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

      {/* Income List Card */}
      <div className="card">
        {loading ? (
          <div className="spinner-center" style={{ padding: '3rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredIncomes.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income) => (
                  <tr key={income._id}>
                    <td style={{ fontWeight: 500 }}>{income.title}</td>
                    <td>
                      <span className="badge badge-income">
                        {income.source}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(income.date)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {income.description || '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      +{formatCurrency(income.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleOpenEditModal(income)}
                          aria-label="Edit Income"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-icon btn-icon-danger" 
                          onClick={() => handleDeleteIncome(income._id)}
                          aria-label="Delete Income"
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
            No income logs found matching the search criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Income Entry' : 'Add New Income'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Description</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              placeholder="e.g. Monthly Salary"
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
            <label className="form-label" htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              className="form-control"
              value={formData.source}
              onChange={handleFormChange}
              disabled={submitting}
            >
              {SOURCES.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
            {formErrors.source && <span className="form-error">{formErrors.source}</span>}
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
              {submitting ? 'Saving...' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncomePage;
