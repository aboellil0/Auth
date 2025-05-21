import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// Keep this as the base URL for the entire API
export const API_BASE_URL = 'http://localhost:3000/api/auth';

interface RefreshTokenResponse {
  accessToken: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// Log network requests for debugging purposes
const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log(`REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
};

// Add auth header to requests if token exists
const addAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`Authorization header set: Bearer ${token.substring(0, 15)}...`);
  } else {
    console.warn('No access token found in localStorage');
  }
  return config;
};

// Request interceptors
api.interceptors.request.use(logRequest);
api.interceptors.request.use(addAuthHeader);

// Response interceptors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Only attempt to refresh the token if we get a 401 and haven't tried yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/refresh-token') {
      console.log('Token expired, attempting refresh...');
      
      if (isRefreshing) {
        try {
          // Wait for the current refresh to complete
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Make sure we're using the right endpoint for refresh
        const { data } = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/refresh-token`, 
          {}, 
          { withCredentials: true }
        );
        
        const newToken = data.accessToken;
        console.log('Token refreshed successfully');
        
        // Update stored token
        localStorage.setItem('accessToken', newToken);
        
        // Update auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Process queue with new token
        processQueue(null, newToken);
        
        // Return original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError as AxiosError);
        
        // Clear auth state and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;