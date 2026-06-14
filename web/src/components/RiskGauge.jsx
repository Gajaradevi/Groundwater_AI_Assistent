import React, { useState, useEffect } from 'react';

/**
 * RiskGauge Component (Phase 4.5)
 * Animated progress bar visualizing Stage of Development percentage.
 * Color-coded: Green (Safe) → Yellow (Semi-Critical) → Orange (Critical) → Red (Over-Exploited).
 */

const getGaugeColor = (value) => {
  if (value <= 70) return '#2ecc71';
  if (value <= 90) return '#f1c40f';
  if (value <= 100) return '#e67e22';
  return '#e74c3c';
};

const getGaugeLabel = (value) => {
  if (value <= 70) return 'Safe';
  if (value <= 90) return 'Semi-Critical';
  if (value <= 100) return 'Critical';
  return 'Over-Exploited';
};

export function RiskGauge({ value, category }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => {
      setAnimatedWidth(Math.min(value, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const color = getGaugeColor(value);
  const label = category ? category.replace('_', ' ') : getGaugeLabel(value);

  return (
    <div className="risk-gauge">
      <div className="risk-gauge-header">
        <span className="risk-gauge-label" style={{ color }}>
          {label}
        </span>
        <span className="risk-gauge-value" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="risk-gauge-track">
        <div
          className="risk-gauge-fill"
          style={{
            width: `${animatedWidth}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}66`
          }}
        />
      </div>
    </div>
  );
}

export default RiskGauge;
