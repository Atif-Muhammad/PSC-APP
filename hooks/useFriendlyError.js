// hooks/useFriendlyError.js
import { useState, useEffect } from 'react';
import eventBus from '../services/eventBus';

/**
 * useFriendlyError Hook
 * 
 * Listens for API errors emitted by the apiClient interceptor
 * and provides friendly error state management.
 * 
 * @param {string} module - Module name to filter errors (rooms, halls, lawns)
 * @returns {Object} Error state and handlers
 */
export const useFriendlyError = (module = null) => {
  const [errorState, setErrorState] = useState({
    hasError: false,
    message: null,
    module: null,
    endpoint: null,
  });
  
  const [lastErrorTime, setLastErrorTime] = useState(null);

  useEffect(() => {
    // Subscribe to API_ERROR events from eventBus
    const errorHandler = (errorData) => {
      // Filter by module if specified
      if (module && errorData.module !== module) {
        return;
      }
      
      console.log('🎯 Friendly Error Hook received:', errorData);
      
      setErrorState({
        hasError: true,
        message: errorData.friendlyMessage,
        module: errorData.module,
        endpoint: errorData.endpoint,
      });
      
      setLastErrorTime(new Date().toISOString());
    };
    
    // Listen for error events
    eventBus.on('API_ERROR', errorHandler);
    
    // Cleanup subscription on unmount
    return () => {
      eventBus.off('API_ERROR', errorHandler);
    };
  }, [module]);
  
  // Clear error state
  const clearError = () => {
    setErrorState({
      hasError: false,
      message: null,
      module: null,
      endpoint: null,
    });
  };
  
  // Manually set error (for custom scenarios)
  const setError = (message, errorModule = 'default') => {
    setErrorState({
      hasError: true,
      message,
      module: errorModule,
      endpoint: null,
    });
  };
  
  return {
    error: errorState,
    hasError: errorState.hasError,
    errorMessage: errorState.message,
    errorModule: errorState.module,
    clearError,
    setError,
    lastErrorTime,
  };
};

export default useFriendlyError;
