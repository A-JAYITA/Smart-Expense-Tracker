import React from 'react';
import { formatCurrency } from '../utils/formatters';

const StatCard = ({ title, value, subText, type }) => {
  // Determine color and glow according to metric type
  let accentColor = 'var(--accent-primary)';
  let glowColor = 'var(--accent-glow)';
  let bgGradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))';

  if (type === 'income') {
    accentColor = 'var(--success)';
    glowColor = 'var(--success-glow)';
    bgGradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.08))';
  } else if (type === 'expense') {
    accentColor = 'var(--danger)';
    glowColor = 'var(--danger-glow)';
    bgGradient = 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.08))';
  }

  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div 
      className="card" 
      style={{ 
        background: bgGradient, 
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: `0 4px 20px ${glowColor}`
      }}
    >
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color: type === 'balance' ? 'var(--text-primary)' : accentColor }}>
        {displayValue}
      </div>
      {subText && <div className="metric-sub">{subText}</div>}
    </div>
  );
};

export default StatCard;
