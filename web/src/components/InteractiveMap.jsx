import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { apiService } from '../services/api';
import { Map as MapIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/**
 * InteractiveMap Component (Feature 1)
 * Renders India map showing districts status using React Leaflet.
 */
export function InteractiveMap() {
  const [mapData, setMapData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statesList, setStatesList] = useState([]);

  const fetchMapData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.getMapData();
      if (result.success && result.data) {
        setMapData(result.data);
        setFilteredData(result.data);
        
        // Extract unique states
        const states = ['All', ...new Set(result.data.map(item => item.state))];
        setStatesList(states);
      } else {
        setError('Failed to fetch map data details from server.');
      }
    } catch (err) {
      console.error('Map loading error:', err);
      setError('Could not connect to database server. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    let data = mapData;
    if (selectedState !== 'All') {
      data = data.filter(item => item.state === selectedState);
    }
    if (selectedCategory !== 'All') {
      data = data.filter(item => {
        const cat = item.category?.toUpperCase().replace('-', '_');
        const filterCat = selectedCategory.toUpperCase().replace('-', '_');
        return cat === filterCat;
      });
    }
    setFilteredData(data);
  }, [selectedState, selectedCategory, mapData]);

  const getMarkerColor = (category) => {
    if (!category) return '#22c55e';
    const cat = category.toUpperCase().replace('-', '_');
    switch (cat) {
      case 'SAFE': return '#22c55e'; // Green
      case 'SEMI_CRITICAL': return '#eab308'; // Yellow
      case 'CRITICAL': return '#f97316'; // Orange
      case 'OVER_EXPLOITED': return '#ef4444'; // Red
      default: return '#3b82f6';
    }
  };

  return (
    <div className="page-container interactive-map-page">
      <div className="page-header">
        <div className="header-title-wrapper">
          <MapIcon className="header-icon" size={24} />
          <h1>Interactive Groundwater Map</h1>
        </div>
        <p className="header-subtitle">
          Geographical visualization of groundwater resource stress across districts in India.
        </p>
      </div>

      <div className="filter-panel glass-card">
        <div className="filter-group">
          <label htmlFor="state-filter">Filter by State</label>
          <select 
            id="state-filter" 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="filter-select"
          >
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Filter by Category</label>
          <select 
            id="category-filter" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="SAFE">Safe</option>
            <option value="SEMI_CRITICAL">Semi-Critical</option>
            <option value="CRITICAL">Critical</option>
            <option value="OVER_EXPLOITED">Over-Exploited</option>
          </select>
        </div>

        <button 
          onClick={fetchMapData} 
          className="refresh-btn" 
          title="Reload Map Data"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Sync Data</span>
        </button>
      </div>

      <div className="map-view-container glass-card">
        {loading ? (
          <div className="map-loader">
            <div className="spinner"></div>
            <p>Loading geographical parameters...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <AlertTriangle size={36} className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchMapData} className="retry-btn">Retry Connection</button>
          </div>
        ) : (
          <div style={{ height: '550px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer 
              center={[22.5, 82.0]} 
              zoom={5} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {filteredData.map((marker, idx) => (
                <CircleMarker
                  key={`${marker.district}-${marker.year}-${idx}`}
                  center={[marker.latitude, marker.longitude]}
                  radius={10}
                  fillColor={getMarkerColor(marker.category)}
                  color="#ffffff"
                  weight={1}
                  opacity={0.9}
                  fillOpacity={0.75}
                >
                  <Popup className="dark-popup">
                    <div className="popup-content">
                      <h3>{marker.district}</h3>
                      <p className="popup-state">{marker.state}</p>
                      <hr className="popup-divider" />
                      <div className="popup-stat-row">
                        <span className="stat-label">Assessment Year:</span>
                        <span className="stat-value">{marker.year}</span>
                      </div>
                      <div className="popup-stat-row">
                        <span className="stat-label">Stage of Dev:</span>
                        <span className="stat-value">{marker.stageDevelopment.toFixed(2)}%</span>
                      </div>
                      <div className="popup-stat-row">
                        <span className="stat-label">Category:</span>
                        <span className={`stat-value category-tag ${marker.category?.toLowerCase().replace('_', '-')}`}>
                          {marker.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="map-legend glass-card">
              <h4>Legend</h4>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#22c55e' }}></span>
                <span>Safe (0 - 70%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#eab308' }}></span>
                <span>Semi-Critical (70 - 90%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f97316' }}></span>
                <span>Critical (90 - 100%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span>Over-Exploited (&gt; 100%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveMap;
