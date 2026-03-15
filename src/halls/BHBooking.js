// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   SafeAreaView,
//   Alert,
//   StatusBar,
//   ImageBackground,
//   Modal,
//   ActivityIndicator,
//   Switch,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { getUserData, banquetAPI } from '../../config/apis';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { useVoucher } from '../auth/contexts/VoucherContext';
// import TermsAndConditions from '../components/TermsAndConditions';

// const eventTypeOptions = [
//   { label: 'Wedding Reception', value: 'wedding' },
//   { label: 'Birthday Party', value: 'birthday' },
//   { label: 'Anniversary', value: 'anniversary' },
//   { label: 'Family Gathering', value: 'family' },
//   { label: 'Other Event', value: 'other' },
// ];

// const timeSlotOptions = [
//   { label: 'Day', value: 'DAY' },
//   { label: 'Night', value: 'NIGHT' },
// ];

// const BHBooking = ({ route, navigation }) => {
//   const { setVoucher } = useVoucher();
//   const { venue } = route.params || {};
//   const { user, isAuthenticated } = useAuth();

//   // State variables
//   const [selectedDates, setSelectedDates] = useState({});
//   const [dateConfigurations, setDateConfigurations] = useState({});
//   const [eventTypeOpen, setEventTypeOpen] = useState(false);
//   const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);
//   const [numberOfGuests, setNumberOfGuests] = useState('');
//   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlotOptions[0].value);
//   const [specialRequests, setSpecialRequests] = useState('');

//   // Guest Booking States
//   const guestPriceRaw = venue?.guestPrice || venue?.chargesGuests || 0;
//   const canBookAsGuest = !venue?.isExclusive && guestPriceRaw > 0;
//   const [isGuest, setIsGuest] = useState(canBookAsGuest); // Select guest by default ONLY if allowed, otherwise select member (false)
//   const [guestName, setGuestName] = useState('');
//   const [guestContact, setGuestContact] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Validate guest name - only alphabets and max 50 characters
//   const handleGuestNameChange = (text) => {
//     // Remove any non-alphabetic characters (allow spaces for full names)
//     const sanitizedText = text.replace(/[^a-zA-Z\s]/g, '');
//     // Limit to 50 characters
//     const limitedText = sanitizedText.slice(0, 50);
//     setGuestName(limitedText);
//   };

//   // Validate guest contact - Pakistani format (03XXXXXXXXX or 92XXXXXXXXXX)
//   const handleGuestContactChange = (text) => {
//     // Remove any non-digit characters
//     const digitsOnly = text.replace(/[^0-9]/g, '');
//     // Limit to 12 digits (for 92 format) but prefer 11 for 03 format
//     const limitedText = digitsOnly.slice(0, 12);
//     setGuestContact(limitedText);
//   };

//   // Admin Reservation States
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [reserveFrom, setReserveFrom] = useState('');
//   const [reserveTo, setReserveTo] = useState('');
//   const [timeSlot, setTimeSlot] = useState(null);
//   const [reserveModalVisible, setReserveModalVisible] = useState(false);
//   const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
//   const [calendarModalVisible, setCalendarModalVisible] = useState(false);
//   const [calendarType, setCalendarType] = useState('from');

//   // Booking Modal State
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   // Reservation Data
//   const [reservedDates, setReservedDates] = useState({});
//   const [isFetchingReservations, setIsFetchingReservations] = useState(false);

//   // Terms & Conditions state
//   const [termsAgreed, setTermsAgreed] = useState(false);
//   const [showTermsError, setShowTermsError] = useState(false);

//   // Extract membership number from user object
//   const extractMembershipNo = () => {
//     if (!user) return null;

//     const possibleFields = [
//       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
//       'membershipID', 'memberNo', 'memberNumber', 'membershipId'
//     ];

//     for (const field of possibleFields) {
//       if (user[field]) {
//         return user[field].toString();
//       }
//     }

//     if (user.data && typeof user.data === 'object') {
//       for (const field of possibleFields) {
//         if (user.data[field]) {
//           return user.data[field].toString();
//         }
//       }
//     }

//     return null;
//   };

//   const membershipNo = extractMembershipNo();
//   const userName = user?.name || user?.username || user?.fullName;

//   useEffect(() => {
//     checkUserStatus();
//     fetchReservations();
//   }, [venue]);

//   const fetchReservations = async () => {
//     if (!venue?.id) return;
//     try {
//       setIsFetchingReservations(true);
//       const response = await banquetAPI.getHallReservations(venue.id);
//       if (response.data && Array.isArray(response.data)) {
//         const marked = {};
//         response.data.forEach(res => {
//           // Assuming reservation date is in YYYY-MM-DD
//           // If it's a range, we might need to expand it, but the API getHallReservations
//           // likely returns an array of booked date objects or strings
//           const dateStr = res.date || res.bookingDate;
//           if (dateStr) {
//             marked[dateStr] = {
//               disabled: true,
//               disableTouchEvent: true,
//               textColor: '#d9e1e8',
//             };
//           }
//         });
//         setReservedDates(marked);
//       }
//     } catch (error) {
//       console.error("Error fetching reservations:", error);
//     } finally {
//       setIsFetchingReservations(false);
//     }
//   };

//   const checkUserStatus = async () => {
//     try {
//       const userData = await getUserData();

//       const currentUser = user || userData;

//       if (!currentUser) {
//         setIsAdmin(false);
//         return;
//       }

//       const extractedUserRole =
//         currentUser.role ||
//         currentUser.Role ||
//         currentUser.userRole ||
//         currentUser.user_role;

//       const isAdminUser = extractedUserRole && (
//         extractedUserRole.toLowerCase() === 'admin' ||
//         extractedUserRole.toLowerCase() === 'super_admin' ||
//         extractedUserRole.toLowerCase() === 'superadmin'
//       );

//       setIsAdmin(isAdminUser);

//     } catch (error) {
//       console.error('Error checking user status:', error);
//       setIsAdmin(false);
//     }
//   };

//   // Admin Reservation Functions
//   const openCalendar = (type) => {
//     setCalendarType(type);
//     setCalendarModalVisible(true);
//   };

//   const handleDateSelect = (date) => {
//     const selectedDate = date.dateString;
//     if (calendarType === 'from') {
//       setReserveFrom(selectedDate);
//     } else {
//       setReserveTo(selectedDate);
//     }
//     setCalendarModalVisible(false);
//   };

//   const validateReservation = () => {
//     if (!reserveFrom || !reserveTo) {
//       Alert.alert('Error', 'Please select reservation dates');
//       return false;
//     }
//     if (!timeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return false;
//     }

//     const fromDate = new Date(reserveFrom);
//     const toDate = new Date(reserveTo);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (fromDate < today) {
//       Alert.alert('Error', 'Reservation start date cannot be in the past');
//       return false;
//     }

//     if (fromDate >= toDate) {
//       Alert.alert('Error', 'Reservation end date must be after start date');
//       return false;
//     }

//     return true;
//   };

//   const handleAdminReserve = async () => {
//     if (!validateReservation()) return;

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: true,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);

//       Alert.alert(
//         'Success',
//         response.data?.message || 'Hall reserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setReserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Reservation error:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to reserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminUnreserve = async () => {
//     if (!reserveFrom || !reserveTo || !timeSlot) {
//       Alert.alert('Error', 'Please select dates and time slot to unreserve');
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: false,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);

//       Alert.alert(
//         'Success',
//         response.data?.message || 'Hall unreserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setUnreserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Unreservation error:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to unreserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Member/Guest Booking function
//   const handleGenerateInvoice = async () => {
//     // Terms & Conditions validation
//     if (!termsAgreed) {
//       setShowTermsError(true);
//       setShowBookingModal(false);
//       Alert.alert('Terms & Conditions', 'You must agree to the Terms & Conditions before booking.');
//       return;
//     }

//     // Validation
//     const sortedDates = Object.keys(dateConfigurations).sort();
//     if (sortedDates.length === 0) {
//       Alert.alert('Error', 'Please select at least one booking date');
//       return;
//     }
//     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
//       Alert.alert('Error', 'Please enter number of guests');
//       return;
//     }
//     if (venue?.capacity && parseInt(numberOfGuests) > venue.capacity) {
//       Alert.alert('Capacity Exceeded', `The maximum capacity for this hall is ${venue.capacity} guests. Please adjust the number of guests.`);
//       return;
//     }

//     // Guest validation
//     if (isGuest) {
//       if (!guestName.trim()) {
//         Alert.alert('Error', 'Please enter guest name');
//         return;
//       }
//       // Validate Pakistani mobile number format (03xxxxxxxxx or 92xxxxxxxxxx)
//       const phoneRegex = /^(03\d{9}|92\d{10})$/;
//       if (!phoneRegex.test(guestContact.trim())) {
//         Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number (e.g., 03001234567 or 923001234567).');
//         return;
//       }
//     }

//     // Member validation
//     if (!isGuest && !isAuthenticated) {
//       Alert.alert(
//         'Authentication Required',
//         'Please login to book a hall.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Go to Login',
//             onPress: () => navigation.reset({
//               index: 0,
//               routes: [{ name: 'LoginScr' }],
//             })
//           }
//         ]
//       );
//       return;
//     }

//     setBookingLoading(true);

//     try {
//       // Calculate start and end dates
//       const startDate = sortedDates[0];
//       const endDate = sortedDates[sortedDates.length - 1];

//       // Create booking details for each selected date
//       const bookingDetails = sortedDates.map(date => ({
//         date: date,
//         timeSlot: dateConfigurations[date].timeSlot,
//         eventType: dateConfigurations[date].eventType
//       }));

