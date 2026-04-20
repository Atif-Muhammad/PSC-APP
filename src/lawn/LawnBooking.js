// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   StyleSheet,
// //   Text,
// //   View,
// //   TouchableOpacity,
// //   TextInput,
// //   ScrollView,
// //   SafeAreaView,
// //   Alert,
// //   StatusBar,
// //   ImageBackground,
// //   Modal,
// //   ActivityIndicator,
// //   Platform,
// //   Switch,
// //   KeyboardAvoidingView,
// // } from 'react-native';
// // import { Calendar } from 'react-native-calendars';
// // import Icon from 'react-native-vector-icons/AntDesign';
// // import Feather from 'react-native-vector-icons/Feather';
// // import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// // import DropDownPicker from 'react-native-dropdown-picker';
// // import { getUserData, lawnAPI, getAuthToken } from '../../config/apis';
// // import { useAuth } from '../auth/contexts/AuthContext';
// // import { useVoucher } from '../auth/contexts/VoucherContext';

// // const eventTypeOptions = [
// //   { label: 'Wedding Reception', value: 'wedding' },
// //   { label: 'Birthday Party', value: 'birthday' },
// //   { label: 'Anniversary', value: 'anniversary' },
// //   { label: 'Family Gathering', value: 'family' },
// //   { label: 'Other Event', value: 'other' },
// // ];

// // const timeSlotOptions = [
// //   { label: 'Day', value: 'DAY' },
// //   { label: 'Night', value: 'NIGHT' },
// // ];

// // const LawnBooking = ({ route, navigation }) => {
// //   const { setVoucher } = useVoucher();
// //   const { venue } = route.params || {};
// //   const { user, isAuthenticated } = useAuth();

// //   // Refs for dropdown z-index management
// //   const scrollViewRef = useRef(null);

// //   // ==============================
// //   // COMMON STATE VARIABLES
// //   // ==============================
// //   const [loading, setLoading] = useState(false);
// //   const [userData, setUserData] = useState(null);
// //   const [isAdmin, setIsAdmin] = useState(false);

// //   // No longer used: Admin reservation states removed

// //   // ==============================
// //   // MEMBER/GUEST BOOKING STATES
// //   // ==============================
// //   const [selectedDates, setSelectedDates] = useState({});
// //   const [dateConfigurations, setDateConfigurations] = useState({});
// //   const [eventTypeOpen, setEventTypeOpen] = useState(false);
// //   const [selectedEventType, setSelectedEventType] = useState(null);
// //   const [numberOfGuests, setNumberOfGuests] = useState('');
// //   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
// //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
// //   const [specialRequests, setSpecialRequests] = useState('');
// //   const [isGuest, setIsGuest] = useState(true);
// //   const [guestName, setGuestName] = useState('');
// //   const [guestContact, setGuestContact] = useState('');
// //   const [showBookingModal, setShowBookingModal] = useState(false);
// //   const [bookingLoading, setBookingLoading] = useState(false);

// //   // Extract membership number from user object
// //   const extractMembershipNo = () => {
// //     const targets = [user, userData];
// //     const possibleFields = [
// //       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
// //       'membershipID', 'memberNo', 'memberNumber', 'membershipId',
// //       'id', 'userId', 'user_id', 'userID'
// //     ];

// //     for (const target of targets) {
// //       if (!target) continue;

// //       for (const field of possibleFields) {
// //         if (target[field]) {
// //           return target[field].toString();
// //         }
// //       }

// //       if (target.data && typeof target.data === 'object') {
// //         for (const field of possibleFields) {
// //           if (target.data[field]) {
// //             return target.data[field].toString();
// //           }
// //         }
// //       }
// //     }

// //     return null;
// //   };

// //   const membershipNo = extractMembershipNo();
// //   const userName = user?.name || user?.username || user?.fullName || userData?.name || userData?.username || userData?.fullName;

// //   useEffect(() => {
// //     console.log('🎯 LawnBooking mounted with params:', {
// //       venue: venue,
// //       venueId: venue?.id,
// //       venueDescription: venue?.description
// //     });

// //     checkUserStatus();

// //     if (venue) {
// //       setNumberOfGuests(venue.minGuests?.toString() || '50');
// //     }

// //     // setSelectedDates({}); // Initial state is empty
// //   }, [venue]);

// //   const checkUserStatus = async () => {
// //     try {
// //       const fetchedUserData = await getUserData();
// //       setUserData(fetchedUserData);

// //       const currentUser = user || fetchedUserData;

// //       if (!currentUser) {
// //         setIsAdmin(false);
// //         return;
// //       }

// //       const extractedUserRole =
// //         currentUser.role ||
// //         currentUser.Role ||
// //         currentUser.userRole ||
// //         currentUser.user_role;

// //       const isAdminUser = extractedUserRole && (
// //         extractedUserRole.toLowerCase() === 'admin' ||
// //         extractedUserRole.toLowerCase() === 'super_admin' ||
// //         extractedUserRole.toLowerCase() === 'superadmin'
// //       );

// //       setIsAdmin(isAdminUser);
// //       console.log('👤 User status:', {
// //         isAdmin: isAdminUser,
// //         role: extractedUserRole,
// //         userName: userName
// //       });

// //     } catch (error) {
// //       console.error('Error checking user status:', error);
// //       setIsAdmin(false);
// //     }
// //   };



// //   // ==============================
// //   // MEMBER/GUEST BOOKING FUNCTIONS
// //   // ==============================
// //   const handleGenerateInvoice = async () => {
// //     // Validation
// //     const sortedDates = Object.keys(dateConfigurations).sort();
// //     if (sortedDates.length === 0) {
// //       Alert.alert('Error', 'Please select at least one booking date');
// //       return;
// //     }

// //     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
// //       Alert.alert('Error', 'Please enter number of guests');
// //       return;
// //     }

// //     // Guest validation
// //     if (isGuest) {
// //       if (!guestName.trim()) {
// //         Alert.alert('Error', 'Please enter guest name');
// //         return;
// //       }
// //       if (!guestContact.trim() || guestContact.length < 10) {
// //         Alert.alert('Error', 'Please enter a valid phone number');
// //         return;
// //       }
// //     }

// //     // Member validation
// //     if (!isGuest && !isAuthenticated) {
// //       Alert.alert(
// //         'Authentication Required',
// //         'Please login to book a lawn.',
// //         [
// //           { text: 'Cancel', style: 'cancel' },
// //           {
// //             text: 'Go to Login',
// //             onPress: () => navigation.reset({
// //               index: 0,
// //               routes: [{ name: 'LoginScr' }],
// //             })
// //           }
// //         ]
// //       );
// //       return;
// //     }

// //     // Check guest count against lawn capacity
// //     if (venue) {
// //       const guests = parseInt(numberOfGuests);
// //       if (venue.minGuests && guests < venue.minGuests) {
// //         Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
// //         return;
// //       }
// //       if (venue.maxGuests && guests > venue.maxGuests) {
// //         Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
// //         return;
// //       }
// //     }

// //     setBookingLoading(true);

// //     try {
// //       const startDate = sortedDates[0];
// //       const endDate = sortedDates[sortedDates.length - 1];
// //       const numberOfDays = sortedDates.length;

// //       // Prepare booking data
// //       const basePrice = isGuest ? venue.guestCharges : venue.memberCharges;
// //       const totalPriceValue = basePrice * numberOfDays;

// //       // Construct bookingDetails array from dateConfigurations
// //       const bookingDetails = sortedDates.map(date => ({
// //         date: date,
// //         timeSlot: dateConfigurations[date].timeSlot,
// //         eventType: dateConfigurations[date].eventType
// //       }));

// //       // Use first date's config as global fallbacks (for older backend logic if still used)
// //       const firstConfig = dateConfigurations[startDate];

// //       // Generate the invoice
// //       const invoicePayload = {
// //         bookingDate: startDate,
// //         endDate: endDate,
// //         bookingDetails: bookingDetails,
// //         eventTime: firstConfig.timeSlot,
// //         eventType: firstConfig.eventType,
// //         numberOfGuests: parseInt(numberOfGuests),
// //         specialRequest: specialRequests || '',
// //         pricingType: isGuest ? 'guest' : 'member',
// //         membership_no: !isGuest ? membershipNo : null,
// //         guestName: isGuest ? guestName : null,
// //         guestContact: isGuest ? guestContact : null,
// //         totalPrice: totalPriceValue
// //       };

// //       console.log('🧾 Generating invoice with:', invoicePayload);

// //       const response = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

// //       console.log('✅ Invoice response:', response);

// //       if (response.status === 200 || response.status === 201) {
// //         const responseData = response.data;
// //         // Create the booking payload for the confirmation flow
// //         const bookingPayload = {
// //           consumerInfo: {
// //             membership_no: !isGuest ? membershipNo : 'GUEST',
// //           },
// //           bookingData: {
// //             lawnId: venue.id.toString(),
// //             bookingDate: startDate,
// //             endDate: endDate,
// //             bookingDetails: bookingDetails,
// //             eventTime: firstConfig.timeSlot,
// //             eventType: firstConfig.eventType,
// //             numberOfGuests: parseInt(numberOfGuests),
// //             specialRequest: specialRequests || '',
// //             pricingType: isGuest ? 'guest' : 'member',
// //             totalPrice: totalPriceValue.toString(),
// //             paidBy: isGuest ? 'GUEST' : 'MEMBER',
// //             guestName: isGuest ? guestName : '',
// //             guestContact: isGuest ? guestContact : '',
// //           }
// //         };

// //         console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

// //         try {
// //           // Create booking with direct fetch
// //           const token = await getAuthToken();
// //           const bookingResponse = await fetch(`${base_url}/booking/member/booking/lawn`, {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'Authorization': `Bearer ${token}`,
// //             },
// //             body: JSON.stringify(bookingPayload),
// //           });

// //           let bookingData;
// //           if (bookingResponse.ok) {
// //             bookingData = await bookingResponse.json();
// //             console.log('✅ Booking created successfully:', bookingData);
// //           } else {
// //             console.warn('⚠️ Booking creation failed, but invoice was generated');
// //             bookingData = {
// //               success: false,
// //               message: 'Booking creation failed, but invoice was generated',
// //             };
// //           }

// //           // Navigate to voucher with invoice data
// //           const invoiceNumber = responseData.Data?.InvoiceNumber ||
// //             responseData.InvoiceNumber ||
// //             `INV-LAWN-${Date.now()}`;

// //           // Prepare navigation params
// //           const navigationParams = {
// //             invoiceData: responseData.Data || responseData,
// //             invoiceNumber: invoiceNumber,
// //             bookingType: 'LAWN',
// //             venue: venue,
// //             bookingDetails: {
// //               ...invoicePayload,
// //               lawnName: venue.description,
// //               totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
// //               bookingSummary: responseData.Data?.BookingSummary,
// //               bookingId: bookingData?.booking?.id || bookingData?.bookingId,
// //               invoiceNumber: invoiceNumber,
// //               selectedDates: sortedDates,
// //               dateConfigurations: dateConfigurations
// //             },
// //             bookingId: bookingData?.booking?.id || bookingData?.bookingId,
// //             isGuest: isGuest,
// //             memberDetails: !isGuest ? {
// //               memberName: userName,
// //               membershipNo: membershipNo
// //             } : null,
// //             guestDetails: isGuest ? {
// //               guestName,
// //               guestContact
// //             } : null,
// //             bookingSuccess: bookingResponse.ok,
// //             bookingError: !bookingResponse.ok ? 'Booking creation failed, but invoice was generated' : null,
// //             module: 'LAWN'
// //           };

// //           // Set global voucher for floating timer
// //           setVoucher(responseData.Data || responseData, navigationParams);

// //           navigation.navigate('Voucher', navigationParams);

