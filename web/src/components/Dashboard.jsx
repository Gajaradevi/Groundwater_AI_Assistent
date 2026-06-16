import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  LayoutDashboard, ShieldAlert, ShieldCheck, AlertCircle, BrainCircuit,
  TrendingDown, TrendingUp, RefreshCw, MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';

/**
 * Dashboard Component (Feature 4)
 * Renders the executive analytics dashboard page.
 */
export function Dashboard({ onPageChange }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.getDashboardData();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError('Failed to fetch dashboard data.');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to communicate with the groundwater API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container dashboard-error">
        <div className="error-card glass-card">
          <ShieldAlert size={48} className="error-icon" />
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboard} className="retry-btn">
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    totalDistricts,
    safeCount,
    semiCriticalCount,
    criticalCount,
    overExploitedCount,
    topStressedDistricts,
    topSafestDistricts,
    categoryDistribution
  } = dashboardData;

  // Pie chart data
  const pieData = [
    { name: 'Safe', value: safeCount, color: '#22c55e' },
    { name: 'Semi-Critical', value: semiCriticalCount, color: '#eab308' },
    { name: 'Critical', value: criticalCount, color: '#f97316' },
    { name: 'Over-Exploited', value: overExploitedCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Bar chart data for distribution
  const barData = Object.entries(categoryDistribution).map(([cat, val]) => ({
    name: cat.replace('_', ' '),
    count: val,
    color: cat === 'SAFE' ? '#22c55e' : cat === 'SEMI_CRITICAL' ? '#eab308' : cat === 'CRITICAL' ? '#f97316' : '#ef4444'
  }));

  // Mapped recent queries list
  const recentQueries = [
    { text: "Compare Pune and Nashik stress levels in 2023", time: "5 mins ago" },
    { text: "Conservation recommendations for Kolar district", time: "12 mins ago" },
    { text: "Show critical areas in Rajasthan", time: "25 mins ago" },
    { text: "Groundwater recharge trends for Bangalore", time: "1 hour ago" }
  ];

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <div className="header-title-wrapper">
          <LayoutDashboard className="header-icon" size={24} />
          <h1>Executive Dashboard</h1>
        </div>
        <p className="header-subtitle">
          Real-time aggregated groundwater status overview across monitored regions.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper total">
            <LayoutDashboard size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Districts</span>
            <h2 className="stat-value">{totalDistricts}</h2>
          </div>
        </div>

        <div className="stat-card glass-card border-safe">
          <div className="stat-icon-wrapper safe">
            <ShieldCheck size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Safe Areas</span>
            <h2 className="stat-value text-safe">{safeCount}</h2>
          </div>
        </div>

        <div className="stat-card glass-card border-semi">
          <div className="stat-icon-wrapper semi">
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Semi-Critical</span>
            <h2 className="stat-value text-semi">{semiCriticalCount}</h2>
          </div>
        </div>

        <div className="stat-card glass-card border-critical">
          <div className="stat-icon-wrapper critical">
            <ShieldAlert size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Critical</span>
            <h2 className="stat-value text-critical">{criticalCount}</h2>
          </div>
        </div>

        <div className="stat-card glass-card border-over">
          <div className="stat-icon-wrapper over">
            <ShieldAlert size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Over-Exploited</span>
            <h2 className="stat-value text-over">{overExploitedCount}</h2>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="dashboard-charts-grid">
        {/* Pie Chart */}
        <div className="chart-card glass-card">
          <h3>Groundwater Status Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card glass-card">
          <h3>Resource Categories Breakdown</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Ranked Lists and Recent Queries */}
      <div className="dashboard-details-grid">
        {/* Most Stressed */}
        <div className="details-list-card glass-card">
          <div className="list-card-header">
            <TrendingUp className="header-icon-stressed" size={18} />
            <h3>Top 5 Most Stressed Districts</h3>
          </div>
          <div className="list-wrapper">
            {topStressedDistricts.map((d, index) => (
              <div key={d.id || index} className="details-list-item">
                <span className="item-rank rank-high">{index + 1}</span>
                <div className="item-main">
                  <span className="item-title">{d.district}</span>
                  <span className="item-subtitle">{d.state}</span>
                </div>
                <div className="item-metric">
                  <span className="metric-value text-over">{d.stageDevelopment.toFixed(1)}%</span>
                  <span className="metric-label">Stage Dev</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safest */}
        <div className="details-list-card glass-card">
          <div className="list-card-header">
            <TrendingDown className="header-icon-safe" size={18} />
            <h3>Top 5 Safest Districts</h3>
          </div>
          <div className="list-wrapper">
            {topSafestDistricts.map((d, index) => (
              <div key={d.id || index} className="details-list-item">
                <span className="item-rank rank-low">{index + 1}</span>
                <div className="item-main">
                  <span className="item-title">{d.district}</span>
                  <span className="item-subtitle">{d.state}</span>
                </div>
                <div className="item-metric">
                  <span className="metric-value text-safe">{d.stageDevelopment.toFixed(1)}%</span>
                  <span className="metric-label">Stage Dev</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Queries */}
        <div className="details-list-card glass-card">
          <div className="list-card-header">
            <BrainCircuit className="header-icon-ai" size={18} />
            <h3>Recent AI Assistant Queries</h3>
          </div>
          <div className="list-wrapper">
            {recentQueries.map((q, index) => (
              <div 
                key={index} 
                className="details-list-item query-item"
                onClick={() => onPageChange('chat')}
                role="button"
                tabIndex={0}
              >
                <div className="query-icon-wrapper">
                  <MessageSquare size={14} />
                </div>
                <div className="item-main">
                  <p className="query-text">{q.text}</p>
                  <span className="query-time">{q.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
