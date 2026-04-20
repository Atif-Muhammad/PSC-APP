// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   ImageBackground,
//   Image,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { paymentAPI, photoshootAPI, makeApiCall, getUserData, checkAuthStatus, getPhotoshootRule } from '../config/apis';
// import { useVoucher } from '../src/auth/contexts/VoucherContext';
// import HtmlRenderer from '../src/events/HtmlRenderer';

// const shootsBooking = ({ route, navigation }) => {
//   const { setVoucher } = useVoucher();
//   const { photoshoot } = route.params || {};

//   // State variables
//   const [selectedDates, setSelectedDates] = useState({});
//   const [dateConfigurations, setDateConfigurations] = useState({});
//   const [isGuest, setIsGuest] = useState(true); // Guest selected by default
//   const [guestName, setGuestName] = useState('');
//   const [guestContact, setGuestContact] = useState('');
//   const [specialRequest, setSpecialRequest] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [timeSlots, setTimeSlots] = useState([]);

//   // Time Picker states
//   const [showPicker, setShowPicker] = useState(false);
//   const [pickerDate, setPickerDate] = useState(new Date());
//   const [currentDateForTime, setCurrentDateForTime] = useState(null);

//   // Member info state
//   const [memberInfo, setMemberInfo] = useState(null);
//   const [authError, setAuthError] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [rules, setRules] = useState([]);
//   const [loadingRules, setLoadingRules] = useState(true);

//   useEffect(() => {
//     console.log('🎬 shootsBooking mounted with photoshoot:', photoshoot);

//     // Always initialize time slots immediately
//     generateTimeSlots();

//     // Initialize with today's date
//     const today = new Date().toISOString().split('T')[0];
//     const initialDates = {
//       [today]: {
//         selected: true,
//         selectedColor: '#B8860B',
//         selectedTextColor: 'white',
//       }
//     };
//     setSelectedDates(initialDates);
//     setDateConfigurations({
//       [today]: {
//         time: new Date(), // Default time is now
//       }
//     });

//     // Then check authentication
//     checkAuthentication();

//     // Listen for focus to refresh data
//     const unsubscribe = navigation.addListener('focus', () => {
//       console.log('🔄 Screen focused, refreshing...');
//       checkAuthentication();
//     });

//     fetchRules();

//     return unsubscribe;
//   }, [navigation]);

//   const fetchRules = async () => {
//     try {
//       setLoadingRules(true);
//       const fetchedRules = await getPhotoshootRule();
//       console.log('✅ Fetched photoshoot rules:', fetchedRules);
//       setRules(fetchedRules);
//     } catch (error) {
//       console.error('Error fetching photoshoot rules:', error);
//     } finally {
//       setLoadingRules(false);
//     }
//   };

//   const checkAuthentication = async () => {
//     try {
//       console.log('🔐 Checking authentication...');
//       setLoading(true);
//       setAuthError(null);

//       // Use the checkAuthStatus function from your config
//       const authStatus = await checkAuthStatus();
//       console.log('📊 Auth status:', authStatus);

//       if (authStatus.isAuthenticated && authStatus.userData) {
//         setIsAuthenticated(true);

//         // Extract member information from userData
//         const userData = authStatus.userData;
//         console.log('👤 User data from storage:', userData);

//         // Map userData to memberInfo structure
//         const memberData = {
//           membership_no: userData.membership_no ||
//             userData.Membership_No ||
//             userData.membershipNumber ||
//             userData.memberId ||
//             '',
//           member_name: userData.member_name ||
//             userData.Name ||
//             userData.name ||
//             userData.fullName ||
//             '',
//           Sno: userData.Sno || userData.id || userData.userId,
//           email: userData.email || '',
//           phone: userData.phone || userData.Phone || '',
//           status: userData.status || 'active',
//         };

//         console.log('✅ Extracted member data:', memberData);

//         if (!memberData.membership_no) {
//           console.warn('⚠️ No membership number found in user data');
//           setAuthError('Membership information incomplete. Please login again.');
//           setIsAuthenticated(false);
//           setMemberInfo(null);
//         } else {
//           setMemberInfo(memberData);
//         }
//       } else {
//         console.warn('⚠️ User not authenticated');
//         setIsAuthenticated(false);
//         setMemberInfo(null);
//         setAuthError('Please login to book a photoshoot.');
//       }
//     } catch (error) {
//       console.error('❌ Error checking authentication:', error);
//       setIsAuthenticated(false);
//       setMemberInfo(null);
//       setAuthError('Authentication error. Please login again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateTimeSlots = () => {
//     const slots = [];
//     // Generate slots from 9 AM to 6 PM in 2-hour intervals
//     for (let hour = 9; hour <= 16; hour += 2) {
//       const startTime = `${hour.toString().padStart(2, '0')}:00`;
//       const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
//       slots.push({
//         id: hour,
//         startTime,
//         endTime,
//         label: `${startTime} - ${endTime}`,
//         available: true,
//       });
//     }
//     console.log('🕒 Generated time slots:', slots);
//     setTimeSlots(slots);
//   };

//   const handleDateSelect = (day) => {
//     const date = day.dateString;
//     console.log('📅 Date toggled:', date);

//     const newDates = { ...selectedDates };
//     const newConfigs = { ...dateConfigurations };

//     if (newDates[date]) {
//       // Deselect
//       delete newDates[date];
//       delete newConfigs[date];
//     } else {
//       // Select
//       newDates[date] = {
//         selected: true,
//         selectedColor: '#B8860B',
//         selectedTextColor: 'white',
//       };
//       newConfigs[date] = {
//         time: new Date(),
//       };
//     }

//     setSelectedDates(newDates);
//     setDateConfigurations(newConfigs);
//   };

//   const onTimeChange = (event, selectedTime) => {
//     setShowPicker(false);
//     if (selectedTime && currentDateForTime) {
//       const newConfigs = { ...dateConfigurations };
//       newConfigs[currentDateForTime] = {
//         ...newConfigs[currentDateForTime],
//         time: selectedTime,
//       };
//       setDateConfigurations(newConfigs);
//     }
//     setCurrentDateForTime(null);
//   };

//   const handlePickTime = (date) => {
//     setCurrentDateForTime(date);
//     setPickerDate(dateConfigurations[date]?.time || new Date());
//     setShowPicker(true);
//   };

//   /* handleTimeSlotSelect removed in favor of handlePickTime */

//   const calculateTotalAmount = () => {
//     const photoshootPrice = isGuest ? (photoshoot?.guestCharges || 0) : (photoshoot?.memberCharges || 0);
//     const count = Object.keys(dateConfigurations).length;
//     return count * photoshootPrice;
//   };

//   const handleGenerateInvoice = async () => {
//     // Check authentication
//     if (!isAuthenticated || !memberInfo || !memberInfo.membership_no) {
//       Alert.alert(
//         'Authentication Required',
//         'Please login to book a photoshoot.',
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

//     // Validation
//     if (!photoshoot || !photoshoot.id) {
//       Alert.alert('Error', 'Photoshoot information is missing');
//       return;
//     }

//     const sortedDates = Object.keys(dateConfigurations).sort();
//     if (sortedDates.length === 0) {
//       Alert.alert('Error', 'Please select at least one date');
//       return;
//     }

//     // Check if each date has a time
//     const incompleteDates = sortedDates.filter(date => !dateConfigurations[date].time);
//     if (incompleteDates.length > 0) {
//       Alert.alert('Error', `Please select a time for all dates: ${incompleteDates.map(d => formatDateForDisplay(d)).join(', ')}`);
//       return;
//     }

//     if (isGuest && (!guestName || !guestContact)) {
//       Alert.alert('Error', 'Please enter guest name and contact');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Construct bookingDetails array from dateConfigurations
//       const bookingDetails = sortedDates.map(date => {
//         const time = dateConfigurations[date].time || new Date();
//         const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:00`;
//         return {
//           date: date,
//           timeSlot: `${date}T${timeStr}`
//         };
//       });