// //         } catch (bookingError) {
// //           console.error('❌ Booking creation error:', bookingError);
// //           // Still navigate to voucher even if booking fails
// //           const invoiceNumber = responseData.Data?.InvoiceNumber ||
// //             responseData.InvoiceNumber ||
// //             `INV-LAWN-${Date.now()}`;

// //           navigation.navigate('Voucher', {
// //             invoiceData: responseData.Data || responseData,
// //             invoiceNumber: invoiceNumber,
// //             bookingType: 'LAWN',
// //             venue: venue,
// //             bookingDetails: {
// //               ...invoicePayload,
// //               lawnName: venue.description,
// //               totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
// //               bookingSummary: responseData.Data?.BookingSummary,
// //               invoiceNumber: invoiceNumber,
// //               selectedDates: sortedDates,
// //               dateConfigurations: dateConfigurations
// //             },
// //             isGuest: isGuest,
// //             memberDetails: !isGuest ? {
// //               memberName: userName,
// //               membershipNo: membershipNo
// //             } : null,
// //             guestDetails: isGuest ? {
// //               guestName,
// //               guestContact
// //             } : null,
// //             bookingSuccess: false,
// //             bookingError: bookingError.message
// //           });
// //         }
// //       } else {
// //         throw new Error(response.data?.ResponseMessage || 'Failed to generate invoice');
// //       }

// //     } catch (error) {
// //       setBookingLoading(false);
// //       setShowBookingModal(false);

// //       console.error('❌ Error in handleGenerateInvoice:', {
// //         message: error.message,
// //         response: error.response?.data,
// //         status: error.response?.status
// //       });

// //       let errorMessage = 'Failed to process booking. Please try again.';

// //       if (error.response?.status === 400) {
// //         const serverMsg = error.response.data?.message;
// //         errorMessage = serverMsg || 'Invalid booking data provided.';
// //       } else if (error.response?.status === 404) {
// //         errorMessage = 'Booking endpoint not found. Please check backend configuration.';
// //       } else if (error.response?.status === 500) {
// //         const serverError = error.response.data;
// //         if (serverError && typeof serverError === 'object') {
// //           errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
// //         }
// //       }

// //       Alert.alert('Booking Failed', errorMessage);
// //     } finally {
// //       setBookingLoading(false);
// //     }
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'Select Date';
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric'
// //     });
// //   };

// //   const formatDateForDisplay = (dateString) => {
// //     if (!dateString) return '';
// //     const [year, month, day] = dateString.split('-');
// //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// //     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
// //   };

// //   const calculateTotalAmount = () => {
// //     if (!venue) return 'Rs. 0/-';
// //     const price = isGuest ? venue.guestCharges : venue.memberCharges;
// //     const daysCount = Object.keys(dateConfigurations).length;
// //     return `Rs. ${(price * daysCount).toLocaleString() || '0'}/-`;
// //   };

// //   // renderAdminReservationForm removed

// //   // ==============================
// //   // MEMBER/GUEST BOOKING FORM
// //   // ==============================
// //   const renderMemberBookingForm = () => {
// //     return (
// //       <>
// //         {/* Venue Summary Card */}
// //         {renderVenueInfo()}

// //         {/* Booking Type Toggle */}
// //         <View style={styles.toggleContainer}>
// //           <Text style={styles.toggleLabel}>Booking Type:</Text>
// //           <View style={styles.toggleRow}>
// //             <Text style={[styles.toggleOption, !isGuest && styles.toggleActive]}>
// //               Member
// //             </Text>
// //             <Switch
// //               value={isGuest}
// //               onValueChange={setIsGuest}
// //               trackColor={{ false: '#b48a64', true: '#b48a64' }}
// //               thumbColor={isGuest ? '#fff' : '#fff'}
// //             />
// //             <Text style={[styles.toggleOption, isGuest && styles.toggleActive]}>
// //               Guest
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Guest Details (Conditional) */}
// //         {isGuest && (
// //           <View style={styles.guestContainer}>
// //             <Text style={styles.sectionTitle}>Guest Details</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Guest Name *"
// //               value={guestName}
// //               onChangeText={setGuestName}
// //               placeholderTextColor="#999"
// //             />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Guest Contact Number *"
// //               value={guestContact}
// //               onChangeText={setGuestContact}
// //               keyboardType="phone-pad"
// //               placeholderTextColor="#999"
// //               maxLength={15}
// //             />
// //           </View>
// //         )}

// //         {/* Calendar Section */}
// //         <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="event" size={22} color="#b48a64" />
// //             <Text style={styles.sectionTitle}>Select Date</Text>
// //           </View>
// //           {Object.keys(selectedDates).length > 0 && (
// //             <View style={styles.selectedDatesBadgeContainer}>
// //               {Object.keys(selectedDates).sort().map(date => (
// //                 <View key={date} style={styles.dateBadge}>
// //                   <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
// //                   <TouchableOpacity
// //                     onPress={() => {
// //                       const newDates = { ...selectedDates };
// //                       const newConfigs = { ...dateConfigurations };
// //                       delete newDates[date];
// //                       delete newConfigs[date];
// //                       setSelectedDates(newDates);
// //                       setDateConfigurations(newConfigs);
// //                     }}
// //                     style={{ marginLeft: 5 }}
// //                   >
// //                     <Icon name="close" size={14} color="#b48a64" />
// //                   </TouchableOpacity>
// //                 </View>
// //               ))}
// //             </View>
// //           )}
// //           {renderCalendar()}
// //         </View>

// //         {/* Event Details */}
// //         <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="event-available" size={22} color="#b48a64" />
// //             <Text style={styles.sectionTitle}>Event Details</Text>
// //           </View>

// //           {Object.keys(dateConfigurations).length > 0 ? (
// //             Object.keys(dateConfigurations).sort().map((date) => (
// //               <View key={date} style={[styles.dateConfigCard, { zIndex: dateConfigurations[date].eventTypeOpen || dateConfigurations[date].timeSlotOpen ? 1000 : 1 }]}>
// //                 <Text style={styles.dateConfigTitle}>{formatDateForDisplay(date)}</Text>

// //                 <View style={styles.dropdownSection}>
// //                   <Text style={styles.sectionLabel}>Event Type</Text>
// //                   <DropDownPicker
// //                     open={dateConfigurations[date].eventTypeOpen}
// //                     value={dateConfigurations[date].eventType}
// //                     items={eventTypeOptions}
// //                     setOpen={(open) => {
// //                       const newConfigs = { ...dateConfigurations };
// //                       // Close others on this date
// //                       newConfigs[date].timeSlotOpen = false;
// //                       newConfigs[date].eventTypeOpen = open;
// //                       setDateConfigurations(newConfigs);
// //                     }}
// //                     onSelectItem={(item) => {
// //                       const newConfigs = { ...dateConfigurations };
// //                       newConfigs[date].eventType = item.value;
// //                       setDateConfigurations(newConfigs);
// //                     }}
// //                     placeholder="Select Event Type"
// //                     style={styles.dropdown}
// //                     dropDownContainerStyle={styles.dropdownContainer}
// //                     listMode="SCROLLVIEW"
// //                     scrollViewProps={{ nestedScrollEnabled: true }}
// //                     zIndex={4000}
// //                     zIndexInverse={1000}
// //                   />
// //                 </View>

// //                 <View style={styles.dropdownSection}>
// //                   <Text style={styles.sectionLabel}>Time Slot</Text>
// //                   <DropDownPicker
// //                     open={dateConfigurations[date].timeSlotOpen}
// //                     value={dateConfigurations[date].timeSlot}
// //                     items={timeSlotOptions}
// //                     setOpen={(open) => {
// //                       const newConfigs = { ...dateConfigurations };
// //                       // Close others on this date
// //                       newConfigs[date].eventTypeOpen = false;
// //                       newConfigs[date].timeSlotOpen = open;
// //                       setDateConfigurations(newConfigs);
// //                     }}
// //                     onSelectItem={(item) => {
// //                       const newConfigs = { ...dateConfigurations };
// //                       newConfigs[date].timeSlot = item.value;
// //                       setDateConfigurations(newConfigs);
// //                     }}
// //                     placeholder="Select Time Slot"
// //                     style={styles.dropdown}
// //                     dropDownContainerStyle={styles.dropdownContainer}
// //                     listMode="SCROLLVIEW"
// //                     scrollViewProps={{ nestedScrollEnabled: true }}
// //                     zIndex={3000}
// //                     zIndexInverse={2000}
// //                   />
// //                 </View>
// //               </View>
// //             ))
// //           ) : (
// //             <Text style={styles.noDateText}>Please select a date from the calendar above</Text>
// //           )}
// //           <View style={styles.inputGroup}>
// //             <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
// //             <TextInput
// //               style={styles.input}
// //               onChangeText={setNumberOfGuests}
// //               value={numberOfGuests}
// //               placeholder="Number of Guests"
// //               placeholderTextColor="#A0AEC0"
// //               keyboardType="numeric"
// //               returnKeyType="done"
// //             />
// //           </View>
// //         </View>

// //         {/* Special Requests */}
// //         {/* <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="edit" size={22} color="#b48a64" />
// //             <Text style={styles.sectionTitle}>Special Requests</Text>
// //           </View>
// //           <View style={styles.inputGroup}>
// //             <Feather name="edit-3" size={20} color="#b48a64" style={styles.inputIcon} />
// //             <TextInput
// //               style={[styles.input, styles.textArea]}
// //               onChangeText={setSpecialRequests}
// //               value={specialRequests}
// //               placeholder="Any special requirements or requests..."
// //               placeholderTextColor="#A0AEC0"
// //               multiline
// //               numberOfLines={4}
// //               textAlignVertical="top"
// //               returnKeyType="done"
// //             />
// //           </View>
// //         </View> */}

// //         {/* Price Summary */}
// //         <View style={styles.priceSummary}>
// //           <View>
// //             <Text style={styles.priceSummaryLabel}>Total Amount:</Text>
// //             <Text style={styles.priceSummarySubtitle}>
// //               {isGuest ? 'Guest Charges' : 'Member Charges'}
// //             </Text>
// //           </View>
// //           <View style={styles.priceSummaryValueContainer}>
// //             <Text style={styles.priceSummaryValue}>
// //               {calculateTotalAmount()}
// //             </Text>
// //             <Text style={styles.priceSummaryBreakdown}>
// //               {Object.keys(dateConfigurations).length} date(s) × Rs. {(isGuest ? (venue?.guestCharges || 0) : (venue?.memberCharges || 0)).toLocaleString()}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Book Now Button */}
// //         <TouchableOpacity
// //           style={[
// //             styles.submitButton,
// //             (Object.keys(dateConfigurations).length === 0 || !numberOfGuests) &&
// //             styles.submitButtonDisabled,
// //             (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
// //             (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
// //           ]}
// //           onPress={() => setShowBookingModal(true)}
// //           disabled={
// //             Object.keys(dateConfigurations).length === 0 ||
// //             !numberOfGuests ||
// //             (!isGuest && !isAuthenticated) ||
// //             (isGuest && (!guestName || !guestContact))
// //           }
// //         >
// //           <Text style={styles.submitButtonText}>
// //             {isGuest ? 'Book as Guest' : 'Book as Member'}
// //           </Text>
// //           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
// //         </TouchableOpacity>
// //       </>
// //     );
// //   };

// //   const renderCalendar = () => (
// //     <View style={styles.calendarWrapper}>
// //       <Calendar
// //         current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
// //         minDate={new Date().toISOString().split('T')[0]}
// //         onDayPress={(day) => {
// //           const date = day.dateString;
// //           const newDates = { ...selectedDates };
// //           const newConfigs = { ...dateConfigurations };

