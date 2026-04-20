# Requirements Document

## Introduction

This feature integrates TanStack Query (React Query) into the React Native app for all GET API calls defined in `config/apis.js`. The goal is to wrap every read-only API function with `useQuery` hooks so that components get automatic caching, background refetching, loading states, and error handling out of the box — without changing the underlying API functions themselves.

The integration will be delivered as a dedicated hooks file (e.g., `hooks/useQueries.js`) that exports one custom hook per GET API. Components can then replace manual `useEffect`/`useState` data-fetching patterns with these hooks.

## Glossary

- **Query_Hook**: A custom React hook built on `useQuery` that wraps a single GET API function.
- **Query_Client**: The TanStack Query `QueryClient` instance that manages the cache and request lifecycle.
- **Query_Key**: A serializable array used by TanStack Query to uniquely identify and cache a query result.
- **Stale_Time**: The duration (in milliseconds) after which cached data is considered stale and eligible for background refetching.
- **API_Function**: An existing async function exported from `config/apis.js` that performs an HTTP GET request.
- **Hook_Consumer**: A React Native component that calls a Query_Hook to read data.
- **QueryClientProvider**: The TanStack Query context provider that must wrap the component tree.
- **Parameterized_Query**: A Query_Hook that accepts one or more runtime arguments (e.g., an ID) and includes them in the Query_Key.

---

## Requirements

### Requirement 1: TanStack Query Setup

**User Story:** As a developer, I want a single QueryClient configured and provided to the app, so that all Query_Hooks share the same cache and configuration.

#### Acceptance Criteria

1. THE Query_Client SHALL be created with a default `staleTime` of 5 minutes (300,000 ms).
2. THE Query_Client SHALL be created with a default `retry` count of 2.
3. WHEN the app starts, THE QueryClientProvider SHALL wrap the root component tree and receive the Query_Client instance.
4. THE Query_Client SHALL be exported so that components can call `queryClient.invalidateQueries` after mutations.

---

### Requirement 2: Hook File Structure

**User Story:** As a developer, I want all Query_Hooks in one dedicated file, so that imports are predictable and the hooks are easy to discover.

#### Acceptance Criteria

1. THE Query_Hook file SHALL be located at `hooks/useQueries.js`.
2. THE Query_Hook file SHALL import all required API_Functions from `config/apis.js` without modifying that file.
3. THE Query_Hook file SHALL export each Query_Hook as a named export.
4. WHEN a Query_Hook is called, THE Query_Hook SHALL delegate data fetching entirely to the corresponding API_Function.

---

### Requirement 3: Query Keys

**User Story:** As a developer, I want each query to have a stable, unique Query_Key, so that the cache can be targeted precisely for invalidation and refetching.

#### Acceptance Criteria

1. THE Query_Hook file SHALL define a `QUERY_KEYS` constant object that maps every hook to its base key string.
2. WHEN a Query_Hook is parameterized, THE Query_Key SHALL include all parameters as additional array elements (e.g., `['hallReservations', hallId]`).
3. THE `QUERY_KEYS` constant SHALL be exported so that mutation hooks and other code can reference keys without hardcoding strings.

---

### Requirement 4: Non-Parameterized GET Hooks

**User Story:** As a developer, I want hooks for all GET APIs that require no arguments, so that I can fetch global or user-level data with a single hook call.

#### Acceptance Criteria

The following hooks SHALL be implemented with no required parameters:

1. `useUserWho` — wraps `userWho`
2. `useGetUserData` — wraps `getUserData`
3. `useGetUserNotifications` — wraps `getUserNotifications`
4. `useGetUnseenNotificationsCount` — wraps `getUnseenNotificationsCount`
5. `useGetMembershipNumber` — wraps `getMembershipNumber`
6. `useGetAllHalls` — wraps `banquetAPI.getAllHalls`
7. `useGetAllPhotoshoots` — wraps `photoshootAPI.getAllPhotoshoots`
8. `useGetAvailablePhotoshoots` — wraps `photoshootAPI.getAvailablePhotoshoots`
9. `useGetAvailableLawns` — wraps `lawnAPI.getAvailableLawns`
10. `useGetLawnCategories` — wraps `lawnAPI.getLawnCategories`
11. `useGetTimerVouchers` — wraps `voucherAPI.getTimerVouchers`
12. `useGetAffiliatedClubs` — wraps `getAffiliatedClubs`
13. `useGetAds` — wraps `getAds`
14. `useGetEvents` — wraps `getEvents`
15. `useGetRules` — wraps `getRules`
16. `useGetAboutUs` — wraps `getAboutUs`
17. `useGetClubHistory` — wraps `getClubHistory`
18. `useGetDashboardStats` — wraps `getDashboardStats`
19. `useGetSports` — wraps `getSports`
20. `useGetAllCalendarData` — wraps `calendarAPI.getAllCalendarData`
21. `useGetCalendarRooms` — wraps `calendarAPI.getCalendarRooms`
22. `useGetCalendarHalls` — wraps `calendarAPI.getHalls`
23. `useGetCalendarLawns` — wraps `calendarAPI.getLawns`
24. `useGetCalendarPhotoshoots` — wraps `calendarAPI.getPhotoshoots`
25. `useGetHallRule` — wraps `getHallRule`
26. `useGetRoomRule` — wraps `getRoomRule`
27. `useGetLawnRule` — wraps `getLawnRule`
28. `useGetPhotoshootRule` — wraps `getPhotoshootRule`
29. `useGetMessingCategory` — wraps `getMessingCategory`
30. `useGetCurrentAdmin` — wraps `getCurrentAdmin`
31. `useGetAuthAdmins` — wraps `getAuthAdmins`
32. `useGetFeedbackCategories` — wraps `feedbackAPI.getCategories`
33. `useGetFeedbackSubCategories` — wraps `feedbackAPI.getSubCategories`
34. `useGetFeedbacks` — wraps `feedbackAPI.getFeedbacks`

