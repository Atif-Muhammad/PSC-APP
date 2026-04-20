// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     TouchableOpacity,
//     ActivityIndicator,
//     Alert,
//     StatusBar,
//     TextInput,
//     Switch,
//     Dimensions,
//     ImageBackground,
//     SafeAreaView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Feather from 'react-native-vector-icons/Feather';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { roomService } from '../../services/roomService';
// import { bookingService } from '../../services/bookingService';
// import { useVoucher } from '../auth/contexts/VoucherContext';
// import { useAuth } from '../auth/contexts/AuthContext';

// const { width: screenWidth } = Dimensions.get('window');
// const MAX_ROOMS = 8;
// const CALENDAR_LIMIT_DAYS = 30;

// const ROOM_BOOKING_CONFIG = {
//     advancePayment: { "1-2": 0.25, "3-5": 0.50, "6-8": 0.75 },
//     cancellationRefund: {
//         moreThan72Hours: { "1-2": 0.05, "3-5": 0.15, "6-8": 0.25 },
//         "24To72Hours": { "1-2": 0.10, "3-5": 0.25, "6-8": 0.50 },
//         lessThan24Hours: { "1-2": 1.00, "3-5": 1.00, "6-8": 1.00 }
//     }
// };

// export default function RoomBookingScreen({ navigation, route }) {
//     const { setVoucher } = useVoucher();
//     const { user } = useAuth();

//     // Get params from navigation
//     const { roomType, room, isMember, isAvailable } = route.params || {};

//     const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
//     const userName = user?.name || user?.username || user?.fullName;

//     // Form state
//     const [checkIn, setCheckIn] = useState(new Date());
//     const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
//     const [showCheckInPicker, setShowCheckInPicker] = useState(false);
//     const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
//     const [numberOfAdults, setNumberOfAdults] = useState('1');
//     const [numberOfChildren, setNumberOfChildren] = useState('0');
//     const [numberOfRooms, setNumberOfRooms] = useState('1');
//     const [specialRequest, setSpecialRequest] = useState('');
//     const [loading, setLoading] = useState(false);

//     // Guest booking fields - DEFAULT TO TRUE
//     const [isGuestBooking, setIsGuestBooking] = useState(true);
//     const [guestName, setGuestName] = useState('');
//     const [guestContact, setGuestContact] = useState('');

//     const calculateTotalPrice = () => {
//         const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
//         const price = isGuestBooking ? roomType?.priceGuest : roomType?.priceMember;
//         const roomsCount = parseInt(numberOfRooms) || 1;
//         const totalAmount = nights * (price || 0) * roomsCount;

//         // Calculate advance payment required based on number of rooms
//         let advanceMultiplier = 0.25; // Default for 1-2 rooms
//         if (roomsCount >= 3 && roomsCount <= 5) advanceMultiplier = 0.50;
//         else if (roomsCount >= 6 && roomsCount <= 8) advanceMultiplier = 0.75;

//         return {
//             total: totalAmount,
//             advance: totalAmount * advanceMultiplier
//         };
//     };

//     const calculateRefund = (checkInDate, roomsCount) => {
//         const now = new Date();
//         const diffHours = (checkInDate - now) / (1000 * 60 * 60);
//         let tier = "";

//         if (diffHours > 72) tier = "moreThan72Hours";
//         else if (diffHours >= 24) tier = "24To72Hours";
//         else tier = "lessThan24Hours";

//         let roomsTier = "1-2";
//         if (roomsCount >= 3 && roomsCount <= 5) roomsTier = "3-5";
//         else if (roomsCount >= 6 && roomsCount <= 8) roomsTier = "6-8";

//         const refundPercentage = ROOM_BOOKING_CONFIG.cancellationRefund[tier][roomsTier];
//         return refundPercentage; // This returns the deduction percentage
//     };

//     const formatDateForDisplay = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const handleRoomInput = (value) => {
//         if (value === '') {
//             setNumberOfRooms('');
//             return;
//         }

//         const rooms = parseInt(value);
//         if (isNaN(rooms)) return;

//         if (rooms > MAX_ROOMS) {
//             Alert.alert(
//                 "Limit Exceeded",
//                 `Maximum limit of ${MAX_ROOMS} rooms exceeded. Please contact Admin for large group bookings.`
//             );
//             setNumberOfRooms(MAX_ROOMS.toString());
//         } else {
//             setNumberOfRooms(value);
//         }
//     };

//     const handleConfirmBooking = async () => {
//         if (!checkIn || !checkOut) {
//             Alert.alert('Error', 'Please select check-in and check-out dates');
//             return;
//         }

//         if (checkIn >= checkOut) {
//             Alert.alert('Error', 'Check-out date must be after check-in date');
//             return;
//         }

//         const adults = parseInt(numberOfAdults) || 1;
//         const children = parseInt(numberOfChildren) || 0;
//         const roomsCount = parseInt(numberOfRooms) || 1;

//         if (adults < 1) {
//             Alert.alert('Error', 'At least one adult is required');
//             return;
//         }


//         if (roomsCount < 1) {
//             Alert.alert('Error', 'At least one room is required');
//             return;
//         }

//         if (roomsCount > MAX_ROOMS) {
//             Alert.alert('Error', `Maximum ${MAX_ROOMS} rooms can be booked at once.`);
//             return;
//         }

//         // Strict Occupancy Limit (Max 2 Adults, 2 Children per room)
//         const maxAdults = roomsCount * 2;
//         const maxChildren = roomsCount * 2;

//         if (adults > maxAdults) {
//             Alert.alert(
//                 'Occupancy Limit Exceeded',
//                 `A maximum of 2 adults are allowed per room.\n\nFor ${adults} adults, you need at least ${Math.ceil(adults / 2)} rooms.`
//             );
//             return;
//         }

//         if (children > maxChildren) {
//             Alert.alert(
//                 'Occupancy Limit Exceeded',
//                 `A maximum of 2 children are allowed per room.\n\nFor ${children} children, you need at least ${Math.ceil(children / 2)} rooms.`
//             );
//             return;
//         }

//         if (isGuestBooking) {
//             if (!guestName || guestName.trim() === '') {
//                 Alert.alert('Error', 'Please enter guest name');
//                 return;
//             }
//             if (!guestContact || guestContact.trim() === '') {
//                 Alert.alert('Error', 'Please enter guest contact number');
//                 return;
//             }

//             // Validate Pakistani mobile number format (03xxxxxxxxx)
//             const phoneRegex = /^03\d{9}$/;
//             if (!phoneRegex.test(guestContact.trim())) {
//                 Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number   (e.g., 03001234567).');
//                 return;
//             }
//         }

//         setLoading(true);
//         try {
//             console.log('🎫 Starting booking process...');