// //           if (newDates[date]) {
// //             delete newDates[date];
// //             delete newConfigs[date];
// //           } else {
// //             newDates[date] = {
// //               selected: true,
// //               selectedColor: '#b48a64',
// //               selectedTextColor: '#FFF',
// //             };
// //             // Initialize config for the new date
// //             newConfigs[date] = {
// //               timeSlot: selectedTimeSlot || 'NIGHT',
// //               eventType: selectedEventType || 'wedding',
// //               eventTypeOpen: false,
// //               timeSlotOpen: false
// //             };
// //           }
// //           setSelectedDates(newDates);
// //           setDateConfigurations(newConfigs);
// //         }}
// //         markedDates={selectedDates}
// //         theme={{
// //           calendarBackground: '#FFF',
// //           textSectionTitleColor: '#b48a64',
// //           selectedDayBackgroundColor: '#b48a64',
// //           selectedDayTextColor: '#FFF',
// //           todayTextColor: '#b48a64',
// //           dayTextColor: '#2D3748',
// //           textDisabledColor: '#CBD5E0',
// //           dotColor: '#b48a64',
// //           selectedDotColor: '#FFF',
// //           arrowColor: '#b48a64',
// //           monthTextColor: '#2D3748',
// //           textDayFontSize: 14,
// //           textMonthFontSize: 16,
// //           textDayHeaderFontSize: 14,
// //         }}
// //         style={styles.calendar}
// //       />
// //     </View>
// //   );

// //   const renderVenueInfo = () => {
// //     if (!venue) return null;

// //     const truncateDescription = (description) => {
// //       if (!description) return 'Lawn';
// //       const cateringIndex = description.toLowerCase().indexOf('catering');
// //       if (cateringIndex !== -1) {
// //         return description.substring(0, cateringIndex + 8).trim();
// //       }
// //       return description.length > 50 ? description.substring(0, 50) + '...' : description;
// //     };

// //     const getAdditionalInfo = (description) => {
// //       if (!description) return '';
// //       const cateringIndex = description.toLowerCase().indexOf('catering');
// //       if (cateringIndex !== -1) {
// //         const additionalPart = description.substring(cateringIndex + 8).trim();
// //         return additionalPart.startsWith(',') || additionalPart.startsWith('.')
// //           ? additionalPart.substring(1).trim()
// //           : additionalPart;
// //       }
// //       return '';
// //     };

// //     const mainTitle = truncateDescription(venue.description);
// //     const additionalInfo = getAdditionalInfo(venue.description);

// //     return (
// //       <View style={styles.summaryCard}>
// //         <View style={styles.summaryHeader}>
// //           <Text style={styles.summaryHeaderTitle}>Lawn Summary</Text>
// //         </View>

// //         <View style={styles.summaryContent}>
// //           <Text style={styles.summaryMainTitle}>{mainTitle}</Text>

// //           {additionalInfo ? (
// //             <Text style={styles.summaryAdditionalInfo}>{additionalInfo}</Text>
// //           ) : null}

// //           <View style={styles.summaryStatsRow}>
// //             <View style={styles.summaryStatItem}>
// //               <Text style={styles.summaryStatLabel}>Capacity</Text>
// //               <Text style={styles.summaryStatValue}>
// //                 {venue.minGuests || 0} - {venue.maxGuests || 0} Guests
// //               </Text>
// //             </View>
// //           </View>

// //           <View style={styles.summaryDivider} />

// //           <View style={styles.summaryPricingRow}>
// //             <View style={styles.summaryPriceItem}>
// //               <Text style={styles.summaryPriceLabel}>Member Charges</Text>
// //               <Text style={styles.summaryPriceValueMember}>
// //                 Rs. {venue.memberCharges?.toLocaleString() || '0'}
// //               </Text>
// //             </View>
// //             <View style={styles.summaryPriceItem}>
// //               <Text style={styles.summaryPriceLabel}>Guest Charges</Text>
// //               <Text style={styles.summaryPriceValueGuest}>
// //                 Rs. {venue.guestCharges?.toLocaleString() || '0'}
// //               </Text>
// //             </View>
// //           </View>
// //         </View>
// //       </View>
// //     );
// //   };

// //   return (
// //     <>
// //       <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
// //       <SafeAreaView style={styles.container}>
// //         <ImageBackground
// //           source={require('../../assets/notch.jpg')}
// //           style={styles.notch}
// //           imageStyle={styles.notchImage}
// //         >
// //           <View style={styles.notchContent}>
// //             <TouchableOpacity
// //               style={styles.backButton}
// //               onPress={() => navigation.goBack()}
// //             >
// //               <MaterialIcons name="arrow-back" size={28} color="#000" />
// //             </TouchableOpacity>
// //             <Text style={styles.headerText}>
// //               {isAdmin ? 'Admin Booking' : 'Book Lawn'}
// //             </Text>
// //             <View style={styles.placeholder} />
// //           </View>
// //         </ImageBackground>

// //         <KeyboardAvoidingView
// //           style={styles.keyboardAvoid}
// //           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// //           keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
// //         >
// //           <ScrollView
// //             ref={scrollViewRef}
// //             style={styles.scrollView}
// //             contentContainerStyle={styles.scrollContent}
// //             showsVerticalScrollIndicator={false}
// //             keyboardShouldPersistTaps="handled"
// //             nestedScrollEnabled={true}
// //           >
// //             {renderMemberBookingForm()}
// //             <View style={styles.footerSpacer} />
// //           </ScrollView>
// //         </KeyboardAvoidingView>

// //         {/* ==============================
// //             BOOKING CONFIRMATION MODAL (Member/Guest)
// //         ============================== */}
// //         <Modal
// //           visible={showBookingModal}
// //           animationType="slide"
// //           transparent={true}
// //           onRequestClose={() => setShowBookingModal(false)}
// //         >
// //           <View style={styles.modalOverlay}>
// //             <View style={styles.modalContainer}>
// //               <View style={styles.modalHeader}>
// //                 <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
// //                 <TouchableOpacity onPress={() => setShowBookingModal(false)}>
// //                   <Icon name="close" size={24} color="#666" />
// //                 </TouchableOpacity>
// //               </View>

// //               <ScrollView style={styles.modalContent} nestedScrollEnabled={true}>
// //                 <View style={styles.bookingSummary}>
// //                   <Text style={styles.summaryTitle}>Booking Details</Text>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Booking Type:</Text>
// //                     <Text style={styles.summaryValue}>
// //                       {isGuest ? 'Guest Booking' : 'Member Booking'}
// //                     </Text>
// //                   </View>

// //                   {isGuest && (
// //                     <>
// //                       <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Guest Name:</Text>
// //                         <Text style={styles.summaryValue}>{guestName}</Text>
// //                       </View>
// //                       <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Contact:</Text>
// //                         <Text style={styles.summaryValue}>{guestContact}</Text>
// //                       </View>
// //                     </>
// //                   )}

// //                   {!isGuest && (
// //                     <>
// //                       <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Member Name:</Text>
// //                         <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
// //                       </View>
// //                       <View style={styles.summaryRow}>
// //                         <Text style={styles.summaryLabel}>Membership No:</Text>
// //                         <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
// //                       </View>
// //                     </>
// //                   )}

// //                   <View style={styles.summaryDivider} />
// //                   <Text style={[styles.summaryLabel, { marginBottom: 10, width: '100%' }]}>Selected Dates & Config:</Text>
// //                   {Object.keys(dateConfigurations).sort().map(date => (
// //                     <View key={date} style={styles.summaryConfigBox}>
// //                       <Text style={styles.summaryConfigDate}>{formatDateForDisplay(date)}</Text>
// //                       <Text style={styles.summaryConfigDetail}>
// //                         {timeSlotOptions.find(opt => opt.value === dateConfigurations[date].timeSlot)?.label} | {eventTypeOptions.find(opt => opt.value === dateConfigurations[date].eventType)?.label}
// //                       </Text>
// //                     </View>
// //                   ))}

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Guests:</Text>
// //                     <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Total Amount:</Text>
// //                     <Text style={[styles.summaryValue, { fontWeight: 'bold', color: '#b48a64' }]}>
// //                       {calculateTotalAmount()}
// //                     </Text>
// //                   </View>

// //                   {specialRequests && (
// //                     <View style={styles.summaryRow}>
// //                       <Text style={styles.summaryLabel}>Special Requests:</Text>
// //                       <Text style={styles.summaryValue}>{specialRequests}</Text>
// //                     </View>
// //                   )}
// //                 </View>

// //                 <View style={styles.infoBox}>
// //                   <MaterialIcons name="info" size={16} color="#2E7D32" />
// //                   <Text style={styles.infoText}>
// //                     {isGuest
// //                       ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
// //                       : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
// //                   </Text>
// //                 </View>
// //               </ScrollView>

// //               <View style={styles.modalFooter}>
// //                 <TouchableOpacity
// //                   style={styles.cancelButton}
// //                   onPress={() => setShowBookingModal(false)}
// //                 >
// //                   <Text style={styles.cancelButtonText}>Cancel</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity
// //                   style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
// //                   onPress={handleGenerateInvoice}
// //                   disabled={bookingLoading}
// //                 >
// //                   {bookingLoading ? (
// //                     <ActivityIndicator size="small" color="#FFF" />
// //                   ) : (
// //                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// //                   )}
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         </Modal>

// //         {/* Admin modals removed */}
// //       </SafeAreaView>
// //     </>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#FEF9F3',
// //   },
// //   keyboardAvoid: {
// //     flex: 1,
// //   },
// //   notch: {
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //     paddingHorizontal: 20,
// //     borderBottomEndRadius: 30,
// //     borderBottomStartRadius: 30,
// //     overflow: 'hidden',
// //     minHeight: 120,
// //   },
// //   notchImage: {
// //     resizeMode: 'cover',
// //   },
// //   notchContent: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   headerText: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: '#000',
// //     textAlign: 'center',
// //     flex: 1,
// //   },
// //   placeholder: {
// //     width: 40,
// //   },
// //   scrollView: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     paddingVertical: 15,
// //   },

// //   // Summary Card
// //   summaryCard: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 12,
// //     marginBottom: 15,
// //     borderRadius: 12,
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //     elevation: 6,
// //   },
// //   summaryHeader: {
// //     backgroundColor: '#b48a64',
// //     paddingHorizontal: 16,
// //     paddingVertical: 14,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   summaryHeaderTitle: {
// //     fontSize: 16,
// //     fontWeight: '500',
// //     color: '#000000ff',
// //     letterSpacing: 0.5,
// //   },
// //   summaryContent: {
// //     padding: 16,
// //   },
// //   summaryMainTitle: {
// //     fontSize: 15,
// //     fontWeight: 'bold',
// //     color: '#1a1a2e',
// //     marginBottom: 6,
// //     lineHeight: 20,
// //   },
// //   summaryAdditionalInfo: {
// //     fontSize: 13,
// //     fontWeight: '400',
// //     color: '#666',
// //     marginBottom: 16,
// //     lineHeight: 18,
// //   },
// //   summaryStatsRow: {
// //     flexDirection: 'row',
// //     marginBottom: 16,
// //   },
// //   summaryStatItem: {
// //     flex: 1,
// //   },
// //   summaryStatLabel: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 4,
// //   },
// //   summaryStatValue: {
// //     fontSize: 13,
// //     fontWeight: '400',
// //     color: '#555',
// //   },
// //   summaryDivider: {
// //     height: 1,
// //     backgroundColor: '#E0E0E0',
// //     marginBottom: 16,
// //   },
// //   summaryPricingRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //   },
// //   summaryPriceItem: {
// //     flex: 1,
// //   },
// //   summaryPriceLabel: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 4,
// //   },
// //   summaryPriceValueMember: {
// //     fontSize: 14,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //   },
// //   summaryPriceValueGuest: {
// //     fontSize: 14,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //   },