//       // Prepare booking data matching the backend API
//       const bookingData = {
//         bookingDate: startDate,
//         endDate: endDate,
//         bookingDetails: bookingDetails,
//         eventTime: dateConfigurations[sortedDates[0]].timeSlot, // Global fallback
//         eventType: dateConfigurations[sortedDates[0]].eventType, // Global fallback
//         numberOfGuests: parseInt(numberOfGuests),
//         specialRequest: specialRequests || '',
//         pricingType: isGuest ? 'guest' : 'member',
//         totalPrice: calculateTotalAmount().total,
//         // Always include membership_no - backend requires it for member status check
//         membership_no: membershipNo,
//       };

//       // Add guest details if it's a guest booking
//       if (isGuest) {
//         bookingData.guestName = guestName;
//         bookingData.guestContact = guestContact;
//       }

//       console.log('🧾 Generating hall invoice with data:', {
//         hallId: venue.id,
//         bookingData,
//         isGuest
//       });

//       // Use the API call
//       const response = await banquetAPI.memberBookingHall(venue.id, bookingData);

//       setBookingLoading(false);
//       setShowBookingModal(false);
//       console.log("hall booking res:", response)

//       if (response.status === 201) {
//         // Prepare navigation params
//         const navigationParams = {
//           invoiceData: response.data.Data || response.data,
//           bookingData: {
//             ...bookingData,
//             hallId: venue.id,
//             hallName: venue.name,
//             hallDescription: venue.description,
//             totalAmount: response.data.Data?.Amount || response.data.Amount,
//           },
//           venue: venue,
//           isGuest: isGuest,
//           memberDetails: !isGuest ? {
//             memberName: userName,
//             membershipNo: membershipNo
//           } : null,
//           guestDetails: isGuest ? {
//             guestName,
//             guestContact
//           } : null,
//           module: 'HALL'
//         };

//         // Set global voucher for persistent timer
//         setVoucher(response.data.Data || response.data, navigationParams);

//         // Navigate to invoice screen
//         navigation.navigate('HallInvoiceScreen', navigationParams);
//       } else {
//         throw new Error(response.data.ResponseMessage || 'Failed to generate invoice');
//       }

//     } catch (error) {
//       setBookingLoading(false);
//       console.error('❌ Hall booking error:', error);

//       let errorMessage = 'Failed to process booking. Please try again.';

//       if (error.response?.status === 401) {
//         errorMessage = 'Authentication failed. Please log in again.';
//       } else if (error.response?.status === 400) {
//         errorMessage = error.response.data?.message || 'Invalid booking data provided.';
//       } else if (error.response?.status === 409) {
//         const msg = error.response.data?.message;
//         if (msg && msg.toLowerCase().includes('reserved')) {
//           errorMessage = `This slot is already booked. ${msg}. Please select a different time or date.`;
//         } else {
//           errorMessage = msg || 'Hall not available for selected date and time.';
//         }
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Hall not found or service unavailable.';
//       } else if (error.message?.includes('Network Error')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       } else if (error.message?.includes('timeout')) {
//         errorMessage = 'Request timeout. Please try again.';
//       }

//       Alert.alert('Booking Failed', errorMessage);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Select Date';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-');
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
//   };

//   const calculateHallAdvance = (price) => {
//     const total = Number(price) || 0;
//     if (total < 50000) {
//       return total; // If amount is less than 50k, full amount is advance
//     }
//     return 50000; // Otherwise, flat fee of 50k
//   };

//   const calculateTotalAmount = () => {
//     if (!venue) return { total: 0, advance: 0 };
//     const numDates = Object.keys(dateConfigurations).length;
//     if (numDates === 0) return { total: 0, advance: 0 };

//     const pricePerDay = isGuest
//       ? (venue.chargesGuests || 0)
//       : (venue.chargesMembers || 0);

//     const totalPrice = pricePerDay * numDates;
//     const advanceAmount = calculateHallAdvance(totalPrice);
//     return {
//       total: totalPrice,
//       advance: advanceAmount
//     };
//   };

//   // Admin Reservation Form
//   const renderAdminReservationForm = () => {
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <MaterialIcons name="admin-panel-settings" size={22} color="#DC3545" />
//           <Text style={styles.sectionTitle}>Admin Reservation</Text>
//         </View>

//         <View style={styles.dateSection}>
//           <Text style={styles.sectionLabel}>Reservation Period</Text>
//           <View style={styles.dateInputs}>
//             <TouchableOpacity
//               style={styles.dateInput}
//               onPress={() => openCalendar('from')}
//             >
//               <Feather name="calendar" size={16} color="#b48a64" />
//               <Text style={styles.dateInputText}>
//                 From: {formatDate(reserveFrom)}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dateInput}
//               onPress={() => openCalendar('to')}
//             >
//               <Feather name="calendar" size={16} color="#b48a64" />
//               <Text style={styles.dateInputText}>
//                 To: {formatDate(reserveTo)}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.dropdownSection}>
//           <Text style={styles.sectionLabel}>Time Slot</Text>
//           <DropDownPicker
//             open={timeSlotOpen}
//             value={timeSlot}
//             items={timeSlotOptions}
//             setOpen={setTimeSlotOpen}
//             setValue={setTimeSlot}
//             placeholder="Select Time Slot"
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownContainer}
//             listMode="SCROLLVIEW"
//             scrollViewProps={{
//               nestedScrollEnabled: true,
//             }}
//             zIndex={3000}
//             zIndexInverse={1000}
//           />
//         </View>

//         <View style={styles.adminActionButtons}>
//           <TouchableOpacity
//             style={[
//               styles.adminButton,
//               styles.reserveButton,
//               (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
//             ]}
//             onPress={() => setReserveModalVisible(true)}
//             disabled={!reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>Reserve Hall</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.adminButton,
//               styles.unreserveButton,
//               (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
//             ]}
//             onPress={() => setUnreserveModalVisible(true)}
//             disabled={!reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>Unreserve Hall</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Member/Guest Booking Form
//   const renderMemberBookingForm = () => {
//     const guestPrice = venue.guestPrice || venue.chargesGuests;
//     const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

//     return (
//       <>
//         {/* Member Info Card (only if authenticated and not guest) */}
//         {/* {!isGuest && isAuthenticated && (
//           // <View style={styles.memberInfoCard}>
//           //   <View style={styles.memberInfoHeader}>
//           //     <Text style={styles.memberInfoTitle}>Member Information</Text>
//           //   </View>

//           //   <View style={styles.memberInfoDisplay}>
//           //     <View style={styles.infoRow}>
//           //       <Text style={styles.infoLabel}>Name:</Text>
//           //       <Text style={styles.infoValue}>
//           //         {userName || 'Member'}
//           //       </Text>
//           //     </View>
//           //     <View style={styles.infoRow}>
//           //       <Text style={styles.infoLabel}>Membership No:</Text>
//           //       <Text style={styles.infoValue}>
//           //         {membershipNo || 'Auto-detected from login'}
//           //       </Text>
//           //     </View>
//           //     <View style={styles.infoRow}>
//           //       <Text style={styles.infoLabel}>Status:</Text>
//           //       <Text style={[styles.infoValue, styles.sessionStatus]}>
//           //         {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
//           //       </Text>
//           //     </View>
//           //   </View>
//           // </View>
//         )} */}

//         {/* Authentication Warning for Member Booking */}
//         {!isGuest && !isAuthenticated && (
//           <View style={styles.warningBox}>
//             <MaterialIcons name="error" size={16} color="#DC3545" />
//             <Text style={styles.warningText}>
//               Please log in with a member account to book halls as a member.
//             </Text>
//           </View>
//         )}

//         {/* Package Info Card */}
//         {/* <View style={styles.packageCard}>
//           <Text style={styles.packageTitle}>{venue?.name || 'Banquet Hall'}</Text>
//           <View style={styles.priceContainer}>
//             <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Member Price</Text>
//               <Text style={styles.priceValue}>Rs. {memberPrice.toLocaleString()}/-</Text>
//             </View>
//             {!venue?.isExclusive && guestPrice > 0 && <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Guest Price</Text>
//               <Text style={styles.priceValue}>Rs. {guestPrice.toLocaleString()}/-</Text>
//             </View>}
//           </View>
//         </View> */}

//         {/* Booking Type Toggle */}
//         <View style={styles.toggleContainer}>
//           <Text style={styles.toggleLabel}>Booking Type:</Text>
//           <View style={styles.toggleRow}>
//             <Text style={[
//               styles.toggleOption,
//               !isGuest && styles.toggleActive,
//               !canBookAsGuest && { opacity: 0.5 }
//             ]}>
//               Member
//             </Text>
//             <Switch
//               value={isGuest}
//               onValueChange={setIsGuest}
//               trackColor={{ false: '#D2B48C', true: '#b48a64' }}
//               thumbColor={isGuest ? '#fff' : '#fff'}
//               disabled={!canBookAsGuest}
//             />
//             <Text style={[
//               styles.toggleOption,
//               isGuest && styles.toggleActive,
//               !canBookAsGuest && { opacity: 0.5 }
//             ]}>
//               Guest
//             </Text>
//           </View>
//         </View>

//         {/* Guest Details (Conditional) */}
//         {isGuest && (
//           <View style={styles.guestContainer}>
//             <View style={styles.guestHeader}>
//               <MaterialIcons name="person-outline" size={22} color="#b48a64" />
//               <Text style={styles.guestTitle}>Guest Details</Text>
//             </View>

