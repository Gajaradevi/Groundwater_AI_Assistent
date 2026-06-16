import axios from 'axios';

// Base URL for the Spring Boot REST API
const BASE_URL = 'http://localhost:8080/api/v1/groundwater';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Automatically inject JWT token into all protected groundwater API requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // Check backend server status
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data; // Returns ApiResponse<String>
  },

  // Get data for a district across all years
  getDistrictData: async (district) => {
    const response = await apiClient.get(`/district/${district}`);
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get data for a specific district and year
  getDistrictYearData: async (district, year) => {
    const response = await apiClient.get(`/district/${district}/year/${year}`);
    return response.data; // Returns ApiResponse<GroundwaterDataDTO>
  },

  // Get data for a state across all years
  getStateData: async (state) => {
    const response = await apiClient.get(`/state/${state}`);
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get data for a specific year across all states
  getYearData: async (year) => {
    const response = await apiClient.get(`/year/${year}`);
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get critical and over-exploited areas in a state for a specific year
  getCriticalAreas: async (state, year) => {
    const response = await apiClient.get('/critical-areas', {
      params: { state, year },
    });
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get trend analysis for a district across a year range
  getTrendAnalysis: async (district, startYear, endYear) => {
    const response = await apiClient.get('/trend-analysis', {
      params: { district, startYear, endYear },
    });
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get data for a category (SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED)
  getCategoryData: async (category) => {
    const response = await apiClient.get(`/category/${category}`);
    return response.data; // Returns ApiResponse<List<GroundwaterDataDTO>>
  },

  // Get AI-powered explanation of the groundwater stress in a district and year
  getAiStressExplanation: async (district, year) => {
    const response = await apiClient.get('/ai/explain-stress', {
      params: { district, year },
      timeout: 30000, // 30 seconds timeout for AI generation
    });
    return response.data; // Returns ApiResponse<String>
  },

  // Get AI-powered comparison of groundwater metrics between two districts for a year
  getAiComparison: async (district1, district2, year) => {
    const response = await apiClient.get('/ai/compare', {
      params: { district1, district2, year },
      timeout: 30000, // 30 seconds timeout for AI generation
    });
    return response.data; // Returns ApiResponse<String>
  },

  // Get AI-powered comparison of groundwater metrics between two states for a year
  getAiStateComparison: async (state1, state2, year) => {
    const response = await apiClient.get('/ai/compare-states', {
      params: { state1, state2, year },
      timeout: 30000, // 30 seconds timeout for AI generation
    });
    return response.data; // Returns ApiResponse<String>
  },

  // Get AI-powered conservation recommendations for a district and year
  getAiRecommendations: async (district, year) => {
    const response = await apiClient.get('/ai/recommendations', {
      params: { district, year },
      timeout: 30000, // 30 seconds timeout for AI generation
    });
    return response.data; // Returns ApiResponse<String>
  },

  // Get India Map marker details (Feature 1)
  getMapData: async () => {
    const response = await apiClient.get('/map-data');
    return response.data; // Returns ApiResponse<List<MapDataDTO>>
  },

  // Get Executive Dashboard aggregated metrics (Feature 4)
  getDashboardData: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data; // Returns ApiResponse<DashboardDTO>
  },

  // Get Statistics charts data with dynamic filters (Feature 5)
  getStatistics: async (filters = {}) => {
    const response = await apiClient.get('/statistics', {
      params: filters
    });
    return response.data; // Returns ApiResponse<StatisticsDTO>
  },

  // Get Risk Analytics and AI insights (Feature 6)
  getAnalytics: async () => {
    const response = await apiClient.get('/analytics', {
      timeout: 30000
    });
    return response.data; // Returns ApiResponse<AnalyticsDTO>
  },

  // Generate AI-powered comprehensive markdown reports (Feature 3)
  generateReport: async (reportRequest) => {
    const response = await apiClient.post('/ai/report', reportRequest, {
      timeout: 45000 // 45 seconds timeout for complex report generation
    });
    return response.data; // Returns ApiResponse<String>
  },
};
export default apiService;