// //   // Toggle Container
// //   toggleContainer: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 15,
// //     borderRadius: 12,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   toggleLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   toggleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },
// //   toggleOption: {
// //     fontSize: 16,
// //     color: '#A0AEC0',
// //     fontWeight: '500',
// //   },
// //   toggleActive: {
// //     color: '#b48a64',
// //     fontWeight: 'bold',
// //   },

// //   // Guest Container
// //   guestContainer: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 12,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },

// //   // Section Cards
// //   sectionCard: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   sectionHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#2D3748',
// //     marginLeft: 10,
// //   },
// //   sectionLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 10,
// //   },

// //   // Calendar
// //   calendarWrapper: {
// //     height: 350,
// //     overflow: 'hidden',
// //   },
// //   calendar: {
// //     borderRadius: 12,
// //     overflow: 'hidden',
// //     height: '100%',
// //   },
// //   selectedDateContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 15,
// //     padding: 12,
// //     backgroundColor: '#fdf8f4',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#e3d5c5',
// //   },
// //   selectedDateText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#2D3748',
// //     marginLeft: 8,
// //   },

// //   // Admin Date Section
// //   dateSection: {
// //     marginBottom: 20,
// //   },
// //   dateInputs: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 10,
// //   },
// //   dateInput: {
// //     flex: 1,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 15,
// //     backgroundColor: '#F7FAFC',
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //     marginHorizontal: 5,
// //   },
// //   dateInputText: {
// //     fontSize: 14,
// //     color: '#2D3748',
// //     marginLeft: 10,
// //   },

// //   // Inputs
// //   input: {
// //     flex: 1,
// //     height: 50,
// //     fontSize: 16,
// //     color: '#2D3748',
// //     paddingHorizontal: 15,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //     backgroundColor: '#F7FAFC',
// //     marginBottom: 10,
// //     marginTop: 10,
// //   },
// //   inputGroup: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F7FAFC',
// //     borderRadius: 12,
// //     paddingHorizontal: 15,
// //     marginBottom: 15,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   inputIcon: {
// //     marginRight: 12,
// //   },
// //   textArea: {
// //     height: 80,
// //     paddingVertical: 12,
// //   },

// //   // Dropdown
// //   dropdownSection: {
// //     marginBottom: 20,
// //   },
// //   dropdown: {
// //     backgroundColor: '#F7FAFC',
// //     borderColor: '#E2E8F0',
// //     borderWidth: 1,
// //     borderRadius: 12,
// //   },
// //   dropdownContainer: {
// //     backgroundColor: '#F7FAFC',
// //     borderColor: '#E2E8F0',
// //     borderRadius: 12,
// //     zIndex: 9999,
// //   },

// //   // Admin Action Buttons
// //   adminActionButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 20,
// //   },
// //   adminButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     marginHorizontal: 5,
// //   },
// //   reserveButton: {
// //     backgroundColor: '#28a745',
// //   },
// //   unreserveButton: {
// //     backgroundColor: '#dc3545',
// //   },
// //   adminButtonText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },

// //   // Button Disabled State
// //   buttonDisabled: {
// //     backgroundColor: '#CBD5E0',
// //     opacity: 0.6,
// //   },

// //   // Total Amount
// //   totalCard: {
// //     backgroundColor: '#b48a64',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 16,
// //     alignItems: 'center',
// //   },
// //   totalLabel: {
// //     fontSize: 16,
// //     color: '#ffffffff',
// //     marginBottom: 8,
// //   },
// //   totalAmount: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#ffffffff',
// //     marginBottom: 8,
// //   },
// //   totalNote: {
// //     fontSize: 12,
// //     color: '#ffffffff',
// //     fontStyle: 'italic',
// //   },

// //   // Price Summary (similar to room booking)
// //   priceSummary: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //     padding: 15,
// //     backgroundColor: '#f8f9fa',
// //     borderRadius: 12,
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   priceSummaryLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //   },
// //   priceSummarySubtitle: {
// //     fontSize: 12,
// //     color: '#666',
// //     marginTop: 4,
// //   },
// //   priceSummaryValueContainer: {
// //     alignItems: 'flex-end',
// //   },
// //   priceSummaryValue: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //   },
// //   priceSummaryBreakdown: {
// //     fontSize: 12,
// //     color: '#666',
// //     marginTop: 4,
// //     textAlign: 'right',
// //   },

// //   // Submit Button
// //   submitButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#b48a64',
// //     marginHorizontal: 15,
// //     paddingVertical: 18,
// //     borderRadius: 12,
// //     shadowColor: '#b48a64',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 6,
// //   },
// //   submitButtonDisabled: {
// //     backgroundColor: '#b489645f',
// //     shadowColor: 'transparent',
// //   },
// //   submitButtonText: {
// //     color: '#ffffffff',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginRight: 8,
// //   },

// //   // Footer Spacer
// //   footerSpacer: {
// //     height: 30,
// //   },