//             // Check if member is deactivated
//             const userStatus = user?.status || user?.Status || user?.memberStatus || '';
//             if (userStatus.toUpperCase() === 'DEACTIVATED') {
//                 Alert.alert(
//                     'Account Deactivated',
//                     'You cannot book room. Please contact PSC for assistance.',
//                     [{ text: 'OK' }]
//                 );
//                 setLoading(false);
//                 return;
//             }

//             const possibleMembershipNo = membershipNo || user?.id;

//             if (!possibleMembershipNo) {
//                 Alert.alert(
//                     'Membership Number Required',
//                     `We couldn't find your membership number.`,
//                     [{ text: 'OK' }]
//                 );
//                 setLoading(false);
//                 return;
//             }

//             console.log('✅ Using membership number:', possibleMembershipNo);

//             const bookingData = {
//                 checkIn: `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}-${String(checkIn.getDate()).padStart(2, '0')}`,
//                 checkOut: `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}-${String(checkOut.getDate()).padStart(2, '0')}`,
//                 numberOfAdults: adults,
//                 numberOfChildren: children,
//                 numberOfRooms: roomsCount,
//                 specialRequest: specialRequest,
//                 totalPrice: calculateTotalPrice().total,
//                 advanceAmount: calculateTotalPrice().advance,
//                 isGuestBooking: isGuestBooking,
//                 guestName: guestName,
//                 guestContact: guestContact,
//             };

//             // Prepare payload according to backend expectations
//             const payload = {
//                 membership_no: possibleMembershipNo,
//                 from: bookingData.checkIn,
//                 to: bookingData.checkOut,
//                 numberOfRooms: bookingData.numberOfRooms || 1,
//                 numberOfAdults: bookingData.numberOfAdults || 1,
//                 numberOfChildren: bookingData.numberOfChildren || 0,
//                 pricingType: bookingData.isGuestBooking ? 'guest' : 'member',
//                 specialRequest: bookingData.specialRequest || '',
//                 guestName: bookingData.isGuestBooking ? bookingData.guestName : '',
//                 guestContact: bookingData.isGuestBooking ? bookingData.guestContact : '',
//             };

//             console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

//             // Call the booking service with roomType as query parameter
//             const response = await bookingService.memberBookingRoom(roomType.id, payload);
//             const result = response.data;
//             console.log('✅ Booking response data received:', result);

//             const navigationParams = {
//                 bookingType: 'ROOM',
//                 voucherData: result,
//                 bookingId: result.voucher?.booking_id || result.voucher?.id,
//                 invoiceNumber: result.voucher?.voucher_no,
//                 dueDate: result.due_date || result.voucher?.expiresAt,
//                 bookingData: {
//                     ...bookingData,
//                     totalPrice: result.voucher?.amount || bookingData.totalPrice,
//                 },
//                 roomType: roomType,
//                 memberDetails: result.membership ? {
//                     memberName: result.membership.name,
//                     membershipNo: result.membership.no,
//                     email: result.membership.email,
//                     contact: result.membership.contact
//                 } : null,
//                 isGuest: bookingData.isGuestBooking
//             };

//             // Set global voucher for the floating timer
//             setVoucher(result, navigationParams);
//             console.log("check 2:", navigationParams)
//             // Navigate to voucher screen
//             navigation.navigate('voucher', navigationParams);

//         } catch (error) {
//             console.error('💥 Booking error in component:', {
//                 message: error.message,
//                 response: error.response?.data,
//                 status: error.response?.status,
//                 data: error.response?.data
//             });

//             let errorMessage = error.message || 'Failed to book room. Please try again.';

//             // Extract error message from backend response if available
//             if (error.response?.data?.message) {
//                 errorMessage = error.response.data.message;
//             } else if (error.response?.data?.ResponseMessage) {
//                 errorMessage = error.response.data.ResponseMessage;
//             } else if (error.response?.data?.error) {
//                 errorMessage = error.response.data.error;
//             }

//             // Handle specific HTTP status codes
//             if (error.message?.includes('Network Error')) {
//                 errorMessage = 'Network error. Please check your internet connection and try again.';
//             } else if (error.message?.includes('timeout')) {
//                 errorMessage = 'Request timeout. Please try again.';
//             } else if (error.response?.status === 409) {
//                 errorMessage = errorMessage || 'Room not available for selected dates. Please choose different dates.';
//             } else if (error.response?.status === 400) {
//                 errorMessage = errorMessage || 'Invalid booking data. Please check your information and try again.';
//             } else if (error.response?.status === 500) {
//                 errorMessage = errorMessage || 'Server error. Please try again later.';
//                 console.error('Server error details:', error.response?.data);
//             }

//             Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />

//             {/* Header - Same style as HallDetailsScreen */}
//             <ImageBackground
//                 source={require("../../assets/notch.jpg")}
//                 style={styles.notch}
//                 imageStyle={styles.notchImage}
//             >
//                 <View style={styles.notchContent}>
//                     <TouchableOpacity
//                         style={styles.backButton}
//                         onPress={() => navigation.goBack()}
//                         activeOpacity={0.7}
//                     >
//                         <Icon name="arrow-back" size={28} color="#000" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerText}>Book {roomType?.name || 'Room'}</Text>
//                     <View style={{ width: 40 }} />
//                 </View>
//             </ImageBackground>

//             {/* Main Scrollable Content */}
//             <SafeAreaView style={styles.safeArea}>
//                 <ScrollView
//                     style={styles.scrollView}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {/* Booking Type Toggle - Same style as BHBooking */}
//                     <View style={styles.packageCard}>
//                         <Text style={styles.packageTitle}>{roomType?.name || 'Room Details'}</Text>
//                         <View style={styles.priceContainer}>
//                             <View style={styles.priceColumn}>
//                                 <Text style={styles.priceLabel}>Member</Text>
//                                 <Text style={styles.priceValue}>Rs. {roomType?.priceMember || 0}</Text>
//                             </View>
//                             <View style={styles.priceColumn}>
//                                 <Text style={styles.priceLabel}>Guest</Text>
//                                 <Text style={styles.priceValue}>Rs. {roomType?.priceGuest || 0}</Text>
//                             </View>
//                         </View>
//                     </View>

//                     {isMember && (
//                         <View style={styles.toggleContainer}>
//                             <Text style={styles.toggleLabel}>Booking Type:</Text>
//                             <View style={styles.toggleRow}>
//                                 <Text style={[
//                                     styles.toggleOption,
//                                     !isGuestBooking && styles.toggleActive
//                                 ]}>
//                                     Member
//                                 </Text>
//                                 <Switch
//                                     value={isGuestBooking}
//                                     onValueChange={setIsGuestBooking}
//                                     trackColor={{ false: '#D2B48C', true: '#b48a64' }}
//                                     thumbColor={isGuestBooking ? '#fff' : '#fff'}
//                                 />
//                                 <Text style={[
//                                     styles.toggleOption,
//                                     isGuestBooking && styles.toggleActive
//                                 ]}>
//                                     Guest
//                                 </Text>
//                             </View>


