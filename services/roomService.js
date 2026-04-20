// services/roomService.js
import { api, getAuthToken } from '../config/apis';

export const roomService = {
  // Get all room types
  getRoomTypes: async () => {
    try {
      console.log('🔄 Fetching room types...');
      const token = await getAuthToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/room/get/roomTypes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Room types fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching room types:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available rooms by type
  getAvailableRooms: async (roomTypeId, userRole) => {
    try {
      const token = await getAuthToken();

      console.log('🔐 Fetching rooms with role:', userRole);

      // For MEMBER role, use the member-specific endpoint
      if (userRole === 'MEMBER') {
        console.log('👤 Using member endpoint for room availability');

        // Use today and tomorrow as dates for immediate availability check
        const todayVal = new Date();
        const today = `${todayVal.getFullYear()}-${String(todayVal.getMonth() + 1).padStart(2, '0')}-${String(todayVal.getDate()).padStart(2, '0')}`;
        const tomorrowVal = new Date(Date.now() + 86400000);
        const tomorrow = `${tomorrowVal.getFullYear()}-${String(tomorrowVal.getMonth() + 1).padStart(2, '0')}-${String(tomorrowVal.getDate()).padStart(2, '0')}`;

        const response = await api.post(
          `/room/member/check/rooms/available?roomType=${roomTypeId}`,
          {
            from: today,
            to: tomorrow,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } else {
        // For ADMIN/SUPER_ADMIN, use the regular endpoint
        console.log('👮 Using admin endpoint for room availability');
        const response = await api.get(`/room/get/rooms/available?roomTypeId=${roomTypeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error fetching available rooms:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  // getAvailableRooms: async (roomTypeId) => {
  //   try {
  //     const token = await getAuthToken();
  //     const response = await api.get(`/room/get/rooms/available?roomTypeId=${roomTypeId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching available rooms:', error);
  //     throw error;
  //   }
  // },

  // Get member available rooms for dates
  getMemberRoomsForDate: async (fromDate, toDate, roomType) => {
    try {
      const token = await getAuthToken();
      const response = await api.post(`/room/member/check/rooms/available?roomType=${roomType}`, {
        from: fromDate,
        to: toDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching member rooms:', error);
      throw error;
    }
  },

  reserveRooms: async (payload) => {
    try {
      const token = await getAuthToken();

      console.log('📤 Sending reservation request:', JSON.stringify(payload, null, 2));
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token');

      const response = await api.patch('/room/reserve/rooms', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Reservation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Reservation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      // More specific error handling
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid request data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to reserve rooms.');
      } else if (error.response?.status === 409) {
        throw new Error(error.response.data?.message || 'Room reservation conflict');
      } else if (error.response?.status === 500) {
        throw new Error(error.response.data?.message || 'Server error during reservation. Please try again.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Reservation failed');
      }
    }
  },
};