// //   // Modal Styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContainer: {
// //     backgroundColor: '#FFF',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: '80%',
// //     padding: 20,
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   modalContent: {
// //     flex: 1,
// //     maxHeight: 400,
// //   },

// //   // Reservation Details (Admin)
// //   reservationDetails: {
// //     backgroundColor: '#F8F9FA',
// //     padding: 15,
// //     borderRadius: 8,
// //     marginBottom: 20,
// //   },
// //   detailLabel: {
// //     fontSize: 14,
// //     color: '#333',
// //     marginBottom: 8,
// //   },

// //   // Booking Summary
// //   bookingSummary: {
// //     backgroundColor: '#F8F9FA',
// //     padding: 15,
// //     borderRadius: 8,
// //     marginBottom: 20,
// //   },
// //   summaryTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 15,
// //     textAlign: 'center',
// //   },
// //   summaryRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //     paddingVertical: 5,
// //   },
// //   summaryLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //     fontWeight: '600',
// //   },
// //   summaryValue: {
// //     fontSize: 14,
// //     color: '#333',
// //     fontWeight: '500',
// //     textAlign: 'right',
// //     flex: 1,
// //     marginLeft: 10,
// //   },

// //   // Info Box
// //   infoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     backgroundColor: '#FFF8E1',
// //     padding: 12,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#b48a64',
// //   },
// //   infoText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#8D6E63',
// //     marginLeft: 8,
// //     lineHeight: 16,
// //   },

// //   // Warning Box
// //   warningBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FFE6E6',
// //     padding: 12,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#DC3545',
// //     marginTop: 10,
// //   },
// //   warningText: {
// //     fontSize: 12,
// //     color: '#DC3545',
// //     marginLeft: 8,
// //     flex: 1,
// //   },

// //   // Modal Footer
// //   modalFooter: {
// //     flexDirection: 'row',
// //     gap: 10,
// //     marginTop: 20,
// //   },
// //   modalButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //   },
// //   modalCancelButton: {
// //     backgroundColor: '#6c757d',
// //   },
// //   modalConfirmButton: {
// //     backgroundColor: '#28a745',
// //   },
// //   modalUnreserveButton: {
// //     backgroundColor: '#dc3545',
// //   },
// //   cancelButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     backgroundColor: '#6c757d',
// //     alignItems: 'center',
// //   },
// //   confirmButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     backgroundColor: '#b48a64',
// //     alignItems: 'center',
// //   },
// //   cancelButtonText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   confirmButtonText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   modalCancelText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   modalConfirmText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },

// //   // Calendar Modal
// //   calendarModalContainer: {
// //     backgroundColor: '#FFF',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     padding: 20,
// //     maxHeight: '80%',
// //   },
// //   calendarModalTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   closeCalendarButton: {
// //     marginTop: 20,
// //     padding: 15,
// //     backgroundColor: '#b48a64',
// //     borderRadius: 8,
// //     alignItems: 'center',
// //   },
// //   closeCalendarText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   dateConfigCard: {
// //     backgroundColor: '#FDFCFB',
// //     borderRadius: 12,
// //     padding: 15,
// //     marginBottom: 20,
// //     borderWidth: 1,
// //     borderColor: '#F0E6D8',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 2,
// //     elevation: 2,
// //   },
// //   dateConfigTitle: {
// //     fontSize: 15,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //     marginBottom: 10,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#F0E6D8',
// //     paddingBottom: 5,
// //   },
// //   noDateText: {
// //     fontSize: 14,
// //     color: '#8B7355',
// //     textAlign: 'center',
// //     paddingVertical: 20,
// //     fontStyle: 'italic',
// //   },
// //   selectedDatesBadgeContainer: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     marginTop: 15,
// //     gap: 8,
// //   },
// //   dateBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FFF8E1',
// //     paddingHorizontal: 10,
// //     paddingVertical: 6,
// //     borderRadius: 15,
// //     borderWidth: 1,
// //     borderColor: '#b48a64',
// //   },
// //   dateBadgeText: {
// //     fontSize: 12,
// //     color: '#b48a64',
// //     fontWeight: '600',
// //   },
// //   summaryConfigBox: {
// //     backgroundColor: '#F7FAFC',
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 8,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   summaryConfigDate: {
// //     fontSize: 13,
// //     fontWeight: 'bold',
// //     color: '#2D3748',
// //   },
// //   summaryConfigDetail: {
// //     fontSize: 12,
// //     color: '#666',
// //     marginTop: 2,
// //   },
// // });

// // export default LawnBooking;

// import React, { useState, useEffect, useRef } from 'react';
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
//   Platform,
//   Switch,
//   KeyboardAvoidingView,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { getUserData, lawnAPI, getAuthToken } from '../../config/apis';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { useVoucher } from '../auth/contexts/VoucherContext';

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

// const LawnBooking = ({ route, navigation }) => {
//   const { setVoucher } = useVoucher();
//   const { venue } = route.params || {};
//   const { user, isAuthenticated } = useAuth();

//   // Refs for dropdown z-index management
//   const scrollViewRef = useRef(null);

//   // ==============================
//   // COMMON STATE VARIABLES
//   // ==============================
//   const [loading, setLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // No longer used: Admin reservation states removed

//   // ==============================
//   // MEMBER/GUEST BOOKING STATES
//   // ==============================
//   const [selectedDates, setSelectedDates] = useState({});
//   const [dateConfigurations, setDateConfigurations] = useState({});
//   const [eventTypeOpen, setEventTypeOpen] = useState(false);
//   const [selectedEventType, setSelectedEventType] = useState(null);
//   const [numberOfGuests, setNumberOfGuests] = useState('');
//   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
//   const [specialRequests, setSpecialRequests] = useState('');
//   const [isGuest, setIsGuest] = useState(true);
//   const [guestName, setGuestName] = useState('');
//   const [guestContact, setGuestContact] = useState('');
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   // Extract membership number from user object
//   const extractMembershipNo = () => {
//     const targets = [user, userData];
//     const possibleFields = [
//       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
//       'membershipID', 'memberNo', 'memberNumber', 'membershipId',
//       'id', 'userId', 'user_id', 'userID'
//     ];

//     for (const target of targets) {
//       if (!target) continue;

//       for (const field of possibleFields) {
//         if (target[field]) {
//           return target[field].toString();
//         }
//       }

//       if (target.data && typeof target.data === 'object') {
//         for (const field of possibleFields) {
//           if (target.data[field]) {
//             return target.data[field].toString();
//           }
//         }
//       }
//     }

//     return null;
//   };

//   const membershipNo = extractMembershipNo();
//   const userName = user?.name || user?.username || user?.fullName || userData?.name || userData?.username || userData?.fullName;

//   useEffect(() => {
//     console.log('🎯 LawnBooking mounted with params:', {
//       venue: venue,
//       venueId: venue?.id,
//       venueDescription: venue?.description
//     });

//     checkUserStatus();

//     // Don't pre-fill number of guests, let the user enter it

//     // setSelectedDates({}); // Initial state is empty
//   }, [venue]);

//   const checkUserStatus = async () => {
//     try {
//       const fetchedUserData = await getUserData();
//       setUserData(fetchedUserData);

//       const currentUser = user || fetchedUserData;

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
//       console.log('👤 User status:', {
//         isAdmin: isAdminUser,
//         role: extractedUserRole,
//         userName: userName
//       });

//     } catch (error) {
//       console.error('Error checking user status:', error);
//       setIsAdmin(false);
//     }
//   };



//   // ==============================
//   // MEMBER/GUEST BOOKING FUNCTIONS
//   // ==============================
//   const handleGenerateInvoice = async () => {
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

//     // Guest validation
//     if (isGuest) {
//       if (!guestName.trim()) {
//         Alert.alert('Error', 'Please enter guest name');
//         return;
//       }
//       if (!guestContact.trim() || guestContact.length < 10) {
//         Alert.alert('Error', 'Please enter a valid phone number');
//         return;
//       }
//     }

//     // Member validation
//     if (!isGuest && !isAuthenticated) {
//       Alert.alert(
//         'Authentication Required',
//         'Please login to book a lawn.',
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

//     // Check guest count against lawn capacity
//     if (venue) {
//       const guests = parseInt(numberOfGuests);
//       if (venue.minGuests && guests < venue.minGuests) {
//         Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
//         return;
//       }
//       if (venue.maxGuests && guests > venue.maxGuests) {
//         Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
//         return;
//       }
//     }

//     setBookingLoading(true);

//     try {
//       const startDate = sortedDates[0];
//       const endDate = sortedDates[sortedDates.length - 1];
//       const numberOfDays = sortedDates.length;

//       // Prepare booking data
//       const basePrice = isGuest ? venue.guestCharges : venue.memberCharges;
//       const totalPriceValue = basePrice * numberOfDays;

//       // Construct bookingDetails array from dateConfigurations
//       const bookingDetails = sortedDates.map(date => ({
//         date: date,
//         timeSlot: dateConfigurations[date].timeSlot,
//         eventType: dateConfigurations[date].eventType
//       }));

//       // Use first date's config as global fallbacks (for older backend logic if still used)
//       const firstConfig = dateConfigurations[startDate];

//       // Generate the invoice
//       const invoicePayload = {
//         bookingDate: startDate,
//         endDate: endDate,
//         bookingDetails: bookingDetails,
//         eventTime: firstConfig.timeSlot,
//         eventType: firstConfig.eventType,
//         numberOfGuests: parseInt(numberOfGuests),
//         specialRequest: specialRequests || '',
//         pricingType: isGuest ? 'guest' : 'member',
//         membership_no: !isGuest ? membershipNo : null,
//         guestName: isGuest ? guestName : null,
//         guestContact: isGuest ? guestContact : null,
//         totalPrice: totalPriceValue
//       };

//       console.log('🧾 Generating invoice with:', invoicePayload);

//       const response = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

//       console.log('✅ Invoice response:', response);

//       if (response.status === 200 || response.status === 201) {
//         const responseData = response.data;
//         // Create the booking payload for the confirmation flow
//         const bookingPayload = {
//           consumerInfo: {
//             membership_no: !isGuest ? membershipNo : 'GUEST',
//           },
//           bookingData: {
//             lawnId: venue.id.toString(),
//             bookingDate: startDate,
//             endDate: endDate,
//             bookingDetails: bookingDetails,
//             eventTime: firstConfig.timeSlot,
//             eventType: firstConfig.eventType,
//             numberOfGuests: parseInt(numberOfGuests),
//             specialRequest: specialRequests || '',
//             pricingType: isGuest ? 'guest' : 'member',
//             totalPrice: totalPriceValue.toString(),
//             paidBy: isGuest ? 'GUEST' : 'MEMBER',
//             guestName: isGuest ? guestName : '',
//             guestContact: isGuest ? guestContact : '',
//           }
//         };

//         console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

//         try {
//           // Create booking with direct fetch
//           const token = await getAuthToken();
//           const bookingResponse = await fetch(`${base_url}/booking/member/booking/lawn`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify(bookingPayload),
//           });

//           let bookingData;
//           if (bookingResponse.ok) {
//             bookingData = await bookingResponse.json();
//             console.log('✅ Booking created successfully:', bookingData);
//           } else {
//             console.warn('⚠️ Booking creation failed, but invoice was generated');
//             bookingData = {
//               success: false,
//               message: 'Booking creation failed, but invoice was generated',
//             };
//           }

//           // Navigate to voucher with invoice data
//           const invoiceNumber = responseData.Data?.InvoiceNumber ||
//             responseData.InvoiceNumber ||
//             `INV-LAWN-${Date.now()}`;

//           // Prepare navigation params
//           const navigationParams = {
//             invoiceData: responseData.Data || responseData,
//             invoiceNumber: invoiceNumber,
//             bookingType: 'LAWN',
//             venue: venue,
//             bookingDetails: {
//               ...invoicePayload,
//               lawnName: venue.description,
//               totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
//               bookingSummary: responseData.Data?.BookingSummary,
//               bookingId: bookingData?.booking?.id || bookingData?.bookingId,
//               invoiceNumber: invoiceNumber,
//               selectedDates: sortedDates,
//               dateConfigurations: dateConfigurations
//             },
//             bookingId: bookingData?.booking?.id || bookingData?.bookingId,
//             isGuest: isGuest,
//             memberDetails: !isGuest ? {
//               memberName: userName,
//               membershipNo: membershipNo
//             } : null,
//             guestDetails: isGuest ? {
//               guestName,
//               guestContact
//             } : null,
//             bookingSuccess: bookingResponse.ok,
//             bookingError: !bookingResponse.ok ? 'Booking creation failed, but invoice was generated' : null,
//             module: 'LAWN'
//           };

//           // Set global voucher for floating timer
//           setVoucher(responseData.Data || responseData, navigationParams);

//           navigation.navigate('Voucher', navigationParams);

//         } catch (bookingError) {
//           console.error('❌ Booking creation error:', bookingError);
//           // Still navigate to voucher even if booking fails
//           const invoiceNumber = responseData.Data?.InvoiceNumber ||
//             responseData.InvoiceNumber ||
//             `INV-LAWN-${Date.now()}`;

//           navigation.navigate('Voucher', {
//             invoiceData: responseData.Data || responseData,
//             invoiceNumber: invoiceNumber,
//             bookingType: 'LAWN',
//             venue: venue,
//             bookingDetails: {
//               ...invoicePayload,
//               lawnName: venue.description,
//               totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
//               bookingSummary: responseData.Data?.BookingSummary,
//               invoiceNumber: invoiceNumber,
//               selectedDates: sortedDates,
//               dateConfigurations: dateConfigurations
//             },
//             isGuest: isGuest,
//             memberDetails: !isGuest ? {
//               memberName: userName,
//               membershipNo: membershipNo
//             } : null,
//             guestDetails: isGuest ? {
//               guestName,
//               guestContact
//             } : null,
//             bookingSuccess: false,
//             bookingError: bookingError.message
//           });
//         }
//       } else {
//         throw new Error(response.data?.ResponseMessage || 'Failed to generate invoice');
//       }

//     } catch (error) {
//       setBookingLoading(false);
//       setShowBookingModal(false);

//       console.error('❌ Error in handleGenerateInvoice:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });

//       let errorMessage = 'Failed to process booking. Please try again.';

//       if (error.response?.status === 400) {
//         const serverMsg = error.response.data?.message;
//         errorMessage = serverMsg || 'Invalid booking data provided.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Booking endpoint not found. Please check backend configuration.';
//       } else if (error.response?.status === 500) {
//         const serverError = error.response.data;
//         if (serverError && typeof serverError === 'object') {
//           errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
//         }
//       }

//       Alert.alert('Booking Failed', errorMessage);
//     } finally {
//       setBookingLoading(false);
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

//   const calculateTotalAmount = () => {
//     if (!venue) return 'Rs. 0/-';
//     const price = isGuest ? venue.guestCharges : venue.memberCharges;
//     const daysCount = Object.keys(dateConfigurations).length;
//     return `Rs. ${(price * daysCount).toLocaleString() || '0'}/-`;
//   };

//   // renderAdminReservationForm removed

//   // ==============================
//   // MEMBER/GUEST BOOKING FORM
//   // ==============================
//   const renderMemberBookingForm = () => {
//     return (
//       <>
//         {/* Venue Summary Card */}
//         {renderVenueInfo()}

//         {/* Booking Type Toggle */}
//         <View style={styles.toggleContainer}>
//           <Text style={styles.toggleLabel}>Booking Type:</Text>
//           <View style={styles.toggleRow}>
//             <Text style={[styles.toggleOption, !isGuest && styles.toggleActive]}>
//               Member
//             </Text>
//             <Switch
//               value={isGuest}
//               onValueChange={setIsGuest}
//               trackColor={{ false: '#b48a64', true: '#b48a64' }}
//               thumbColor={isGuest ? '#fff' : '#fff'}
//             />
//             <Text style={[styles.toggleOption, isGuest && styles.toggleActive]}>
//               Guest
//             </Text>
//           </View>
//         </View>

//         {/* Guest Details (Conditional) */}
//         {isGuest && (
//           <View style={styles.guestContainer}>
//             <Text style={styles.sectionTitle}>Guest Details</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Guest Name *"
//               value={guestName}
//               onChangeText={setGuestName}
//               placeholderTextColor="#999"
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Guest Contact Number *"
//               value={guestContact}
//               onChangeText={setGuestContact}
//               keyboardType="phone-pad"
//               placeholderTextColor="#999"
//               maxLength={15}
//             />
//           </View>
//         )}

//         {/* Calendar Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Select Date</Text>
//           </View>
//           {Object.keys(selectedDates).length > 0 && (
//             <View style={styles.selectedDatesBadgeContainer}>
//               {Object.keys(selectedDates).sort().map(date => (
//                 <View key={date} style={styles.dateBadge}>
//                   <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
//                   <TouchableOpacity
//                     onPress={() => {
//                       const newDates = { ...selectedDates };
//                       const newConfigs = { ...dateConfigurations };
//                       delete newDates[date];
//                       delete newConfigs[date];
//                       setSelectedDates(newDates);
//                       setDateConfigurations(newConfigs);
//                     }}
//                     style={{ marginLeft: 5 }}
//                   >
//                     <Icon name="close" size={14} color="#b48a64" />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           )}
//           {renderCalendar()}
//         </View>

//         {/* Event Details */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event-available" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Event Details</Text>
//           </View>

//           {Object.keys(dateConfigurations).length > 0 ? (
//             Object.keys(dateConfigurations).sort().map((date) => (
//               <View key={date} style={[styles.dateConfigCard, { zIndex: dateConfigurations[date].eventTypeOpen || dateConfigurations[date].timeSlotOpen ? 1000 : 1 }]}>
//                 <Text style={styles.dateConfigTitle}>{formatDateForDisplay(date)}</Text>

//                 <View style={styles.dropdownSection}>
//                   <Text style={styles.sectionLabel}>Event Type</Text>
//                   <DropDownPicker
//                     open={dateConfigurations[date].eventTypeOpen}
//                     value={dateConfigurations[date].eventType}
//                     items={eventTypeOptions}
//                     setOpen={(open) => {
//                       const newConfigs = { ...dateConfigurations };
//                       // Close others on this date
//                       newConfigs[date].timeSlotOpen = false;
//                       newConfigs[date].eventTypeOpen = open;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     onSelectItem={(item) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].eventType = item.value;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     placeholder="Select Event Type"
//                     style={styles.dropdown}
//                     dropDownContainerStyle={styles.dropdownContainer}
//                     listMode="SCROLLVIEW"
//                     scrollViewProps={{ nestedScrollEnabled: true }}
//                     zIndex={4000}
//                     zIndexInverse={1000}
//                   />
//                 </View>

//                 <View style={styles.dropdownSection}>
//                   <Text style={styles.sectionLabel}>Time Slot</Text>
//                   <DropDownPicker
//                     open={dateConfigurations[date].timeSlotOpen}
//                     value={dateConfigurations[date].timeSlot}
//                     items={timeSlotOptions}
//                     setOpen={(open) => {
//                       const newConfigs = { ...dateConfigurations };
//                       // Close others on this date
//                       newConfigs[date].eventTypeOpen = false;
//                       newConfigs[date].timeSlotOpen = open;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     onSelectItem={(item) => {
//                       const newConfigs = { ...dateConfigurations };
//                       newConfigs[date].timeSlot = item.value;
//                       setDateConfigurations(newConfigs);
//                     }}
//                     placeholder="Select Time Slot"
//                     style={styles.dropdown}
//                     dropDownContainerStyle={styles.dropdownContainer}
//                     listMode="SCROLLVIEW"
//                     scrollViewProps={{ nestedScrollEnabled: true }}
//                     zIndex={3000}
//                     zIndexInverse={2000}
//                   />
//                 </View>
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDateText}>Please select a date from the calendar above</Text>
//           )}
//           <View style={styles.inputGroup}>
//             <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setNumberOfGuests}
//               value={numberOfGuests}
//               placeholder="Number of Guests"
//               placeholderTextColor="#A0AEC0"
//               keyboardType="numeric"
//               returnKeyType="done"
//             />
//           </View>
//           <View style={styles.guestInfoNote}>
//             <MaterialIcons name="info-outline" size={16} color="#b48a64" />
//             <Text style={styles.guestInfoText}>
//               (Maximum no. of guests is {venue?.maxGuests || 'N/A'})
//             </Text>
//           </View>
//         </View>

//         {/* Special Requests */}
//         {/* <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="edit" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Special Requests</Text>
//           </View>
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
//               returnKeyType="done"
//             />
//           </View>
//         </View> */}

//         {/* Price Summary */}
//         <View style={styles.priceSummary}>
//           <View>
//             <Text style={styles.priceSummaryLabel}>Total Amount:</Text>
//             <Text style={styles.priceSummarySubtitle}>
//               {isGuest ? 'Guest Charges' : 'Member Charges'}
//             </Text>
//           </View>
//           <View style={styles.priceSummaryValueContainer}>
//             <Text style={styles.priceSummaryValue}>
//               {calculateTotalAmount()}
//             </Text>
//             <Text style={styles.priceSummaryBreakdown}>
//               {Object.keys(dateConfigurations).length} date(s) × Rs. {(isGuest ? (venue?.guestCharges || 0) : (venue?.memberCharges || 0)).toLocaleString()}
//             </Text>
//           </View>
//         </View>

//         {/* Book Now Button */}
//         <TouchableOpacity
//           style={[
//             styles.submitButton,
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

//   const renderCalendar = () => (
//     <View style={styles.calendarWrapper}>
//       <Calendar
//         current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
//         minDate={new Date().toISOString().split('T')[0]}
//         onDayPress={(day) => {
//           const date = day.dateString;
//           const newDates = { ...selectedDates };
//           const newConfigs = { ...dateConfigurations };

//           if (newDates[date]) {
//             delete newDates[date];
//             delete newConfigs[date];
//           } else {
//             newDates[date] = {
//               selected: true,
//               selectedColor: '#b48a64',
//               selectedTextColor: '#FFF',
//             };
//             // Initialize config for the new date
//             newConfigs[date] = {
//               timeSlot: selectedTimeSlot || 'NIGHT',
//               eventType: selectedEventType || 'wedding',
//               eventTypeOpen: false,
//               timeSlotOpen: false
//             };
//           }
//           setSelectedDates(newDates);
//           setDateConfigurations(newConfigs);
//         }}
//         markedDates={selectedDates}
//         theme={{
//           calendarBackground: '#FFF',
//           textSectionTitleColor: '#b48a64',
//           selectedDayBackgroundColor: '#b48a64',
//           selectedDayTextColor: '#FFF',
//           todayTextColor: '#b48a64',
//           dayTextColor: '#2D3748',
//           textDisabledColor: '#CBD5E0',
//           dotColor: '#b48a64',
//           selectedDotColor: '#FFF',
//           arrowColor: '#b48a64',
//           monthTextColor: '#2D3748',
//           textDayFontSize: 14,
//           textMonthFontSize: 16,
//           textDayHeaderFontSize: 14,
//         }}
//         style={styles.calendar}
//       />
//     </View>
//   );

//   const renderVenueInfo = () => {
//     if (!venue) return null;

//     const truncateDescription = (description) => {
//       if (!description) return 'Lawn';
//       const cateringIndex = description.toLowerCase().indexOf('catering');
//       if (cateringIndex !== -1) {
//         return description.substring(0, cateringIndex + 8).trim();
//       }
//       return description.length > 50 ? description.substring(0, 50) + '...' : description;
//     };

//     const getAdditionalInfo = (description) => {
//       if (!description) return '';
//       const cateringIndex = description.toLowerCase().indexOf('catering');
//       if (cateringIndex !== -1) {
//         const additionalPart = description.substring(cateringIndex + 8).trim();
//         return additionalPart.startsWith(',') || additionalPart.startsWith('.')
//           ? additionalPart.substring(1).trim()
//           : additionalPart;
//       }
//       return '';
//     };

//     const mainTitle = truncateDescription(venue.description);
//     const additionalInfo = getAdditionalInfo(venue.description);

//     return (
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryHeader}>
//           <Text style={styles.summaryHeaderTitle}>Lawn Summary</Text>
//         </View>

