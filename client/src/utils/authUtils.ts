// authUtils.ts - Helper functions for authentication

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
    return !!token;
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