import { QueryClient, useQuery } from '@tanstack/react-query';
import {
  userWho,
  getUserData,
  getUserNotifications,
  getUnseenNotificationsCount,
  getMembershipNumber,
  getAffiliatedClubs,
  getAds,
  getEvents,
  getRules,
  getAboutUs,
  getClubHistory,
  getDashboardStats,
  getSports,
  banquetAPI,
  photoshootAPI,
  lawnAPI,
  voucherAPI,
  calendarAPI,
  feedbackAPI,
  getHallRule,
  getRoomRule,
  getLawnRule,
  getPhotoshootRule,
  getMessingCategory,
  getCurrentAdmin,
  getAuthAdmins,
  getMessingItemsByCategory,
  getMessingSubCategoriesByCategory,
  getMessingItemsBySubCategory,
  getAffiliatedClubRequests,
  getAdminReservations,
} from '../config/apis';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300_000,
      retry: 2,
    },
  },
});

export const QUERY_KEYS = {
  userWho: 'userWho',
  userData: 'userData',
  userNotifications: 'userNotifications',
  unseenNotificationsCount: 'unseenNotificationsCount',
  membershipNumber: 'membershipNumber',
  allHalls: 'allHalls',
  hallReservations: 'hallReservations',
  hallLogs: 'hallLogs',
  hallVoucher: 'hallVoucher',
  allPhotoshoots: 'allPhotoshoots',
  availablePhotoshoots: 'availablePhotoshoots',
  availableLawns: 'availableLawns',
  lawnCategories: 'lawnCategories',
  lawnNames: 'lawnNames',
  lawnReservations: 'lawnReservations',
  lawnLogs: 'lawnLogs',
  lawnsByCategory: 'lawnsByCategory',
  timerVouchers: 'timerVouchers',
  vouchers: 'vouchers',
  voucherByType: 'voucherByType',
  affiliatedClubs: 'affiliatedClubs',
  affiliatedClubRequests: 'affiliatedClubRequests',
  ads: 'ads',
  events: 'events',
  rules: 'rules',
  aboutUs: 'aboutUs',
  clubHistory: 'clubHistory',
  dashboardStats: 'dashboardStats',
  sports: 'sports',
  allCalendarData: 'allCalendarData',
  calendarRooms: 'calendarRooms',
  calendarHalls: 'calendarHalls',
  calendarLawns: 'calendarLawns',
  calendarPhotoshoots: 'calendarPhotoshoots',
  hallRule: 'hallRule',
  roomRule: 'roomRule',
  lawnRule: 'lawnRule',
  photoshootRule: 'photoshootRule',
  messingCategory: 'messingCategory',
  messingItemsByCategory: 'messingItemsByCategory',
  messingSubCategories: 'messingSubCategories',
  messingItemsBySubCategory: 'messingItemsBySubCategory',
  currentAdmin: 'currentAdmin',
  authAdmins: 'authAdmins',
  adminReservations: 'adminReservations',
  feedbackCategories: 'feedbackCategories',
  feedbackSubCategories: 'feedbackSubCategories',
  feedbacks: 'feedbacks',
};

// ─── Non-Parameterized Hooks (1–19) ───────────────────────────────────────────