//         <View style={styles.summaryContent}>
//           <Text style={styles.summaryMainTitle}>{mainTitle}</Text>

//           {additionalInfo ? (
//             <Text style={styles.summaryAdditionalInfo}>{additionalInfo}</Text>
//           ) : null}

//           <View style={styles.summaryStatsRow}>
//             <View style={styles.summaryStatItem}>
//               <Text style={styles.summaryStatLabel}>Capacity</Text>
//               <Text style={styles.summaryStatValue}>
//                 {venue.minGuests || 0} - {venue.maxGuests || 0} Guests
//               </Text>
//             </View>
//           </View>

//           <View style={styles.summaryDivider} />

//           <View style={styles.summaryPricingRow}>
//             <View style={styles.summaryPriceItem}>
//               <Text style={styles.summaryPriceLabel}>Member Charges</Text>
//               <Text style={styles.summaryPriceValueMember}>
//                 Rs. {venue.memberCharges?.toLocaleString() || '0'}
//               </Text>
//             </View>
//             <View style={styles.summaryPriceItem}>
//               <Text style={styles.summaryPriceLabel}>Guest Charges</Text>
//               <Text style={styles.summaryPriceValueGuest}>
//                 Rs. {venue.guestCharges?.toLocaleString() || '0'}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
//       <SafeAreaView style={styles.container}>
//         <ImageBackground
//           source={require('../../assets/notch.jpg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchContent}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <MaterialIcons name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>
//               {isAdmin ? 'Admin Booking' : 'Book Lawn'}
//             </Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <KeyboardAvoidingView
//           style={styles.keyboardAvoid}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         >
//           <ScrollView
//             ref={scrollViewRef}
//             style={styles.scrollView}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             nestedScrollEnabled={true}
//           >
//             {renderMemberBookingForm()}
//             <View style={styles.footerSpacer} />
//           </ScrollView>
//         </KeyboardAvoidingView>

//         {/* ==============================
//             BOOKING CONFIRMATION MODAL (Member/Guest)
//         ============================== */}
//         <Modal
//           visible={showBookingModal}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setShowBookingModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
//                 <TouchableOpacity onPress={() => setShowBookingModal(false)}>
//                   <Icon name="close" size={24} color="#666" />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView style={styles.modalContent} nestedScrollEnabled={true}>
//                 <View style={styles.bookingSummary}>
//                   <Text style={styles.summaryTitle}>Booking Details</Text>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Booking Type:</Text>
//                     <Text style={styles.summaryValue}>
//                       {isGuest ? 'Guest Booking' : 'Member Booking'}
//                     </Text>
//                   </View>

//                   {isGuest && (
//                     <>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Guest Name:</Text>
//                         <Text style={styles.summaryValue}>{guestName}</Text>
//                       </View>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Contact:</Text>
//                         <Text style={styles.summaryValue}>{guestContact}</Text>
//                       </View>
//                     </>
//                   )}

//                   {!isGuest && (
//                     <>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Member Name:</Text>
//                         <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
//                       </View>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Membership No:</Text>
//                         <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
//                       </View>
//                     </>
//                   )}

//                   <View style={styles.summaryDivider} />
//                   <Text style={[styles.summaryLabel, { marginBottom: 10, width: '100%' }]}>Selected Dates & Config:</Text>
//                   {Object.keys(dateConfigurations).sort().map(date => (
//                     <View key={date} style={styles.summaryConfigBox}>
//                       <Text style={styles.summaryConfigDate}>{formatDateForDisplay(date)}</Text>
//                       <Text style={styles.summaryConfigDetail}>
//                         {timeSlotOptions.find(opt => opt.value === dateConfigurations[date].timeSlot)?.label} | {eventTypeOptions.find(opt => opt.value === dateConfigurations[date].eventType)?.label}
//                       </Text>
//                     </View>
//                   ))}

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Guests:</Text>
//                     <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Total Amount:</Text>
//                     <Text style={[styles.summaryValue, { fontWeight: 'bold', color: '#b48a64' }]}>
//                       {calculateTotalAmount()}
//                     </Text>
//                   </View>

//                   {specialRequests && (
//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Special Requests:</Text>
//                       <Text style={styles.summaryValue}>{specialRequests}</Text>
//                     </View>
//                   )}
//                 </View>

//                 <View style={styles.infoBox}>
//                   <MaterialIcons name="info" size={16} color="#2E7D32" />
//                   <Text style={styles.infoText}>
//                     {isGuest
//                       ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
//                       : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
//                   </Text>
//                 </View>
//               </ScrollView>

//               <View style={styles.modalFooter}>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => setShowBookingModal(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
//                   onPress={handleGenerateInvoice}
//                   disabled={bookingLoading}
//                 >
//                   {bookingLoading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Admin modals removed */}
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF9F3',
//   },
//   keyboardAvoid: {
//     flex: 1,
//   },
//   notch: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomEndRadius: 30,
//     borderBottomStartRadius: 30,
//     overflow: 'hidden',
//     minHeight: 120,
//   },
//   notchImage: {
//     resizeMode: 'cover',
//   },
//   notchContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
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

//   // Summary Card
//   summaryCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 12,
//     marginBottom: 15,
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   summaryHeader: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   summaryHeaderTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000000ff',
//     letterSpacing: 0.5,
//   },
//   summaryContent: {
//     padding: 16,
//   },
//   summaryMainTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#1a1a2e',
//     marginBottom: 6,
//     lineHeight: 20,
//   },
//   summaryAdditionalInfo: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: '#666',
//     marginBottom: 16,
//     lineHeight: 18,
//   },
//   summaryStatsRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   summaryStatItem: {
//     flex: 1,
//   },
//   summaryStatLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   summaryStatValue: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: '#555',
//   },
//   summaryDivider: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginBottom: 16,
//   },
//   summaryPricingRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   summaryPriceItem: {
//     flex: 1,
//   },
//   summaryPriceLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   summaryPriceValueMember: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   summaryPriceValueGuest: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },

