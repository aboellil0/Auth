// tokenRefresh.ts - Token refresh utility
import api, { API_BASE_URL } from './Api'; // Import your existing API instance
import axios from 'axios';
import { getAccessToken, saveAccessToken, parseJwt, isTokenExpired } from './authUtils';

interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Check if the current token is valid, and refresh if needed
 * @returns Promise resolving to true if we have a valid token, false otherwise
 */
export const ensureValidToken = async (): Promise<boolean> => {
  const currentToken = getAccessToken();
  
  // If no token exists, we can't refresh
  if (!currentToken) {
    console.warn('No token found to refresh');
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired(currentToken)) {
    console.log('Token expired, attempting refresh...');
    try {
      // Use a separate axios call to prevent interceptor loops
      const { data } = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/refresh-token`,
        {},
        { withCredentials: true }
      );
      
      // Save the new token
      saveAccessToken(data.accessToken);
      console.log('Token refreshed successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
  
  // Token exists and is valid
  return true;
};

/**
 * Higher-order function to wrap API calls with token validation
 * @param apiCall Function that makes the API request
 * @returns Promise resolving to the API response
 */
export const withAuth = <T>(apiCall: () => Promise<T>): Promise<T> => {
  return ensureValidToken()
    .then(isValid => {
      if (!isValid) {
        // Redirect to login if token couldn't be refreshed
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      // Token is valid, proceed with the API call
      return apiCall();
    });
};

/**
 * Initialize token refresh interval check
 * This can be called when your app starts
 * @param intervalMs How often to check token validity (default: 5 minutes)
 */
export const initTokenRefreshScheduler = (intervalMs = 5 * 60 * 1000): void => {
  // Check token immediately on startup
  ensureValidToken();
  
  // Set up periodic checks
  setInterval(() => {
    const token = getAccessToken();
    if (token) {
      // Only attempt refresh if token exists but is expiring soon
      // Check if token expires in the next 10 minutes
      const decoded = parseJwt(token);
      if (decoded && decoded.exp) {
        const expiresInMs = decoded.exp * 1000 - Date.now();
        if (expiresInMs < 10 * 60 * 1000 && expiresInMs > 0) {
          console.log('Token expiring soon, refreshing...');
          ensureValidToken();
        }
      }
    }
  }, intervalMs);
};