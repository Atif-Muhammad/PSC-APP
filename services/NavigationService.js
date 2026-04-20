// services/NavigationService.js
import { CommonActions } from '@react-navigation/native';

// Navigation reference holder
let navigationRef = null;

/**
 * Set the navigation reference (call this from App.js onNavigationReady)
 */
export const setNavigator = (ref) => {
  navigationRef = ref;
};

/**
 * Get the current navigation reference
 */
export const getNavigator = () => {
  if (!navigationRef) {
    console.warn('⚠️ Navigation ref not set! Make sure to call setNavigator() in App.js');
  }
  return navigationRef;
};

/**
 * Reset navigation stack to a specific screen
 * This prevents users from going back to previous screens
 * 
 * @param {string} routeName - The name of the screen to navigate to (e.g., 'LoginScr')
 * @param {object} params - Optional params to pass to the screen
 */
export const resetNavigation = (routeName, params = {}) => {
  const nav = getNavigator();
  if (nav && nav.dispatch) {
    nav.dispatch(
      CommonActions.reset({
        index: 0, // Set the active route to the first one
        routes: [
          {
            name: routeName,
            params: Object.keys(params).length > 0 ? params : undefined
          }
        ],
      })
    );
    console.log(`✅ Navigation reset to ${routeName}`);
  } else {
    console.error('❌ Navigation ref is not ready');
  }
};

/**
 * Navigate to a screen (standard navigation)
 */
export const navigate = (routeName, params) => {
  const nav = getNavigator();
  if (nav && nav.dispatch) {
    nav.dispatch(CommonActions.navigate({ name: routeName, params }));
  } else {
    console.error('❌ Navigation ref is not ready');
  }
};

/**
 * Go back to the previous screen
 */
export const goBack = () => {
  const nav = getNavigator();
  if (nav && nav.canGoBack && nav.canGoBack()) {
    nav.dispatch(CommonActions.back());
  } else {
    console.warn('⚠️ Cannot go back - no history');
  }
};
