import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const authService = {
  register: async (fullName, email, password) => {
    const response = await authClient.post('/register', { fullName, email, password });
    return response.data; // ApiResponse<RegisterResponse>
  },

  login: async (email, password) => {
    const response = await authClient.post('/login', { email, password });
    return response.data; // ApiResponse<LoginResponse>
  },

  forgotPassword: async (email) => {
    const response = await authClient.post('/forgot-password', { email });
    return response.data; // ApiResponse<String>
  },

  resetPassword: async (token, newPassword) => {
    const response = await authClient.post('/reset-password', { token, newPassword });
    return response.data; // ApiResponse<String>
  }
};

export default authService;
