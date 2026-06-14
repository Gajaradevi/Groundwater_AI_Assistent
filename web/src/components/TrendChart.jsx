import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

/**
 * TrendChart Component (Phase 4.5)
 * Renders interactive line charts for groundwater trend analysis data.
 * Shows Annual Recharge, Total Extraction, and Stage of Development over time.
 */

// Custom dark-themed tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="trend-chart-tooltip">
      <p className="trend-chart-tooltip-title">Year {label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color, margin: '3px 0', fontSize: '0.82rem' }}>
          {entry.name}: <strong>{entry.value}</strong>
          {entry.name === 'Stage of Dev.' ? '%' : ' km³'}
        </p>
      ))}
    </div>
  );
};

export function TrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) return null;

  // Format data for Recharts
  const chartData = trendData.map(item => ({
    year: item.year,
    'Annual Recharge': parseFloat(item.annualRecharge) || 0,
    'Total Extraction': parseFloat(item.totalExtraction) || 0,
    'Stage of Dev.': parseFloat(item.stageDevelopment) || 0
  }));

  return (
    <div className="trend-chart-card">
      <h4 className="trend-chart-title">📊 Trend Analysis</h4>

      {/* Recharge & Extraction Chart */}
      <div className="trend-chart-section">
        <p className="trend-chart-subtitle">Recharge vs Extraction (km³)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'hsl(215, 20%, 75%)', fontSize: 12 }}
              stroke="rgba(255,255,255,0.1)"
            />
            <YAxis
              tick={{ fill: 'hsl(215, 20%, 75%)', fontSize: 12 }}
              stroke="rgba(255,255,255,0.1)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.78rem', color: 'hsl(215, 20%, 75%)' }}
            />
            <Line
              type="monotone"
              dataKey="Annual Recharge"
              stroke="hsl(174, 80%, 45%)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'hsl(174, 80%, 45%)', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: 'hsl(174, 80%, 45%)', strokeWidth: 2, fill: 'hsl(222, 40%, 11%)' }}
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="Total Extraction"
              stroke="hsl(30, 80%, 55%)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'hsl(30, 80%, 55%)', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: 'hsl(30, 80%, 55%)', strokeWidth: 2, fill: 'hsl(222, 40%, 11%)' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stage of Development Chart */}
      <div className="trend-chart-section">
        <p className="trend-chart-subtitle">Stage of Development (%)</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'hsl(215, 20%, 75%)', fontSize: 12 }}
              stroke="rgba(255,255,255,0.1)"
            />
            <YAxis
              tick={{ fill: 'hsl(215, 20%, 75%)', fontSize: 12 }}
              stroke="rgba(255,255,255,0.1)"
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.78rem', color: 'hsl(215, 20%, 75%)' }}
            />
            <Line
              type="monotone"
              dataKey="Stage of Dev."
              stroke="hsl(280, 70%, 60%)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'hsl(280, 70%, 60%)', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: 'hsl(280, 70%, 60%)', strokeWidth: 2, fill: 'hsl(222, 40%, 11%)' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;
