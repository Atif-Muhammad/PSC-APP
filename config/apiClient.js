// config/apiClient.js
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import eventBus from '../services/eventBus';
import { resetNavigation } from '../services/NavigationService';

// Base URL configuration
export const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'https://admin.peshawarservicesclub.com/api';
  } else {
    return 'https://admin.peshawarservicesclub.com/api';
  }
};

const base_url = getBaseUrl();
console.log('🔌 API Client using base URL:', base_url);

// Error message mapping based on endpoint patterns
const ERROR_ENDPOINT_MAP = {
  // Room bookings
  '/bookings/rooms': 'rooms',
  '/rooms/booking': 'rooms',
  '/room': 'rooms',
  
  // Halls
  '/halls/availability': 'halls',
  '/halls/booking': 'halls',
  '/banquet': 'halls',
  '/hall': 'halls',
  
  // Lawns
  '/lawns/availability': 'lawns',
  '/lawn/booking': 'lawns',
  '/lawn': 'lawns',
};

// Friendly error messages for different modules
const FRIENDLY_ERRORS = {
  rooms: [
    "Service is temporarily unavailable. Please try again later.",
    "Feature under maintenance. Thank you for your patience.",
    "We are updating the system. Some features may not be available.",
  ],
  halls: [
    "Service is temporarily unavailable. Please try again later.",
    "Feature under maintenance. Thank you for your patience.",
    "We are updating the system. Some features may not be available.",
  ],
  lawns: [
    "Service is temporarily unavailable. Please try again later.",
    "Feature under maintenance. Thank you for your patience.",
    "We are updating the system. Some features may not be available.",
  ],
  default: [
    "Service is temporarily unavailable. Please try again later.",
    "Feature under maintenance. Thank you for your patience.",
    "We are updating the system. Some features may not be available.",
  ],
};

// Get friendly error message based on endpoint
const getFriendlyError = (endpoint) => {
  let moduleKey = 'default';
  
  // Check endpoint against mapping
  for (const [pattern, module] of Object.entries(ERROR_ENDPOINT_MAP)) {
    if (endpoint.toLowerCase().includes(pattern)) {
      moduleKey = module;
      break;
    }
  }
  
  const messages = FRIENDLY_ERRORS[moduleKey] || FRIENDLY_ERRORS.default;
  // Rotate through messages for variety
  const randomIndex = Math.floor(Math.random() * messages.length);
  return {
    message: messages[randomIndex],
    module: moduleKey,
  };
};

// Token write lock to prevent race conditions during login/logout
let isTokenBeingWritten = false;
const MAX_LOCK_WAIT_TIME = 2000; // 2 seconds max wait

const waitForTokenWrite = async () => {
  if (!isTokenBeingWritten) return;
  
  const startTime = Date.now();
  while (isTokenBeingWritten) {
    if (Date.now() - startTime > MAX_LOCK_WAIT_TIME) {
      console.warn('⚠️ Token write lock timeout - proceeding anyway');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: base_url,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Wait for any pending token writes to complete
      await waitForTokenWrite();
      
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Don't log for auth endpoints to reduce noise
        const isAuthEndpoint = config.url.includes('/auth/') || config.url.includes('/login');
        if (!isAuthEndpoint) {
          console.log('ℹ️ No access token found for API request to:', config.url);
        }
      }
      
      // Add FCM Token for Single Device Session
      const isAuthEndpoint = config.url.includes('/auth/') || config.url.includes('/login');
      if (!isAuthEndpoint && token) {
        try {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            config.headers['client-fcm-token'] = fcmToken;
          }
        } catch (fcmErr) {
          console.warn('⚠️ Could not get FCM token for header:', fcmErr.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple logout triggers during token handover
let isLoggingOut = false;

// Response Interceptor with Enhanced Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log("❌ Error in response interceptor:", {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest?.url
    });
    
    // Handle HTTP 500 Internal Server Error
    if (error.response?.status === 500) {
      const endpoint = originalRequest?.url || '';
      const friendlyError = getFriendlyError(endpoint);
      
      console.error(`🚨 HTTP 500 Error for ${endpoint}:`, friendlyError.message);
      
      // Emit error event for UI to handle
      // This allows components to listen and display friendly errors
      eventBus.emit('API_ERROR', {
        status: 500,
        endpoint,
        friendlyMessage: friendlyError.message,
        module: friendlyError.module,
        timestamp: new Date().toISOString(),
      });
      
      // Return sanitized error object (no technical details leaked)
      return Promise.reject({
        isFriendlyError: true,
        status: 500,
        message: friendlyError.message,
        module: friendlyError.module,
        endpoint,
      });
    }
    
    // Handle SESSION_EXPIRED (403) - True unauthorized from Force Logout
    if (error.response?.status === 403 && error.response?.data?.error === 'SESSION_EXPIRED') {
      // Prevent duplicate logout calls
      if (isLoggingOut) {
        console.log('⚠️ Logout already in progress, skipping duplicate trigger');
        return Promise.reject(error);
      }
      
      isLoggingOut = true;
      console.error('🚨 Session Expired: Logged in on another device');
      
      try {
        // Use eventBus to trigger Alert via AuthContext
        eventBus.emit('FORCE_LOGOUT', {
          message: error.response?.data?.message || 'You have been logged in on another device.'
        });
      } catch (emitError) {
        console.error('❌ Failed to emit FORCE_LOGOUT event:', emitError);
      }
      
      return new Promise(() => { }); // Stop the promise chain
    }
    
    // Handle 401 Unauthorized - Could be transient or permanent
    if (error.response?.status === 401) {
      // Check if this is a retry attempt
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Verify current token state before deciding to logout
        try {
          const currentToken = await AsyncStorage.getItem('access_token');
          
          // If token exists and matches the failed request, it's a true 401
          // If token is different or missing, it was a transient handover issue
          if (currentToken) {
            console.log('⚠️ 401 received but token still exists - possible transient error');
          } else {
            // No token - user already logged out, don't trigger again
            console.log('ℹ️ 401 received but no token exists - skipping logout');
            return Promise.reject(error);
          }
        } catch (storageError) {
          console.error('❌ Error checking token during 401 handling:', storageError);
        }
      }
    }
    
    // For other errors, sanitize the message before returning
    const sanitizedError = {
      ...error,
      message: error.message || 'An unexpected error occurred',
      isFriendlyError: false,
    };
    
    return Promise.reject(sanitizedError);
  }
);

// Token management functions
export const storeAuthData = async (tokens, userData) => {
  try {
    // Set write lock to prevent race conditions
    isTokenBeingWritten = true;
    
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    
    console.log('✅ Auth data stored');
    
    // Release lock after a small delay to ensure writes complete
    setTimeout(() => {
      isTokenBeingWritten = false;
      console.log('🔓 Token write lock released');
    }, 100);
    
  } catch (error) {
    console.error('❌ Error storing auth data:', error);
    isTokenBeingWritten = false; // Always release lock on error
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    isTokenBeingWritten = true;
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    console.log('✅ Auth data cleared');
    setTimeout(() => {
      isTokenBeingWritten = false;
    }, 100);
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    isTokenBeingWritten = false;
  }
};

export default apiClient;