//       const totalPriceValue = calculateTotalAmount();

//       const startDate = sortedDates[0];
//       const firstTime = dateConfigurations[startDate].time || new Date();
//       const firstTimeStr = `${firstTime.getHours().toString().padStart(2, '0')}:${firstTime.getMinutes().toString().padStart(2, '0')}:00`;

//       const bookingData = {
//         membership_no: memberInfo.membership_no,
//         bookingDate: startDate,
//         timeSlot: `${startDate}T${firstTimeStr}:00`,
//         bookingDetails: JSON.stringify(bookingDetails),
//         pricingType: isGuest ? 'guest' : 'member',
//         specialRequest: specialRequest || '',
//         guestName: isGuest ? guestName : null,
//         guestContact: isGuest ? guestContact : null,
//         member_name: memberInfo.member_name || '',
//         totalPrice: totalPriceValue
//       };

//       console.log('🧾 Generating invoice with data:', {
//         photoshootId: photoshoot.id,
//         bookingData,
//       });

//       // Generate invoice using the API
//       const result = await makeApiCall(
//         photoshootAPI.generateInvoicePhotoshoot,
//         photoshoot.id,
//         bookingData
//       );

//       setLoading(false);

//       if (result.success) {
//         console.log('✅ Invoice generated successfully:', result.data);

//         // Prepare navigation params
//         const navigationParams = {
//           invoiceData: result.data.Data || result.data,
//           bookingData: {
//             ...bookingData,
//             photoshootId: photoshoot.id,
//             totalPrice: totalPriceValue,
//             photoshootDescription: photoshoot.description,
//             selectedDates: sortedDates,
//             dateConfigurations: dateConfigurations
//           },
//           photoshoot: photoshoot,
//           memberInfo: memberInfo,
//           module: 'SHOOT'
//         };

//         // Set global voucher for persistent timer
//         setVoucher(result.data.Data || result.data, navigationParams);

//         // Navigate to invoice screen
//         navigation.navigate('InvoiceScreen', navigationParams);
//       } else {
//         Alert.alert('Invoice Generation Failed', result.message || 'Failed to generate invoice');
//       }
//     } catch (error) {
//       setLoading(false);
//       console.error('❌ Invoice generation error:', error);
//       Alert.alert('Error', error.message || 'Failed to generate invoice. Please try again.');
//     }
//   };

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const formatTimeForDisplay = (time) => {
//     if (!time) return '';

//     let hours, minutes;
//     if (time instanceof Date) {
//       hours = time.getHours();
//       minutes = time.getMinutes();
//     } else if (typeof time === 'string') {
//       [hours, minutes] = time.split(':').map(Number);
//     } else {
//       return '';
//     }

//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     const hour12 = hours % 12 || 12;
//     const minutesStr = minutes.toString().padStart(2, '0');
//     return `${hour12}:${minutesStr} ${ampm}`;
//   };

//   const debugStorage = async () => {
//     try {
//       const keys = await AsyncStorage.getAllKeys();
//       console.log('🔑 All AsyncStorage keys:', keys);

//       for (const key of keys) {
//         const value = await AsyncStorage.getItem(key);
//         console.log(`📦 ${key}:`, value);
//       }

//       // Show specific keys
//       const token = await AsyncStorage.getItem('access_token');
//       const userData = await AsyncStorage.getItem('user_data');

//       console.log('🔐 Token exists:', !!token);
//       console.log('👤 User data exists:', !!userData);

//       if (userData) {
//         console.log('📄 Parsed user data:', JSON.parse(userData));
//       }

//       // Show in alert for easier debugging
//       Alert.alert(
//         'Storage Debug',
//         `Keys: ${keys.length}\nToken: ${token ? 'Yes' : 'No'}\nUser Data: ${userData ? 'Yes' : 'No'}`,
//         [{ text: 'OK' }]
//       );
//     } catch (error) {
//       console.error('❌ Debug storage error:', error);
//     }
//   };

//   // Function to simulate login for testing
//   const simulateLogin = async () => {
//     try {
//       const testUserData = {
//         membership_no: 'M12345',
//         member_name: 'Test Member',
//         Name: 'Test Member',
//         Sno: 1,
//         email: 'test@example.com',
//         phone: '1234567890',
//         status: 'active'
//       };

//       await AsyncStorage.setItem('user_data', JSON.stringify(testUserData));
//       await AsyncStorage.setItem('access_token', 'test_token_123');

//       Alert.alert(
//         'Test Login',
//         'Test member data stored. Now you can test booking.',
//         [{
//           text: 'OK',
//           onPress: () => {
//             // Refresh authentication check
//             checkAuthentication();
//           }
//         }]
//       );
//     } catch (error) {
//       console.error('Error simulating login:', error);
//     }
//   };

//   // Render loading state
//   if (loading && !timeSlots.length) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#D2B48C" />
//           <Text style={styles.loadingText}>Loading booking information...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Render auth error state - BUT STILL SHOW THE FORM FOR TESTING
//   if (!isAuthenticated || authError) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="black" />

//         {/* 🔹 NOTCH HEADER */}
//         <ImageBackground
//           source={require('../assets/notch.jpg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchRow}>
//             <TouchableOpacity
//               style={styles.iconWrapper}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrowleft" size={30} color="#000" />
//             </TouchableOpacity>

//             <Text style={styles.notchTitle}>Book Photoshoot</Text>

//             <View style={styles.iconWrapper} />
//           </View>
//         </ImageBackground>

//         {/* 
//         {/* Header */}
//         {/* <View style={styles.headerBackground}>
//           {/* <View style={styles.headerBar}>
//             {/* <TouchableOpacity onPress={() => navigation.goBack()}>
//               <Icon name="arrowleft" size={24} color="black" />
//             </TouchableOpacity> */}
//         {/* <Text style={styles.headerTitle}>Book Photoshoot</Text> */}
//         {/* <View style={{ width: 24 }} />
//           </View> */}
//         {/* /</View>  */}


//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Authentication Warning Banner */}
//           {/* <View style={styles.authWarningBanner}>
//             <Icon name="exclamationcircleo" size={20} color="#856404" />
//             <Text style={styles.authWarningText}>
//               {authError || 'Please login to complete booking'}
//             </Text>
//           </View> */}

//           {/* Package Info Card */}
//           <View style={styles.packageCard}>
//             <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
//             <View style={styles.priceContainer}>
//               <View style={styles.priceColumn}>
//                 <Text style={styles.priceLabel}>Member Charges</Text>
//                 <Text style={styles.priceValue}>Rs:{photoshoot?.memberCharges || 0}</Text>
//               </View>
//               <View style={styles.priceColumn}>
//                 <Text style={styles.priceLabel}>Guest Charges</Text>
//                 <Text style={styles.priceValue}>Rs:{photoshoot?.guestCharges || 0}</Text>
//               </View>
//             </View>
//           </View>

//           {/* Member/Guest Booking Toggle - Sliding Pill Style */}
//           <View style={styles.bookingTypeCard}>
//             <Text style={styles.bookingTypeTitle}>Booking Type</Text>
//             <View style={styles.togglePillContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.togglePillOption,
//                   !isGuest && styles.togglePillOptionActive
//                 ]}
//                 onPress={() => setIsGuest(false)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[
//                   styles.togglePillText,
//                   !isGuest && styles.togglePillTextActive
//                 ]}>
//                   Member Booking
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.togglePillOption,
//                   isGuest && styles.togglePillOptionActive
//                 ]}
//                 onPress={() => setIsGuest(true)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[
//                   styles.togglePillText,
//                   isGuest && styles.togglePillTextActive
//                 ]}>
//                   Guest Booking
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Price Description based on selection */}
//             {/* <View style={styles.priceDescriptionContainer}>
//               <Icon name="infocirlceo" size={16} color="#666" />
//               <Text style={styles.priceDescriptionText}>
//                 {isGuest
//                   ? `Guest price: Rs ${photoshoot?.guestCharges || 0}`
//                   : `Member price: Rs ${photoshoot?.memberCharges || 0}`
//                 }
//               </Text>
//             </View> */}
//           </View>

