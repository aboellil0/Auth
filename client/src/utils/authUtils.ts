// authUtils.ts - Helper functions for authentication
import api, { API_BASE_URL } from './Api';

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

/**
 * Save the access token to localStorage
 */
export const saveAccessToken = (token: string): void => {
    localStorage.setItem('accessToken', token);
};

/**
 * Remove the access token from localStorage
 */
export const removeAccessToken = (): void => {
    localStorage.removeItem('accessToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    return !!token && !isTokenExpired(token);
};

/**
 * Parse JWT token (without validation - client-side only)
 */
export const parseJwt = (token: string): any => {
    try {
        // Split the token and get the payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT token', e);
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = parseJwt(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        // Check if expiration time is past current time
        return decoded.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

/**
 * Handles logout - clears token and redirects to login
 */
export const logout = (): void => {
    removeAccessToken();
    window.location.href = '/login';
};

/**
 * Attempt to refresh the token when needed
 * Returns a promise that resolves to the new token if successful
 */
export const refreshToken = async (): Promise<string | null> => {
    try {
        const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {});
        const newToken = response.data.accessToken;
        saveAccessToken(newToken);
        return newToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        logout();
        return null;
    }
};

/**
 * Check if token needs to be refreshed and refresh if needed
 * This can be called before making authenticated requests
 */
export const checkAndRefreshToken = async (): Promise<boolean> => {
    const token = getAccessToken();
    
    if (!token) {
        return false;
    }
    
    // If token is expired or will expire in the next 5 minutes, refresh it
    if (isTokenExpired(token)) {
        const newToken = await refreshToken();
        return !!newToken;
    }
    
    // Token is still valid
    return true;
};