//                             {/* Price Comparison - Below Toggle */
//                             /* <View style={styles.priceComparisonContainer}>
//                                 <View style={[
//                                     styles.priceBox,
//                                     !isGuestBooking && styles.priceBoxActive
//                                 ]}>
//                                     <Text style={styles.priceBoxLabel}>Member Charges</Text>
//                                     <Text style={[
//                                         styles.priceBoxValue,
//                                         !isGuestBooking && styles.priceBoxValueActive
//                                     ]}>
//                                         Rs. {(roomType?.priceMember || 0).toLocaleString()}
//                                     </Text>
//                                     <Text style={styles.priceBoxSubtext}>per night</Text>
//                                 </View>
//                                 <View style={[
//                                     styles.priceBox,
//                                     isGuestBooking && styles.priceBoxActive
//                                 ]}>
//                                     <Text style={styles.priceBoxLabel}>Guest Charges</Text>
//                                     <Text style={[
//                                         styles.priceBoxValue,
//                                         isGuestBooking && styles.priceBoxValueActive
//                                     ]}>
//                                         Rs. {(roomType?.priceGuest || 0).toLocaleString()}
//                                     </Text>
//                                     <Text style={styles.priceBoxSubtext}>per night</Text>
//                                 </View>
//                             </View> */}
//                         </View>
//                     )}

//                     {/* Guest Details - Same style as BHBooking */}
//                     {isMember && isGuestBooking && (
//                         <View style={styles.guestContainer}>
//                             <View style={styles.guestHeader}>
//                                 <Icon name="person-outline" size={22} color="#b48a64" />
//                                 <Text style={styles.guestTitle}>Guest Details</Text>
//                             </View>

//                             <View style={styles.guestInputGroup}>
//                                 <View style={styles.guestInputWrapper}>
//                                     <Icon name="person" size={20} color="#b48a64" style={styles.guestInputIcon} />
//                                     <TextInput
//                                         style={styles.guestInput}
//                                         placeholder="Guest Full Name *"
//                                         value={guestName}
//                                         onChangeText={setGuestName}
//                                         placeholderTextColor="#999"
//                                         autoCapitalize="words"
//                                     />
//                                 </View>
//                             </View>

//                             <View style={styles.guestInputGroup}>
//                                 <View style={styles.guestInputWrapper}>
//                                     <Icon name="phone" size={20} color="#b48a64" style={styles.guestInputIcon} />
//                                     <TextInput
//                                         style={styles.guestInput}
//                                         placeholder="Guest Contact Number *"
//                                         value={guestContact}
//                                         onChangeText={setGuestContact}
//                                         keyboardType="phone-pad"
//                                         placeholderTextColor="#999"
//                                         maxLength={15}
//                                     />
//                                 </View>
//                             </View>

//                             <View style={styles.guestInfoNote}>
//                                 <Icon name="info-outline" size={16} color="#b48a64" />
//                                 <Text style={styles.guestInfoText}>
//                                     Guest pricing (Rs. {roomType?.priceGuest}/night) will be applied. Guest details are required for booking.
//                                 </Text>
//                             </View>
//                         </View>
//                     )}

//                     {/* Date Selection Section */}
//                     <View style={styles.sectionCard}>
//                         <Text style={styles.sectionTitle}>Select Dates</Text>

//                         <View style={styles.dateSection}>
//                             <Text style={styles.sectionLabel}>Check-in Date</Text>
//                             <TouchableOpacity
//                                 style={styles.dateInput}
//                                 onPress={() => setShowCheckInPicker(true)}
//                             >
//                                 <Feather name="calendar" size={20} color="#b48a64" />
//                                 <Text style={styles.dateInputText}>
//                                     {formatDateForDisplay(checkIn)}
//                                 </Text>
//                             </TouchableOpacity>
//                             {showCheckInPicker && (
//                                 <DateTimePicker
//                                     value={checkIn}
//                                     mode="date"
//                                     display="default"
//                                     onChange={(event, date) => {
//                                         setShowCheckInPicker(false);
//                                         if (date) {
//                                             setCheckIn(date);
//                                             // Ensure Checkout is reactive: Check-in + 1 day
//                                             const nextDay = new Date(date.getTime() + 86400000);
//                                             if (checkOut <= date) {
//                                                 setCheckOut(nextDay);
//                                             }
//                                         }
//                                     }}
//                                     minimumDate={new Date()}
//                                     maximumDate={new Date(Date.now() + CALENDAR_LIMIT_DAYS * 24 * 60 * 60 * 1000)}
//                                 />
//                             )}
//                         </View>

//                         <View style={styles.dateSection}>
//                             <Text style={styles.sectionLabel}>Check-out Date</Text>
//                             <TouchableOpacity
//                                 style={styles.dateInput}
//                                 onPress={() => setShowCheckOutPicker(true)}
//                             >
//                                 <Feather name="calendar" size={20} color="#b48a64" />
//                                 <Text style={styles.dateInputText}>
//                                     {formatDateForDisplay(checkOut)}
//                                 </Text>
//                             </TouchableOpacity>
//                             {showCheckOutPicker && (
//                                 <DateTimePicker
//                                     value={checkOut}
//                                     mode="date"
//                                     display="default"
//                                     onChange={(event, date) => {
//                                         setShowCheckOutPicker(false);
//                                         if (date) setCheckOut(date);
//                                     }}
//                                     minimumDate={new Date(checkIn.getTime() + 86400000)}
//                                     maximumDate={new Date(checkIn.getTime() + CALENDAR_LIMIT_DAYS * 24 * 60 * 60 * 1000)}
//                                 />
//                             )}
//                         </View>
//                     </View>

//                     {/* Guest Count Section - Same layout as modal */}
//                     <View style={styles.sectionCard}>
//                         <Text style={styles.sectionTitle}>Booking Details</Text>

//                         {/* Row layout for Adults, Children, Rooms - matching modal */}
//                         <View style={styles.row}>
//                             <View style={styles.thirdInput}>
//                                 <Text style={styles.label}>Adults</Text>
//                                 <TextInput
//                                     style={styles.modalInput}
//                                     value={numberOfAdults}
//                                     onChangeText={setNumberOfAdults}
//                                     keyboardType="numeric"
//                                     placeholder="1"
//                                     placeholderTextColor="#999"
//                                 />
//                             </View>
//                             <View style={styles.thirdInput}>
//                                 <Text style={styles.label}>Children</Text>
//                                 <TextInput
//                                     style={styles.modalInput}
//                                     value={numberOfChildren}
//                                     onChangeText={setNumberOfChildren}
//                                     keyboardType="numeric"
//                                     placeholder="0"
//                                     placeholderTextColor="#999"
//                                 />
//                             </View>
//                             <View style={styles.thirdInput}>
//                                 <Text style={styles.label}>Rooms</Text>
//                                 <TextInput
//                                     style={styles.modalInput}
//                                     value={numberOfRooms}
//                                     onChangeText={handleRoomInput}
//                                     keyboardType="numeric"
//                                     placeholder="1"
//                                     placeholderTextColor="#999"
//                                 />
//                             </View>
//                         </View>

