# Implementation Plan: TanStack Query Integration

## Overview

Install TanStack Query, create `hooks/useQueries.js` with all 48 hooks, wire `QueryClientProvider` into the root component, and write property-based tests for the 6 correctness properties.

## Tasks

- [x] 1. Install TanStack Query dependency
  - Run `npm install @tanstack/react-query` (or yarn equivalent)
  - Verify the package appears in `package.json` dependencies
  - _Requirements: 1.1, 1.2_

- [x] 2. Create `hooks/useQueries.js` — QueryClient and QUERY_KEYS
  - [x] 2.1 Export `queryClient` singleton with `staleTime: 300_000` and `retry: 2`
    - Create `hooks/useQueries.js`
    - Import `QueryClient` from `@tanstack/react-query`
    - Export `queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300_000, retry: 2 } } })`
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 2.2 Export `QUERY_KEYS` constant with all 48 keys
    - Add the `QUERY_KEYS` object covering all non-parameterized and parameterized hook keys as specified in the design
    - _Requirements: 3.1, 3.3, 8.1_

- [x] 3. Implement the 34 non-parameterized hooks
  - [x] 3.1 Implement hooks 1–19 (user, banquet, photoshoot, lawn, voucher, clubs, content, dashboard, sports)
    - Import all required API functions from `config/apis.js`
    - Implement: `useUserWho`, `useGetUserData`, `useGetUserNotifications`, `useGetUnseenNotificationsCount`, `useGetMembershipNumber`, `useGetAllHalls`, `useGetAllPhotoshoots`, `useGetAvailablePhotoshoots`, `useGetAvailableLawns`, `useGetLawnCategories`, `useGetTimerVouchers`, `useGetAffiliatedClubs`, `useGetAds`, `useGetEvents`, `useGetRules`, `useGetAboutUs`, `useGetClubHistory`, `useGetDashboardStats`, `useGetSports`
    - Each hook: `export const useXxx = () => useQuery({ queryKey: [QUERY_KEYS.xxx], queryFn: apiFunction })`
    - _Requirements: 4.1–4.19_
  - [x] 3.2 Implement hooks 20–34 (calendar, rules, messing, admin, feedback)
    - Implement: `useGetAllCalendarData`, `useGetCalendarRooms`, `useGetCalendarHalls`, `useGetCalendarLawns`, `useGetCalendarPhotoshoots`, `useGetHallRule`, `useGetRoomRule`, `useGetLawnRule`, `useGetPhotoshootRule`, `useGetMessingCategory`, `useGetCurrentAdmin`, `useGetAuthAdmins`, `useGetFeedbackCategories`, `useGetFeedbackSubCategories`, `useGetFeedbacks`
    - _Requirements: 4.20–4.34_

- [x] 4. Implement the 14 parameterized hooks
  - [x] 4.1 Implement parameterized hooks with single param
    - Implement: `useGetHallReservations(hallId)`, `useGetHallVoucher(bookingId)`, `useGetLawnNames(categoryId)`, `useGetLawnReservations(lawnId)`, `useGetLawnsByCategory(categoryId)`, `useGetMessingItemsByCategory(catID)`, `useGetMessingSubCategoriesByCategory(catID)`, `useGetMessingItemsBySubCategory(subCatID)`
    - Each hook uses `enabled: param != null` guard
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.7, 5.11, 5.12, 5.13_
  - [x] 4.2 Implement parameterized hooks with multiple params
    - Implement: `useGetHallLogs(hallId, from, to)`, `useGetLawnLogs(lawnId, from, to)`, `useGetVouchers(bookingType, bookingId)`, `useGetVoucherByType(bookingType, bookingId)`, `useGetAffiliatedClubRequests(from, to, clubId)`, `useGetAdminReservations(adminId, filters)`
    - Each hook uses `enabled: param != null` guard on the primary required parameter
    - _Requirements: 5.2, 5.6, 5.8, 5.9, 5.10, 5.14, 5.15_

- [x] 5. Wrap root component with QueryClientProvider
  - Locate the app entry point (`App.js` or equivalent)
  - Import `QueryClientProvider` from `@tanstack/react-query` and `queryClient` from `hooks/useQueries`
  - Wrap the root JSX with `<QueryClientProvider client={queryClient}>...</QueryClientProvider>`
  - _Requirements: 1.3_

- [x] 6. Checkpoint — verify structure before tests
  - Ensure all 48 hooks are exported from `hooks/useQueries.js`
  - Ensure `queryClient` and `QUERY_KEYS` are exported
  - Ensure the app entry point renders without errors
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Write property-based tests
  - [x] 7.1 Write property test for Property 1 — hook delegates to API function
    - Use `fast-check` to generate a random hook from the 48 hooks with a mocked API function
    - Assert the mock was called exactly once after rendering
    - **Property 1: Every hook delegates to its API function**
    - **Validates: Requirements 2.4**
  - [x] 7.2 Write property test for Property 2 — parameterized query key contains params
    - Use `fast-check` to generate random non-null values for each parameterized hook's parameters
    - Assert the active query key array contains each generated value in order
    - **Property 2: Parameterized hooks include params in query key**
    - **Validates: Requirements 3.2, 5.1–5.14**
  - [x] 7.3 Write property test for Property 3 — null/undefined params disable query
    - Use `fast-check` to generate null or undefined for each parameter slot of each parameterized hook
    - Assert the underlying API mock is never called
    - **Property 3: Null/undefined params disable parameterized queries**
    - **Validates: Requirements 5.15**
  - [x] 7.4 Write property test for Property 4 — successful fetch exposes data
    - Use `fast-check` to generate random response objects from a mocked API function
    - Assert `data` equals the generated response and `isLoading` is false after resolution
    - **Property 4: Successful fetch exposes data and clears loading**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 7.5 Write property test for Property 5 — failed fetch exposes error state
    - Use `fast-check` to generate random error objects thrown by a mocked API function
    - Assert `isError` is true and `error` equals the generated error object
    - **Property 5: Failed fetch exposes error state**
    - **Validates: Requirements 6.3**
  - [x] 7.6 Write property test for Property 6 — refetch triggers new API call
    - Use `fast-check` to generate any hook in resolved state
    - Assert calling `refetch()` increments the mock call count by exactly 1
    - **Property 6: refetch triggers a new API call**
    - **Validates: Requirements 6.4**

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests require `fast-check` and `@testing-library/react-hooks` (or React Testing Library with `renderHook`)
- Each task references specific requirements for traceability
- The `enabled: param != null` guard applies to all parameterized hooks — if any primary param is null/undefined, the query is disabled
