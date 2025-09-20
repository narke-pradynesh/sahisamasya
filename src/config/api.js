// API Configuration for MongoDB Backend
const getBaseURL = () => {
  // Use the same hostname as the frontend but port 3000 for API
  // This allows network access when frontend is hosted on network IP
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:3000/api`;
  }
  // Default to localhost for local development
  return 'http://localhost:3000/api';
};

const BASE_URL = getBaseURL();
console.log(`API Base URL: ${BASE_URL}`);

export const API_CONFIG = {
  BASE_URL,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Helper function to get headers with auth token
export const getApiHeaders = (token = null) => {
  const headers = { ...API_CONFIG.HEADERS };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('SahiSamasya_token');
};

// Helper function to make API requests with timeout
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const headers = getApiHeaders(token);
  
  const config = {
    headers,
    ...options
  };
  
  // Add timeout to prevent hanging requests
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
  });
  
  try {
    console.log(`Making API request to ${endpoint}:`, {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });
    
    const response = await Promise.race([
      fetch(url, config),
      timeoutPromise
    ]);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error ${response.status} for ${endpoint}:`, data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};
