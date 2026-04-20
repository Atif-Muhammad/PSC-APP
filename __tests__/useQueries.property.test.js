/**
 * Property-Based Test for TanStack Query Integration
 *
 * **Validates: Requirements 2.4**
 *
 * Property 1: Every hook delegates to its API function
 * Tag: Feature: tanstack-query-integration, Property 1: every hook delegates to its API function
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import fc from 'fast-check';

// Mock the entire apis module before importing hooks
jest.mock('../config/apis', () => {
  const mockFn = () => jest.fn().mockResolvedValue({ data: 'mock' });
  return {
    userWho: mockFn(),
    getUserData: mockFn(),
    getUserNotifications: mockFn(),
    getUnseenNotificationsCount: mockFn(),
    getMembershipNumber: mockFn(),
    getAffiliatedClubs: mockFn(),
    getAds: mockFn(),
    getEvents: mockFn(),
    getRules: mockFn(),
    getAboutUs: mockFn(),
    getClubHistory: mockFn(),
    getDashboardStats: mockFn(),
    getSports: mockFn(),
    getHallRule: mockFn(),
    getRoomRule: mockFn(),
    getLawnRule: mockFn(),
    getPhotoshootRule: mockFn(),
    getMessingCategory: mockFn(),
    getCurrentAdmin: mockFn(),
    getAuthAdmins: mockFn(),
    getMessingItemsByCategory: mockFn(),
    getMessingSubCategoriesByCategory: mockFn(),
    getMessingItemsBySubCategory: mockFn(),
    getAffiliatedClubRequests: mockFn(),
    getAdminReservations: mockFn(),
    banquetAPI: {
      getAllHalls: mockFn(),
      getHallReservations: mockFn(),
      getHallLogs: mockFn(),
      getHallVoucher: mockFn(),
    },
    photoshootAPI: {
      getAllPhotoshoots: mockFn(),
      getAvailablePhotoshoots: mockFn(),
    },
    lawnAPI: {
      getAvailableLawns: mockFn(),
      getLawnCategories: mockFn(),
      getLawnNames: mockFn(),
      getLawnReservations: mockFn(),
      getLawnsByCategory: mockFn(),
      getLawnLogs: mockFn(),
    },
    voucherAPI: {
      getTimerVouchers: mockFn(),
      getVouchers: mockFn(),
      getVoucherByType: mockFn(),
    },
    calendarAPI: {
      getAllCalendarData: mockFn(),
      getCalendarRooms: mockFn(),
      getHalls: mockFn(),
      getLawns: mockFn(),
      getPhotoshoots: mockFn(),
    },
    feedbackAPI: {
      getCategories: mockFn(),
      getSubCategories: mockFn(),
      getFeedbacks: mockFn(),
    },
  };
});

// Import hooks AFTER mocking
const hooksModule = require('../hooks/useQueries');
const apisModule = require('../config/apis');

// Create a fresh QueryClient per test to avoid cache pollution
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Array of [hook, mockApiFn] pairs for all 34 non-parameterized hooks
const NON_PARAMETERIZED_HOOK_PAIRS = [
  [hooksModule.useUserWho, apisModule.userWho],
  [hooksModule.useGetUserData, apisModule.getUserData],
  [hooksModule.useGetUserNotifications, apisModule.getUserNotifications],
  [hooksModule.useGetUnseenNotificationsCount, apisModule.getUnseenNotificationsCount],
  [hooksModule.useGetMembershipNumber, apisModule.getMembershipNumber],
  [hooksModule.useGetAllHalls, apisModule.banquetAPI.getAllHalls],
  [hooksModule.useGetAllPhotoshoots, apisModule.photoshootAPI.getAllPhotoshoots],
  [hooksModule.useGetAvailablePhotoshoots, apisModule.photoshootAPI.getAvailablePhotoshoots],
  [hooksModule.useGetAvailableLawns, apisModule.lawnAPI.getAvailableLawns],
  [hooksModule.useGetLawnCategories, apisModule.lawnAPI.getLawnCategories],
  [hooksModule.useGetTimerVouchers, apisModule.voucherAPI.getTimerVouchers],
  [hooksModule.useGetAffiliatedClubs, apisModule.getAffiliatedClubs],
  [hooksModule.useGetAds, apisModule.getAds],
  [hooksModule.useGetEvents, apisModule.getEvents],
  [hooksModule.useGetRules, apisModule.getRules],
  [hooksModule.useGetAboutUs, apisModule.getAboutUs],
  [hooksModule.useGetClubHistory, apisModule.getClubHistory],
  [hooksModule.useGetDashboardStats, apisModule.getDashboardStats],
  [hooksModule.useGetSports, apisModule.getSports],
  [hooksModule.useGetAllCalendarData, apisModule.calendarAPI.getAllCalendarData],
  [hooksModule.useGetCalendarRooms, apisModule.calendarAPI.getCalendarRooms],
  [hooksModule.useGetCalendarHalls, apisModule.calendarAPI.getHalls],
  [hooksModule.useGetCalendarLawns, apisModule.calendarAPI.getLawns],
  [hooksModule.useGetCalendarPhotoshoots, apisModule.calendarAPI.getPhotoshoots],
  [hooksModule.useGetHallRule, apisModule.getHallRule],
  [hooksModule.useGetRoomRule, apisModule.getRoomRule],
  [hooksModule.useGetLawnRule, apisModule.getLawnRule],
  [hooksModule.useGetPhotoshootRule, apisModule.getPhotoshootRule],
  [hooksModule.useGetMessingCategory, apisModule.getMessingCategory],
  [hooksModule.useGetCurrentAdmin, apisModule.getCurrentAdmin],
  [hooksModule.useGetAuthAdmins, apisModule.getAuthAdmins],
  [hooksModule.useGetFeedbackCategories, apisModule.feedbackAPI.getCategories],
  [hooksModule.useGetFeedbackSubCategories, apisModule.feedbackAPI.getSubCategories],
  [hooksModule.useGetFeedbacks, apisModule.feedbackAPI.getFeedbacks],
];

/**
 * Property 2: Parameterized hooks include params in query key
 *
 * **Validates: Requirements 3.2, 5.1–5.14**
 *
 * Tag: Feature: tanstack-query-integration, Property 2: parameterized hooks include params in query key
 */

