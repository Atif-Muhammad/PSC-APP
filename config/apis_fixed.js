// FIXED reservation functions for apis.js

// Cancel reservation - FIXED: Use toggle pattern like web portal
export const cancelReservation = async (reservationData) => {
  try {
    console.log('🔄 Canceling reservation with toggle pattern...', reservationData);
    
    // Extract required data from reservationData
    const { roomIds, reserveFrom, reserveTo, remarks } = reservationData;
    
    // Use the same toggle pattern as working unreserve logic
    const payload = {
      roomIds: roomIds,        // Array of room IDs
      reserve: false,          // Set to false to cancel/unreserve
      reserveFrom: reserveFrom, // Same date as original reservation
      reserveTo: reserveTo,     // Same date as original reservation
      remarks: remarks || 'Reservation cancelled', // Optional remarks
    };
    
    console.log('📤 Cancel payload:', JSON.stringify(payload, null, 2));
    
    // Use the same endpoint as reserveRooms but with reserve: false
    const response = await api.patch('/room/reserve/rooms', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });
    
    console.log('✅ Reservation cancelled successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Cancel reservation error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });
    throw error;
  }
};

// Update reservation - FIXED: Use toggle pattern with new dates
export const updateReservation = async (reservationData, newDates) => {
  try {
    console.log('🔄 Updating reservation with toggle pattern...', { reservationData, newDates });
    
    // First, cancel the existing reservation (set reserve: false)
    const cancelPayload = {
      roomIds: reservationData.roomIds,
      reserve: false,
      reserveFrom: reservationData.reserveFrom,
      reserveTo: reservationData.reserveTo,
      remarks: 'Updating reservation dates'
    };
    
    console.log('📤 Cancel existing reservation:', JSON.stringify(cancelPayload, null, 2));
    await api.patch('/room/reserve/rooms', cancelPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });
    
    // Then, create new reservation with updated dates (set reserve: true)
    const updatePayload = {
      roomIds: reservationData.roomIds,
      reserve: true,
      reserveFrom: newDates.reserveFrom,
      reserveTo: newDates.reserveTo,
      remarks: newDates.remarks || 'Reservation updated'
    };
    
    console.log('📤 Create updated reservation:', JSON.stringify(updatePayload, null, 2));
    const response = await api.patch('/room/reserve/rooms', updatePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });
    
    console.log('✅ Reservation updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update reservation error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};