//                         {/* Strict Occupancy Warning */}
//                         {(parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
//                             parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2) && (
//                                 <View style={styles.occupancyWarningContainer}>
//                                     <Icon name="warning" size={14} color="#D32F2F" />
//                                     <Text style={styles.occupancyWarningText}>
//                                         Max 2 adults & 2 children allowed per room.
//                                     </Text>
//                                 </View>
//                             )}
//                     </View>

//                     {/* Special Request Section - Same as Modal */}
//                     <View style={styles.sectionCard}>
//                         <Text style={styles.sectionTitle}>Special Requests</Text>
//                         <View style={styles.formGroup}>
//                             <Text style={styles.label}>Special Request (Optional)</Text>
//                             <TextInput
//                                 style={styles.modalTextArea}
//                                 value={specialRequest}
//                                 onChangeText={setSpecialRequest}
//                                 placeholder="Any special request/requirement..."
//                                 placeholderTextColor="#999"
//                                 multiline
//                                 numberOfLines={3}
//                             />
//                         </View>
//                     </View>

//                     {/* Price Summary */}
//                     <View style={styles.priceSummary}>
//                         <View>
//                             <Text style={styles.priceSummaryLabel}>Total Amount</Text>
//                             <Text style={styles.priceSummarySubtitle}>
//                                 {isGuestBooking ? 'Guest Charges' : 'Member Charges'}
//                             </Text>
//                         </View>
//                         <View style={styles.priceSummaryValueContainer}>
//                             <Text style={styles.priceSummaryValue}>
//                                 Rs. {calculateTotalPrice().total.toLocaleString()}/-
//                             </Text>
//                             <Text style={styles.advanceNote}>
//                                 Advance Required: Rs. {calculateTotalPrice().advance.toLocaleString()}/-
//                             </Text>
//                             <Text style={styles.priceSummaryBreakdown}>
//                                 {parseInt(numberOfRooms) || 1} room(s) × {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} night(s)
//                             </Text>
//                         </View>
//                     </View>

//                     {/* Info Box */}
//                     <View style={styles.infoBox}>
//                         <Icon name="info" size={16} color="#b48a64" />
//                         <Text style={styles.infoText}>
//                             {isGuestBooking
//                                 ? `Booking ${numberOfRooms} room(s) for your guest. The guest will need to provide ID at check-in.`
//                                 : `Booking ${numberOfRooms} room(s) of ${roomType?.name}. Rooms will be automatically assigned based on availability.`
//                             }
//                         </Text>
//                     </View>

//                     {/* Submit Button */}
//                     <TouchableOpacity
//                         style={[
//                             styles.submitButton,
//                             isGuestBooking ? styles.guestSubmitButton : styles.memberSubmitButton,
//                             (loading ||
//                                 parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
//                                 parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2) && styles.submitButtonDisabled
//                         ]}
//                         onPress={handleConfirmBooking}
//                         disabled={loading ||
//                             parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
//                             parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2}
//                     >
//                         {loading ? (
//                             <ActivityIndicator size="small" color="#FFF" />
//                         ) : (
//                             <>
//                                 <Text style={styles.submitButtonText}>
//                                     {isGuestBooking ? 'Book for Guest' : 'Confirm Booking'}
//                                 </Text>
//                                 <Icon name="arrow-forward" size={20} color="#FFF" />
//                             </>
//                         )}
//                     </TouchableOpacity>

//                     <View style={styles.footerSpacer} />
//                 </ScrollView>
//             </SafeAreaView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FEF9F3',
//     },
//     occupancyWarningContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 10,
//         backgroundColor: '#FFEBEE',
//         padding: 8,
//         borderRadius: 6,
//     },
//     occupancyWarningText: {
//         color: '#D32F2F',
//         fontSize: 12,
//         fontWeight: 'bold',
//         marginLeft: 5,
//     },
//     notch: {
//         paddingTop: 50,
//         paddingBottom: 20,
//         paddingHorizontal: 20,
//         borderBottomEndRadius: 30,
//         borderBottomStartRadius: 30,
//         overflow: 'hidden',
//         minHeight: 120,
//     },
//     notchImage: {
//         resizeMode: 'cover',
//     },
//     notchContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     backButton: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#000',
//         textAlign: 'center',
//         flex: 1,
//     },
//     safeArea: {
//         flex: 1,
//     },
//     scrollView: {
//         flex: 1,
//     },
//     scrollContent: {
//         paddingVertical: 20,
//         paddingHorizontal: 0,
//     },

//     // Booking Type Toggle - Same as BHBooking
//     packageCard: {
//         backgroundColor: '#fff',
//         marginHorizontal: 15,
//         marginVertical: 10,
//         borderRadius: 12,
//         padding: 15,
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     packageTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
//     priceContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         width: '100%',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         marginTop: 5,
//     },
//     priceColumn: {
//         alignItems: 'center',
//     },
//     priceLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginBottom: 4,
//     },
//     priceValue: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#000',
//     },
//     toggleContainer: {
//         backgroundColor: '#FFF',
//         marginHorizontal: 15,
//         marginBottom: 15,
//         padding: 20,
//         borderRadius: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 4,
//     },
//     toggleLabel: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#2D3748',
//         marginBottom: 10,
//     },
//     toggleRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-around',
//     },
//     toggleOption: {
//         fontSize: 16,
//         color: '#666',
//     },
//     toggleActive: {
//         color: '#b48a64',
//         fontWeight: 'bold',
//     },

//     // Price Comparison - Below Toggle
//     priceComparisonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 20,
//         gap: 12,
//     },
//     priceBox: {
//         flex: 1,
//         backgroundColor: '#F8F5F0',
//         borderRadius: 12,
//         padding: 15,
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#E2D9CC',
//     },
//     priceBoxActive: {
//         backgroundColor: '#FFF8E1',
//         borderColor: '#b48a64',
//         borderWidth: 2,
//     },
//     priceBoxLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginBottom: 5,
//         fontWeight: '600',
//     },
//     priceBoxValue: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     priceBoxValueActive: {
//         color: '#b48a64',
//     },
//     priceBoxSubtext: {
//         fontSize: 11,
//         color: '#999',
//         marginTop: 3,
//     },