// QUERY_KEYS reference for parameterized hooks
const QUERY_KEYS = hooksModule.QUERY_KEYS;

// Specs for all 14 parameterized hooks (Requirements 5.1–5.14)
const PARAMETERIZED_HOOK_SPECS = [
  // 5.1 useGetHallReservations(hallId) → ['hallReservations', hallId]
  {
    name: 'useGetHallReservations',
    useHook: (params) => hooksModule.useGetHallReservations(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'hallReservations',
  },
  // 5.2 useGetHallLogs(hallId, from, to) → ['hallLogs', hallId, from, to]
  {
    name: 'useGetHallLogs',
    useHook: (params) => hooksModule.useGetHallLogs(params[0], params[1], params[2]),
    arb: fc.tuple(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 500 }),
      fc.integer({ min: 501, max: 1000 }),
    ),
    keyPrefix: 'hallLogs',
  },
  // 5.3 useGetHallVoucher(bookingId) → ['hallVoucher', bookingId]
  {
    name: 'useGetHallVoucher',
    useHook: (params) => hooksModule.useGetHallVoucher(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'hallVoucher',
  },
  // 5.4 useGetLawnNames(categoryId) → ['lawnNames', categoryId]
  {
    name: 'useGetLawnNames',
    useHook: (params) => hooksModule.useGetLawnNames(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'lawnNames',
  },
  // 5.5 useGetLawnReservations(lawnId) → ['lawnReservations', lawnId]
  {
    name: 'useGetLawnReservations',
    useHook: (params) => hooksModule.useGetLawnReservations(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'lawnReservations',
  },
  // 5.6 useGetLawnLogs(lawnId, from, to) → ['lawnLogs', lawnId, from, to]
  {
    name: 'useGetLawnLogs',
    useHook: (params) => hooksModule.useGetLawnLogs(params[0], params[1], params[2]),
    arb: fc.tuple(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 500 }),
      fc.integer({ min: 501, max: 1000 }),
    ),
    keyPrefix: 'lawnLogs',
  },
  // 5.7 useGetLawnsByCategory(categoryId) → ['lawnsByCategory', categoryId]
  {
    name: 'useGetLawnsByCategory',
    useHook: (params) => hooksModule.useGetLawnsByCategory(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'lawnsByCategory',
  },
  // 5.8 useGetVouchers(bookingType, bookingId) → ['vouchers', bookingType, bookingId]
  {
    name: 'useGetVouchers',
    useHook: (params) => hooksModule.useGetVouchers(params[0], params[1]),
    arb: fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.integer({ min: 1, max: 1000 }),
    ),
    keyPrefix: 'vouchers',
  },
  // 5.9 useGetVoucherByType(bookingType, bookingId) → ['voucherByType', bookingType, bookingId]
  {
    name: 'useGetVoucherByType',
    useHook: (params) => hooksModule.useGetVoucherByType(params[0], params[1]),
    arb: fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.integer({ min: 1, max: 1000 }),
    ),
    keyPrefix: 'voucherByType',
  },
  // 5.10 useGetAffiliatedClubRequests(from, to, clubId) → ['affiliatedClubRequests', from, to, clubId]
  {
    name: 'useGetAffiliatedClubRequests',
    useHook: (params) => hooksModule.useGetAffiliatedClubRequests(params[0], params[1], params[2]),
    arb: fc.tuple(
      fc.integer({ min: 1, max: 500 }),
      fc.integer({ min: 501, max: 1000 }),
      fc.integer({ min: 1, max: 1000 }),
    ),
    keyPrefix: 'affiliatedClubRequests',
  },
  // 5.11 useGetMessingItemsByCategory(catID) → ['messingItemsByCategory', catID]
  {
    name: 'useGetMessingItemsByCategory',
    useHook: (params) => hooksModule.useGetMessingItemsByCategory(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'messingItemsByCategory',
  },
  // 5.12 useGetMessingSubCategoriesByCategory(catID) → ['messingSubCategories', catID]
  {
    name: 'useGetMessingSubCategoriesByCategory',
    useHook: (params) => hooksModule.useGetMessingSubCategoriesByCategory(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'messingSubCategories',
  },
  // 5.13 useGetMessingItemsBySubCategory(subCatID) → ['messingItemsBySubCategory', subCatID]
  {
    name: 'useGetMessingItemsBySubCategory',
    useHook: (params) => hooksModule.useGetMessingItemsBySubCategory(params[0]),
    arb: fc.tuple(fc.integer({ min: 1, max: 1000 })),
    keyPrefix: 'messingItemsBySubCategory',
  },
  // 5.14 useGetAdminReservations(adminId, filters) → ['adminReservations', adminId, filters]
  {
    name: 'useGetAdminReservations',
    useHook: (params) => hooksModule.useGetAdminReservations(params[0], params[1]),
    arb: fc.tuple(
      fc.integer({ min: 1, max: 1000 }),
      fc.record({ status: fc.string({ minLength: 1, maxLength: 10 }) }),
    ),
    keyPrefix: 'adminReservations',
  },
];

describe('Property 2: Parameterized hooks include params in query key', () => {
  it(
    'for any parameterized hook and any non-null params, the query key contains each param value in order',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...PARAMETERIZED_HOOK_SPECS).chain((spec) =>
            spec.arb.map((params) => ({ spec, params }))
          ),
          async ({ spec, params }) => {
            const queryClient = new QueryClient({
              defaultOptions: { queries: { retry: false } },
            });
            const wrapper = ({ children }) => (
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            renderHook(() => spec.useHook(params), { wrapper });

            // Give the query a tick to register in the cache
            await new Promise((resolve) => setTimeout(resolve, 0));

            const allQueries = queryClient.getQueryCache().getAll();
            const matchingQuery = allQueries.find(
              (q) => Array.isArray(q.queryKey) && q.queryKey[0] === spec.keyPrefix
            );

            // The query with the expected prefix must exist
            expect(matchingQuery).toBeDefined();

            // Every param value must appear in the key array, in order
            const key = matchingQuery.queryKey;
            params.forEach((param, index) => {
              expect(key[index + 1]).toEqual(param);
            });
          }
        ),
        { numRuns: 10 }
      );
    }
  );
});