//             <View style={styles.guestInputGroup}>
//               <View style={styles.guestInputWrapper}>
//                 <MaterialIcons name="person" size={20} color="#b48a64" style={styles.guestInputIcon} />
//                 <TextInput
//                   style={styles.guestInput}
//                   placeholder="Guest Full Name *"
//                   value={guestName}
//                   onChangeText={handleGuestNameChange}
//                   placeholderTextColor="#999"
//                   autoCapitalize="words"
//                   maxLength={50}
//                 />
//               </View>
//             </View>

//             <View style={styles.guestInputGroup}>
//               <View style={styles.guestInputWrapper}>
//                 <MaterialIcons name="phone" size={20} color="#b48a64" style={styles.guestInputIcon} />
//                 <TextInput
//                   style={styles.guestInput}
//                   placeholder="Guest Contact Number *"
//                   value={guestContact}
//                   onChangeText={handleGuestContactChange}
//                   keyboardType="phone-pad"
//                   placeholderTextColor="#999"
//                   maxLength={12}
//                 />
//               </View>
//             </View>

//             <View style={styles.guestInfoNote}>
//               <MaterialIcons name="info-outline" size={16} color="#b48a64" />
//               <Text style={styles.guestInfoText}>
//                 Guest pricing will be applied. Guest details are required for booking
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Calendar Section */}
//         <View style={styles.calendarCard}>
//           <Text style={styles.sectionTitle}>Select Date(s)</Text>
//           {Object.keys(selectedDates).length > 0 && (
//             <View style={styles.selectedDatesBadgeContainer}>
//               {Object.keys(selectedDates).sort().map(date => (
//                 <View key={date} style={styles.dateBadge}>
//                   <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
//                   <TouchableOpacity onPress={() => {
//                     const newDates = { ...selectedDates };
//                     delete newDates[date];
//                     setSelectedDates(newDates);

//                     const newConfigs = { ...dateConfigurations };
//                     delete newConfigs[date];
//                     setDateConfigurations(newConfigs);
//                   }}>
//                     <Icon name="closecircle" size={14} color="#b48a64" style={{ marginLeft: 5 }} />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           )}

//           <Calendar
//             current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
//             minDate={new Date().toISOString().split('T')[0]}
//             onDayPress={(day) => {
//               const date = day.dateString;
//               const newDates = { ...selectedDates };
//               const newConfigs = { ...dateConfigurations };

//               // Check if date is disabled
//               if (reservedDates[date]?.disabled) {
//                 return;
//               }

//               if (newDates[date]) {
//                 // If removing a date, we only allow removing from ends to maintain continuity
//                 const sortedDates = Object.keys(newDates).sort();
//                 if (date !== sortedDates[0] && date !== sortedDates[sortedDates.length - 1]) {
//                   Alert.alert("Invalid Selection", "Please only remove dates from the beginning or end of your selection to maintain a consecutive range.");
//                   return;
//                 }
//                 delete newDates[date];
//                 delete newConfigs[date];
//               } else {
//                 // If adding a date, check for continuity
//                 const sortedDates = Object.keys(newDates).sort();
//                 if (sortedDates.length > 0) {
//                   const firstDate = new Date(sortedDates[0]);
//                   const lastDate = new Date(sortedDates[sortedDates.length - 1]);
//                   const clickedDate = new Date(date);

//                   // Calculate difference in days
//                   const diffToFirst = Math.abs(clickedDate - firstDate) / (1000 * 60 * 60 * 24);
//                   const diffToLast = Math.abs(clickedDate - lastDate) / (1000 * 60 * 60 * 24);

//                   if (diffToFirst !== 1 && diffToLast !== 1) {
//                     Alert.alert("Invalid Selection", "Please select consecutive dates.");
//                     return;
//                   }
//                 }

//                 newDates[date] = {
//                   selected: true,
//                   selectedColor: '#b48a64',
//                   selectedTextColor: 'white',
//                 };
//                 newConfigs[date] = {
//                   timeSlot: selectedTimeSlot || timeSlotOptions[0].value,
//                   eventType: selectedEventType || eventTypeOptions[0].value,
//                 };
//               }
//               setSelectedDates(newDates);
//               setDateConfigurations(newConfigs);
//             }}
//             markedDates={{ ...reservedDates, ...selectedDates }}
//             theme={{
//               calendarBackground: '#fff',
//               textSectionTitleColor: '#000',
//               selectedDayBackgroundColor: '#b48a64',
//               selectedDayTextColor: '#fff',
//               todayTextColor: '#b48a64',
//               dayTextColor: '#000',
//               textDisabledColor: '#d9e1e8',
//               arrowColor: '#b48a64',
//               monthTextColor: '#000',
//               textDayFontSize: 16,
//               textMonthFontSize: 18,
//               textDayHeaderFontSize: 14,
//             }}
//           />
//         </View>

//         {/* Event Details */}
//         <View style={[styles.sectionCard, { zIndex: 1 }]}>
//           <Text style={styles.sectionTitle}>Event Details</Text>

//           <View style={styles.inputGroup}>
//             <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setNumberOfGuests}
//               value={numberOfGuests}
//               placeholder="Number of Guests"
//               placeholderTextColor="#A0AEC0"
//               keyboardType="numeric"
//             />
//           </View>
//           <View style={styles.guestInfoNote}>
//             <MaterialIcons name="info-outline" size={16} color="#b48a64" />
//             <Text style={styles.guestInfoText}>
//               (Maximum no. of guests is {venue?.capacity || 'N/A'})
//             </Text>
//           </View>

//           {Object.keys(dateConfigurations).length > 0 ? (
//             Object.keys(dateConfigurations).sort().map((date, index) => (
//               <View key={date} style={[styles.dateConfigCard, { zIndex: (Object.keys(dateConfigurations).length - index) * 100 }]}>
//                 <Text style={styles.dateConfigTitle}>Booking details for {formatDateForDisplay(date)}</Text>

//                 <View style={styles.dropdownSection}>
//                   <Text style={styles.sectionLabel}>Event Type</Text>
//                   <DropDownPicker
//                     open={!!dateConfigurations[date]?.eventTypeOpen}
//                     value={dateConfigurations[date]?.eventType}
//                     items={eventTypeOptions}
//                     setOpen={(open) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].eventTypeOpen = typeof open === 'function' ? open(newConfigs[date].eventTypeOpen) : open;
//                       // Close others
//                       Object.keys(newConfigs).forEach(d => {
//                         if (d !== date) {
//                           newConfigs[d].eventTypeOpen = false;
//                           newConfigs[d].timeSlotOpen = false;
//                         }
//                       });
//                       setDateConfigurations(newConfigs);
//                     }}
//                     setValue={(callback) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].eventType = typeof callback === 'function' ? callback(newConfigs[date].eventType) : callback;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     placeholder="Select Event Type"
//                     style={styles.dropdown}
//                     dropDownContainerStyle={styles.dropdownContainer}
//                     listMode="SCROLLVIEW"
//                     nestedScrollEnabled={true}
//                     zIndex={5000 - index * 10}
//                     dropDownDirection="BOTTOM"
//                   />
//                 </View>

//                 <View style={styles.dropdownSection}>
//                   <Text style={styles.sectionLabel}>Time Slot</Text>
//                   <DropDownPicker
//                     open={!!dateConfigurations[date]?.timeSlotOpen}
//                     value={dateConfigurations[date]?.timeSlot}
//                     items={timeSlotOptions}
//                     setOpen={(open) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].timeSlotOpen = typeof open === 'function' ? open(newConfigs[date].timeSlotOpen) : open;
//                       // Close others
//                       Object.keys(newConfigs).forEach(d => {
//                         if (d !== date) {
//                           newConfigs[d].eventTypeOpen = false;
//                           newConfigs[d].timeSlotOpen = false;
//                         }
//                       });
//                       setDateConfigurations(newConfigs);
//                     }}
//                     setValue={(callback) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].timeSlot = typeof callback === 'function' ? callback(newConfigs[date].timeSlot) : callback;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     placeholder="Select Time Slot"
//                     style={styles.dropdown}
//                     dropDownContainerStyle={styles.dropdownContainer}
//                     listMode="SCROLLVIEW"
//                     nestedScrollEnabled={true}
//                     zIndex={4995 - index * 10}
//                     dropDownDirection="BOTTOM"
//                   />
//                 </View>
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDateText}>Please select at least one date from the calendar</Text>
//           )}
//         </View>

//         {/* Special Requests */}
//         <View style={styles.specialRequestContainer}>
//           <Text style={styles.sectionTitle}>Special Request</Text>
//           <View style={styles.inputGroup}>
//             <Feather name="edit-3" size={20} color="#b48a64" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               onChangeText={setSpecialRequests}
//               value={specialRequests}
//               placeholder="Any special requirements or requests..."
//               placeholderTextColor="#A0AEC0"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />
//           </View>
//         </View>

//         {/* Price Summary */}
//         <View style={styles.priceSummary}>
//           <View>
//             <Text style={styles.priceSummaryLabel}>Total Amount:</Text>
//             <Text style={styles.priceSummarySubtitle}>
//               {isGuest ? 'Guest Charges' : 'Member Charges'}
//             </Text>
//           </View>
//           <View style={styles.priceSummaryValueContainer}>
//             <View style={styles.priceRow}>
//               <Text style={styles.priceLabel}>Total:</Text>
//               <Text style={styles.priceValue}>Rs. {calculateTotalAmount().total.toLocaleString()}/-</Text>
//             </View>
//             <View style={[styles.priceRow, styles.advanceRow]}>
//               <Text style={styles.advanceLabel}>Advance Required:</Text>
//               <Text style={styles.advanceValue}>Rs. {calculateTotalAmount().advance.toLocaleString()}/-</Text>
//             </View>
//             <Text style={styles.priceSummaryBreakdown}>
//               {Object.keys(dateConfigurations).length} date(s) × Rs. {(isGuest ? (venue?.chargesGuests || 0) : (venue?.chargesMembers || 0)).toLocaleString()}
//             </Text>
//           </View>
//         </View>