//           {/* Guest Details (Conditional) */}
//           {isGuest && (
//             <View style={styles.guestContainer}>
//               <Text style={styles.sectionTitle}>Guest Information</Text>
//               <View style={styles.formGroup}>
//                 <Text style={styles.label}>Guest Name *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter guest full name"
//                   value={guestName}
//                   onChangeText={setGuestName}
//                   placeholderTextColor="#999"
//                 />
//               </View>
//               <View style={styles.formGroup}>
//                 <Text style={styles.label}>Guest Contact Number *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter guest phone number"
//                   value={guestContact}
//                   onChangeText={setGuestContact}
//                   keyboardType="phone-pad"
//                   placeholderTextColor="#999"
//                 />
//               </View>
//             </View>
//           )}

//           {/* Show booking form even if not authenticated */}
//           <View style={styles.bookingForm}>
//             <Text style={styles.sectionTitle}>Select Date & Time</Text>

//             {/* Calendar Section */}
//             <View style={styles.calendarCard}>
//               <Text style={styles.sectionTitle}>Select Date(s)</Text>

//               {/* Selected Dates Badges */}
//               {Object.keys(selectedDates).length > 0 && (
//                 <View style={styles.selectedDatesBadgeContainer}>
//                   {Object.keys(selectedDates).sort().map(date => (
//                     <View key={date} style={styles.dateBadge}>
//                       <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
//                       <TouchableOpacity
//                         onPress={() => {
//                           const newDates = { ...selectedDates };
//                           const newConfigs = { ...dateConfigurations };
//                           delete newDates[date];
//                           delete newConfigs[date];
//                           setSelectedDates(newDates);
//                           setDateConfigurations(newConfigs);
//                         }}
//                         style={{ marginLeft: 5 }}
//                       >
//                         <Icon name="closecircle" size={14} color="#B8860B" />
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </View>
//               )}

//               <Calendar
//                 current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
//                 minDate={new Date().toISOString().split('T')[0]}
//                 onDayPress={handleDateSelect}
//                 markedDates={selectedDates}
//                 theme={{
//                   calendarBackground: '#fff',
//                   textSectionTitleColor: '#000',
//                   selectedDayBackgroundColor: '#B8860B',
//                   selectedDayTextColor: '#fff',
//                   todayTextColor: '#B8860B',
//                   dayTextColor: '#000',
//                   textDisabledColor: '#d9e1e8',
//                   arrowColor: '#B8860B',
//                   monthTextColor: '#000',
//                   textDayFontSize: 16,
//                   textMonthFontSize: 18,
//                   textDayHeaderFontSize: 14,
//                 }}
//               />
//             </View>

//             {/* Time selection Section - PER DATE */}
//             <View style={styles.multiDateConfigSection}>
//               <Text style={styles.sectionTitle}>Pick Time for Each Date</Text>

//               {Object.keys(dateConfigurations).length > 0 ? (
//                 Object.keys(dateConfigurations).sort().map((date) => (
//                   <View key={date} style={styles.dateConfigCard}>
//                     <Text style={styles.dateConfigTitle}>Selection for {formatDateForDisplay(date)}</Text>
//                     <TouchableOpacity
//                       style={styles.timePickerButton}
//                       onPress={() => handlePickTime(date)}
//                     >
//                       <Icon name="clockcircleo" size={20} color="#B8860B" />
//                       <Text style={styles.timePickerButtonText}>
//                         {dateConfigurations[date].time
//                           ? `Time: ${formatTimeForDisplay(dateConfigurations[date].time)}`
//                           : 'Select Time'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))
//               ) : (
//                 <Text style={styles.timeSlotHint}>
//                   Please select at least one date from the calendar
//                 </Text>
//               )}
//             </View>

//             {/* Special Requests */}
//             {/* <View style={styles.specialRequestContainer}>
//               <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
//               <TextInput
//                 style={[styles.input, styles.textArea]}
//                 placeholder="Any special requirements or notes..."
//                 value={specialRequest}
//                 onChangeText={setSpecialRequest}
//                 multiline
//                 numberOfLines={4}
//                 textAlignVertical="top"
//                 placeholderTextColor="#999"
//               />
//             </View> */}

//             {/* Booking Summary */}
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryTitle}>Booking Summary</Text>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Package:</Text>
//                 <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Booking Type:</Text>
//                 <Text style={styles.summaryValue}>
//                   {isGuest ? 'Guest' : 'Member'}
//                 </Text>
//               </View>

//               <View style={styles.summaryDivider} />
//               <Text style={[styles.summaryLabel, { marginBottom: 10 }]}>Selected Slots:</Text>
//               {Object.keys(dateConfigurations).sort().map(date => (
//                 <View key={date} style={styles.summarySlotRow}>
//                   <Text style={styles.summarySlotDate}>{formatDateForDisplay(date)}</Text>
//                   <Text style={styles.summarySlotTime}>
//                     {dateConfigurations[date].time ? formatTimeForDisplay(dateConfigurations[date].time) : 'No time selected'}
//                   </Text>
//                 </View>
//               ))}

//               <View style={[styles.summaryRow, styles.totalRow]}>
//                 <Text style={styles.totalLabel}>Total Amount:</Text>
//                 <Text style={styles.totalValue}>
//                   Rs. {calculateTotalAmount()}
//                 </Text>
//               </View>
//             </View>

//             {/* Login Required Message */}
//             <View style={styles.loginRequiredCard}>
//               <Icon name="lock" size={24} color="#856404" />
//               <Text style={styles.loginRequiredTitle}>Login Required</Text>
//               <Text style={styles.loginRequiredText}>
//                 Please login to generate invoice and complete your booking
//               </Text>

//               <View style={styles.authButtons}>
//                 <TouchableOpacity
//                   style={styles.loginButton}
//                   onPress={() => navigation.navigate('Login')}
//                 >
//                   <Text style={styles.loginButtonText}>Go to Login</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.testLoginButton}
//                   onPress={simulateLogin}
//                 >
//                   <Text style={styles.testLoginButtonText}>Test Login (Dev Only)</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.debugButton}
//                   onPress={debugStorage}
//                 >
//                   <Text style={styles.debugButtonText}>Debug Storage</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     );
//   }

//   // Render booking form when authenticated
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="black" />
//       {/* 🔹 NOTCH HEADER */}
//       <ImageBackground
//         source={require('../assets/notch.jpg')}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchRow}>
//           <TouchableOpacity
//             style={styles.iconWrapper}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="arrowleft" size={30} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.notchTitle}>Book Photoshoot</Text>

//           <View style={styles.iconWrapper} />
//         </View>
//       </ImageBackground>


//       {/* Header
//       <View style={styles.headerBackground}>
//         <View style={styles.headerBar}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrowleft" size={24} color="black" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Book Photoshoot</Text>
//           <View style={{ width: 24 }} />
//         </View>
//       </View> */}

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Member Info Card */}
//         {/* <View style={styles.memberInfoCard}>
//           <View style={styles.memberInfoHeader}>
//             <Icon name="user" size={20} color="#2E8B57" />
//             <Text style={styles.memberInfoTitle}>Logged in as</Text>
//           </View>
//           <View style={styles.memberInfoRow}>
//             <Text style={styles.memberInfoLabel}>Membership No:</Text>
//             <Text style={styles.memberInfoValue}>{memberInfo?.membership_no || 'N/A'}</Text>
//           </View>
//           <View style={styles.memberInfoRow}>
//             <Text style={styles.memberInfoLabel}>Name:</Text>
//             <Text style={styles.memberInfoValue}>{memberInfo?.member_name || 'N/A'}</Text>
//           </View>
//         </View> */}