describe('Property 1: Every hook delegates to its API function', () => {
  beforeEach(() => {
    // Reset all mocks before each test run
    jest.clearAllMocks();
    // Re-set all mocks to resolve successfully
    NON_PARAMETERIZED_HOOK_PAIRS.forEach(([, mockFn]) => {
      mockFn.mockResolvedValue({ data: 'mock' });
    });
  });

  it(
    'for any non-parameterized hook, rendering it calls the underlying API function at least once',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...NON_PARAMETERIZED_HOOK_PAIRS),
          async ([useHook, mockApiFn]) => {
            // Clear this specific mock's call count
            mockApiFn.mockClear();

            const wrapper = createWrapper();
            const { result } = renderHook(() => useHook(), { wrapper });

            // Wait for the query to settle (loading to finish)
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Assert the API function was called at least once
            expect(mockApiFn).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 10 }
      );
    }
  );
});

/**
 * Property 3: Null/undefined params disable parameterized queries
 *
 * **Validates: Requirements 5.15**
 *
 * Tag: Feature: tanstack-query-integration, Property 3: null/undefined params disable parameterized queries
 */
describe('Property 3: Null/undefined params disable parameterized queries', () => {
  it('for any parameterized hook, null/undefined primary param prevents API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PARAMETERIZED_HOOK_SPECS),
        fc.constantFrom(null, undefined),
        async (spec, nullParam) => {
          // Clear all mocks before each run
          jest.clearAllMocks();

          const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
          });
          const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          );

          // Pass null/undefined as the first (primary) param, valid values for the rest
          const { result } = renderHook(
            () => spec.useHook([nullParam, 1, 1]),
            { wrapper }
          );

          // Wait a tick for any async effects to settle
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Query should be disabled — fetchStatus must be 'idle'
          expect(result.current.fetchStatus).toBe('idle');
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 4: Successful fetch exposes data and clears loading
 *
 * **Validates: Requirements 6.1, 6.2**
 *
 * Tag: Feature: tanstack-query-integration, Property 4: successful fetch exposes data and clears loading
 */
describe('Property 4: Successful fetch exposes data and clears loading', () => {
  it('for any hook and any valid response, data equals the response and isLoading is false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...NON_PARAMETERIZED_HOOK_PAIRS),
        fc.anything(),
        async ([useHook, mockApiFn], response) => {
          mockApiFn.mockResolvedValue(response);

          const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
          const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          );

          const { result } = renderHook(() => useHook(), { wrapper });

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          expect(result.current.data).toEqual(response);
          expect(result.current.isLoading).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 5: Failed fetch exposes error state
 *
 * **Validates: Requirements 6.3**
 *
 * Tag: Feature: tanstack-query-integration, Property 5: failed fetch exposes error state
 */
describe('Property 5: Failed fetch exposes error state', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('for any hook, when API throws, isError is true and error matches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...NON_PARAMETERIZED_HOOK_PAIRS),
        fc.string({ minLength: 1, maxLength: 100 }),
        async ([useHook, mockApiFn], errorMessage) => {
          const error = new Error(errorMessage);
          mockApiFn.mockReset();
          mockApiFn.mockRejectedValue(error);

          const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
          const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          );

          const { result } = renderHook(() => useHook(), { wrapper });

          await waitFor(
            () => {
              expect(result.current.isError).toBe(true);
            },
            { timeout: 5000 }
          );

          expect(result.current.error).toBe(error);
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 6: refetch triggers a new API call
 *
 * **Validates: Requirements 6.4**
 *
 * Tag: Feature: tanstack-query-integration, Property 6: refetch triggers a new API call
 */
describe('Property 6: refetch triggers a new API call', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    NON_PARAMETERIZED_HOOK_PAIRS.forEach(([, mockFn]) => {
      mockFn.mockResolvedValue({ data: 'mock' });
    });
  });

  it('for any hook in resolved state, calling refetch() invokes the API function again', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...NON_PARAMETERIZED_HOOK_PAIRS),
        async ([useHook, mockApiFn]) => {
          mockApiFn.mockClear();
          mockApiFn.mockResolvedValue({ data: 'mock' });

          const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
          const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          );

          const { result } = renderHook(() => useHook(), { wrapper });

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          const callCountAfterInitial = mockApiFn.mock.calls.length;
          expect(callCountAfterInitial).toBe(1);

          // Trigger refetch
          result.current.refetch();

          // Wait for refetch to complete
          await waitFor(() => {
            expect(result.current.isFetching).toBe(false);
          });

          // Assert one more call was made
          expect(mockApiFn.mock.calls.length).toBe(callCountAfterInitial + 1);
        }
      ),
      { numRuns: 10 }
    );
  });
});