//         {/* Contact Info */}
//         <View style={styles.contactContainer}>
//           <Text style={styles.contactText}>
//             <Text style={{ fontWeight: 'bold' }}>Note: </Text>
//             For more details contact booking office{' '}
//             <Text style={{ fontWeight: 'bold' }}>03419777711</Text>.
//           </Text>
//         </View>

//         {/* Terms & Conditions */}
//         <TermsAndConditions
//           bookingType="HALL"
//           agreed={termsAgreed}
//           onToggle={() => {
//             setTermsAgreed(!termsAgreed);
//             if (showTermsError) setShowTermsError(false);
//           }}
//           showError={showTermsError}
//         />

//         {/* Book Now Button */}
//         <TouchableOpacity
//           style={[
//             styles.submitButton,
//             styles[isGuest ? 'guestSubmitButton' : 'memberSubmitButton'],
//             (Object.keys(dateConfigurations).length === 0 || !numberOfGuests) &&
//             styles.submitButtonDisabled,
//             (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
//             (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
//           ]}
//           onPress={() => setShowBookingModal(true)}
//           disabled={
//             Object.keys(dateConfigurations).length === 0 ||
//             !numberOfGuests ||
//             (!isGuest && !isAuthenticated) ||
//             (isGuest && (!guestName || !guestContact))
//           }
//         >
//           <Text style={styles.submitButtonText}>
//             {isGuest ? 'Book as Guest' : 'Book as Member'}
//           </Text>
//           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
//         </TouchableOpacity>
//       </>
//     );
//   };

//   const renderVenueInfo = () => {
//     if (!venue) return null;

//     const guestPrice = venue.guestPrice || venue.chargesGuests || venue.memberPrice * 1.2 || venue.memberPrice;
//     const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

//     return (
//       <View style={styles.venueInfoCard}>
//         <Text style={styles.venueInfoTitle}>Booking Summary</Text>
//         <View style={styles.venueDetails}>
//           <Text style={styles.venueName}>{venue.name || venue.title}</Text>
//           <Text style={styles.venueDescription}>{venue.description}</Text>
//           <View style={styles.venueStats}>
//             <Text style={styles.venueStat}>Capacity: {venue.capacity} people</Text>
//             {/* <View style={styles.priceComparison}>
//               <Text style={styles.memberPriceText}>
//                 Member Price: Rs. {memberPrice.toLocaleString()}/-
//               </Text>
//               <Text style={styles.guestPriceText}>
//                 Guest Price: Rs. {guestPrice.toLocaleString()}/-
//               </Text>
//             </View> */}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="black" />
//       <SafeAreaView style={styles.container}>
//         <ImageBackground
//           source={require('../../assets/notch.jpg')}
//           style={styles.headerBackground}
//           imageStyle={styles.headerImage}
//         >
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrowleft" size={24} color="#000000ff" />
//             </TouchableOpacity>
//             <View style={styles.headerTitleContainer}>
//               <Text style={styles.headerTitle}>
//                 {isAdmin ? 'Admin Reservation' : 'Book Hall'}
//               </Text>
//               <Text style={styles.headerSubtitle}>
//                 {venue?.name || venue?.title || 'Select Hall'}
//               </Text>
//             </View>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <ScrollView
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* {renderVenueInfo()} */}
//           {isAdmin ? renderAdminReservationForm() : renderMemberBookingForm()}
//           <View style={styles.footerSpacer} />
//         </ScrollView>

//         {/* Booking Confirmation Modal */}
//         {!isAdmin && (
//           <Modal
//             visible={showBookingModal}
//             animationType="slide"
//             transparent={true}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>Confirm Booking</Text>
//                   <TouchableOpacity onPress={() => setShowBookingModal(false)}>
//                     <Icon name="close" size={24} color="#666" />
//                   </TouchableOpacity>
//                 </View>

//                 <ScrollView style={styles.modalContent}>
//                   <View style={styles.bookingSummary}>
//                     <Text style={styles.summaryTitle}>Booking Details</Text>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Booking Type:</Text>
//                       <Text style={styles.summaryValue}>
//                         {isGuest ? 'Guest Booking' : 'Member Booking'}
//                       </Text>
//                     </View>

//                     {isGuest && (
//                       <>
//                         <View style={styles.summaryRow}>
//                           <Text style={styles.summaryLabel}>Guest Name:</Text>
//                           <Text style={styles.summaryValue}>{guestName}</Text>
//                         </View>
//                         <View style={styles.summaryRow}>
//                           <Text style={styles.summaryLabel}>Contact:</Text>
//                           <Text style={styles.summaryValue}>{guestContact}</Text>
//                         </View>
//                       </>
//                     )}

//                     {!isGuest && (
//                       <>
//                         <View style={styles.summaryRow}>
//                           <Text style={styles.summaryLabel}>Member Name:</Text>
//                           <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
//                         </View>
//                         <View style={styles.summaryRow}>
//                           <Text style={styles.summaryLabel}>Membership No:</Text>
//                           <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
//                         </View>
//                       </>
//                     )}

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Hall:</Text>
//                       <Text style={styles.summaryValue}>{venue?.name || venue?.title}</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Dates & Configurations:</Text>
//                     </View>
//                     {Object.keys(dateConfigurations).sort().map(date => (
//                       <View key={date} style={styles.summaryConfigBox}>
//                         <Text style={styles.summaryConfigDate}>{formatDateForDisplay(date)}</Text>
//                         <Text style={styles.summaryConfigDetail}>
//                           {timeSlotOptions.find(opt => opt.value === dateConfigurations[date].timeSlot)?.label || dateConfigurations[date].timeSlot} - {eventTypeOptions.find(opt => opt.value === dateConfigurations[date].eventType)?.label || dateConfigurations[date].eventType}
//                         </Text>
//                       </View>
//                     ))}

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Guests:</Text>
//                       <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Total Amount:</Text>
//                       <Text style={styles.summaryValue}>Rs. {calculateTotalAmount().total.toLocaleString()}/-</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={[styles.summaryLabel, { color: '#b48a64' }]}>Advance Required:</Text>
//                       <Text style={[styles.summaryValue, { color: '#b48a64', fontWeight: 'bold' }]}>
//                         Rs. {calculateTotalAmount().advance.toLocaleString()}/-
//                       </Text>
//                     </View>

//                     {specialRequests && (
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Special Requests:</Text>
//                         <Text style={styles.summaryValue}>{specialRequests}</Text>
//                       </View>
//                     )}
//                   </View>

//                   <View style={styles.infoBox}>
//                     <MaterialIcons name="info" size={16} color="#b48a64" />
//                     <Text style={styles.infoText}>
//                       {isGuest
//                         ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
//                         : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 <View style={styles.modalFooter}>
//                   <TouchableOpacity
//                     style={styles.cancelButton}
//                     onPress={() => setShowBookingModal(false)}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
//                     onPress={handleGenerateInvoice}
//                     disabled={bookingLoading}
//                   >
//                     {bookingLoading ? (
//                       <ActivityIndicator size="small" color="#FFF" />
//                     ) : (
//                       <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>
//         )}

//         {/* Admin Reservation Modal */}
//         <Modal
//           visible={reserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Reservation</Text>

//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setReserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.confirmButton]}
//                   onPress={handleAdminReserve}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Reserve</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Admin Unreserve Modal */}
//         <Modal
//           visible={unreserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Unreserve</Text>

//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <Text style={styles.warningText}>
//                 This will remove the reservation for the specified period.
//               </Text>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setUnreserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.unreserveConfirmButton]}
//                   onPress={handleAdminUnreserve}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Unreserve</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Calendar Modal */}
//         <Modal
//           visible={calendarModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.calendarModalContent}>
//               <Text style={styles.calendarTitle}>
//                 Select {calendarType === 'from' ? 'Start' : 'End'} Date
//               </Text>

//               <Calendar
//                 onDayPress={handleDateSelect}
//                 markedDates={{
//                   [reserveFrom]: { selected: true, selectedColor: '#007AFF' },
//                   [reserveTo]: { selected: true, selectedColor: '#007AFF' }
//                 }}
//                 minDate={new Date().toISOString().split('T')[0]}
//                 theme={{
//                   todayTextColor: '#007AFF',
//                   arrowColor: '#007AFF',
//                   selectedDayBackgroundColor: '#007AFF',
//                   selectedDayTextColor: '#FFF',
//                 }}
//               />

//               <TouchableOpacity
//                 style={styles.closeCalendarButton}
//                 onPress={() => setCalendarModalVisible(false)}
//               >
//                 <Text style={styles.closeCalendarText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF9F3',
//   },
//   headerBackground: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     overflow: 'hidden',
//   },
//   headerImage: {
//     opacity: 0.9,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000000ff',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#000000ff',
//     marginTop: 4,
//   },
//   placeholder: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingVertical: 15,
//   },

