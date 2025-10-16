// lib/cookieDebug.js
/**
 * Cookie Debugging Utility
 * Helps debug cookie-related authentication issues
 */

export const cookieDebug = {
  /**
   * Log all cookies from the browser
   */
  logClientCookies() {
    if (typeof window !== 'undefined') {
      console.log('=== CLIENT COOKIES ===');
      console.log('document.cookie:', document.cookie);
      
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      console.log('Parsed cookies:', cookies);
      console.log('Has accessToken:', !!cookies.accessToken);
      console.log('Has refreshToken:', !!cookies.refreshToken);
      console.log('=====================');
    }
  },

  /**
   * Log all cookies from the server request
   */
  logServerCookies(req) {
    console.log('=== SERVER COOKIES ===');
    console.log('req.cookies:', req.cookies);
    console.log('req.headers.cookie:', req.headers.cookie);
    
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      console.log('Parsed cookies:', cookies);
      console.log('Has accessToken:', !!cookies.accessToken);
      console.log('Has refreshToken:', !!cookies.refreshToken);
    }
    console.log('======================');
  },

  /**
   * Test cookie functionality
   */
  testCookie(name = 'test', value = 'testValue') {
    if (typeof window !== 'undefined') {
      // Set a test cookie
      document.cookie = `${name}=${value}; Path=/; SameSite=Strict`;
      
      // Check if it was set
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        acc[cookieName] = cookieValue;
        return acc;
      }, {});
      
      const testResult = cookies[name] === value;
      console.log(`Cookie test ${name}=${value}:`, testResult ? 'PASS' : 'FAIL');
      
      // Clean up test cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      return testResult;
    }
    return false;
  },

  /**
   * Check if cookies are being sent with requests
   */
  async testAuthRequest() {
    console.log('=== TESTING AUTH REQUEST ===');
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Array.from(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
      } else {
        const errorData = await response.text();
        console.log('Error response:', errorData);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
    
    console.log('============================');
  }
};

// Export for use in components
export const debugAuth = () => {
  if (process.env.NODE_ENV === 'development') {
    cookieDebug.logClientCookies();
    cookieDebug.testCookie();
    cookieDebug.testAuthRequest();
  }
};

export default cookieDebug;