//   // Toggle Container
//   toggleContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   toggleLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   toggleOption: {
//     fontSize: 16,
//     color: '#A0AEC0',
//     fontWeight: '500',
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
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
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

//   // Calendar
//   calendarWrapper: {
//     height: 350,
//     overflow: 'hidden',
//   },
//   calendar: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     height: '100%',
//   },
//   selectedDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#fdf8f4',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e3d5c5',
//   },
//   selectedDateText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2D3748',
//     marginLeft: 8,
//   },

//   // Admin Date Section
//   dateSection: {
//     marginBottom: 20,
//   },
//   dateInputs: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   dateInput: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#F7FAFC',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     marginHorizontal: 5,
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: '#2D3748',
//     marginLeft: 10,
//   },

//   // Inputs
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#2D3748',
//     paddingHorizontal: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F7FAFC',
//     marginBottom: 10,
//     marginTop: 10,
//   },
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
//     zIndex: 9999,
//   },

//   // Admin Action Buttons
//   adminActionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   adminButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   reserveButton: {
//     backgroundColor: '#28a745',
//   },
//   unreserveButton: {
//     backgroundColor: '#dc3545',
//   },
//   adminButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // Button Disabled State
//   buttonDisabled: {
//     backgroundColor: '#CBD5E0',
//     opacity: 0.6,
//   },

//   // Total Amount
//   totalCard: {
//     backgroundColor: '#b48a64',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
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
//     color: '#ffffffff',
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
//   priceSummaryBreakdown: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
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
//   submitButtonDisabled: {
//     backgroundColor: '#b489645f',
//     shadowColor: 'transparent',
//   },
//   submitButtonText: {
//     color: '#ffffffff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 8,
//   },

//   // Footer Spacer
//   footerSpacer: {
//     height: 30,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalContent: {
//     flex: 1,
//     maxHeight: 400,
//   },

//   // Reservation Details (Admin)
//   reservationDetails: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 8,
//   },

//   // Booking Summary
//   bookingSummary: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingVertical: 5,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//     textAlign: 'right',
//     flex: 1,
//     marginLeft: 10,
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
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#DC3545',
//     marginLeft: 8,
//     flex: 1,
//   },

//   // Modal Footer
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 20,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalCancelButton: {
//     backgroundColor: '#6c757d',
//   },
//   modalConfirmButton: {
//     backgroundColor: '#28a745',
//   },
//   modalUnreserveButton: {
//     backgroundColor: '#dc3545',
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: '#6c757d',
//     alignItems: 'center',
//   },
//   confirmButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: '#b48a64',
//     alignItems: 'center',
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
//   modalCancelText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   modalConfirmText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // Calendar Modal
//   calendarModalContainer: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   calendarModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeCalendarButton: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#b48a64',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeCalendarText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
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
//     color: '#b48a64',
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E6D8',
//     paddingBottom: 5,
//   },
//   noDateText: {
//     fontSize: 14,
//     color: '#8B7355',
//     textAlign: 'center',
//     paddingVertical: 20,
//     fontStyle: 'italic',
//   },
//   selectedDatesBadgeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 15,
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
//     color: '#b48a64',
//     fontWeight: '600',
//   },
//   summaryConfigBox: {
//     backgroundColor: '#F7FAFC',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
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
//   guestInfoNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     paddingHorizontal: 5,
//   },
//   guestInfoText: {
//     fontSize: 12,
//     color: '#8B7355',
//     marginLeft: 5,
//     fontStyle: 'italic',
//   },
// });

// export default LawnBooking;
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

  ActivityIndicator,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUserData, lawnAPI, getAuthToken } from '../../config/apis';
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