//         {/* Package Info Card */}
//         <View style={styles.packageCard}>
//           <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
//           <View style={styles.priceContainer}>
//             <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Member Charges</Text>
//               <Text style={styles.priceValue}>Rs. {photoshoot?.memberCharges || 0}</Text>
//             </View>
//             <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Guest Charges</Text>
//               <Text style={styles.priceValue}>Rs. {photoshoot?.guestCharges || 0}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Member/Guest Booking Toggle - Sliding Pill Style */}
//         <View style={styles.bookingTypeCard}>
//           <Text style={styles.bookingTypeTitle}>Booking Type</Text>
//           <View style={styles.togglePillContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.togglePillOption,
//                 !isGuest && styles.togglePillOptionActive
//               ]}
//               onPress={() => setIsGuest(false)}
//               activeOpacity={0.8}
//             >
//               <Text style={[
//                 styles.togglePillText,
//                 !isGuest && styles.togglePillTextActive
//               ]}>
//                 Member Booking
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.togglePillOption,
//                 isGuest && styles.togglePillOptionActive
//               ]}
//               onPress={() => setIsGuest(true)}
//               activeOpacity={0.8}
//             >
//               <Text style={[
//                 styles.togglePillText,
//                 isGuest && styles.togglePillTextActive
//               ]}>
//                 Guest Booking
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Price Description based on selection */}
//           {/* <View style={styles.priceDescriptionContainer}>
//             <Icon name="infocirlceo" size={16} color="#666" />
//             <Text style={styles.priceDescriptionText}>
//               {isGuest
//                 ? `Guest price: Rs ${photoshoot?.guestCharges || 0}`
//                 : `Member price: Rs ${photoshoot?.memberCharges || 0}`
//               }
//             </Text>
//           </View> */}
//         </View>

//         {/* Guest Details (Conditional) */}
//         {isGuest && (
//           <View style={styles.guestContainer}>
//             <Text style={styles.sectionTitle}>Guest Information</Text>
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Guest Name *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter guest full name"
//                 value={guestName}
//                 onChangeText={setGuestName}
//                 placeholderTextColor="#999"
//               />
//             </View>
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Guest Contact Number *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter guest phone number"
//                 value={guestContact}
//                 onChangeText={setGuestContact}
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#999"
//               />
//             </View>
//           </View>
//         )}

//         {/* Booking Form */}
//         <View style={styles.bookingForm}>
//           <Text style={styles.sectionTitle}>Select Date & Time</Text>

//           {/* Calendar Section */}
//           <View style={styles.calendarCard}>
//             <Text style={styles.sectionTitle}>Select Date(s)</Text>

//             {/* Selected Dates Badges */}
//             {Object.keys(selectedDates).length > 0 && (
//               <View style={styles.selectedDatesBadgeContainer}>
//                 {Object.keys(selectedDates).sort().map(date => (
//                   <View key={date} style={styles.dateBadge}>
//                     <Text style={styles.dateBadgeText}>{formatDateForDisplay(date)}</Text>
//                     <TouchableOpacity
//                       onPress={() => {
//                         const newDates = { ...selectedDates };
//                         const newConfigs = { ...dateConfigurations };
//                         delete newDates[date];
//                         delete newConfigs[date];
//                         setSelectedDates(newDates);
//                         setDateConfigurations(newConfigs);
//                       }}
//                       style={{ marginLeft: 5 }}
//                     >
//                       <Icon name="closecircle" size={14} color="#B8860B" />
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>
//             )}

//             <Calendar
//               current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
//               minDate={new Date().toISOString().split('T')[0]}
//               onDayPress={handleDateSelect}
//               markedDates={selectedDates}
//               theme={{
//                 calendarBackground: '#fff',
//                 textSectionTitleColor: '#000',
//                 selectedDayBackgroundColor: '#B8860B',
//                 selectedDayTextColor: '#fff',
//                 todayTextColor: '#B8860B',
//                 dayTextColor: '#000',
//                 textDisabledColor: '#d9e1e8',
//                 arrowColor: '#B8860B',
//                 monthTextColor: '#000',
//                 textDayFontSize: 16,
//                 textMonthFontSize: 18,
//                 textDayHeaderFontSize: 14,
//               }}
//             />
//           </View>

//           {/* Time selection Section - PER DATE */}
//           <View style={styles.multiDateConfigSection}>
//             <Text style={styles.sectionTitle}>Pick Time for Each Date</Text>

//             {Object.keys(dateConfigurations).length > 0 ? (
//               Object.keys(dateConfigurations).sort().map((date) => (
//                 <View key={date} style={styles.dateConfigCard}>
//                   <Text style={styles.dateConfigTitle}>Selection for {formatDateForDisplay(date)}</Text>
//                   <TouchableOpacity
//                     style={styles.timePickerButton}
//                     onPress={() => handlePickTime(date)}
//                   >
//                     <Icon name="clockcircleo" size={20} color="#B8860B" />
//                     <Text style={styles.timePickerButtonText}>
//                       {dateConfigurations[date].time
//                         ? `Time: ${formatTimeForDisplay(dateConfigurations[date].time)}`
//                         : 'Select Time'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.timeSlotHint}>
//                 Please select at least one date from the calendar
//               </Text>
//             )}
//           </View>

//           {showPicker && (
//             <DateTimePicker
//               value={pickerDate}
//               mode="time"
//               is24Hour={false}
//               display="default"
//               onChange={onTimeChange}
//             />
//           )}

//           {/* Special Requests */}
//           {/* <View style={styles.specialRequestContainer}>
//             <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Any special requirements or notes..."
//               value={specialRequest}
//               onChangeText={setSpecialRequest}
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//               placeholderTextColor="#999"
//             />
//           </View> */}

//           {/* Booking Summary */}
//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryTitle}>Booking Summary</Text>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Package:</Text>
//               <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Booking Type:</Text>
//               <Text style={styles.summaryValue}>
//                 {isGuest ? 'Guest' : 'Member'}
//               </Text>
//             </View>

//             <View style={styles.summaryDivider} />
//             <Text style={[styles.summaryLabel, { marginBottom: 10 }]}>Selected Slots:</Text>
//             {Object.keys(dateConfigurations).sort().map(date => (
//               <View key={date} style={styles.summarySlotRow}>
//                 <Text style={styles.summarySlotDate}>{formatDateForDisplay(date)}</Text>
//                 <Text style={styles.summarySlotTime}>
//                   {dateConfigurations[date].time ? formatTimeForDisplay(dateConfigurations[date].time) : 'No time selected'}
//                 </Text>
//               </View>
//             ))}

//             <View style={[styles.summaryRow, styles.totalRow]}>
//               <Text style={styles.totalLabel}>Total Amount:</Text>
//               <Text style={styles.totalValue}>
//                 Rs: {calculateTotalAmount()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.actionButtons}>
//           {/* <View style={styles.policySection}>
//             <Text style={styles.policyTitle}>Photoshoot Policy & Rules</Text>
//             {loadingRules ? (
//               <ActivityIndicator color="#D2B48C" size="small" />
//             ) : rules && rules.length > 0 ? (
//               rules.map((rule, index) => (
//                 <View key={rule.id || index} style={styles.ruleItem}>
//                   <View style={{ flex: 1 }}>
//                     <HtmlRenderer
//                       htmlContent={rule.content || rule.rule || ''}
//                       textStyle={styles.ruleText}
//                     />
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.noRulesText}>No specific rules found.</Text>
//             )}
//           </View> */}