export const useUserWho = () => useQuery({ queryKey: [QUERY_KEYS.userWho], queryFn: userWho });
export const useGetUserData = () => useQuery({ queryKey: [QUERY_KEYS.userData], queryFn: getUserData });
export const useGetUserNotifications = () => useQuery({ queryKey: [QUERY_KEYS.userNotifications], queryFn: getUserNotifications });
export const useGetUnseenNotificationsCount = () => useQuery({ queryKey: [QUERY_KEYS.unseenNotificationsCount], queryFn: getUnseenNotificationsCount });
export const useGetMembershipNumber = () => useQuery({ queryKey: [QUERY_KEYS.membershipNumber], queryFn: getMembershipNumber });
export const useGetAllHalls = () => useQuery({ queryKey: [QUERY_KEYS.allHalls], queryFn: banquetAPI.getAllHalls });
export const useGetAllPhotoshoots = () => useQuery({ queryKey: [QUERY_KEYS.allPhotoshoots], queryFn: photoshootAPI.getAllPhotoshoots });
export const useGetAvailablePhotoshoots = () => useQuery({ queryKey: [QUERY_KEYS.availablePhotoshoots], queryFn: photoshootAPI.getAvailablePhotoshoots });
export const useGetAvailableLawns = () => useQuery({ queryKey: [QUERY_KEYS.availableLawns], queryFn: lawnAPI.getAvailableLawns });
export const useGetLawnCategories = () => useQuery({ queryKey: [QUERY_KEYS.lawnCategories], queryFn: lawnAPI.getLawnCategories });
export const useGetTimerVouchers = () => useQuery({ queryKey: [QUERY_KEYS.timerVouchers], queryFn: voucherAPI.getTimerVouchers });
export const useGetAffiliatedClubs = () => useQuery({ queryKey: [QUERY_KEYS.affiliatedClubs], queryFn: getAffiliatedClubs });
export const useGetAds = () => useQuery({ queryKey: [QUERY_KEYS.ads], queryFn: getAds });
export const useGetEvents = () => useQuery({ queryKey: [QUERY_KEYS.events], queryFn: getEvents });
export const useGetRules = () => useQuery({ queryKey: [QUERY_KEYS.rules], queryFn: getRules });
export const useGetAboutUs = () => useQuery({ queryKey: [QUERY_KEYS.aboutUs], queryFn: getAboutUs });
export const useGetClubHistory = () => useQuery({ queryKey: [QUERY_KEYS.clubHistory], queryFn: getClubHistory });
export const useGetDashboardStats = () => useQuery({ queryKey: [QUERY_KEYS.dashboardStats], queryFn: getDashboardStats });
export const useGetSports = () => useQuery({ queryKey: [QUERY_KEYS.sports], queryFn: getSports });

// ─── Non-Parameterized Hooks (20–34) ─────────────────────────────────────────

export const useGetAllCalendarData = () => useQuery({ queryKey: [QUERY_KEYS.allCalendarData], queryFn: calendarAPI.getAllCalendarData });
export const useGetCalendarRooms = () => useQuery({ queryKey: [QUERY_KEYS.calendarRooms], queryFn: calendarAPI.getCalendarRooms });
export const useGetCalendarHalls = () => useQuery({ queryKey: [QUERY_KEYS.calendarHalls], queryFn: calendarAPI.getHalls });
export const useGetCalendarLawns = () => useQuery({ queryKey: [QUERY_KEYS.calendarLawns], queryFn: calendarAPI.getLawns });
export const useGetCalendarPhotoshoots = () => useQuery({ queryKey: [QUERY_KEYS.calendarPhotoshoots], queryFn: calendarAPI.getPhotoshoots });
export const useGetHallRule = () => useQuery({ queryKey: [QUERY_KEYS.hallRule], queryFn: getHallRule });
export const useGetRoomRule = () => useQuery({ queryKey: [QUERY_KEYS.roomRule], queryFn: getRoomRule });
export const useGetLawnRule = () => useQuery({ queryKey: [QUERY_KEYS.lawnRule], queryFn: getLawnRule });
export const useGetPhotoshootRule = () => useQuery({ queryKey: [QUERY_KEYS.photoshootRule], queryFn: getPhotoshootRule });
export const useGetMessingCategory = () => useQuery({ queryKey: [QUERY_KEYS.messingCategory], queryFn: getMessingCategory });
export const useGetCurrentAdmin = () => useQuery({ queryKey: [QUERY_KEYS.currentAdmin], queryFn: getCurrentAdmin });
export const useGetAuthAdmins = () => useQuery({ queryKey: [QUERY_KEYS.authAdmins], queryFn: getAuthAdmins });
export const useGetFeedbackCategories = () => useQuery({ queryKey: [QUERY_KEYS.feedbackCategories], queryFn: feedbackAPI.getCategories });
export const useGetFeedbackSubCategories = () => useQuery({ queryKey: [QUERY_KEYS.feedbackSubCategories], queryFn: feedbackAPI.getSubCategories });
export const useGetFeedbacks = () => useQuery({ queryKey: [QUERY_KEYS.feedbacks], queryFn: feedbackAPI.getFeedbacks });