//     // Guest Container - Same as BHBooking
//     guestContainer: {
//         backgroundColor: '#FFF',
//         marginHorizontal: 15,
//         marginBottom: 15,
//         padding: 20,
//         borderRadius: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 4,
//         borderWidth: 1,
//         borderColor: '#E8DCC8',
//     },
//     guestHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//         paddingBottom: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: '#F0E6D8',
//     },
//     guestTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#2D3748',
//         marginLeft: 10,
//     },
//     guestInputGroup: {
//         marginBottom: 15,
//     },
//     guestInputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#F8F5F0',
//         borderRadius: 12,
//         borderWidth: 1,
//         borderColor: '#E2D9CC',
//         paddingHorizontal: 15,
//         height: 55,
//     },
//     guestInputIcon: {
//         marginRight: 12,
//     },
//     guestInput: {
//         flex: 1,
//         fontSize: 16,
//         color: '#2D3748',
//         height: '100%',
//     },
//     guestInfoNote: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         backgroundColor: '#FDF8F3',
//         padding: 12,
//         borderRadius: 8,
//         marginTop: 5,
//         borderWidth: 1,
//         borderColor: '#E8DCC8',
//     },
//     guestInfoText: {
//         flex: 1,
//         fontSize: 13,
//         color: '#8B7355',
//         marginLeft: 8,
//         lineHeight: 18,
//     },

//     // Section Cards - Same as BHBooking
//     sectionCard: {
//         backgroundColor: '#FFF',
//         marginHorizontal: 15,
//         marginBottom: 15,
//         padding: 20,
//         borderRadius: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 4,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#2D3748',
//         marginBottom: 15,
//     },
//     sectionLabel: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 10,
//     },

//     // Date Section
//     dateSection: {
//         marginBottom: 15,
//     },
//     dateInput: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#E0E0E0',
//         borderRadius: 12,
//         padding: 15,
//         backgroundColor: '#F9F9F9',
//     },
//     dateInputText: {
//         fontSize: 16,
//         color: '#333',
//         marginLeft: 12,
//     },

//     // Inputs - Same as BHBooking
//     inputGroup: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#F7FAFC',
//         borderRadius: 12,
//         paddingHorizontal: 15,
//         marginBottom: 15,
//         borderWidth: 1,
//         borderColor: '#E2E8F0',
//     },
//     inputIcon: {
//         marginRight: 12,
//     },
//     input: {
//         flex: 1,
//         height: 50,
//         fontSize: 16,
//         color: '#2D3748',
//     },
//     textArea: {
//         height: 80,
//         paddingVertical: 12,
//     },

//     // Row Layout - Same as Modal
//     row: {
//         flexDirection: 'row',
//         gap: 10,
//     },
//     thirdInput: {
//         flex: 1,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 8,
//     },
//     modalInput: {
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//         fontSize: 14,
//         backgroundColor: '#f9f9f9',
//         textAlign: 'center',
//     },
//     formGroup: {
//         marginBottom: 0,
//     },
//     modalTextArea: {
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//         fontSize: 14,
//         backgroundColor: '#f9f9f9',
//         minHeight: 80,
//         textAlignVertical: 'top',
//     },

//     // Price Summary - Same as BHBooking
//     priceSummary: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         padding: 15,
//         backgroundColor: '#f8f9fa',
//         borderRadius: 12,
//         marginHorizontal: 15,
//         marginBottom: 15,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     priceSummaryLabel: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//     },
//     priceSummarySubtitle: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 4,
//     },
//     priceSummaryValueContainer: {
//         alignItems: 'flex-end',
//     },
//     priceSummaryValue: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#b48a64',
//     },
//     priceSummaryBreakdown: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 4,
//         textAlign: 'right',
//     },
//     advanceNote: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         marginTop: 2,
//     },

//     // Info Box - Same as BHBooking
//     infoBox: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         backgroundColor: '#FFF8E1',
//         padding: 12,
//         borderRadius: 8,
//         borderLeftWidth: 4,
//         borderLeftColor: '#b48a64',
//         marginHorizontal: 15,
//         marginBottom: 20,
//     },
//     infoText: {
//         flex: 1,
//         fontSize: 12,
//         color: '#8D6E63',
//         marginLeft: 8,
//         lineHeight: 16,
//     },

//     // Submit Button - Same as BHBooking
//     submitButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#b48a64',
//         marginHorizontal: 15,
//         paddingVertical: 18,
//         borderRadius: 12,
//         shadowColor: '#b48a64',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 6,
//     },
//     memberSubmitButton: {
//         backgroundColor: '#b48a64',
//     },
//     guestSubmitButton: {
//         backgroundColor: '#b48a64',
//     },
//     submitButtonDisabled: {
//         backgroundColor: '#b4896449',
//         shadowColor: 'transparent',
//     },
//     submitButtonText: {
//         color: '#FFF',
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginRight: 8,
//     },

//     // Footer Spacer
//     footerSpacer: {
//         height: 30,
//     },
// });

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    TextInput,
    Switch,
    Dimensions,
    ImageBackground,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { useVoucher } from '../auth/contexts/VoucherContext';
import { useAuth } from '../auth/contexts/AuthContext';
import TermsAndConditions from '../components/TermsAndConditions';

const { width: screenWidth } = Dimensions.get('window');
const MAX_ROOMS = 8;
const CALENDAR_LIMIT_DAYS = 30;

const ROOM_BOOKING_CONFIG = {
    advancePayment: { "1-2": 0.25, "3-5": 0.50, "6-8": 0.75 },
    cancellationRefund: {
        moreThan72Hours: { "1-2": 0.05, "3-5": 0.15, "6-8": 0.25 },
        "24To72Hours": { "1-2": 0.10, "3-5": 0.25, "6-8": 0.50 },
        lessThan24Hours: { "1-2": 1.00, "3-5": 1.00, "6-8": 1.00 }
    }
};