//           <TouchableOpacity
//             style={[styles.button, styles.invoiceButton]}
//             onPress={handleGenerateInvoice}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 {/* <Icon name="filetext1" size={20} color="#fff" style={styles.buttonIcon} /> */}
//                 <Text style={styles.buttonText}>{isGuest ? 'Book For Guest' : 'Confirm Booking'}</Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9EFE6',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   headerBackground: {
//     backgroundColor: '#D2B48C',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   notch: {
//     paddingTop: 60,
//     paddingBottom: 25,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     overflow: "hidden",
//     backgroundColor: "#D2B48C",
//   },

//   notchImage: {
//     resizeMode: "cover",
//   },

//   notchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   iconWrapper: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   notchTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#000",
//   },

//   headerBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   authWarningBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff3cd',
//     padding: 15,
//     margin: 15,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffc107',
//   },
//   authWarningText: {
//     color: '#856404',
//     marginLeft: 10,
//     fontSize: 14,
//     flex: 1,
//   },
//   bookingForm: {
//     paddingBottom: 20,
//   },
//   packageCard: {
//     width: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   packageTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 10,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     paddingHorizontal: 50,
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
//   calendarCard: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//   },
//   selectedDate: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 15,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   timeContainer: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 10,
//     paddingHorizontal: 10
//   },
//   timeSlotsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   timeSlot: {
//     width: '48%',
//     backgroundColor: '#f8f8f8',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   timeSlotSelected: {
//     backgroundColor: '#B8860B',
//     borderColor: '#B8860B',
//   },
//   timeSlotDisabled: {
//     backgroundColor: '#f0f0f0',
//     borderColor: '#ddd',
//     opacity: 0.6,
//   },
//   timeSlotText: {
//     fontSize: 14,
//     color: '#000',
//   },
//   timeSlotTextSelected: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   timeSlotTextDisabled: {
//     color: '#999',
//   },
//   bookedText: {
//     fontSize: 10,
//     color: '#ff6b6b',
//     marginTop: 4,
//   },
//   selectedTimeContainer: {
//     marginTop: 15,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   selectedTimeText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//   },
//   timeSlotHint: {
//     fontSize: 14,
//     color: '#666',
//     fontStyle: 'italic',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   specialRequestContainer: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//   },
//   input: {
//     backgroundColor: '#f8f8f8',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     marginBottom: 10,
//     color: '#000',
//   },
//   textArea: {
//     height: 100,
//   },
//   summaryCard: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 15,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     textAlign: 'right',
//     flex: 1,
//     marginLeft: 10,
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 10,
//     marginTop: 10,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#B8860B',
//   },
//   loginRequiredCard: {
//     backgroundColor: '#e7f3ff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#b3d7ff',
//   },
//   loginRequiredTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#0d6efd',
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   loginRequiredText: {
//     fontSize: 14,
//     color: '#0d6efd',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   authButtons: {
//     width: '100%',
//   },
//   loginButton: {
//     backgroundColor: '#2E8B57',
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   testLoginButton: {
//     backgroundColor: '#D2B48C',
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   testLoginButtonText: {
//     color: '#000',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   debugButton: {
//     backgroundColor: '#6c757d',
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   debugButtonText: {
//     color: '#fff',
//     fontSize: 14,
//   },
//   memberInfoCard: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#2E8B57',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   memberInfoHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   memberInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2E8B57',
//     marginLeft: 8,
//   },
//   memberInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   memberInfoLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   memberInfoValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//   },
//   // Booking Type Toggle Styles (sliding pill style)
//   bookingTypeCard: {
//     backgroundColor: '#fff',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     borderRadius: 12,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   bookingTypeTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   // Sliding Pill Toggle Styles
//   togglePillContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F9EFE6',
//     borderRadius: 30,
//     padding: 4,
//   },
//   togglePillOption: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 26,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   togglePillOptionActive: {
//     backgroundColor: '#C9A962',
//   },
//   togglePillText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#999',
//   },
//   togglePillTextActive: {
//     color: '#000',
//   },
//   priceDescriptionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   priceDescriptionText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#666',
//   },
//   // Form Group Styles
//   formGroup: {
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 6,
//   },
//   guestContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     borderRadius: 12,
//     padding: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
//   },
//   actionButtons: {
//     marginHorizontal: 15,
//     marginTop: 20,
//   },
//   button: {
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   invoiceButton: {
//     backgroundColor: '#b48a64',
//   },
//   buttonIcon: {
//     marginRight: 8,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   // Multi-date styles
//   selectedDatesBadgeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 10,
//     gap: 8,
//     paddingHorizontal: 5,
//   },
//   dateBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9EFE6',
//     borderWidth: 1,
//     borderColor: '#B8860B',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   dateBadgeText: {
//     fontSize: 12,
//     color: '#000',
//     fontWeight: '600',
//   },
//   multiDateConfigSection: {
//     backgroundColor: '#fff',
//     margin: 15,
//     borderRadius: 12,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   dateConfigCard: {
//     backgroundColor: '#f9f9f9',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   dateConfigTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#B8860B',
//     marginBottom: 10,
//   },
//   // Rules Section Styles
//   policySection: {
//     backgroundColor: '#fff',
//     marginHorizontal: 15,
//     marginBottom: 20,
//     borderRadius: 12,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   policyTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#B8860B',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   ruleItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//     paddingRight: 10,
//   },
//   ruleText: {
//     fontSize: 14,
//     color: '#555',
//     marginLeft: 8,
//     lineHeight: 20,
//     flex: 1,
//   },
//   noRulesText: {
//     fontSize: 14,
//     color: '#999',
//     fontStyle: 'italic',
//     textAlign: 'center',
//     padding: 10,
//   },
//   summaryDivider: {
//     height: 1,
//     backgroundColor: '#eee',
//     marginVertical: 12,
//   },
//   summarySlotRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 4,
//   },
//   summarySlotDate: {
//     fontSize: 13,
//     color: '#444',
//     fontWeight: '500',
//   },
//   summarySlotTime: {
//     fontSize: 13,
//     color: '#B8860B',
//     fontWeight: 'bold',
//   },
//   timePickerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#B8860B',
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 5,
//   },
//   timePickerButtonText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#000',
//     fontWeight: '500',
//   },
// });

// export default shootsBooking;

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  Switch,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentAPI, photoshootAPI, makeApiCall, getUserData, checkAuthStatus, getPhotoshootRule } from '../config/apis';
import { useVoucher } from '../src/auth/contexts/VoucherContext';
import HtmlRenderer from '../src/events/HtmlRenderer';
import TermsAndConditions from '../src/components/TermsAndConditions';

const shootsBooking = ({ route, navigation }) => {
  const { setVoucher } = useVoucher();
  const { photoshoot } = route.params || {};

  // State variables
  const [selectedDates, setSelectedDates] = useState({});
  const [dateConfigurations, setDateConfigurations] = useState({});
  const [pricingType, setPricingType] = useState('guest'); // Guest selected by default
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);

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

  // Time Picker states
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [currentDateForTime, setCurrentDateForTime] = useState(null);

  // Member info state
  const [memberInfo, setMemberInfo] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    console.log('🎬 shootsBooking mounted with photoshoot:', photoshoot);

    // Always initialize time slots immediately
    generateTimeSlots();

    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    const initialDates = {
      [today]: {
        selected: true,
        selectedColor: '#b48a64',
        selectedTextColor: 'white',
      }
    };
    setSelectedDates(initialDates);
    setDateConfigurations({
      [today]: {
        time: new Date(), // Default time is now
      }
    });

    // Then check authentication
    checkAuthentication();

    // Listen for focus to refresh data
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Screen focused, refreshing...');
      checkAuthentication();
    });

    fetchRules();

    return unsubscribe;
  }, [navigation]);

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const fetchedRules = await getPhotoshootRule();
      console.log('✅ Fetched photoshoot rules:', fetchedRules);
      setRules(fetchedRules);
    } catch (error) {
      console.error('Error fetching photoshoot rules:', error);
    } finally {
      setLoadingRules(false);
    }
  };

  const checkAuthentication = async () => {
    try {
      console.log('🔐 Checking authentication...');
      setLoading(true);
      setAuthError(null);

      // Use the checkAuthStatus function from your config
      const authStatus = await checkAuthStatus();
      console.log('📊 Auth status:', authStatus);

      if (authStatus.isAuthenticated && authStatus.userData) {
        setIsAuthenticated(true);

        // Extract member information from userData
        const userData = authStatus.userData;
        console.log('👤 User data from storage:', userData);

        // Map userData to memberInfo structure
        const memberData = {
          membership_no: userData.membership_no ||
            userData.Membership_No ||
            userData.membershipNumber ||
            userData.memberId ||
            '',
          member_name: userData.member_name ||
            userData.Name ||
            userData.name ||
            userData.fullName ||
            '',
          Sno: userData.Sno || userData.id || userData.userId,
          email: userData.email || '',
          phone: userData.phone || userData.Phone || '',
          status: userData.status || 'active',
        };

        console.log('✅ Extracted member data:', memberData);

        if (!memberData.membership_no) {
          console.warn('⚠️ No membership number found in user data');
          setAuthError('Membership information incomplete. Please login again.');
          setIsAuthenticated(false);
          setMemberInfo(null);
        } else {
          setMemberInfo(memberData);
        }
      } else {
        console.warn('⚠️ User not authenticated');
        setIsAuthenticated(false);
        setMemberInfo(null);
        setAuthError('Please login to book a photoshoot.');
      }
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticated(false);
      setMemberInfo(null);
      setAuthError('Authentication error. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    // Generate slots from 9 AM to 6 PM in 2-hour intervals
    for (let hour = 9; hour <= 16; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
      slots.push({
        id: hour,
        startTime,
        endTime,
        label: `${startTime} - ${endTime}`,
        available: true,
      });
    }
    console.log('🕒 Generated time slots:', slots);
    setTimeSlots(slots);
  };

  const handleDateSelect = (day) => {
    const date = day.dateString;
    console.log('📅 Date toggled:', date);

    const newDates = { ...selectedDates };
    const newConfigs = { ...dateConfigurations };

    if (newDates[date]) {
      // Deselect
      delete newDates[date];
      delete newConfigs[date];
    } else {
      // Select
      newDates[date] = {
        selected: true,
        selectedColor: '#b48a64',
        selectedTextColor: 'white',
      };
      newConfigs[date] = {
        time: new Date(),
      };
    }

    setSelectedDates(newDates);
    setDateConfigurations(newConfigs);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime && currentDateForTime) {
      if (event.type === 'dismissed') {
        setCurrentDateForTime(null);
        return;
      }

      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      // Validate time: 9:00 AM to 6:00 PM (18:00) strict
      // Valid if: hours >= 9 AND (hours < 18 OR (hours === 18 && minutes === 0))
      const isValidTime = hours >= 9 && (hours < 18 || (hours === 18 && minutes === 0));

      if (!isValidTime) {
        Alert.alert(
          'Invalid Time',
          'Bookings are only allowed between 9:00 AM and 6:00 PM.',
          [{ text: 'OK' }]
        );
        setCurrentDateForTime(null);
        return;
      }

      const newConfigs = { ...dateConfigurations };
      newConfigs[currentDateForTime] = {
        ...newConfigs[currentDateForTime],
        time: selectedTime,
      };
      setDateConfigurations(newConfigs);
    }
    setCurrentDateForTime(null);
  };

  const handlePickTime = (date) => {
    setCurrentDateForTime(date);
    setPickerDate(dateConfigurations[date]?.time || new Date());
    setShowPicker(true);
  };

  /* handleTimeSlotSelect removed in favor of handlePickTime */

  const calculateTotalAmount = () => {
    const isGuest = pricingType === 'guest';
    const photoshootPrice = isGuest ? (photoshoot?.guestCharges || 0) : (photoshoot?.memberCharges || 0);
    const count = Object.keys(dateConfigurations).length;
    return count * photoshootPrice;
  };

  const handleGenerateInvoice = async () => {
    // Terms & Conditions validation
    if (!termsAgreed) {
      setShowTermsError(true);
      Alert.alert('Terms & Conditions', 'You must agree to the Terms & Conditions before booking.');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !memberInfo || !memberInfo.membership_no) {
      Alert.alert(
        'Authentication Required',
        'Please login to book a photoshoot.',
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

    // Validation
    if (!photoshoot || !photoshoot.id) {
      Alert.alert('Error', 'Photoshoot information is missing');
      return;
    }

    const sortedDates = Object.keys(dateConfigurations).sort();
    if (sortedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one date');
      return;
    }

    // Check if each date has a time
    const incompleteDates = sortedDates.filter(date => !dateConfigurations[date].time);
    if (incompleteDates.length > 0) {
      Alert.alert('Error', `Please select a time for all dates: ${incompleteDates.map(d => formatDateForDisplay(d)).join(', ')}`);
      return;
    }

    if (pricingType === 'guest' && (!guestName || !guestContact)) {
      Alert.alert('Error', 'Please enter guest name and contact');
      return;
    }

    // Validate Pakistani mobile number format (03xxxxxxxxx or 92xxxxxxxxxx)
    if (pricingType === 'guest') {
      const phoneRegex = /^(03\d{9}|92\d{10})$/;
      if (!phoneRegex.test(guestContact.trim())) {
        Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number (e.g., 03001234567 or 923001234567).');
        return;
      }
    }

    setLoading(true);

    try {
      // Construct bookingDetails array from dateConfigurations
      const bookingDetails = sortedDates.map(date => {
        const time = dateConfigurations[date].time || new Date();
        const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:00`;
        return {
          date: date,
          timeSlot: `${date}T${timeStr}`
        };
      });

      const totalPriceValue = calculateTotalAmount();

      const startDate = sortedDates[0];
      const firstTime = dateConfigurations[startDate].time || new Date();
      const firstTimeStr = `${firstTime.getHours().toString().padStart(2, '0')}:${firstTime.getMinutes().toString().padStart(2, '0')}:00`;

      const bookingData = {
        membership_no: memberInfo.membership_no,
        bookingDate: startDate,
        timeSlot: `${startDate}T${firstTimeStr}:00`,
        bookingDetails: JSON.stringify(bookingDetails),
        pricingType: pricingType,
        specialRequest: specialRequest || '',
        guestName: pricingType === 'guest' ? guestName : null,
        guestContact: pricingType === 'guest' ? guestContact : null,
        member_name: memberInfo.member_name || '',
        totalPrice: totalPriceValue
      };

      console.log('🧾 Generating invoice with data:', {
        photoshootId: photoshoot.id,
        bookingData,
      });

      // Generate invoice using the API
      const result = await makeApiCall(
        photoshootAPI.generateInvoicePhotoshoot,
        photoshoot.id,
        bookingData
      );

      setLoading(false);

      if (result.success) {
        console.log('✅ Invoice generated successfully:', result.data);

        // Serialize dateConfigurations to avoid React Navigation serialization warnings
        // Convert Date objects to ISO strings for safe navigation param passing
        const serializedDateConfigurations = {};
        Object.keys(dateConfigurations).forEach(date => {
          const timeValue = dateConfigurations[date].time;
          serializedDateConfigurations[date] = {
            time: timeValue instanceof Date ? timeValue.toISOString() : timeValue
          };
        });

        console.log('📦 Serializing for navigation:', {
          originalTime: dateConfigurations[sortedDates[0]]?.time,
          serializedTime: serializedDateConfigurations[sortedDates[0]]?.time,
          type: typeof serializedDateConfigurations[sortedDates[0]]?.time
        });

        // Prepare navigation params
        const navigationParams = {
          invoiceData: result.data.Data || result.data,
          bookingData: {
            ...bookingData,
            photoshootId: photoshoot.id,
            totalPrice: totalPriceValue,
            photoshootDescription: photoshoot.description,
            selectedDates: sortedDates,
            dateConfigurations: serializedDateConfigurations
          },
          photoshoot: photoshoot,
          memberInfo: memberInfo,
          module: 'SHOOT'
        };

        // Set global voucher for persistent timer
        setVoucher(result.data.Data || result.data, navigationParams);

        // Navigate to invoice screen
        navigation.navigate('InvoiceScreen', navigationParams);
      } else {
        Alert.alert('Invoice Generation Failed', result.message || 'Failed to generate invoice');
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Invoice generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate invoice. Please try again.');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return '';

    let hours, minutes;
    if (time instanceof Date) {
      hours = time.getHours();
      minutes = time.getMinutes();
    } else if (typeof time === 'string') {
      [hours, minutes] = time.split(':').map(Number);
    } else {
      return '';
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  const debugStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔑 All AsyncStorage keys:', keys);

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📦 ${key}:`, value);
      }

      // Show specific keys
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('🔐 Token exists:', !!token);
      console.log('👤 User data exists:', !!userData);

      if (userData) {
        console.log('📄 Parsed user data:', JSON.parse(userData));
      }

      // Show in alert for easier debugging
      Alert.alert(
        'Storage Debug',
        `Keys: ${keys.length}\nToken: ${token ? 'Yes' : 'No'}\nUser Data: ${userData ? 'Yes' : 'No'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Debug storage error:', error);
    }
  };

  // Function to simulate login for testing
  const simulateLogin = async () => {
    try {
      const testUserData = {
        membership_no: 'M12345',
        member_name: 'Test Member',
        Name: 'Test Member',
        Sno: 1,
        email: 'test@example.com',
        phone: '1234567890',
        status: 'active'
      };

      await AsyncStorage.setItem('user_data', JSON.stringify(testUserData));
      await AsyncStorage.setItem('access_token', 'test_token_123');

      Alert.alert(
        'Test Login',
        'Test member data stored. Now you can test booking.',
        [{
          text: 'OK',
          onPress: () => {
            // Refresh authentication check
            checkAuthentication();
          }
        }]
      );
    } catch (error) {
      console.error('Error simulating login:', error);
    }
  };

  // Render loading state
  if (loading && !timeSlots.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D2B48C" />
          <Text style={styles.loadingText}>Loading booking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render auth error state - BUT STILL SHOW THE FORM FOR TESTING
  if (!isAuthenticated || authError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" />

        {/* 🔹 NOTCH HEADER */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchRow}>
            <TouchableOpacity
              style={styles.iconWrapper}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrowleft" size={30} color="#000" />
            </TouchableOpacity>

            <Text style={styles.notchTitle}>Book Photoshoot</Text>

            <View style={styles.iconWrapper} />
          </View>
        </ImageBackground>

        {/* 
        {/* Header */}
        {/* <View style={styles.headerBackground}>
          {/* <View style={styles.headerBar}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrowleft" size={24} color="black" />
            </TouchableOpacity> */}
        {/* <Text style={styles.headerTitle}>Book Photoshoot</Text> */}
        {/* <View style={{ width: 24 }} />
          </View> */}
        {/* /</View>  */}


        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Authentication Warning Banner */}
          {/* <View style={styles.authWarningBanner}>
            <Icon name="exclamationcircleo" size={20} color="#856404" />
            <Text style={styles.authWarningText}>
              {authError || 'Please login to complete booking'}
            </Text>
          </View> */}

          {/* Package Info Card */}
          <View style={styles.packageCard}>
            <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Member</Text>
                <Text style={styles.priceValue}>Rs:{photoshoot?.memberCharges || 0}</Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Guest</Text>
                <Text style={styles.priceValue}>Rs:{photoshoot?.guestCharges || 0}</Text>
              </View>
            </View>
          </View>

          {/* Member/Guest Booking Toggle */}
          <View style={styles.bookingTypeCard}>
            <Text style={styles.bookingTypeTitle}>Booking Type</Text>
            <View style={styles.toggleRow}>
              <Text style={[
                styles.toggleOption,
                pricingType === 'member' && styles.toggleActive
              ]}>
                Member Booking
              </Text>
              <Switch
                value={pricingType === 'guest'}
                onValueChange={(val) => setPricingType(val ? 'guest' : 'member')}
                trackColor={{ false: '#D2B48C', true: '#b48a64' }}
                thumbColor="#fff"
              />
              <Text style={[
                styles.toggleOption,
                pricingType === 'guest' && styles.toggleActive
              ]}>
                Guest Booking
              </Text>
            </View>
          </View>

          {/* Guest Details (Conditional) */}
          {pricingType === 'guest' && (
            <View style={styles.guestContainer}>
              <Text style={styles.sectionTitle}>Guest Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Guest Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter guest full name"
                  value={guestName}
                  onChangeText={handleGuestNameChange}
                  placeholderTextColor="#999"
                  maxLength={50}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Guest Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter guest phone number"
                  value={guestContact}
                  onChangeText={handleGuestContactChange}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  maxLength={12}
                />
              </View>
            </View>
          )}

          {/* Show booking form even if not authenticated */}
          <View style={styles.bookingForm}>
            <Text style={styles.sectionTitle}>Select Date & Time</Text>

            {/* Calendar Section */}
            <View style={styles.calendarCard}>
              <Text style={styles.sectionTitle}>Select Date(s)</Text>

              {/* Selected Dates Badges */}
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
                        <Icon name="closecircle" size={14} color="#b48a64" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Calendar
                current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={selectedDates}
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

            {/* Time selection Section - PER DATE */}
            <View style={styles.multiDateConfigSection}>
              <Text style={styles.sectionTitle}>Pick Time for Each Date</Text>

              {Object.keys(dateConfigurations).length > 0 ? (
                Object.keys(dateConfigurations).sort().map((date) => (
                  <View key={date} style={styles.dateConfigCard}>
                    <Text style={styles.dateConfigTitle}>Selection for {formatDateForDisplay(date)}</Text>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => handlePickTime(date)}
                    >
                      <Icon name="clockcircleo" size={20} color="#b48a64" />
                      <Text style={styles.timePickerButtonText}>
                        {dateConfigurations[date].time
                          ? `Time: ${formatTimeForDisplay(dateConfigurations[date].time)}`
                          : 'Select Time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.timeSlotHint}>
                  Please select at least one date from the calendar
                </Text>
              )}
            </View>

            {/* Special Requests */}
            {/* <View style={styles.specialRequestContainer}>
              <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requirements or notes..."
                value={specialRequest}
                onChangeText={setSpecialRequest}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View> */}

            {/* Booking Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Package:</Text>
                <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Booking Type:</Text>
                <Text style={styles.summaryValue}>
                  {pricingType === 'guest' ? 'Guest' : 'Member'}
                </Text>
              </View>

              <View style={styles.summaryDivider} />
              <Text style={[styles.summaryLabel, { marginBottom: 10 }]}>Selected Slots:</Text>
              {Object.keys(dateConfigurations).sort().map(date => (
                <View key={date} style={styles.summarySlotRow}>
                  <Text style={styles.summarySlotDate}>{formatDateForDisplay(date)}</Text>
                  <Text style={styles.summarySlotTime}>
                    {dateConfigurations[date].time ? formatTimeForDisplay(dateConfigurations[date].time) : 'No time selected'}
                  </Text>
                </View>
              ))}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  Rs. {calculateTotalAmount()}
                </Text>
              </View>
            </View>

            {/* Login Required Message
            <View style={styles.loginRequiredCard}>
              <Icon name="lock" size={24} color="#b48a64" />
              <Text style={styles.loginRequiredTitle}>Login Required</Text>
              <Text style={styles.loginRequiredText}>
                Please login to generate invoice and complete your booking
              </Text>

              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>Go to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testLoginButton}
                  onPress={simulateLogin}
                >
                  <Text style={styles.testLoginButtonText}>Test Login (Dev Only)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={debugStorage}
                >
                  <Text style={styles.debugButtonText}>Debug Storage</Text>
                </TouchableOpacity>
              </View>
            </View> */}
          </View>
        </ScrollView>
      </SafeAreaView >
    );
  }

  // Render booking form when authenticated
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* 🔹 NOTCH HEADER */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrowleft" size={30} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>Book Photoshoot</Text>

          <View style={styles.iconWrapper} />
        </View>
      </ImageBackground>


      {/* Header
      <View style={styles.headerBackground}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Photoshoot</Text>
          <View style={{ width: 24 }} />
        </View>
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Info Card */}
        {/* <View style={styles.memberInfoCard}>
          <View style={styles.memberInfoHeader}>
            <Icon name="user" size={20} color="#2E8B57" />
            <Text style={styles.memberInfoTitle}>Logged in as</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>Membership No:</Text>
            <Text style={styles.memberInfoValue}>{memberInfo?.membership_no || 'N/A'}</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>Name:</Text>
            <Text style={styles.memberInfoValue}>{memberInfo?.member_name || 'N/A'}</Text>
          </View>
        </View> */}

        {/* Package Info Card */}
        <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Member</Text>
              <Text style={styles.priceValue}>Rs. {photoshoot?.memberCharges || 0}</Text>
            </View>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Guest</Text>
              <Text style={styles.priceValue}>Rs. {photoshoot?.guestCharges || 0}</Text>
            </View>
          </View>
        </View>

        {/* Member/Guest Booking Toggle */}
        <View style={styles.bookingTypeCard}>
          <Text style={styles.bookingTypeTitle}>Booking Type</Text>
          <View style={styles.toggleRow}>
            <Text style={[
              styles.toggleOption,
              pricingType === 'member' && styles.toggleActive
            ]}>
              Member Booking
            </Text>
            <Switch
              value={pricingType === 'guest'}
              onValueChange={(val) => setPricingType(val ? 'guest' : 'member')}
              trackColor={{ false: '#D2B48C', true: '#b48a64' }}
              thumbColor="#fff"
            />
            <Text style={[
              styles.toggleOption,
              pricingType === 'guest' && styles.toggleActive
            ]}>
              Guest Booking
            </Text>
          </View>
        </View>

        {/* Guest Details (Conditional) */}
        {pricingType === 'guest' && (
          <View style={styles.guestContainer}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guest Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest full name"
                value={guestName}
                onChangeText={handleGuestNameChange}
                placeholderTextColor="#999"
                maxLength={50}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guest Contact Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest phone number"
                value={guestContact}
                onChangeText={handleGuestContactChange}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                maxLength={12}
              />
            </View>
          </View>
        )}

        {/* Booking Form */}
        <View style={styles.bookingForm}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>

          {/* Calendar Section */}
          <View style={styles.calendarCard}>
            <Text style={styles.sectionTitle}>Select Date(s)</Text>

            {/* Selected Dates Badges */}
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
                      <Icon name="closecircle" size={14} color="#b48a64" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Calendar
              current={Object.keys(selectedDates)[0] || new Date().toISOString().split('T')[0]}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDateSelect}
              markedDates={selectedDates}
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

          {/* Time selection Section - PER DATE */}
          <View style={styles.multiDateConfigSection}>
            <Text style={styles.sectionTitle}>Pick Time for Each Date</Text>

            {Object.keys(dateConfigurations).length > 0 ? (
              Object.keys(dateConfigurations).sort().map((date) => (
                <View key={date} style={styles.dateConfigCard}>
                  <Text style={styles.dateConfigTitle}>Selection for {formatDateForDisplay(date)}</Text>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => handlePickTime(date)}
                  >
                    <Icon name="clockcircleo" size={20} color="#b48a64" />
                    <Text style={styles.timePickerButtonText}>
                      {dateConfigurations[date].time
                        ? `Time: ${formatTimeForDisplay(dateConfigurations[date].time)}`
                        : 'Select Time'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.timeSlotHint}>
                Please select at least one date from the calendar
              </Text>
            )}
          </View>

          {showPicker && (
            <DateTimePicker
              value={pickerDate}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}

          {/* Special Requests */}
          {/* <View style={styles.specialRequestContainer}>
            <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requirements or notes..."
              value={specialRequest}
              onChangeText={setSpecialRequest}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View> */}

          {/* Booking Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Package:</Text>
              <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking Type:</Text>
              <Text style={styles.summaryValue}>
                {pricingType === 'guest' ? 'Guest' : 'Member'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />
            <Text style={[styles.summaryLabel, { marginBottom: 10 }]}>Selected Slots:</Text>
            {Object.keys(dateConfigurations).sort().map(date => (
              <View key={date} style={styles.summarySlotRow}>
                <Text style={styles.summarySlotDate}>{formatDateForDisplay(date)}</Text>
                <Text style={styles.summarySlotTime}>
                  {dateConfigurations[date].time ? formatTimeForDisplay(dateConfigurations[date].time) : 'No time selected'}
                </Text>
              </View>
            ))}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                Rs: {calculateTotalAmount()}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        <TermsAndConditions
          bookingType="PHOTOSHOOT"
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
            loading && styles.submitButtonDisabled
          ]}
          onPress={handleGenerateInvoice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {pricingType === 'guest' ? 'Book For Guest' : 'Confirm Booking'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerBackground: {
    backgroundColor: '#D2B48C',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: "hidden",
    minHeight: 120,
  },

  notchImage: {
    resizeMode: "cover",
  },

  notchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  notchTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: 'center',
  },

  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  authWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  authWarningText: {
    color: '#b48a64',
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  bookingForm: {
    paddingBottom: 20,
  },
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
  calendarCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  selectedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#b48a64',
    borderColor: '#b48a64',
  },
  timeSlotDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#000',
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
  bookedText: {
    fontSize: 10,
    color: '#ff6b6b',
    marginTop: 4,
  },
  selectedTimeContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  timeSlotHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  specialRequestContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  textArea: {
    height: 100,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  loginRequiredCard: {
    backgroundColor: '#e7f3ff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b3d7ff',
  },
  loginRequiredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginTop: 10,
    marginBottom: 5,
  },
  loginRequiredText: {
    fontSize: 14,
    color: '#0d6efd',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButtons: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testLoginButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testLoginButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  memberInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginLeft: 8,
  },
  memberInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  memberInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  // Booking Type Toggle Styles (sliding pill style)
  bookingTypeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  bookingTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Toggle Switch Styles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  toggleOption: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  toggleActive: {
    color: '#b48a64',
    fontWeight: 'bold',
  },
  priceDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceDescriptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  // Form Group Styles
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  textArea: {
    height: 100,
  },
  guestContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  actionButtons: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  invoiceButton: {
    backgroundColor: '#b48a64',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Multi-date styles
  selectedDatesBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
    paddingHorizontal: 5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
    borderWidth: 1,
    borderColor: '#b48a64',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateBadgeText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  multiDateConfigSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateConfigCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateConfigTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b48a64',
    marginBottom: 10,
  },
  // Rules Section Styles
  policySection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b48a64',
    marginBottom: 15,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  ruleText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    lineHeight: 20,
    flex: 1,
  },
  noRulesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  summarySlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summarySlotDate: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  summarySlotTime: {
    fontSize: 13,
    color: '#b48a64',
    fontWeight: 'bold',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b48a64',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  timePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
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
    backgroundColor: '#b4896449',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default shootsBooking;