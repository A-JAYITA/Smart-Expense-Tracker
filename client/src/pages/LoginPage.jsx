import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await login(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">ET</div>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your budget tracker</p>
        </div>

        {serverError && (
          <div className="alert alert-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