export default function RoomBookingScreen({ navigation, route }) {
    const { setVoucher } = useVoucher();
    const { user } = useAuth();

    // Get params from navigation
    const { roomType, room, isMember, isAvailable } = route.params || {};

    const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
    const userName = user?.name || user?.username || user?.fullName;

    // Form state
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [numberOfAdults, setNumberOfAdults] = useState('1');
    const [numberOfChildren, setNumberOfChildren] = useState('0');
    const [numberOfRooms, setNumberOfRooms] = useState('1');
    const [specialRequest, setSpecialRequest] = useState('');
    const [loading, setLoading] = useState(false);

    // Guest booking fields - DEFAULT TO TRUE
    const [isGuestBooking, setIsGuestBooking] = useState(true);
    const [guestName, setGuestName] = useState('');
    const [guestContact, setGuestContact] = useState('');

    // Validate guest name - only alphabets and max 50 characters
    const handleGuestNameChange = (text) => {
        // Remove any non-alphabetic characters (allow spaces for full names)
        const sanitizedText = text.replace(/[^a-zA-Z\s]/g, '');
        // Limit to 50 characters
        const limitedText = sanitizedText.slice(0, 50);
        setGuestName(limitedText);
    };

    // Validate guest contact - Pakistani format (03XXXXXXXXX or 92XXXXXXXXXX)
    const handleGuestContactChange = (text) => {
        // Remove any non-digit characters
        const digitsOnly = text.replace(/[^0-9]/g, '');
        // Limit to 12 digits (for 92 format) but prefer 11 for 03 format
        const limitedText = digitsOnly.slice(0, 12);
        setGuestContact(limitedText);
    };

    // Terms & Conditions state
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [showTermsError, setShowTermsError] = useState(false);

    const calculateTotalPrice = () => {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const price = isGuestBooking ? roomType?.priceGuest : roomType?.priceMember;
        const roomsCount = parseInt(numberOfRooms) || 1;
        const totalAmount = nights * (price || 0) * roomsCount;

        // Calculate advance payment required based on number of rooms
        let advanceMultiplier = 0.25; // Default for 1-2 rooms
        if (roomsCount >= 3 && roomsCount <= 5) advanceMultiplier = 0.50;
        else if (roomsCount >= 6 && roomsCount <= 8) advanceMultiplier = 0.75;

        return {
            total: totalAmount,
            advance: totalAmount * advanceMultiplier
        };
    };

    const calculateRefund = (checkInDate, roomsCount) => {
        const now = new Date();
        const diffHours = (checkInDate - now) / (1000 * 60 * 60);
        let tier = "";

        if (diffHours > 72) tier = "moreThan72Hours";
        else if (diffHours >= 24) tier = "24To72Hours";
        else tier = "lessThan24Hours";

        let roomsTier = "1-2";
        if (roomsCount >= 3 && roomsCount <= 5) roomsTier = "3-5";
        else if (roomsCount >= 6 && roomsCount <= 8) roomsTier = "6-8";

        const refundPercentage = ROOM_BOOKING_CONFIG.cancellationRefund[tier][roomsTier];
        return refundPercentage; // This returns the deduction percentage
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleRoomInput = (value) => {
        if (value === '') {
            setNumberOfRooms('');
            return;
        }

        const rooms = parseInt(value);
        if (isNaN(rooms)) return;

        if (rooms > MAX_ROOMS) {
            Alert.alert(
                "Limit Exceeded",
                `Maximum limit of ${MAX_ROOMS} rooms exceeded. Please contact Admin for large group bookings.`
            );
            setNumberOfRooms(MAX_ROOMS.toString());
        } else {
            setNumberOfRooms(value);
        }
    };

    const handleConfirmBooking = async () => {
        // Terms & Conditions validation
        if (!termsAgreed) {
            setShowTermsError(true);
            Alert.alert('Terms & Conditions', 'You must agree to the Terms & Conditions before booking.');
            return;
        }

        if (!checkIn || !checkOut) {
            Alert.alert('Error', 'Please select check-in and check-out dates');
            return;
        }

        if (checkIn >= checkOut) {
            Alert.alert('Error', 'Check-out date must be after check-in date');
            return;
        }

        const adults = parseInt(numberOfAdults) || 1;
        const children = parseInt(numberOfChildren) || 0;
        const roomsCount = parseInt(numberOfRooms) || 1;

        if (adults < 1) {
            Alert.alert('Error', 'At least one adult is required');
            return;
        }


        if (roomsCount < 1) {
            Alert.alert('Error', 'At least one room is required');
            return;
        }

        if (roomsCount > MAX_ROOMS) {
            Alert.alert('Error', `Maximum ${MAX_ROOMS} rooms can be booked at once.`);
            return;
        }

        // Strict Occupancy Limit (Max 2 Adults, 2 Children per room)
        const maxAdults = roomsCount * 2;
        const maxChildren = roomsCount * 2;

        if (adults > maxAdults) {
            Alert.alert(
                'Occupancy Limit Exceeded',
                `A maximum of 2 adults are allowed per room.\n\nFor ${adults} adults, you need at least ${Math.ceil(adults / 2)} rooms.`
            );
            return;
        }

        if (children > maxChildren) {
            Alert.alert(
                'Occupancy Limit Exceeded',
                `A maximum of 2 children are allowed per room.\n\nFor ${children} children, you need at least ${Math.ceil(children / 2)} rooms.`
            );
            return;
        }

        if (isGuestBooking) {
            if (!guestName || guestName.trim() === '') {
                Alert.alert('Error', 'Please enter guest name');
                return;
            }
            if (!guestContact || guestContact.trim() === '') {
                Alert.alert('Error', 'Please enter guest contact number');
                return;
            }

            // Validate Pakistani mobile number format (03xxxxxxxxx or 92xxxxxxxxxx)
            const phoneRegex = /^(03\d{9}|92\d{10})$/;
            if (!phoneRegex.test(guestContact.trim())) {
                Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number (e.g., 03001234567 or 923001234567).');
                return;
            }
        }

        setLoading(true);
        try {
            console.log('🎫 Starting booking process...');

            // Check if member is deactivated
            const userStatus = user?.status || user?.Status || user?.memberStatus || '';
            if (userStatus.toUpperCase() === 'DEACTIVATED') {
                Alert.alert(
                    'Account Deactivated',
                    'You cannot book room. Please contact PSC for assistance.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            const possibleMembershipNo = membershipNo || user?.id;

            if (!possibleMembershipNo) {
                Alert.alert(
                    'Membership Number Required',
                    `We couldn't find your membership number.`,
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            console.log('✅ Using membership number:', possibleMembershipNo);

            const bookingData = {
                checkIn: `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}-${String(checkIn.getDate()).padStart(2, '0')}`,
                checkOut: `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}-${String(checkOut.getDate()).padStart(2, '0')}`,
                numberOfAdults: adults,
                numberOfChildren: children,
                numberOfRooms: roomsCount,
                specialRequest: specialRequest,
                totalPrice: calculateTotalPrice().total,
                advanceAmount: calculateTotalPrice().advance,
                isGuestBooking: isGuestBooking,
                guestName: guestName,
                guestContact: guestContact,
            };

            // Prepare payload according to backend expectations
            const payload = {
                membership_no: possibleMembershipNo,
                from: bookingData.checkIn,
                to: bookingData.checkOut,
                numberOfRooms: bookingData.numberOfRooms || 1,
                numberOfAdults: bookingData.numberOfAdults || 1,
                numberOfChildren: bookingData.numberOfChildren || 0,
                pricingType: bookingData.isGuestBooking ? 'guest' : 'member',
                specialRequest: bookingData.specialRequest || '',
                guestName: bookingData.isGuestBooking ? bookingData.guestName : '',
                guestContact: bookingData.isGuestBooking ? bookingData.guestContact : '',
            };

            console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

            // Call the booking service with roomType as query parameter
            const response = await bookingService.memberBookingRoom(roomType.id, payload);
            const result = response.data;
            console.log('✅ Booking response data received:', result);

            const navigationParams = {
                bookingType: 'ROOM',
                voucherData: result,
                bookingId: result.voucher?.booking_id || result.voucher?.id,
                invoiceNumber: result.voucher?.voucher_no,
                dueDate: result.due_date || result.voucher?.expiresAt,
                bookingData: {
                    ...bookingData,
                    totalPrice: result.voucher?.amount || bookingData.totalPrice,
                },
                roomType: roomType,
                memberDetails: result.membership ? {
                    memberName: result.membership.name,
                    membershipNo: result.membership.no,
                    email: result.membership.email,
                    contact: result.membership.contact
                } : null,
                isGuest: bookingData.isGuestBooking
            };

            // Set global voucher for the floating timer
            setVoucher(result, navigationParams);
            console.log("check 2:", navigationParams)
            // Navigate to voucher screen
            navigation.navigate('voucher', navigationParams);

        } catch (error) {
            console.error('💥 Booking error in component:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: error.response?.data
            });

            let errorMessage = error.message || 'Failed to book room. Please try again.';

            // Extract error message from backend response if available
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.ResponseMessage) {
                errorMessage = error.response.data.ResponseMessage;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            // Handle specific HTTP status codes
            if (error.message?.includes('Network Error')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error.response?.status === 409) {
                errorMessage = errorMessage || 'Room not available for selected dates. Please choose different dates.';
            } else if (error.response?.status === 400) {
                errorMessage = errorMessage || 'Invalid booking data. Please check your information and try again.';
            } else if (error.response?.status === 500) {
                errorMessage = errorMessage || 'Server error. Please try again later.';
                console.error('Server error details:', error.response?.data);
            }

            Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />

            {/* Header - Same style as HallDetailsScreen */}
            <ImageBackground
                source={require("../../assets/notch.jpg")}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Book {roomType?.name || 'Room'}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </ImageBackground>

            {/* Main Scrollable Content */}
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Booking Type Toggle - Same style as BHBooking */}
                    <View style={styles.packageCard}>
                        <Text style={styles.packageTitle}>{roomType?.name || 'Room Details'}</Text>
                        <View style={styles.priceContainer}>
                            <View style={styles.priceColumn}>
                                <Text style={styles.priceLabel}>Member</Text>
                                <Text style={styles.priceValue}>Rs. {roomType?.priceMember || 0}</Text>
                            </View>
                            <View style={styles.priceColumn}>
                                <Text style={styles.priceLabel}>Guest</Text>
                                <Text style={styles.priceValue}>Rs. {roomType?.priceGuest || 0}</Text>
                            </View>
                        </View>
                    </View>

                    {isMember && (
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleLabel}>Booking Type:</Text>
                            <View style={styles.toggleRow}>
                                <Text style={[
                                    styles.toggleOption,
                                    !isGuestBooking && styles.toggleActive
                                ]}>
                                    Member
                                </Text>
                                <Switch
                                    value={isGuestBooking}
                                    onValueChange={setIsGuestBooking}
                                    trackColor={{ false: '#D2B48C', true: '#b48a64' }}
                                    thumbColor={isGuestBooking ? '#fff' : '#fff'}
                                />
                                <Text style={[
                                    styles.toggleOption,
                                    isGuestBooking && styles.toggleActive
                                ]}>
                                    Guest
                                </Text>
                            </View>


                            {/* Price Comparison - Below Toggle */
                            /* <View style={styles.priceComparisonContainer}>
                                <View style={[
                                    styles.priceBox,
                                    !isGuestBooking && styles.priceBoxActive
                                ]}>
                                    <Text style={styles.priceBoxLabel}>Member Charges</Text>
                                    <Text style={[
                                        styles.priceBoxValue,
                                        !isGuestBooking && styles.priceBoxValueActive
                                    ]}>
                                        Rs. {(roomType?.priceMember || 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.priceBoxSubtext}>per night</Text>
                                </View>
                                <View style={[
                                    styles.priceBox,
                                    isGuestBooking && styles.priceBoxActive
                                ]}>
                                    <Text style={styles.priceBoxLabel}>Guest Charges</Text>
                                    <Text style={[
                                        styles.priceBoxValue,
                                        isGuestBooking && styles.priceBoxValueActive
                                    ]}>
                                        Rs. {(roomType?.priceGuest || 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.priceBoxSubtext}>per night</Text>
                                </View>
                            </View> */}
                        </View>
                    )}

                    {/* Guest Details - Same style as BHBooking */}
                    {isMember && isGuestBooking && (
                        <View style={styles.guestContainer}>
                            <View style={styles.guestHeader}>
                                <Icon name="person-outline" size={22} color="#b48a64" />
                                <Text style={styles.guestTitle}>Guest Details</Text>
                            </View>

                            <View style={styles.guestInputGroup}>
                                <View style={styles.guestInputWrapper}>
                                    <Icon name="person" size={20} color="#b48a64" style={styles.guestInputIcon} />
                                    <TextInput
                                        style={styles.guestInput}
                                        placeholder="Guest Full Name *"
                                        value={guestName}
                                        onChangeText={handleGuestNameChange}
                                        placeholderTextColor="#999"
                                        autoCapitalize="words"
                                        maxLength={50}
                                    />
                                </View>
                            </View>

                            <View style={styles.guestInputGroup}>
                                <View style={styles.guestInputWrapper}>
                                    <Icon name="phone" size={20} color="#b48a64" style={styles.guestInputIcon} />
                                    <TextInput
                                        style={styles.guestInput}
                                        placeholder="Guest Contact Number *"
                                        value={guestContact}
                                        onChangeText={handleGuestContactChange}
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#999"
                                        maxLength={12}
                                    />
                                </View>
                            </View>

                            <View style={styles.guestInfoNote}>
                                <Icon name="info-outline" size={16} color="#b48a64" />
                                <Text style={styles.guestInfoText}>
                                    Guest pricing (Rs. {roomType?.priceGuest}/night) will be applied. Guest details are required for booking.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Date Selection Section */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Select Dates</Text>

                        <View style={styles.dateSection}>
                            <Text style={styles.sectionLabel}>Check-in Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowCheckInPicker(true)}
                            >
                                <Feather name="calendar" size={20} color="#b48a64" />
                                <Text style={styles.dateInputText}>
                                    {formatDateForDisplay(checkIn)}
                                </Text>
                            </TouchableOpacity>
                            {showCheckInPicker && (
                                <DateTimePicker
                                    value={checkIn}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowCheckInPicker(false);
                                        if (date) {
                                            setCheckIn(date);
                                            // Ensure Checkout is reactive: Check-in + 1 day
                                            const nextDay = new Date(date.getTime() + 86400000);
                                            if (checkOut <= date) {
                                                setCheckOut(nextDay);
                                            }
                                        }
                                    }}
                                    minimumDate={new Date()}
                                    maximumDate={new Date(Date.now() + CALENDAR_LIMIT_DAYS * 24 * 60 * 60 * 1000)}
                                />
                            )}
                        </View>

                        <View style={styles.dateSection}>
                            <Text style={styles.sectionLabel}>Check-out Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowCheckOutPicker(true)}
                            >
                                <Feather name="calendar" size={20} color="#b48a64" />
                                <Text style={styles.dateInputText}>
                                    {formatDateForDisplay(checkOut)}
                                </Text>
                            </TouchableOpacity>
                            {showCheckOutPicker && (
                                <DateTimePicker
                                    value={checkOut}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowCheckOutPicker(false);
                                        if (date) setCheckOut(date);
                                    }}
                                    minimumDate={new Date(checkIn.getTime() + 86400000)}
                                    maximumDate={new Date(checkIn.getTime() + CALENDAR_LIMIT_DAYS * 24 * 60 * 60 * 1000)}
                                />
                            )}
                        </View>
                    </View>

                    {/* Guest Count Section - Same layout as modal */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Booking Details</Text>

                        {/* Row layout for Adults, Children, Rooms - matching modal */}
                        <View style={styles.row}>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Adults</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={numberOfAdults}
                                    onChangeText={setNumberOfAdults}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Children</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={numberOfChildren}
                                    onChangeText={setNumberOfChildren}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Rooms</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={numberOfRooms}
                                    onChangeText={handleRoomInput}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        {/* Strict Occupancy Warning */}
                        {(parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
                            parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2) && (
                                <View style={styles.occupancyWarningContainer}>
                                    <Icon name="warning" size={14} color="#D32F2F" />
                                    <Text style={styles.occupancyWarningText}>
                                        Max 2 adults & 2 children allowed per room.
                                    </Text>
                                </View>
                            )}
                    </View>

                    {/* Special Request Section - Same as Modal */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Special Requests</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Special Request (Optional)</Text>
                            <TextInput
                                style={styles.modalTextArea}
                                value={specialRequest}
                                onChangeText={setSpecialRequest}
                                placeholder="Any special request/requirement..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    {/* Price Summary */}
                    <View style={styles.priceSummary}>
                        <View>
                            <Text style={styles.priceSummaryLabel}>Total Amount</Text>
                            <Text style={styles.priceSummarySubtitle}>
                                {isGuestBooking ? 'Guest Charges' : 'Member Charges'}
                            </Text>
                        </View>
                        <View style={styles.priceSummaryValueContainer}>
                            <Text style={styles.priceSummaryValue}>
                                Rs. {calculateTotalPrice().total.toLocaleString()}/-
                            </Text>
                            <Text style={styles.advanceNote}>
                                Advance Required: Rs. {calculateTotalPrice().advance.toLocaleString()}/-
                            </Text>
                            <Text style={styles.priceSummaryBreakdown}>
                                {parseInt(numberOfRooms) || 1} room(s) × {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} night(s)
                            </Text>
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Icon name="info" size={16} color="#b48a64" />
                        <Text style={styles.infoText}>
                            {isGuestBooking
                                ? `Booking ${numberOfRooms} room(s) for your guest. The guest will need to provide ID at check-in.`
                                : `Booking ${numberOfRooms} room(s) of ${roomType?.name}. Rooms will be automatically assigned based on availability.`
                            }
                        </Text>
                    </View>

                    {/* Terms & Conditions */}
                    <TermsAndConditions
                        bookingType="ROOM"
                        agreed={termsAgreed}
                        onToggle={() => {
                            setTermsAgreed(!termsAgreed);
                            if (showTermsError) setShowTermsError(false);
                        }}
                        showError={showTermsError}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isGuestBooking ? styles.guestSubmitButton : styles.memberSubmitButton,
                            (loading ||
                                parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
                                parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2) && styles.submitButtonDisabled
                        ]}
                        onPress={handleConfirmBooking}
                        disabled={loading ||
                            parseInt(numberOfAdults) > (parseInt(numberOfRooms) || 1) * 2 ||
                            parseInt(numberOfChildren) > (parseInt(numberOfRooms) || 1) * 2}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>
                                    {isGuestBooking ? 'Book for Guest' : 'Confirm Booking'}
                                </Text>
                                <Icon name="arrow-forward" size={20} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerSpacer} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    occupancyWarningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#FFEBEE',
        padding: 8,
        borderRadius: 6,
    },
    occupancyWarningText: {
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 120,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 0,
    },

    // Booking Type Toggle - Same as BHBooking
    packageCard: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 5,
    },
    priceColumn: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    toggleContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    toggleOption: {
        fontSize: 16,
        color: '#666',
    },
    toggleActive: {
        color: '#b48a64',
        fontWeight: 'bold',
    },

    // Price Comparison - Below Toggle
    priceComparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    priceBox: {
        flex: 1,
        backgroundColor: '#F8F5F0',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2D9CC',
    },
    priceBoxActive: {
        backgroundColor: '#FFF8E1',
        borderColor: '#b48a64',
        borderWidth: 2,
    },
    priceBoxLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    priceBoxValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    priceBoxValueActive: {
        color: '#b48a64',
    },
    priceBoxSubtext: {
        fontSize: 11,
        color: '#999',
        marginTop: 3,
    },

    // Guest Container - Same as BHBooking
    guestContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    guestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6D8',
    },
    guestTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginLeft: 10,
    },
    guestInputGroup: {
        marginBottom: 15,
    },
    guestInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F5F0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2D9CC',
        paddingHorizontal: 15,
        height: 55,
    },
    guestInputIcon: {
        marginRight: 12,
    },
    guestInput: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
        height: '100%',
    },
    guestInfoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FDF8F3',
        padding: 12,
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    guestInfoText: {
        flex: 1,
        fontSize: 13,
        color: '#8B7355',
        marginLeft: 8,
        lineHeight: 18,
    },

    // Section Cards - Same as BHBooking
    sectionCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 15,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },

    // Date Section
    dateSection: {
        marginBottom: 15,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        backgroundColor: '#F9F9F9',
    },
    dateInputText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },

    // Inputs - Same as BHBooking
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#2D3748',
    },
    textArea: {
        height: 80,
        paddingVertical: 12,
    },

    // Row Layout - Same as Modal
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    thirdInput: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 0,
    },
    modalTextArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
        minHeight: 80,
        textAlignVertical: 'top',
    },

    // Price Summary - Same as BHBooking
    priceSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    priceSummaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    priceSummarySubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    priceSummaryValueContainer: {
        alignItems: 'flex-end',
    },
    priceSummaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    priceSummaryBreakdown: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    advanceNote: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b48a64',
        marginTop: 2,
    },

    // Info Box - Same as BHBooking
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF8E1',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
        marginHorizontal: 15,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#8D6E63',
        marginLeft: 8,
        lineHeight: 16,
    },

    // Submit Button - Same as BHBooking
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#b48a64',
        marginHorizontal: 15,
        paddingVertical: 18,
        borderRadius: 12,
        shadowColor: '#b48a64',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    memberSubmitButton: {
        backgroundColor: '#b48a64',
    },
    guestSubmitButton: {
        backgroundColor: '#b48a64',
    },
    submitButtonDisabled: {
        backgroundColor: '#b4896449',
        shadowColor: 'transparent',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },

    // Footer Spacer
    footerSpacer: {
        height: 30,
    },
});