const LawnBooking = ({ route, navigation }) => {
  const { setVoucher } = useVoucher();
  const { venue } = route.params || {};
  const { user, isAuthenticated } = useAuth();

  // Refs for dropdown z-index management
  const scrollViewRef = useRef(null);

  // ==============================
  // COMMON STATE VARIABLES
  // ==============================
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // No longer used: Admin reservation states removed

  // ==============================
  // MEMBER/GUEST BOOKING STATES
  // ==============================
  const [selectedDates, setSelectedDates] = useState({});
  const [dateConfigurations, setDateConfigurations] = useState({});
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);

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

  // Extract membership number from user object
  const extractMembershipNo = () => {
    const targets = [user, userData];
    const possibleFields = [
      'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
      'membershipID', 'memberNo', 'memberNumber', 'membershipId',
      'id', 'userId', 'user_id', 'userID'
    ];

    for (const target of targets) {
      if (!target) continue;

      for (const field of possibleFields) {
        if (target[field]) {
          return target[field].toString();
        }
      }

      if (target.data && typeof target.data === 'object') {
        for (const field of possibleFields) {
          if (target.data[field]) {
            return target.data[field].toString();
          }
        }
      }
    }

    return null;
  };

  const membershipNo = extractMembershipNo();
  const userName = user?.name || user?.username || user?.fullName || userData?.name || userData?.username || userData?.fullName;

  useEffect(() => {
    console.log('🎯 LawnBooking mounted with params:', {
      venue: venue,
      venueId: venue?.id,
      venueDescription: venue?.description
    });

    checkUserStatus();

    // Don't pre-fill number of guests, let the user enter it

    // setSelectedDates({}); // Initial state is empty
  }, [venue]);

  const checkUserStatus = async () => {
    try {
      const fetchedUserData = await getUserData();
      setUserData(fetchedUserData);

      const currentUser = user || fetchedUserData;

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
      console.log('👤 User status:', {
        isAdmin: isAdminUser,
        role: extractedUserRole,
        userName: userName
      });

    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
    }
  };



  // ==============================
  // MEMBER/GUEST BOOKING FUNCTIONS
  // ==============================
  const handleGenerateInvoice = async () => {
    // Terms & Conditions validation
    if (!termsAgreed) {
      setShowTermsError(true);
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
        'Please login to book a lawn.',
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

    // Check guest count against lawn capacity
    if (venue) {
      const guests = parseInt(numberOfGuests);
      if (venue.minGuests && guests < venue.minGuests) {
        Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
        return;
      }
      if (venue.maxGuests && guests > venue.maxGuests) {
        Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
        return;
      }
    }

    setBookingLoading(true);

    try {
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      const numberOfDays = sortedDates.length;

      // Prepare booking data
      const basePrice = isGuest ? venue.guestCharges : venue.memberCharges;
      const totalPriceValue = basePrice * numberOfDays;

      // Construct bookingDetails array from dateConfigurations
      const bookingDetails = sortedDates.map(date => ({
        date: date,
        timeSlot: dateConfigurations[date].timeSlot,
        eventType: dateConfigurations[date].eventType
      }));

      // Use first date's config as global fallbacks (for older backend logic if still used)
      const firstConfig = dateConfigurations[startDate];

      // Generate the invoice
      const invoicePayload = {
        bookingDate: startDate,
        endDate: endDate,
        bookingDetails: bookingDetails,
        eventTime: firstConfig.timeSlot,
        eventType: firstConfig.eventType,
        numberOfGuests: parseInt(numberOfGuests),
        specialRequest: specialRequests || '',
        pricingType: isGuest ? 'guest' : 'member',
        membership_no: !isGuest ? membershipNo : null,
        guestName: isGuest ? guestName : null,
        guestContact: isGuest ? guestContact : null,
        totalPrice: totalPriceValue
      };

      console.log('🧾 Generating invoice with:', invoicePayload);

      const response = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

      console.log('✅ Invoice response:', response);

      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        // Create the booking payload for the confirmation flow
        const bookingPayload = {
          consumerInfo: {
            membership_no: !isGuest ? membershipNo : 'GUEST',
          },
          bookingData: {
            lawnId: venue.id.toString(),
            bookingDate: startDate,
            endDate: endDate,
            bookingDetails: bookingDetails,
            eventTime: firstConfig.timeSlot,
            eventType: firstConfig.eventType,
            numberOfGuests: parseInt(numberOfGuests),
            specialRequest: specialRequests || '',
            pricingType: isGuest ? 'guest' : 'member',
            totalPrice: totalPriceValue.toString(),
            paidBy: isGuest ? 'GUEST' : 'MEMBER',
            guestName: isGuest ? guestName : '',
            guestContact: isGuest ? guestContact : '',
          }
        };

        console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

        try {
          // Create booking with direct fetch
          const token = await getAuthToken();
          const bookingResponse = await fetch(`${base_url}/booking/member/booking/lawn`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bookingPayload),
          });

          let bookingData;
          if (bookingResponse.ok) {
            bookingData = await bookingResponse.json();
            console.log('✅ Booking created successfully:', bookingData);
          } else {
            console.warn('⚠️ Booking creation failed, but invoice was generated');
            bookingData = {
              success: false,
              message: 'Booking creation failed, but invoice was generated',
            };
          }

          // Navigate to voucher with invoice data
          const invoiceNumber = responseData.Data?.InvoiceNumber ||
            responseData.InvoiceNumber ||
            `INV-LAWN-${Date.now()}`;

          // Prepare navigation params
          const navigationParams = {
            invoiceData: responseData.Data || responseData,
            invoiceNumber: invoiceNumber,
            bookingType: 'LAWN',
            venue: venue,
            bookingDetails: {
              ...invoicePayload,
              lawnName: venue.description,
              totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
              bookingSummary: responseData.Data?.BookingSummary,
              bookingId: bookingData?.booking?.id || bookingData?.bookingId,
              invoiceNumber: invoiceNumber,
              selectedDates: sortedDates,
              dateConfigurations: dateConfigurations
            },
            bookingId: bookingData?.booking?.id || bookingData?.bookingId,
            isGuest: isGuest,
            memberDetails: !isGuest ? {
              memberName: userName,
              membershipNo: membershipNo
            } : null,
            guestDetails: isGuest ? {
              guestName,
              guestContact
            } : null,
            bookingSuccess: bookingResponse.ok,
            bookingError: !bookingResponse.ok ? 'Booking creation failed, but invoice was generated' : null,
            module: 'LAWN'
          };

          // Set global voucher for floating timer
          setVoucher(responseData.Data || responseData, navigationParams);

          navigation.navigate('Voucher', navigationParams);

        } catch (bookingError) {
          console.error('❌ Booking creation error:', bookingError);
          // Still navigate to voucher even if booking fails
          const invoiceNumber = responseData.Data?.InvoiceNumber ||
            responseData.InvoiceNumber ||
            `INV-LAWN-${Date.now()}`;

          navigation.navigate('Voucher', {
            invoiceData: responseData.Data || responseData,
            invoiceNumber: invoiceNumber,
            bookingType: 'LAWN',
            venue: venue,
            bookingDetails: {
              ...invoicePayload,
              lawnName: venue.description,
              totalAmount: responseData.Data?.Amount || responseData.Amount || totalPriceValue,
              bookingSummary: responseData.Data?.BookingSummary,
              invoiceNumber: invoiceNumber,
              selectedDates: sortedDates,
              dateConfigurations: dateConfigurations
            },
            isGuest: isGuest,
            memberDetails: !isGuest ? {
              memberName: userName,
              membershipNo: membershipNo
            } : null,
            guestDetails: isGuest ? {
              guestName,
              guestContact
            } : null,
            bookingSuccess: false,
            bookingError: bookingError.message
          });
        }
      } else {
        throw new Error(response.data?.ResponseMessage || 'Failed to generate invoice');
      }

    } catch (error) {
      setBookingLoading(false);


      console.error('❌ Error in handleGenerateInvoice:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Failed to process booking. Please try again.';

      if (error.response?.status === 400) {
        const serverMsg = error.response.data?.message;
        errorMessage = serverMsg || 'Invalid booking data provided.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Booking endpoint not found. Please check backend configuration.';
      } else if (error.response?.status === 500) {
        const serverError = error.response.data;
        if (serverError && typeof serverError === 'object') {
          errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
        }
      }

      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setBookingLoading(false);
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

  const calculateTotalAmount = () => {
    if (!venue) return 'Rs. 0/-';
    const price = isGuest ? venue.guestCharges : venue.memberCharges;
    const daysCount = Object.keys(dateConfigurations).length;
    return `Rs. ${(price * daysCount).toLocaleString() || '0'}/-`;
  };

  // renderAdminReservationForm removed

  // ==============================
  // MEMBER/GUEST BOOKING FORM
  // ==============================
  const renderMemberBookingForm = () => {
    return (
      <>
        {/* Venue Summary Card */}
        {renderVenueInfo()}

        {/* Booking Type Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Booking Type:</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleOption, !isGuest && styles.toggleActive]}>
              Member
            </Text>
            <Switch
              value={isGuest}
              onValueChange={setIsGuest}
              trackColor={{ false: '#b48a64', true: '#b48a64' }}
              thumbColor={isGuest ? '#fff' : '#fff'}
            />
            <Text style={[styles.toggleOption, isGuest && styles.toggleActive]}>
              Guest
            </Text>
          </View>
        </View>

        {/* Guest Details (Conditional) */}
        {isGuest && (
          <View style={styles.guestContainer}>
            <Text style={styles.sectionTitle}>Guest Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Guest Name *"
              value={guestName}
              onChangeText={handleGuestNameChange}
              placeholderTextColor="#999"
              maxLength={50}
            />
            <TextInput
              style={styles.input}
              placeholder="Guest Contact Number *"
              value={guestContact}
              onChangeText={handleGuestContactChange}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              maxLength={12}
            />
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          {Object.keys(selectedDates).length > 0 && (
            <View style={styles.selectedDatesBadgeContainer}>
              {Object.keys(selectedDates).sort().map(date => (
                <View key={date} style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newDates = { ...selectedDates };
                      const newConfigs = { ...dateConfigurations };
                      delete newDates[date];
                      delete newConfigs[date];
                      setSelectedDates(newDates);
                      setDateConfigurations(newConfigs);
                    }}
                    style={{ marginLeft: 5 }}
                  >
                    <Icon name="close" size={14} color="#b48a64" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {renderCalendar()}
        </View>

        {/* Event Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event-available" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Event Details</Text>
          </View>

          {Object.keys(dateConfigurations).length > 0 ? (
            Object.keys(dateConfigurations).sort().map((date) => (
              <View key={date} style={[styles.dateConfigCard, { zIndex: dateConfigurations[date].eventTypeOpen || dateConfigurations[date].timeSlotOpen ? 1000 : 1 }]}>
                <Text style={styles.dateConfigTitle}>{formatDateForDisplay(date)}</Text>

                <View style={styles.dropdownSection}>
                  <Text style={styles.sectionLabel}>Event Type</Text>
                  <DropDownPicker
                    open={dateConfigurations[date].eventTypeOpen}
                    value={dateConfigurations[date].eventType}
                    items={eventTypeOptions}
                    setOpen={(open) => {
                      const newConfigs = { ...dateConfigurations };
                      // Close others on this date
                      newConfigs[date].timeSlotOpen = false;
                      newConfigs[date].eventTypeOpen = open;
                      setDateConfigurations(newConfigs);
                    }}
                    onSelectItem={(item) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].eventType = item.value;
                      setDateConfigurations(newConfigs);
                    }}
                    placeholder="Select Event Type"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{ nestedScrollEnabled: true }}
                    zIndex={4000}
                    zIndexInverse={1000}
                  />
                </View>

                <View style={styles.dropdownSection}>
                  <Text style={styles.sectionLabel}>Time Slot</Text>
                  <DropDownPicker
                    open={dateConfigurations[date].timeSlotOpen}
                    value={dateConfigurations[date].timeSlot}
                    items={timeSlotOptions}
                    setOpen={(open) => {
                      const newConfigs = { ...dateConfigurations };
                      // Close others on this date
                      newConfigs[date].eventTypeOpen = false;
                      newConfigs[date].timeSlotOpen = open;
                      setDateConfigurations(newConfigs);
                    }}
                    onSelectItem={(item) => {
                      const newConfigs = { ...dateConfigurations };
                      newConfigs[date].timeSlot = item.value;
                      setDateConfigurations(newConfigs);
                    }}
                    placeholder="Select Time Slot"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{ nestedScrollEnabled: true }}
                    zIndex={3000}
                    zIndexInverse={2000}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDateText}>Please select a date from the calendar above</Text>
          )}
          <View style={styles.inputGroup}>
            <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setNumberOfGuests}
              value={numberOfGuests}
              placeholder="Number of Guests"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
          <View style={styles.guestInfoNote}>
            <MaterialIcons name="info-outline" size={16} color="#b48a64" />
            <Text style={styles.guestInfoText}>
              (Maximum no. of guests is {venue?.maxGuests || 'N/A'})
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        {/* <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="edit" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Special Requests</Text>
          </View>
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
              returnKeyType="done"
            />
          </View>
        </View> */}

        {/* Price Summary */}
        <View style={styles.priceSummary}>
          <View>
            <Text style={styles.priceSummaryLabel}>Total Amount:</Text>
            <Text style={styles.priceSummarySubtitle}>
              {isGuest ? 'Guest Charges' : 'Member Charges'}
            </Text>
          </View>
          <View style={styles.priceSummaryValueContainer}>
            <Text style={styles.priceSummaryValue}>
              {calculateTotalAmount()}
            </Text>
            <Text style={styles.priceSummaryBreakdown}>
              {Object.keys(dateConfigurations).length} date(s) × Rs. {(isGuest ? (venue?.guestCharges || 0) : (venue?.memberCharges || 0)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <TermsAndConditions
          bookingType="LAWN"
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
            (Object.keys(dateConfigurations).length === 0 || !numberOfGuests) &&
            styles.submitButtonDisabled,
            (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
            (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
          ]}
          onPress={handleGenerateInvoice}
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

  const renderCalendar = () => (
    <View style={styles.calendarWrapper}>
      <Calendar
        current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
        minDate={new Date().toISOString().split('T')[0]}
        onDayPress={(day) => {
          const date = day.dateString;
          const newDates = { ...selectedDates };
          const newConfigs = { ...dateConfigurations };

          if (newDates[date]) {
            delete newDates[date];
            delete newConfigs[date];
          } else {
            newDates[date] = {
              selected: true,
              selectedColor: '#b48a64',
              selectedTextColor: '#FFF',
            };
            // Initialize config for the new date
            newConfigs[date] = {
              timeSlot: selectedTimeSlot || 'NIGHT',
              eventType: selectedEventType || 'wedding',
              eventTypeOpen: false,
              timeSlotOpen: false
            };
          }
          setSelectedDates(newDates);
          setDateConfigurations(newConfigs);
        }}
        markedDates={selectedDates}
        theme={{
          calendarBackground: '#FFF',
          textSectionTitleColor: '#b48a64',
          selectedDayBackgroundColor: '#b48a64',
          selectedDayTextColor: '#FFF',
          todayTextColor: '#b48a64',
          dayTextColor: '#2D3748',
          textDisabledColor: '#CBD5E0',
          dotColor: '#b48a64',
          selectedDotColor: '#FFF',
          arrowColor: '#b48a64',
          monthTextColor: '#2D3748',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
    </View>
  );

  const renderVenueInfo = () => {
    if (!venue) return null;

    const truncateDescription = (description) => {
      if (!description) return 'Lawn';
      const cateringIndex = description.toLowerCase().indexOf('catering');
      if (cateringIndex !== -1) {
        return description.substring(0, cateringIndex + 8).trim();
      }
      return description.length > 50 ? description.substring(0, 50) + '...' : description;
    };

    const getAdditionalInfo = (description) => {
      if (!description) return '';
      const cateringIndex = description.toLowerCase().indexOf('catering');
      if (cateringIndex !== -1) {
        const additionalPart = description.substring(cateringIndex + 8).trim();
        return additionalPart.startsWith(',') || additionalPart.startsWith('.')
          ? additionalPart.substring(1).trim()
          : additionalPart;
      }
      return '';
    };

    const mainTitle = truncateDescription(venue.description);
    const additionalInfo = getAdditionalInfo(venue.description);

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderTitle}>Lawn Summary</Text>
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryMainTitle}>{mainTitle}</Text>

          {additionalInfo ? (
            <Text style={styles.summaryAdditionalInfo}>{additionalInfo}</Text>
          ) : null}

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Capacity</Text>
              <Text style={styles.summaryStatValue}>
                {venue.minGuests || 0} - {venue.maxGuests || 0} Guests
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryPricingRow}>
            <View style={styles.summaryPriceItem}>
              <Text style={styles.summaryPriceLabel}>Member Charges</Text>
              <Text style={styles.summaryPriceValueMember}>
                Rs. {venue.memberCharges?.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.summaryPriceItem}>
              <Text style={styles.summaryPriceLabel}>Guest Charges</Text>
              <Text style={styles.summaryPriceValueGuest}>
                Rs. {venue.guestCharges?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {isAdmin ? 'Admin Booking' : 'Book Lawn'}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {renderMemberBookingForm()}
            <View style={styles.footerSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>



        {/* Admin modals removed */}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  keyboardAvoid: {
    flex: 1,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
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

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryHeader: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000ff',
    letterSpacing: 0.5,
  },
  summaryContent: {
    padding: 16,
  },
  summaryMainTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    lineHeight: 20,
  },
  summaryAdditionalInfo: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryStatItem: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 13,
    fontWeight: '400',
    color: '#555',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  summaryPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryPriceItem: {
    flex: 1,
  },
  summaryPriceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryPriceValueMember: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  summaryPriceValueGuest: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b48a64',
  },

  // Toggle Container
  toggleContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleOption: {
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '500',
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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

  // Calendar
  calendarWrapper: {
    height: 350,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    height: '100%',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fdf8f4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3d5c5',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },

  // Admin Date Section
  dateSection: {
    marginBottom: 20,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 5,
  },
  dateInputText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 10,
  },

  // Inputs
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    marginBottom: 10,
    marginTop: 10,
  },
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
    zIndex: 9999,
  },

  // Admin Action Buttons
  adminActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  adminButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  reserveButton: {
    backgroundColor: '#28a745',
  },
  unreserveButton: {
    backgroundColor: '#dc3545',
  },
  adminButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Button Disabled State
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    opacity: 0.6,
  },

  // Total Amount
  totalCard: {
    backgroundColor: '#b48a64',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
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
    color: '#ffffffff',
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
  priceSummaryBreakdown: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  submitButtonDisabled: {
    backgroundColor: '#b489645f',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#ffffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // Footer Spacer
  footerSpacer: {
    height: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContent: {
    flex: 1,
    maxHeight: 400,
  },

  // Reservation Details (Admin)
  reservationDetails: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
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
  },
  warningText: {
    fontSize: 12,
    color: '#DC3545',
    marginLeft: 8,
    flex: 1,
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalConfirmButton: {
    backgroundColor: '#28a745',
  },
  modalUnreserveButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#b48a64',
    alignItems: 'center',
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
  modalCancelText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Calendar Modal
  calendarModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeCalendarButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#b48a64',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeCalendarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#b48a64',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
    paddingBottom: 5,
  },
  noDateText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  selectedDatesBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
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
    color: '#b48a64',
    fontWeight: '600',
  },
  summaryConfigBox: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  guestInfoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  guestInfoText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 5,
    fontStyle: 'italic',
  },
});

export default LawnBooking;