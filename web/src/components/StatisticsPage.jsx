import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { BarChart3, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

/**
 * StatisticsPage Component (Feature 5)
 * Renders statistical charts with dynamic filters (State, District, Year).
 */
export function StatisticsPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown Filter States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const fetchStatistics = async (stateVal = '', districtVal = '', yearVal = '') => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (stateVal) filters.state = stateVal;
      if (districtVal) filters.district = districtVal;
      if (yearVal) filters.year = yearVal;

      const result = await apiService.getStatistics(filters);
      if (result.success && result.data) {
        setStatsData(result.data);
        
        // Sync states if they are empty
        if (!selectedState && result.data.availableStates?.length > 0) {
          setSelectedState(stateVal || result.data.availableStates[0]);
        }
        if (!selectedYear && result.data.availableYears?.length > 0) {
          setSelectedYear(yearVal || result.data.availableYears[0]);
        }
        if (result.data.districtWiseData?.length > 0) {
          const currentDistrict = districtVal || result.data.districtWiseData[0].district;
          setSelectedDistrict(currentDistrict);
        }
      } else {
        setError('Failed to fetch statistics.');
      }
    } catch (err) {
      console.error('Stats fetching error:', err);
      setError('Failed to connect to the statistics database endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    // Reset district so backend picks default for new state
    setSelectedDistrict('');
    fetchStatistics(newState, '', selectedYear);
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    fetchStatistics(selectedState, newDistrict, selectedYear);
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    fetchStatistics(selectedState, selectedDistrict, newYear);
  };

  if (loading && !statsData) {
    return (
      <div className="page-container dashboard-loading">
        <div className="spinner"></div>
        <p>Loading statistical dashboards...</p>
      </div>
    );
  }

  if (error && !statsData) {
    return (
      <div className="page-container dashboard-error">
        <div className="error-card glass-card">
          <BarChart3 size={48} className="error-icon" />
          <h2>Statistics Interface Error</h2>
          <p>{error}</p>
          <button onClick={() => fetchStatistics()} className="retry-btn">Retry Sync</button>
        </div>
      </div>
    );
  }

  const {
    stateWiseData = [],
    districtWiseData = [],
    yearlyTrends = [],
    categoryDistribution = {},
    availableStates = [],
    availableYears = []
  } = statsData || {};

  // Pie chart data
  const pieColors = {
    SAFE: '#22c55e',
    SEMI_CRITICAL: '#eab308',
    CRITICAL: '#f97316',
    OVER_EXPLOITED: '#ef4444'
  };

  const pieData = Object.entries(categoryDistribution)
    .map(([cat, count]) => ({
      name: cat.replace('_', ' '),
      value: count,
      color: pieColors[cat] || '#3b82f6'
    }))
    .filter(item => item.value > 0);

  return (
    <div className="page-container statistics-page">
      <div className="page-header">
        <div className="header-title-wrapper">
          <BarChart3 className="header-icon" size={24} />
          <h1>Statistics Dashboard</h1>
        </div>
        <p className="header-subtitle">
          In-depth visual analysis and trends mapping of extractable and recharge parameters.
        </p>
      </div>

      {/* Dynamic Filters Control Panel */}
      <div className="filter-panel glass-card">
        <div className="filter-panel-title">
          <SlidersHorizontal size={16} />
          <span>Analytical Filters</span>
        </div>
        
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="state-select">Select State</label>
            <select 
              id="state-select" 
              value={selectedState} 
              onChange={handleStateChange}
              className="filter-select"
            >
              {availableStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="district-select">Select District</label>
            <select 
              id="district-select" 
              value={selectedDistrict} 
              onChange={handleDistrictChange}
              className="filter-select"
            >
              {districtWiseData.map(d => (
                <option key={d.district} value={d.district}>{d.district}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year-select">Select Year</label>
            <select 
              id="year-select" 
              value={selectedYear} 
              onChange={handleYearChange}
              className="filter-select"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => fetchStatistics(selectedState, selectedDistrict, selectedYear)}
            className="refresh-btn sync-btn"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="stats-charts-grid">
        {/* State-wise Comparison */}
        <div className="chart-card glass-card span-2">
          <h3>State-wise Stage of Development Comparison ({selectedYear})</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateWiseData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="state" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="averageStageDevelopment" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Stage Dev (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District-wise Development */}
        <div className="chart-card glass-card span-2">
          <h3>District-wise Stage of Development in {selectedState} ({selectedYear})</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtWiseData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="district" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="stageDevelopment" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Stage Dev (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharge and Extraction Trends */}
        <div className="chart-card glass-card span-2">
          <h3>Annual Recharge vs. Extraction Trends for {selectedDistrict} (2020 - 2023)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} unit=" km³" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="annualRecharge" stroke="#10b981" strokeWidth={2} name="Annual Recharge" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="totalExtraction" stroke="#ef4444" strokeWidth={2} name="Total Extraction" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card glass-card">
          <h3>Category Distribution ({selectedState || 'Nationwide'})</h3>
          <div className="chart-wrapper">
            {pieData.length === 0 ? (
              <div className="empty-chart">No category data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