// ─── Parameterized Hooks — Single Param ──────────────────────────────────────

export const useGetHallReservations = (hallId) =>
  useQuery({ queryKey: [QUERY_KEYS.hallReservations, hallId], queryFn: () => banquetAPI.getHallReservations(hallId), enabled: hallId != null });

export const useGetHallVoucher = (bookingId) =>
  useQuery({ queryKey: [QUERY_KEYS.hallVoucher, bookingId], queryFn: () => banquetAPI.getHallVoucher(bookingId), enabled: bookingId != null });

export const useGetLawnNames = (categoryId) =>
  useQuery({ queryKey: [QUERY_KEYS.lawnNames, categoryId], queryFn: () => lawnAPI.getLawnNames(categoryId), enabled: categoryId != null });

export const useGetLawnReservations = (lawnId) =>
  useQuery({ queryKey: [QUERY_KEYS.lawnReservations, lawnId], queryFn: () => lawnAPI.getLawnReservations(lawnId), enabled: lawnId != null });

export const useGetLawnsByCategory = (categoryId) =>
  useQuery({ queryKey: [QUERY_KEYS.lawnsByCategory, categoryId], queryFn: () => lawnAPI.getLawnsByCategory(categoryId), enabled: categoryId != null });

export const useGetMessingItemsByCategory = (catID) =>
  useQuery({ queryKey: [QUERY_KEYS.messingItemsByCategory, catID], queryFn: () => getMessingItemsByCategory(catID), enabled: catID != null });

export const useGetMessingSubCategoriesByCategory = (catID) =>
  useQuery({ queryKey: [QUERY_KEYS.messingSubCategories, catID], queryFn: () => getMessingSubCategoriesByCategory(catID), enabled: catID != null });

export const useGetMessingItemsBySubCategory = (subCatID) =>
  useQuery({ queryKey: [QUERY_KEYS.messingItemsBySubCategory, subCatID], queryFn: () => getMessingItemsBySubCategory(subCatID), enabled: subCatID != null });

// ─── Parameterized Hooks — Multiple Params ────────────────────────────────────

export const useGetHallLogs = (hallId, from, to) =>
  useQuery({ queryKey: [QUERY_KEYS.hallLogs, hallId, from, to], queryFn: () => banquetAPI.getHallLogs(hallId, from, to), enabled: hallId != null });

export const useGetLawnLogs = (lawnId, from, to) =>
  useQuery({ queryKey: [QUERY_KEYS.lawnLogs, lawnId, from, to], queryFn: () => lawnAPI.getLawnLogs(lawnId, from, to), enabled: lawnId != null });

export const useGetVouchers = (bookingType, bookingId) =>
  useQuery({ queryKey: [QUERY_KEYS.vouchers, bookingType, bookingId], queryFn: () => voucherAPI.getVouchers(bookingType, bookingId), enabled: bookingType != null });

export const useGetVoucherByType = (bookingType, bookingId) =>
  useQuery({ queryKey: [QUERY_KEYS.voucherByType, bookingType, bookingId], queryFn: () => voucherAPI.getVoucherByType(bookingType, bookingId), enabled: bookingType != null });

export const useGetAffiliatedClubRequests = (from, to, clubId) =>
  useQuery({ queryKey: [QUERY_KEYS.affiliatedClubRequests, from, to, clubId], queryFn: () => getAffiliatedClubRequests(from, to, clubId), enabled: from != null });

export const useGetAdminReservations = (adminId, filters) =>
  useQuery({ queryKey: [QUERY_KEYS.adminReservations, adminId, filters], queryFn: () => getAdminReservations(adminId, filters), enabled: adminId != null });
