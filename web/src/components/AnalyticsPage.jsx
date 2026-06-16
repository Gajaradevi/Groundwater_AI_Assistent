import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  TrendingUp, ShieldAlert, Sparkles, RefreshCw, Landmark,
  Droplet, CheckCircle, ChevronRight, Activity, AlertCircle, HelpCircle
} from 'lucide-react';

/**
 * AnalyticsPage Component (Feature 6 - Updated layout)
 * Renders calculated risk scores, state performances, and AI insights.
 */
export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.getAnalytics();
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        setError('Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Failed to load insights. Verify backend server and Groq AI availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-container dashboard-loading">
        <div className="spinner"></div>
        <p>Generating AI risk analytics and Groq insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container dashboard-error">
        <div className="error-card glass-card">
          <Activity size={48} className="error-icon" />
          <h2>Analytics Engine Error</h2>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="retry-btn">
            <RefreshCw size={16} />
            <span>Retry Execution</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    totalDistricts = 0,
    safeCount = 0,
    semiCriticalCount = 0,
    criticalCount = 0,
    overExploitedCount = 0,
    topRiskDistricts = [],
    topSafeDistricts = [],
    aiInsights = ''
  } = analyticsData || {};

  // Render markdown helper (since insights are returned as simple markdown lists/text)
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('###')) {
        return <h4 key={idx} className="md-h4">{line.replace('###', '').trim()}</h4>;
      }
      if (line.startsWith('##')) {
        return <h3 key={idx} className="md-h3">{line.replace('##', '').trim()}</h3>;
      }
      if (line.startsWith('#')) {
        return <h2 key={idx} className="md-h2">{line.replace('#', '').trim()}</h2>;
      }
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={idx} className="md-li">
            <span className="bullet-point"></span>
            <span>{line.replace(/^[-*]\s*/, '').trim()}</span>
          </li>
        );
      }
      if (line.trim().match(/^\d+\./)) {
        return (
          <li key={idx} className="md-li-numbered">
            <span className="number-point">{line.match(/^\d+/)[0]}.</span>
            <span>{line.replace(/^\d+\.\s*/, '').trim()}</span>
          </li>
        );
      }
      if (line.trim() === '') return <div key={idx} style={{ height: '8px' }}></div>;
      return <p key={idx} className="md-p">{line}</p>;
    });
  };

  return (
    <div className="page-container analytics-page">
      <div className="page-header">
        <div className="header-title-wrapper">
          <Activity className="header-icon" size={24} />
          <h1>Risk & Trend Analytics</h1>
        </div>
        <p className="header-subtitle">
          AI-generated assessments, risk classification, and national groundwater metrics.
        </p>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper blue">
            <Landmark size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalDistricts}</span>
            <span className="stat-label">Total Districts</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{safeCount}</span>
            <span className="stat-label">Safe Districts</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper yellow">
            <HelpCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{semiCriticalCount}</span>
            <span className="stat-label">Semi-Critical</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper orange">
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{criticalCount}</span>
            <span className="stat-label">Critical Districts</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper red">
            <ShieldAlert size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{overExploitedCount}</span>
            <span className="stat-label">Over-Exploited</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Left Side: Tables & Lists */}
        <div className="analytics-left-col">
          {/* Section 1: Groundwater Risk Analytics */}
          <div className="analytics-card glass-card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <ShieldAlert size={18} className="icon-risk" />
              <h3>Top Water-Risk Districts</h3>
            </div>
            
            <div className="table-responsive">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>State</th>
                    <th>Stage Dev (%)</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {topRiskDistricts.map((d, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{d.district}</td>
                      <td>{d.state}</td>
                      <td>{(d.stageDevelopment || 0).toFixed(1)}%</td>
                      <td>
                        <div className="risk-score-badge">
                          <span className="risk-dot high"></span>
                          <span>{d.category || 'CRITICAL'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Top Safe Districts */}
          <div className="analytics-card glass-card">
            <div className="card-header">
              <CheckCircle size={18} className="icon-best" />
              <h3>Top Water-Safe Districts</h3>
            </div>
            
            <div className="table-responsive">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>State</th>
                    <th>Stage Dev (%)</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {topSafeDistricts.map((d, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{d.district}</td>
                      <td>{d.state}</td>
                      <td>{(d.stageDevelopment || 0).toFixed(1)}%</td>
                      <td>
                        <div className="risk-score-badge">
                          <span className="risk-dot safe"></span>
                          <span>{d.category || 'SAFE'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: AI Insights & Conservation */}
        <div className="analytics-right-col">
          {/* Section 4: AI Insights Panel */}
          <div className="analytics-card glass-card ai-insights-card" style={{ height: '100%' }}>
            <div className="card-header">
              <Sparkles size={18} className="icon-ai" />
              <h3>AI Insights (Groq LLM)</h3>
              <span className="ai-tag">RAG Model</span>
            </div>
            <div className="ai-markdown-content">
              {renderMarkdown(aiInsights)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
