import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/api';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Color Palette for Pie Chart segments
const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444', // Red
  '#64748b'  // Slate
];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Run all API calls concurrently
        const [summaryRes, trendsRes, breakdownRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getMonthlyTrends(),
          analyticsService.getCategoryBreakdown()
        ]);

        setSummary(summaryRes);

        // Format Monthly Trends: e.g., { name: 'May 2026', Income: 5000, Expenses: 1200 }
        // Reverse trend array to render chronologically left-to-right (oldest to newest)
        const formattedTrends = [...trendsRes]
          .reverse()
          .map(item => ({
            name: `${monthNames[item.month - 1]} ${item.year}`,
            Income: item.income,
            Expenses: item.expenses
          }));
        setMonthlyTrends(formattedTrends);

        // Format Category breakdown: map category name and totalAmount
        const formattedCategories = breakdownRes.expenses.map(item => ({
          name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          value: item.totalAmount
        }));
        setCategoryData(formattedCategories);
        
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err.readableMessage || 'Could not fetch dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your financial control center</p>
        </div>
      </div>

      {/* Summary StatCards */}
      <div className="metrics-grid">
        <StatCard 
          title="Total Income" 
          value={summary?.totalIncome || 0} 
          type="income" 
          subText="All accrued earnings"
        />
        <StatCard 
          title="Total Expenses" 
          value={summary?.totalExpenses || 0} 
          type="expense" 
          subText="All recorded spending"
        />
        <StatCard 
          title="Net Balance" 
          value={summary?.balance || 0} 
          type="balance" 
          subText="Remaining savings"
        />
      </div>

      {/* Charts Visualization Section */}
      <div className="charts-grid">
        {/* Monthly Trend Chart */}
        <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 700 }}>Income vs Expenses</h2>
          <div style={{ flexGrow: 1, width: '100%', minHeight: '300px' }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 14%)', 
                      borderColor: 'var(--card-border)', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No transaction trends available. Add some records to see charts.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 700 }}>Expense Breakdown</h2>
          <div style={{ flexGrow: 1, width: '100%', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 14%)', 
                      borderColor: 'var(--card-border)', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                No expense data logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="dashboard-footer">
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>Recent Activity</h2>
          {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Category / Source</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontWeight: 500 }}>{tx.title}</td>
                      <td>
                        <span className={`badge badge-${tx.type}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            tx.type === 'expense' 
                              ? `badge-category-${tx.category.toLowerCase()}` 
                              : 'badge-income'
                          }`}
                        >
                          {tx.type === 'expense' ? tx.category : tx.source}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(tx.date)}</td>
                      <td style={{ 
                        fontWeight: 700, 
                        color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recent transactions recorded. Go to Expenses or Income tabs to add some.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