WHEN any of these hooks is called, THE Query_Hook SHALL return the `useQuery` result object containing `{ data, isLoading, isError, error, refetch }`.

---

### Requirement 5: Parameterized GET Hooks

**User Story:** As a developer, I want hooks for GET APIs that require runtime arguments, so that I can fetch resource-specific data reactively as parameters change.

#### Acceptance Criteria

1. `useGetHallReservations(hallId)` — wraps `banquetAPI.getHallReservations(hallId)`; Query_Key SHALL be `['hallReservations', hallId]`.
2. `useGetHallLogs(hallId, from, to)` — wraps `banquetAPI.getHallLogs(hallId, from, to)`; Query_Key SHALL be `['hallLogs', hallId, from, to]`.
3. `useGetHallVoucher(bookingId)` — wraps `banquetAPI.getHallVoucher(bookingId)`; Query_Key SHALL be `['hallVoucher', bookingId]`.
4. `useGetLawnNames(categoryId)` — wraps `lawnAPI.getLawnNames(categoryId)`; Query_Key SHALL be `['lawnNames', categoryId]`.
5. `useGetLawnReservations(lawnId)` — wraps `lawnAPI.getLawnReservations(lawnId)`; Query_Key SHALL be `['lawnReservations', lawnId]`.
6. `useGetLawnLogs(lawnId, from, to)` — wraps `lawnAPI.getLawnLogs(lawnId, from, to)`; Query_Key SHALL be `['lawnLogs', lawnId, from, to]`.
7. `useGetLawnsByCategory(categoryId)` — wraps `lawnAPI.getLawnsByCategory(categoryId)`; Query_Key SHALL be `['lawnsByCategory', categoryId]`.
8. `useGetVouchers(bookingType, bookingId)` — wraps `voucherAPI.getVouchers(bookingType, bookingId)`; Query_Key SHALL be `['vouchers', bookingType, bookingId]`.
9. `useGetVoucherByType(bookingType, bookingId)` — wraps `voucherAPI.getVoucherByType(bookingType, bookingId)`; Query_Key SHALL be `['voucherByType', bookingType, bookingId]`.
10. `useGetAffiliatedClubRequests(from, to, clubId)` — wraps `getAffiliatedClubRequests(from, to, clubId)`; Query_Key SHALL be `['affiliatedClubRequests', from, to, clubId]`.
11. `useGetMessingItemsByCategory(catID)` — wraps `getMessingItemsByCategory(catID)`; Query_Key SHALL be `['messingItemsByCategory', catID]`.
12. `useGetMessingSubCategoriesByCategory(catID)` — wraps `getMessingSubCategoriesByCategory(catID)`; Query_Key SHALL be `['messingSubCategories', catID]`.
13. `useGetMessingItemsBySubCategory(subCatID)` — wraps `getMessingItemsBySubCategory(subCatID)`; Query_Key SHALL be `['messingItemsBySubCategory', subCatID]`.
14. `useGetAdminReservations(adminId, filters)` — wraps `getAdminReservations(adminId, filters)`; Query_Key SHALL be `['adminReservations', adminId, filters]`.

WHEN a parameter changes, THE Query_Hook SHALL automatically re-fetch data for the new parameter value.
WHEN a required parameter is `undefined` or `null`, THE Query_Hook SHALL disable the query (set `enabled: false`) to prevent unnecessary API calls.

---

### Requirement 6: Loading and Error State Exposure

**User Story:** As a Hook_Consumer, I want consistent loading and error states from every hook, so that I can render skeletons and error messages without custom state management.

#### Acceptance Criteria

1. WHEN a query is in flight, THE Query_Hook SHALL expose `isLoading: true`.
2. WHEN a query succeeds, THE Query_Hook SHALL expose `isLoading: false` and `data` containing the API response.
3. WHEN a query fails after all retries, THE Query_Hook SHALL expose `isError: true` and `error` containing the thrown error object.
4. THE Query_Hook SHALL expose a `refetch` function that triggers a manual re-fetch on demand.

---

### Requirement 7: Caching Behavior

**User Story:** As a Hook_Consumer, I want data to be served from cache when it is still fresh, so that navigating between screens does not trigger redundant network requests.

#### Acceptance Criteria

1. WHEN cached data exists and is within the Stale_Time, THE Query_Hook SHALL return cached data without making a network request.
2. WHEN cached data is stale, THE Query_Hook SHALL return stale data immediately and trigger a background refetch.
3. WHEN a component unmounts and remounts within the cache window, THE Query_Hook SHALL serve cached data on remount.

---

### Requirement 8: Cache Invalidation Support

**User Story:** As a developer, I want to invalidate specific query caches after mutations, so that stale data is refreshed after write operations.

#### Acceptance Criteria

1. THE exported `QUERY_KEYS` constant SHALL allow callers to reference any key without hardcoding strings.
2. WHEN `queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.someKey] })` is called, THE Query_Client SHALL mark the matching cached data as stale and trigger a background refetch for any active subscriber.
3. THE exported `queryClient` instance SHALL be accessible outside of React components for use in non-component mutation handlers.