//   // Venue Info
//   venueInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   venueInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#b48a64',
//     marginBottom: 10,
//   },
//   venueName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 5,
//   },
//   venueDescription: {
//     fontSize: 14,
//     color: '#718096',
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   venueStats: {
//     marginBottom: 10,
//   },
//   venueStat: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//     marginBottom: 5,
//   },
//   priceComparison: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//   },
//   memberPriceText: {
//     fontSize: 14,
//     color: '#28a745',
//     fontWeight: '600',
//     marginBottom: 5,
//   },
//   guestPriceText: {
//     fontSize: 14,
//     color: '#dc3545',
//     fontWeight: '600',
//   },

//   // Member Info Card
//   memberInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   memberInfoHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   memberInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2D3748',
//   },

//   memberInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#e8f5e8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   memberInfoText: {
//     fontSize: 14,
//     color: '#2E7D32',
//     fontWeight: '600',
//   },
//   adminInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#fff3cd',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   adminInfoText: {
//     fontSize: 14,
//     color: '#b48a64',
//     fontWeight: '600',
//   },

//   // Section Cards
//   sectionCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginLeft: 10,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },

//   // Booking Type Toggle
//   toggleContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   toggleLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 10,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//   },
//   toggleOption: {
//     fontSize: 16,
//     color: '#666',
//   },
//   toggleActive: {
//     color: '#b48a64',
//     fontWeight: 'bold',
//   },

//   // Guest Container
//   guestContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#E8DCC8',
//   },
//   guestHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E6D8',
//   },
//   guestTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginLeft: 10,
//   },
//   guestInputGroup: {
//     marginBottom: 15,
//   },
//   guestInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F5F0',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2D9CC',
//     paddingHorizontal: 15,
//     height: 55,
//   },
//   guestInputIcon: {
//     marginRight: 12,
//   },
//   guestInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#2D3748',
//     height: '100%',
//   },
//   guestInfoNote: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#FDF8F3',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 5,
//     borderWidth: 1,
//     borderColor: '#E8DCC8',
//   },
//   guestInfoText: {
//     flex: 1,
//     fontSize: 13,
//     color: '#8B7355',
//     marginLeft: 8,
//     lineHeight: 18,
//   },

//   // Package Card
//   packageCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   packageTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 10,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   priceColumn: {
//     alignItems: 'center',
//   },
//   priceLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   priceValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },

//   // Member Info Display
//   memberInfoDisplay: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#6C757D',
//     fontWeight: '600',
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#495057',
//     fontWeight: '500',
//   },

//   // Calendar
//   calendarCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   selectedDate: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 15,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   selectedDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#F0FFF4',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#9AE6B4',
//   },
//   selectedDateText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2D3748',
//     marginLeft: 8,
//   },

//   // Inputs
//   inputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F7FAFC',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#2D3748',
//   },
//   textArea: {
//     height: 80,
//     paddingVertical: 12,
//   },

//   // Dropdown
//   dropdownSection: {
//     marginBottom: 20,
//   },
//   dropdown: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderWidth: 1,
//     borderRadius: 12,
//   },
//   dropdownContainer: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//   },

//   // Admin Reservation Styles
//   dateSection: {
//     marginBottom: 20,
//   },
//   dateInputs: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   dateInput: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#F9F9F9',
//     // spacing handled by parent and child margins
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   adminActionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   adminButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   reserveButton: {
//     backgroundColor: '#28a745',
//   },
//   unreserveButton: {
//     backgroundColor: '#dc3545',
//   },
//   adminButtonText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },

//   // Button Disabled State
//   buttonDisabled: {
//     backgroundColor: '#CBD5E0',
//     opacity: 0.6,
//   },

//   // Total Amount
//   totalCard: {
//     backgroundColor: '#b48a64',
//     marginHorizontal: 60,
//     marginBottom: 15,
//     padding: 5,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#ffffffff',
//     marginBottom: 8,
//   },
//   totalAmount: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFF',
//     marginBottom: 8,
//   },
//   totalNote: {
//     fontSize: 12,
//     color: '#ffffffff',
//     fontStyle: 'italic',
//   },

//   // Price Summary (similar to room booking)
//   priceSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     marginHorizontal: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   priceSummaryLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   priceSummarySubtitle: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   priceSummaryValueContainer: {
//     alignItems: 'flex-end',
//   },
//   priceSummaryValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   advanceRow: {
//     marginTop: 4,
//     paddingTop: 4,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginRight: 8,
//   },
//   priceValue: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//   },
//   advanceLabel: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#b48a64',
//     marginRight: 8,
//   },
//   advanceValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   priceSummaryBreakdown: {
//     fontSize: 11,
//     color: '#999',
//     marginTop: 6,
//     textAlign: 'right',
//   },

//   // Submit Button
//   submitButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#b48a64',
//     marginHorizontal: 15,
//     paddingVertical: 18,
//     borderRadius: 12,
//     shadowColor: '#b48a64',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   memberSubmitButton: {
//     backgroundColor: '#b48a64',
//   },
//   guestSubmitButton: {
//     backgroundColor: '#b48a64',
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#b4896449',
//     shadowColor: 'transparent',
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 8,
//   },

//   contactContainer: {
//     marginBottom: 10,
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   contactText: {
//     fontSize: 13,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 18,
//   },

//   // Footer Spacer
//   footerSpacer: {
//     height: 30,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '85%',
//     paddingHorizontal: 20,
//     paddingTop: 24,
//     paddingBottom: 30,
//   },
//   calendarModalContent: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#2D3748',
//   },
//   calendarTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalContent: {
//     flexGrow: 1,
//   },

//   // Booking Summary
//   bookingSummary: {
//     backgroundColor: '#F8F9FA',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//     paddingVertical: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//     width: '40%',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#2D3748',
//     fontWeight: '500',
//     textAlign: 'right',
//     width: '60%',
//     flexWrap: 'wrap',
//   },

//   // Reservation Details
//   reservationDetails: {
//     backgroundColor: '#F8F9FA',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   detailLabel: {
//     fontSize: 15,
//     color: '#333',
//     marginBottom: 8,
//     fontWeight: '500',
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#FFF8E1',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#8D6E63',
//     marginLeft: 8,
//     lineHeight: 16,
//   },

//   // Warning Box
//   warningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFE6E6',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#DC3545',
//     marginTop: 10,
//     marginHorizontal: 15,
//     marginBottom: 15,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#DC3545',
//     marginLeft: 8,
//     flex: 1,
//   },

//   // Modal Actions
//   modalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   confirmButton: {
//     backgroundColor: '#b48a64',
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   unreserveConfirmButton: {
//     backgroundColor: '#dc3545',
//   },
//   cancelButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   confirmButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // Calendar Close Button
//   closeCalendarButton: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#B8860B',
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   closeCalendarText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Modal Footer
//   modalFooter: {
//     flexDirection: 'row',
//     marginTop: 20,
//     justifyContent: 'space-between',
//     gap: 12,
//   },

//   // Session Status
//   sessionStatus: {
//     color: '#28a745',
//     fontWeight: 'bold',
//   },

//   // Special Request Container
//   specialRequestContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   dateConfigCard: {
//     backgroundColor: '#FDFCFB',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#F0E6D8',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   dateConfigTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'black',
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E6D8',
//     paddingBottom: 5,
//   },
//   noDateText: {
//     fontSize: 14,
//     color: '#8B7355',
//     textAlign: 'center',
//     marginTop: 10,
//     fontStyle: 'italic',
//   },
//   selectedDatesBadgeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 10,
//     gap: 8,
//   },
//   dateBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8E1',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#b48a64',
//   },
//   dateBadgeText: {
//     fontSize: 12,
//     color: 'black',
//     fontWeight: '600',
//   },
//   summaryConfigBox: {
//     backgroundColor: '#FFF',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   summaryConfigDate: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#2D3748',
//   },
//   summaryConfigDetail: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
// });

// export default BHBooking;

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUserData, banquetAPI } from '../../config/apis';
import { useAuth } from '../auth/contexts/AuthContext';
import { useVoucher } from '../auth/contexts/VoucherContext';
import TermsAndConditions from '../components/TermsAndConditions';

const eventTypeOptions = [
  { label: 'Wedding Reception', value: 'wedding' },
  { label: 'Birthday Party', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family' },
  { label: 'Other Event', value: 'other' },
];

const timeSlotOptions = [
  { label: 'Day', value: 'DAY' },
  { label: 'Night', value: 'NIGHT' },
];

const BHBooking = ({ route, navigation }) => {
  const { setVoucher } = useVoucher();
  const { venue } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  const scrollViewRef = useRef(null);

  // State variables
  const [selectedDates, setSelectedDates] = useState({});
  const [dateConfigurations, setDateConfigurations] = useState({});
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlotOptions[0].value);
  const [specialRequests, setSpecialRequests] = useState('');

  // Guest Booking States
  const guestPriceRaw = venue?.guestPrice || venue?.chargesGuests || 0;
  const canBookAsGuest = !venue?.isExclusive && guestPriceRaw > 0;
  const [isGuest, setIsGuest] = useState(canBookAsGuest); // Select guest by default ONLY if allowed, otherwise select member (false)
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBookingTypeToggle = (value) => {
    setIsGuest(value);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

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

  // Admin Reservation States
  const [isAdmin, setIsAdmin] = useState(false);
  const [reserveFrom, setReserveFrom] = useState('');
  const [reserveTo, setReserveTo] = useState('');
  const [timeSlot, setTimeSlot] = useState(null);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarType, setCalendarType] = useState('from');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Reservation Data
  const [reservedDates, setReservedDates] = useState({});
  const [isFetchingReservations, setIsFetchingReservations] = useState(false);

  // Terms & Conditions state
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  // Extract membership number from user object
  const extractMembershipNo = () => {
    if (!user) return null;

    const possibleFields = [
      'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
      'membershipID', 'memberNo', 'memberNumber', 'membershipId'
    ];

    for (const field of possibleFields) {
      if (user[field]) {
        return user[field].toString();
      }
    }

    if (user.data && typeof user.data === 'object') {
      for (const field of possibleFields) {
        if (user.data[field]) {
          return user.data[field].toString();
        }
      }
    }

    return null;
  };

  const membershipNo = extractMembershipNo();
  const userName = user?.name || user?.username || user?.fullName;

  useEffect(() => {
    checkUserStatus();
    fetchReservations();
  }, [venue]);

  const fetchReservations = async () => {
    if (!venue?.id) return;
    try {
      setIsFetchingReservations(true);
      const response = await banquetAPI.getHallReservations(venue.id);
      if (response.data && Array.isArray(response.data)) {
        const marked = {};
        response.data.forEach(res => {
          // Assuming reservation date is in YYYY-MM-DD
          // If it's a range, we might need to expand it, but the API getHallReservations
          // likely returns an array of booked date objects or strings
          const dateStr = res.date || res.bookingDate;
          if (dateStr) {
            marked[dateStr] = {
              disabled: true,
              disableTouchEvent: true,
              textColor: '#d9e1e8',
            };
          }
        });
        setReservedDates(marked);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setIsFetchingReservations(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const userData = await getUserData();

      const currentUser = user || userData;

      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      const extractedUserRole =
        currentUser.role ||
        currentUser.Role ||
        currentUser.userRole ||
        currentUser.user_role;

      const isAdminUser = extractedUserRole && (
        extractedUserRole.toLowerCase() === 'admin' ||
        extractedUserRole.toLowerCase() === 'super_admin' ||
        extractedUserRole.toLowerCase() === 'superadmin'
      );

      setIsAdmin(isAdminUser);

    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
    }
  };

  // Admin Reservation Functions
  const openCalendar = (type) => {
    setCalendarType(type);
    setCalendarModalVisible(true);
  };

  const handleDateSelect = (date) => {
    const selectedDate = date.dateString;
    if (calendarType === 'from') {
      setReserveFrom(selectedDate);
    } else {
      setReserveTo(selectedDate);
    }
    setCalendarModalVisible(false);
  };

  const validateReservation = () => {
    if (!reserveFrom || !reserveTo) {
      Alert.alert('Error', 'Please select reservation dates');
      return false;
    }
    if (!timeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return false;
    }

    const fromDate = new Date(reserveFrom);
    const toDate = new Date(reserveTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      Alert.alert('Error', 'Reservation start date cannot be in the past');
      return false;
    }

    if (fromDate >= toDate) {
      Alert.alert('Error', 'Reservation end date must be after start date');
      return false;
    }

    return true;
  };

  const handleAdminReserve = async () => {
    if (!validateReservation()) return;

    try {
      setLoading(true);
      const payload = {
        hallIds: [venue.id.toString()],
        reserve: true,
        timeSlot: timeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await banquetAPI.reserveHalls(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Hall reserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setReserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reserve hall'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUnreserve = async () => {
    if (!reserveFrom || !reserveTo || !timeSlot) {
      Alert.alert('Error', 'Please select dates and time slot to unreserve');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        hallIds: [venue.id.toString()],
        reserve: false,
        timeSlot: timeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await banquetAPI.reserveHalls(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Hall unreserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setUnreserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Unreservation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to unreserve hall'
      );
    } finally {
      setLoading(false);
    }
  };

  // Member/Guest Booking function
  const handleGenerateInvoice = async () => {
    // Terms & Conditions validation
    if (!termsAgreed) {
      setShowTermsError(true);
      setShowBookingModal(false);
      Alert.alert('Terms & Conditions', 'You must agree to the Terms & Conditions before booking.');
      return;
    }

    // Validation
    const sortedDates = Object.keys(dateConfigurations).sort();
    if (sortedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one booking date');
      return;
    }
    if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
      Alert.alert('Error', 'Please enter number of guests');
      return;
    }
    if (venue?.capacity && parseInt(numberOfGuests) > venue.capacity) {
      Alert.alert('Capacity Exceeded', `The maximum capacity for this hall is ${venue.capacity} guests. Please adjust the number of guests.`);
      return;
    }

    // Guest validation
    if (isGuest) {
      if (!guestName.trim()) {
        Alert.alert('Error', 'Please enter guest name');
        return;
      }
      // Validate Pakistani mobile number format (03xxxxxxxxx or 92xxxxxxxxxx)
      const phoneRegex = /^(03\d{9}|92\d{10})$/;
      if (!phoneRegex.test(guestContact.trim())) {
        Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number (e.g., 03001234567 or 923001234567).');
        return;
      }
    }

    // Member validation
    if (!isGuest && !isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to book a hall.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Login',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            })
          }
        ]
      );
      return;
    }

    setBookingLoading(true);

    try {
      // Calculate start and end dates
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      // Create booking details for each selected date
      const bookingDetails = sortedDates.map(date => ({
        date: date,
        timeSlot: dateConfigurations[date].timeSlot,
        eventType: dateConfigurations[date].eventType
      }));

      // Prepare booking data matching the backend API
      const bookingData = {
        bookingDate: startDate,
        endDate: endDate,
        bookingDetails: bookingDetails,
        eventTime: dateConfigurations[sortedDates[0]].timeSlot, // Global fallback
        eventType: dateConfigurations[sortedDates[0]].eventType, // Global fallback
        numberOfGuests: parseInt(numberOfGuests),
        specialRequest: specialRequests || '',
        pricingType: isGuest ? 'guest' : 'member',
        totalPrice: calculateTotalAmount().total,
        // Always include membership_no - backend requires it for member status check
        membership_no: membershipNo,
      };

      // Add guest details if it's a guest booking
      if (isGuest) {
        bookingData.guestName = guestName;
        bookingData.guestContact = guestContact;
      }

      console.log('🧾 Generating hall invoice with data:', {
        hallId: venue.id,
        bookingData,
        isGuest
      });

      // Use the API call
      const response = await banquetAPI.memberBookingHall(venue.id, bookingData);

      setBookingLoading(false);
      setShowBookingModal(false);
      console.log("hall booking res:", response)

      if (response.status === 201) {
        // Prepare navigation params
        const navigationParams = {
          invoiceData: response.data.Data || response.data,
          bookingData: {
            ...bookingData,
            hallId: venue.id,
            hallName: venue.name,
            hallDescription: venue.description,
            totalAmount: response.data.Data?.Amount || response.data.Amount,
          },
          venue: venue,
          isGuest: isGuest,
          memberDetails: !isGuest ? {
            memberName: userName,
            membershipNo: membershipNo
          } : null,
          guestDetails: isGuest ? {
            guestName,
            guestContact
          } : null,
          module: 'HALL'
        };

        // Set global voucher for persistent timer
        setVoucher(response.data.Data || response.data, navigationParams);

        // Navigate to invoice screen
        navigation.navigate('HallInvoiceScreen', navigationParams);
      } else {
        throw new Error(response.data.ResponseMessage || 'Failed to generate invoice');
      }

    } catch (error) {
      setBookingLoading(false);
      console.error('❌ Hall booking error:', error);

      let errorMessage = 'Failed to process booking. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid booking data provided.';
      } else if (error.response?.status === 409) {
        const msg = error.response.data?.message;
        if (msg && msg.toLowerCase().includes('reserved')) {
          errorMessage = `This slot is already booked. ${msg}. Please select a different time or date.`;
        } else {
          errorMessage = msg || 'Hall not available for selected date and time.';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Hall not found or service unavailable.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }

      Alert.alert('Booking Failed', errorMessage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
  };

  const calculateHallAdvance = (price) => {
    const total = Number(price) || 0;
    if (total < 50000) {
      return total; // If amount is less than 50k, full amount is advance
    }
    return 50000; // Otherwise, flat fee of 50k
  };

  const calculateTotalAmount = () => {
    if (!venue) return { total: 0, advance: 0 };
    const numDates = Object.keys(dateConfigurations).length;
    if (numDates === 0) return { total: 0, advance: 0 };

    const pricePerDay = isGuest
      ? (venue.chargesGuests || 0)
      : (venue.chargesMembers || 0);

    const totalPrice = pricePerDay * numDates;
    const advanceAmount = calculateHallAdvance(totalPrice);
    return {
      total: totalPrice,
      advance: advanceAmount
    };
  };

  // Admin Reservation Form
  const renderAdminReservationForm = () => {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="admin-panel-settings" size={22} color="#DC3545" />
          <Text style={styles.sectionTitle}>Admin Reservation</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Reservation Period</Text>
          <View style={styles.dateInputs}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('from')}
            >
              <Feather name="calendar" size={16} color="#b48a64" />
              <Text style={styles.dateInputText}>
                From: {formatDate(reserveFrom)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('to')}
            >
              <Feather name="calendar" size={16} color="#b48a64" />
              <Text style={styles.dateInputText}>
                To: {formatDate(reserveTo)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dropdownSection}>
          <Text style={styles.sectionLabel}>Time Slot</Text>
          <DropDownPicker
            open={timeSlotOpen}
            value={timeSlot}
            items={timeSlotOptions}
            setOpen={setTimeSlotOpen}
            setValue={setTimeSlot}
            placeholder="Select Time Slot"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={styles.adminActionButtons}>
          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.reserveButton,
              (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setReserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !timeSlot}
          >
            <Text style={styles.adminButtonText}>Reserve Hall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.unreserveButton,
              (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setUnreserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !timeSlot}
          >
            <Text style={styles.adminButtonText}>Unreserve Hall</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSpecialRequestSection = () => (
    <View style={styles.specialRequestContainer}>
      <Text style={styles.sectionTitle}>Special Request</Text>
      <View style={styles.inputGroup}>
        <Feather name="edit-3" size={20} color="#b48a64" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          onChangeText={setSpecialRequests}
          value={specialRequests}
          placeholder="Any special requirements or requests..."
          placeholderTextColor="#A0AEC0"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  // Member/Guest Booking Form
  const renderMemberBookingForm = () => {
    const guestPrice = venue.guestPrice || venue.chargesGuests;
    const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

    return (
      <>
        {/* Member Info Card (only if authenticated and not guest) */}
        {/* {!isGuest && isAuthenticated && (
          // <View style={styles.memberInfoCard}>
          //   <View style={styles.memberInfoHeader}>
          //     <Text style={styles.memberInfoTitle}>Member Information</Text>
          //   </View>

          //   <View style={styles.memberInfoDisplay}>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Name:</Text>
          //       <Text style={styles.infoValue}>
          //         {userName || 'Member'}
          //       </Text>
          //     </View>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Membership No:</Text>
          //       <Text style={styles.infoValue}>
          //         {membershipNo || 'Auto-detected from login'}
          //       </Text>
          //     </View>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Status:</Text>
          //       <Text style={[styles.infoValue, styles.sessionStatus]}>
          //         {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          //       </Text>
          //     </View>
          //   </View>
          // </View>
        )} */}

        {/* Authentication Warning for Member Booking */}
        {!isGuest && !isAuthenticated && (
          <View style={styles.warningBox}>
            <MaterialIcons name="error" size={16} color="#DC3545" />
            <Text style={styles.warningText}>
              Please log in with a member account to book halls as a member.
            </Text>
          </View>
        )}

        {/* Package Info Card */}
        {/* <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>{venue?.name || 'Banquet Hall'}</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Member Price</Text>
              <Text style={styles.priceValue}>Rs. {memberPrice.toLocaleString()}/-</Text>
            </View>
            {!venue?.isExclusive && guestPrice > 0 && <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Guest Price</Text>
              <Text style={styles.priceValue}>Rs. {guestPrice.toLocaleString()}/-</Text>
            </View>}
          </View>
        </View> */}

        {/* Booking Type Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Booking Type:</Text>
          <View style={styles.toggleRow}>
            <Text style={[
              styles.toggleOption,
              !isGuest && styles.toggleActive,
              !canBookAsGuest && { opacity: 0.5 }
            ]}>
              Member
            </Text>
            <Switch
              value={isGuest}
              onValueChange={handleBookingTypeToggle}
              trackColor={{ false: '#D2B48C', true: '#b48a64' }}
              thumbColor={isGuest ? '#fff' : '#fff'}
              disabled={!canBookAsGuest}
            />
            <Text style={[
              styles.toggleOption,
              isGuest && styles.toggleActive,
              !canBookAsGuest && { opacity: 0.5 }
            ]}>
              Guest
            </Text>
          </View>
        </View>

        {/* Guest Details (Conditional) */}
        {isGuest && (
          <View style={styles.guestContainer}>
            <View style={styles.guestHeader}>
              <MaterialIcons name="person-outline" size={22} color="#b48a64" />
              <Text style={styles.guestTitle}>Guest Details</Text>
            </View>

            <View style={styles.guestInputGroup}>
              <View style={styles.guestInputWrapper}>
                <MaterialIcons name="person" size={20} color="#b48a64" style={styles.guestInputIcon} />
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
                <MaterialIcons name="phone" size={20} color="#b48a64" style={styles.guestInputIcon} />
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
              <MaterialIcons name="info-outline" size={16} color="#b48a64" />
              <Text style={styles.guestInfoText}>
                Guest pricing will be applied. Guest details are required for booking
              </Text>
            </View>
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Select Date(s)</Text>
          {Object.keys(selectedDates).length > 0 && (
            <View style={styles.selectedDatesBadgeContainer}>
              {Object.keys(selectedDates).sort().map(date => (
                <View key={date} style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
                  <TouchableOpacity onPress={() => {
                    const newDates = { ...selectedDates };
                    delete newDates[date];
                    setSelectedDates(newDates);

                    const newConfigs = { ...dateConfigurations };
                    delete newConfigs[date];
                    setDateConfigurations(newConfigs);
                  }}>
                    <Icon name="closecircle" size={14} color="#b48a64" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Calendar
            current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => {
              const date = day.dateString;
              const newDates = { ...selectedDates };
              const newConfigs = { ...dateConfigurations };

              // Check if date is disabled
              if (reservedDates[date]?.disabled) {
                return;
              }

              if (newDates[date]) {
                // If removing a date, we only allow removing from ends to maintain continuity
                const sortedDates = Object.keys(newDates).sort();
                if (date !== sortedDates[0] && date !== sortedDates[sortedDates.length - 1]) {
                  Alert.alert("Invalid Selection", "Please only remove dates from the beginning or end of your selection to maintain a consecutive range.");
                  return;
                }
                delete newDates[date];
                delete newConfigs[date];
              } else {
                // If adding a date, check for continuity
                const sortedDates = Object.keys(newDates).sort();
                if (sortedDates.length > 0) {
                  const firstDate = new Date(sortedDates[0]);
                  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
                  const clickedDate = new Date(date);

                  // Calculate difference in days
                  const diffToFirst = Math.abs(clickedDate - firstDate) / (1000 * 60 * 60 * 24);
                  const diffToLast = Math.abs(clickedDate - lastDate) / (1000 * 60 * 60 * 24);

                  if (diffToFirst !== 1 && diffToLast !== 1) {
                    Alert.alert("Invalid Selection", "Please select consecutive dates.");
                    return;
                  }
                }

                newDates[date] = {
                  selected: true,
                  selectedColor: '#b48a64',
                  selectedTextColor: 'white',
                };
                newConfigs[date] = {
                  timeSlot: selectedTimeSlot || timeSlotOptions[0].value,
                  eventType: selectedEventType || eventTypeOptions[0].value,
                };
              }
              setSelectedDates(newDates);
              setDateConfigurations(newConfigs);
            }}
            markedDates={{ ...reservedDates, ...selectedDates }}
            theme={{
              calendarBackground: '#fff',
              textSectionTitleColor: '#000',
              selectedDayBackgroundColor: '#b48a64',
              selectedDayTextColor: '#fff',
              todayTextColor: '#b48a64',
              dayTextColor: '#000',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#b48a64',
              monthTextColor: '#000',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Event Details */}
        <View style={[styles.sectionCard, { zIndex: 1 }]}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setNumberOfGuests}
              value={numberOfGuests}
              placeholder="Number of Guests"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.guestInfoNote}>
            <MaterialIcons name="info-outline" size={16} color="#b48a64" />
            <Text style={styles.guestInfoText}>
              (Maximum no. of guests is {venue?.capacity || 'N/A'})
            </Text>
          </View>

          {Object.keys(dateConfigurations).length > 0 ? (
            Object.keys(dateConfigurations).sort().map((date, index) => (
              <View key={date} style={[styles.dateConfigCard, { zIndex: (Object.keys(dateConfigurations).length - index) * 100 }]}>
                <Text style={styles.dateConfigTitle}>Booking details for {formatDateForDisplay(date)}</Text>

                <View style={styles.dropdownSection}>
                  <Text style={styles.sectionLabel}>Event Type</Text>
                  <DropDownPicker
                    open={!!dateConfigurations[date]?.eventTypeOpen}
                    value={dateConfigurations[date]?.eventType}
                    items={eventTypeOptions}
                    setOpen={(open) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].eventTypeOpen = typeof open === 'function' ? open(newConfigs[date].eventTypeOpen) : open;
                      // Close others
                      Object.keys(newConfigs).forEach(d => {
                        if (d !== date) {
                          newConfigs[d].eventTypeOpen = false;
                          newConfigs[d].timeSlotOpen = false;
                        }
                      });
                      setDateConfigurations(newConfigs);
                    }}
                    setValue={(callback) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].eventType = typeof callback === 'function' ? callback(newConfigs[date].eventType) : callback;
                      setDateConfigurations(newConfigs);
                    }}
                    placeholder="Select Event Type"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    nestedScrollEnabled={true}
                    zIndex={5000 - index * 10}
                    dropDownDirection="BOTTOM"
                  />
                </View>

                <View style={styles.dropdownSection}>
                  <Text style={styles.sectionLabel}>Time Slot</Text>
                  <DropDownPicker
                    open={!!dateConfigurations[date]?.timeSlotOpen}
                    value={dateConfigurations[date]?.timeSlot}
                    items={timeSlotOptions}
                    setOpen={(open) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].timeSlotOpen = typeof open === 'function' ? open(newConfigs[date].timeSlotOpen) : open;
                      // Close others
                      Object.keys(newConfigs).forEach(d => {
                        if (d !== date) {
                          newConfigs[d].eventTypeOpen = false;
                          newConfigs[d].timeSlotOpen = false;
                        }
                      });
                      setDateConfigurations(newConfigs);
                    }}
                    setValue={(callback) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].timeSlot = typeof callback === 'function' ? callback(newConfigs[date].timeSlot) : callback;
                      setDateConfigurations(newConfigs);
                    }}
                    placeholder="Select Time Slot"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    nestedScrollEnabled={true}
                    zIndex={4995 - index * 10}
                    dropDownDirection="BOTTOM"
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDateText}>Please select at least one date from the calendar</Text>
          )}
        </View>

        {renderSpecialRequestSection()}

        {/* Price Summary */}
        <View style={styles.priceSummary}>
          <View>
            <Text style={styles.priceSummaryLabel}>Total Amount:</Text>
            <Text style={styles.priceSummarySubtitle}>
              {isGuest ? 'Guest Charges' : 'Member Charges'}
            </Text>
          </View>
          <View style={styles.priceSummaryValueContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total:</Text>
              <Text style={styles.priceValue}>Rs. {calculateTotalAmount().total.toLocaleString()}/-</Text>
            </View>
            <View style={[styles.priceRow, styles.advanceRow]}>
              <Text style={styles.advanceLabel}>Advance Required:</Text>
              <Text style={styles.advanceValue}>Rs. {calculateTotalAmount().advance.toLocaleString()}/-</Text>
            </View>
            <Text style={styles.priceSummaryBreakdown}>
              {Object.keys(dateConfigurations).length} date(s) × Rs. {(isGuest ? (venue?.chargesGuests || 0) : (venue?.chargesMembers || 0)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            <Text style={{ fontWeight: 'bold' }}>Note: </Text>
            For more details contact booking office{' '}
            <Text style={{ fontWeight: 'bold' }}>03419777711</Text>.
          </Text>
        </View>

        {/* Terms & Conditions */}
        <TermsAndConditions
          bookingType="HALL"
          agreed={termsAgreed}
          onToggle={() => {
            setTermsAgreed(!termsAgreed);
            if (showTermsError) setShowTermsError(false);
          }}
          showError={showTermsError}
        />

        {/* Book Now Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            styles[isGuest ? 'guestSubmitButton' : 'memberSubmitButton'],
            (Object.keys(dateConfigurations).length === 0 || !numberOfGuests) &&
            styles.submitButtonDisabled,
            (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
            (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
          ]}
          onPress={() => setShowBookingModal(true)}
          disabled={
            Object.keys(dateConfigurations).length === 0 ||
            !numberOfGuests ||
            (!isGuest && !isAuthenticated) ||
            (isGuest && (!guestName || !guestContact))
          }
        >
          <Text style={styles.submitButtonText}>
            {isGuest ? 'Book as Guest' : 'Book as Member'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </>
    );
  };

  const renderVenueInfo = () => {
    if (!venue) return null;

    const guestPrice = venue.guestPrice || venue.chargesGuests || venue.memberPrice * 1.2 || venue.memberPrice;
    const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

    return (
      <View style={styles.venueInfoCard}>
        <Text style={styles.venueInfoTitle}>Booking Summary</Text>
        <View style={styles.venueDetails}>
          <Text style={styles.venueName}>{venue.name || venue.title}</Text>
          <Text style={styles.venueDescription}>{venue.description}</Text>
          <View style={styles.venueStats}>
            <Text style={styles.venueStat}>Capacity: {venue.capacity} people</Text>
            {/* <View style={styles.priceComparison}>
              <Text style={styles.memberPriceText}>
                Member Price: Rs. {memberPrice.toLocaleString()}/-
              </Text>
              <Text style={styles.guestPriceText}>
                Guest Price: Rs. {guestPrice.toLocaleString()}/-
              </Text>
            </View> */}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrowleft" size={24} color="#000000ff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isAdmin ? 'Admin Reservation' : 'Book Hall'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {venue?.name || venue?.title || 'Select Hall'}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* {renderVenueInfo()} */}
          {isAdmin ? renderAdminReservationForm() : renderMemberBookingForm()}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Booking Confirmation Modal */}
        {!isAdmin && (
          <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Booking</Text>
                  <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.bookingSummary}>
                    <Text style={styles.summaryTitle}>Booking Details</Text>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Booking Type:</Text>
                      <Text style={styles.summaryValue}>
                        {isGuest ? 'Guest Booking' : 'Member Booking'}
                      </Text>
                    </View>

                    {isGuest && (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Guest Name:</Text>
                          <Text style={styles.summaryValue}>{guestName}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Contact:</Text>
                          <Text style={styles.summaryValue}>{guestContact}</Text>
                        </View>
                      </>
                    )}

                    {!isGuest && (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Member Name:</Text>
                          <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Membership No:</Text>
                          <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
                        </View>
                      </>
                    )}

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Hall:</Text>
                      <Text style={styles.summaryValue}>{venue?.name || venue?.title}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Dates & Configurations:</Text>
                    </View>
                    {Object.keys(dateConfigurations).sort().map(date => (
                      <View key={date} style={styles.summaryConfigBox}>
                        <Text style={styles.summaryConfigDate}>{formatDateForDisplay(date)}</Text>
                        <Text style={styles.summaryConfigDetail}>
                          {timeSlotOptions.find(opt => opt.value === dateConfigurations[date].timeSlot)?.label || dateConfigurations[date].timeSlot} - {eventTypeOptions.find(opt => opt.value === dateConfigurations[date].eventType)?.label || dateConfigurations[date].eventType}
                        </Text>
                      </View>
                    ))}

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Guests:</Text>
                      <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Amount:</Text>
                      <Text style={styles.summaryValue}>Rs. {calculateTotalAmount().total.toLocaleString()}/-</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: '#b48a64' }]}>Advance Required:</Text>
                      <Text style={[styles.summaryValue, { color: '#b48a64', fontWeight: 'bold' }]}>
                        Rs. {calculateTotalAmount().advance.toLocaleString()}/-
                      </Text>
                    </View>

                    {specialRequests && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Special Requests:</Text>
                        <Text style={styles.summaryValue}>{specialRequests}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.infoBox}>
                    <MaterialIcons name="info" size={16} color="#b48a64" />
                    <Text style={styles.infoText}>
                      {isGuest
                        ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
                        : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowBookingModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
                    onPress={handleGenerateInvoice}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Admin Reservation Modal */}
        <Modal
          visible={reserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Reservation</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setReserveModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAdminReserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Reserve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Admin Unreserve Modal */}
        <Modal
          visible={unreserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Unreserve</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
              </View>

              <Text style={styles.warningText}>
                This will remove the reservation for the specified period.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setUnreserveModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.unreserveConfirmButton]}
                  onPress={handleAdminUnreserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Unreserve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Calendar Modal */}
        <Modal
          visible={calendarModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
              <Text style={styles.calendarTitle}>
                Select {calendarType === 'from' ? 'Start' : 'End'} Date
              </Text>

              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [reserveFrom]: { selected: true, selectedColor: '#007AFF' },
                  [reserveTo]: { selected: true, selectedColor: '#007AFF' }
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#007AFF',
                  arrowColor: '#007AFF',
                  selectedDayBackgroundColor: '#007AFF',
                  selectedDayTextColor: '#FFF',
                }}
              />

              <TouchableOpacity
                style={styles.closeCalendarButton}
                onPress={() => setCalendarModalVisible(false)}
              >
                <Text style={styles.closeCalendarText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerImage: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#000000ff',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
  },

  // Venue Info
  venueInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  venueInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b48a64',
    marginBottom: 10,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  venueDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 10,
    lineHeight: 20,
  },
  venueStats: {
    marginBottom: 10,
  },
  venueStat: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginBottom: 5,
  },
  priceComparison: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  memberPriceText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 5,
  },
  guestPriceText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },

  // Member Info Card
  memberInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },

  memberInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  memberInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  adminInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  adminInfoText: {
    fontSize: 14,
    color: '#b48a64',
    fontWeight: '600',
  },

  // Section Cards
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  // Booking Type Toggle
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

  // Guest Container
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

  // Package Card
  packageCard: {
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
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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

  // Member Info Display
  memberInfoDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  // Calendar
  calendarCard: {
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
  selectedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9AE6B4',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },

  // Inputs
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

  // Dropdown
  dropdownSection: {
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
  },
  dropdownContainer: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },

  // Admin Reservation Styles
  dateSection: {
    marginBottom: 20,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
    // spacing handled by parent and child margins
  },
  dateInputText: {
    fontSize: 14,
    color: '#333',
  },
  adminActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#28a745',
  },
  unreserveButton: {
    backgroundColor: '#dc3545',
  },
  adminButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Button Disabled State
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    opacity: 0.6,
  },

  // Total Amount
  totalCard: {
    backgroundColor: '#b48a64',
    marginHorizontal: 60,
    marginBottom: 15,
    padding: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#ffffffff',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  totalNote: {
    fontSize: 12,
    color: '#ffffffff',
    fontStyle: 'italic',
  },

  // Price Summary (similar to room booking)
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 2,
  },
  advanceRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  advanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b48a64',
    marginRight: 8,
  },
  advanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  priceSummaryBreakdown: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },

  // Submit Button
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

  contactContainer: {
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Footer Spacer
  footerSpacer: {
    height: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  calendarModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalContent: {
    flexGrow: 1,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: '40%',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    textAlign: 'right',
    width: '60%',
    flexWrap: 'wrap',
  },

  // Reservation Details
  reservationDetails: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8D6E63',
    marginLeft: 8,
    lineHeight: 16,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
    marginTop: 10,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 12,
    color: '#DC3545',
    marginLeft: 8,
    flex: 1,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#b48a64',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  unreserveConfirmButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Calendar Close Button
  closeCalendarButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#B8860B',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeCalendarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 12,
  },

  // Session Status
  sessionStatus: {
    color: '#28a745',
    fontWeight: 'bold',
  },

  // Special Request Container
  specialRequestContainer: {
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
  dateConfigCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E6D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateConfigTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
    paddingBottom: 5,
  },
  noDateText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  selectedDatesBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#b48a64',
  },
  dateBadgeText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '600',
  },
  summaryConfigBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  summaryConfigDate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  summaryConfigDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default BHBooking;