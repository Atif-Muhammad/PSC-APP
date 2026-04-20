// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Share,
//   ActivityIndicator,
//   Linking,
//   RefreshControl,
//   ImageBackground,
//   PermissionsAndroid,
//   Platform,
//   Clipboard
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useVoucher } from '../auth/contexts/VoucherContext';
// import socketService from '../../services/socket.service';
// import { voucherAPI } from '../../config/apis';
// import { permissionService } from '../services/PermissionService';
// import ViewShot, { captureRef } from 'react-native-view-shot';
// import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// import { bookingService } from '../../services/bookingService';

// const InvoiceScreen = ({ route, navigation }) => {
//   const { clearVoucher } = useVoucher();
//   const invoiceRef = React.useRef(); // Ref for ViewShot
//   const [saveLoading, setSaveLoading] = useState(false);
//   const {
//     invoiceData: rawInvoiceData,
//     bookingData,
//     photoshoot,
//     memberInfo
//   } = route.params || {};

//   const [invoiceData, setInvoiceData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [shareLoading, setShareLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const loadInvoiceData = useCallback(async () => {
//     if (rawInvoiceData) {
//       console.log('🔄 [Shoot Invoice] Mapping Data. Raw Voucher:', JSON.stringify(rawInvoiceData.voucher, null, 2));

//       let resolvedBookingData = bookingData || {};
//       let resolvedPhotoshoot = photoshoot || {};

//       // Fetch full details if crucial info is missing
//       if (!resolvedBookingData?.bookingDate || !resolvedPhotoshoot?.description) {
//         const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
//         const bType = route.params?.bookingType || 'PHOTOSHOOT';

//         if (bookingId) {
//           try {
//             const res = await voucherAPI.getVoucherByType(bType, bookingId);
//             const fetched = res?.data?.Data || res?.data || {};
//             console.log('🔄 [Shoot Invoice] Fetched details for mapping:', JSON.stringify(fetched, null, 2));

//             if (fetched && Object.keys(fetched).length > 0) {
//               const bInfo = fetched.booking || fetched;

//               // 1. Resolve Time Slot (Check for startTime/endTime pair, or single slot fields)
//               let timeStr = bInfo.timeSlot || bInfo.eventTime || bInfo.time_slot || bInfo.startTime || bInfo.slot;
//               if (bInfo.startTime && bInfo.endTime) {
//                 timeStr = `${bInfo.startTime} - ${bInfo.endTime}`;
//               }

//               resolvedBookingData = {
//                 ...resolvedBookingData,
//                 bookingDate: bInfo.bookingDate || bInfo.eventDate || bInfo.date || resolvedBookingData?.bookingDate,
//                 timeSlot: timeStr || resolvedBookingData?.timeSlot,
//                 selectedDates: bInfo.selectedDates || resolvedBookingData?.selectedDates,
//                 dateConfigurations: bInfo.dateConfigurations || resolvedBookingData?.dateConfigurations,
//                 pricingType: bInfo.pricingType || resolvedBookingData?.pricingType,
//                 numberOfGuests: bInfo.numberOfGuests || bInfo.guests || resolvedBookingData?.numberOfGuests,
//               };

//               // 2. Resolve Photoshoot Package (Check multiple nests and name fields)
//               const pInfo = fetched.photoshoot || fetched.photoShoot || fetched.package || bInfo.photoShoot || bInfo.photoshoot || {};
//               resolvedPhotoshoot = {
//                 ...pInfo,
//                 description: pInfo.description || pInfo.name || pInfo.packageName || pInfo.title || bInfo.photoshootDescription || resolvedPhotoshoot?.description,
//               };

//               console.log('✅ [Shoot Invoice] Resolved Details:', {
//                 package: resolvedPhotoshoot.description,
//                 date: resolvedBookingData.bookingDate,
//                 slot: resolvedBookingData.timeSlot
//               });
//             }
//           } catch (err) {
//             console.warn('⚠️ Fallback fetch failed in loadInvoiceData:', err);
//           }
//         }
//       }

//       /**
//        * STRICT PRIORITY MAPPING LOGIC
//        * Priority 1: Direct Config (dateConfigurations with .time property)
//        * Priority 2: JSON Parsing (bookingDetails with valid selectedDates array)
//        * Priority 3: Regex Fallback (parse voucher.remarks field)
//        */

//       let parsedSelectedDates = null;
//       let parsedDateConfigs = null;
//       let mappingStrategy = 'none';

//       console.log('🔍 [Mapping Strategy] Starting strict priority mapping...', {
//         hasDirectConfig: !!(resolvedBookingData?.selectedDates && resolvedBookingData?.dateConfigurations),
//         hasBookingDetails: !!resolvedBookingData?.bookingDetails,
//         hasRemarks: !!rawInvoiceData.voucher?.remarks
//       });

//       // ════════════════════════════════════════════════════════════
//       // PRIORITY 1: Direct Config (dateConfigurations has keys + time)
//       // ════════════════════════════════════════════════════════════
//       if (
//         resolvedBookingData?.selectedDates && 
//         Array.isArray(resolvedBookingData.selectedDates) && 
//         resolvedBookingData.selectedDates.length > 0 &&
//         resolvedBookingData?.dateConfigurations &&
//         typeof resolvedBookingData.dateConfigurations === 'object'
//       ) {
//         // Validate that at least one date has a time property
//         const hasValidTime = resolvedBookingData.selectedDates.some(date => {
//           const config = resolvedBookingData.dateConfigurations[date];
//           return config && (config.time || config.startTime || config.timeSlot);
//         });

//         if (hasValidTime) {
//           parsedSelectedDates = resolvedBookingData.selectedDates;
//           parsedDateConfigs = resolvedBookingData.dateConfigurations;
//           mappingStrategy = 'direct_config';
//           console.log('✅ [Priority 1] Using DIRECT CONFIG from navigation params');
//           console.log('📊 [Priority 1] Details:', {
//             datesCount: parsedSelectedDates.length,
//             configsCount: Object.keys(parsedDateConfigs).length,
//             sampleDate: parsedSelectedDates[0],
//             sampleConfig: parsedDateConfigs[parsedSelectedDates[0]]
//           });
//         }
//       }

//       // ════════════════════════════════════════════════════════════
//       // PRIORITY 2: JSON Parsing (bookingDetails with valid array)
//       // ════════════════════════════════════════════════════════════
//       if (!parsedSelectedDates && resolvedBookingData?.bookingDetails) {
//         try {
//           console.log('🔍 [Priority 2] Attempting to parse bookingDetails JSON...');

//           const details = typeof resolvedBookingData.bookingDetails === 'string' 
//             ? JSON.parse(resolvedBookingData.bookingDetails) 
//             : resolvedBookingData.bookingDetails;

//           // CRITICAL: Must be non-empty array
//           if (Array.isArray(details) && details.length > 0) {
//             // Validate that each item has required fields
//             const validItems = details.filter(d => d.date && (d.timeSlot || d.time));

//             if (validItems.length > 0) {
//               parsedSelectedDates = validItems.map(d => d.date);
//               parsedDateConfigs = {};

//               validItems.forEach(d => {
//                 if (d.date && d.timeSlot) {
//                   // Extract time from timeSlot (format: "YYYY-MM-DDTHH:mm:ss")
//                   const timePart = d.timeSlot.split('T')[1];
//                   parsedDateConfigs[d.date] = {
//                     time: timePart ? `${timePart.substring(0, 5)}:00` : null
//                   };
//                 } else if (d.date && d.time) {
//                   parsedDateConfigs[d.date] = { time: d.time };
//                 }
//               });

//               mappingStrategy = 'bookingDetails_json';
//               console.log('✅ [Priority 2] Successfully parsed bookingDetails JSON');
//               console.log('📊 [Priority 2] Details:', {
//                 totalItems: details.length,
//                 validItems: validItems.length,
//                 dates: parsedSelectedDates
//               });
//             } else {
//               console.warn('⚠️ [Priority 2] bookingDetails array is empty or invalid - will fall back to Priority 3');
//             }
//           } else {
//             console.warn('⚠️ [Priority 2] bookingDetails is not an array or is empty - will fall back to Priority 3');
//           }
//         } catch (err) {
//           console.error('❌ [Priority 2] Failed to parse bookingDetails:', err.message);
//           console.warn('⚠️ [Priority 2] Will attempt Priority 3 (remarks parsing)');
//         }
//       }

//       // ════════════════════════════════════════════════════════════
//       // PRIORITY 3: Regex Fallback (CRITICAL - parse voucher.remarks)
//       // ════════════════════════════════════════════════════════════
//       if (!parsedSelectedDates && rawInvoiceData.voucher?.remarks) {
//         try {
//           console.log('🔍 [Priority 3] CRITICAL FALLBACK: Parsing remarks field...');
//           console.log('📝 [Priority 3] Remarks content:', rawInvoiceData.voucher.remarks);

//           const remarks = rawInvoiceData.voucher.remarks;

//           // Pattern 1: "Photoshoot booking: Photoshoot on 3/4/2026" or "on 03/04/2026"
//           const pattern1 = /on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i;

//           // Pattern 2: ISO date format "2026-03-04"
//           const pattern2 = /(\d{4}-\d{2}-\d{2})/;

//           // Pattern 3: US format "3/4/2026" without "on" prefix
//           const pattern3 = /(\d{1,2}\/\d{1,2}\/\d{4})/;

//           let extractedDate = null;
//           let matchedPattern = null;

//           // Try Pattern 1 first (most specific)
//           let match = remarks.match(pattern1);
//           if (match && match[1]) {
//             matchedPattern = 'Pattern 1 (on MM/DD/YYYY)';
//             const parts = match[1].split('/');
//             const month = parts[0].padStart(2, '0');
//             const day = parts[1].padStart(2, '0');
//             const year = parts[2];
//             extractedDate = `${year}-${month}-${day}`;
//           }

//           // Try Pattern 2 (ISO format)
//           if (!extractedDate) {
//             match = remarks.match(pattern2);
//             if (match && match[1]) {
//               matchedPattern = 'Pattern 2 (ISO YYYY-MM-DD)';
//               extractedDate = match[1];
//             }
//           }

//           // Try Pattern 3 (US format without "on")
//           if (!extractedDate) {
//             match = remarks.match(pattern3);
//             if (match && match[1]) {
//               matchedPattern = 'Pattern 3 (MM/DD/YYYY)';
//               const parts = match[1].split('/');
//               const month = parts[0].padStart(2, '0');
//               const day = parts[1].padStart(2, '0');
//               const year = parts[2];
//               extractedDate = `${year}-${month}-${day}`;
//             }
//           }

//           // SUCCESS: Date extracted from remarks
//           if (extractedDate) {
//             console.log(`✅ [Priority 3] Extracted date using ${matchedPattern}:`, extractedDate);

//             // Reconstruct time from voucher.issued_at or use current time
//             let reconstructedTime = null;
//             let timeSource = null;

//             if (rawInvoiceData.voucher?.issued_at) {
//               // Use issued_at timestamp as fallback time
//               reconstructedTime = rawInvoiceData.voucher.issued_at;
//               timeSource = 'voucher.issued_at';
//               console.log('🕐 [Priority 3] Using voucher.issued_at for time:', reconstructedTime);
//             } else if (rawInvoiceData.voucher?.expiresAt) {
//               // Fallback to expiresAt
//               reconstructedTime = rawInvoiceData.voucher.expiresAt;
//               timeSource = 'voucher.expiresAt';
//               console.log('🕐 [Priority 3] Using voucher.expiresAt for time:', reconstructedTime);
//             } else {
//               // Last resort: current time
//               reconstructedTime = new Date().toISOString();
//               timeSource = 'current_time';
//               console.log('🕐 [Priority 3] Using current time as last resort:', reconstructedTime);
//             }

//             // Build the final structures
//             parsedSelectedDates = [extractedDate];
//             parsedDateConfigs = {
//               [extractedDate]: {
//                 time: reconstructedTime
//               }
//             };
//             mappingStrategy = 'remarks_regex';

//             console.log('✅ [Priority 3] SUCCESS: Reconstructed data structure from remarks');
//             console.log('📊 [Priority 3] Final structure:', {
//               selectedDates: parsedSelectedDates,
//               dateConfigurations: {
//                 [extractedDate]: {
//                   time: reconstructedTime,
//                   timeType: typeof reconstructedTime,
//                   timeSource: timeSource
//                 }
//               },
//               hasTimeValue: true
//             });
//           } else {
//             console.error('❌ [Priority 3] FAILED: Could not extract date from remarks');
//             console.error('❌ [Priority 3] Tried patterns:', ['Pattern 1', 'Pattern 2', 'Pattern 3']);
//           }
//         } catch (err) {
//           console.error('❌ [Priority 3] Critical error parsing remarks:', err);
//           console.error('❌ [Priority 3] Stack:', err.stack);
//         }
//       }

//       // Log final mapping result
//       if (!parsedSelectedDates) {
//         console.error('❌ [MAPPING FAILED] All three priorities failed!');
//         console.error('❌ [MAPPING FAILED] No structured data available from any source');
//       }

//       const mappedDetails = {
//         invoiceNo: rawInvoiceData.voucher?.invoice_no || rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id || 'N/A',
//         invoiceNumber: rawInvoiceData.voucher?.invoice_no || rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id,
//         consumerNumber: rawInvoiceData.voucher?.consumer_number,
//         amount: rawInvoiceData.voucher?.amount,
//         totalPrice: rawInvoiceData.voucher?.amount,
//         dueDate: rawInvoiceData.due_date || rawInvoiceData.voucher?.expiresAt,
//         status: rawInvoiceData.voucher?.status || 'PENDING',
//         membershipNo: rawInvoiceData.membership?.no || rawInvoiceData.voucher?.membership_no || memberInfo?.membership_no || 'N/A',
//         memberName: rawInvoiceData.membership?.name || rawInvoiceData.voucher?.member?.Name || rawInvoiceData.voucher?.member_name || memberInfo?.member_name || 'N/A',
//         numberOfGuests: rawInvoiceData.voucher?.number_of_guests || resolvedBookingData?.numberOfGuests,
//         // Photoshoot specific - USING PARSED VALUES FROM STRICT PRIORITY LOGIC
//         packageDescription: resolvedPhotoshoot?.description || 'Photoshoot Package',
//         selectedDates: parsedSelectedDates,
//         dateConfigurations: parsedDateConfigs,
//         bookingDate: resolvedBookingData?.bookingDate,
//         timeSlot: resolvedBookingData?.timeSlot,
//         pricingType: resolvedBookingData?.pricingType,
//         remarks: rawInvoiceData.voucher?.remarks,
//         _mappingStrategy: mappingStrategy // Internal tracking
//       };

//       // CRITICAL VALIDATION: Ensure hasTimeValue will be true
//       const firstDate = mappedDetails.selectedDates?.[0];
//       const firstConfig = firstDate ? mappedDetails.dateConfigurations?.[firstDate] : null;
//       const timeValue = firstConfig?.time;

//       console.log('\n═══════════════════════════════════════════════════════════');
//       console.log('📋 [MAPPING FINALIZATION] Complete validation report:');
//       console.log('═══════════════════════════════════════════════════════════');
//       console.log('🎯 Strategy used:', mappingStrategy);
//       console.log('📅 selectedDates:', mappedDetails.selectedDates);
//       console.log('⚙️ dateConfigurations keys:', parsedDateConfigs ? Object.keys(parsedDateConfigs) : 'NONE');

//       if (firstDate && firstConfig) {
//         console.log('✅ First date config found:', {
//           date: firstDate,
//           time: firstConfig.time,
//           timeType: typeof firstConfig.time,
//           timeSource: firstConfig.time instanceof Date ? 'Date object' : typeof firstConfig.time
//         });
//       } else {
//         console.error('❌ NO CONFIG FOUND for first date!');
//       }

//       console.log('⏰ timeValue:', timeValue);
//       console.log('⏰ timeValueType:', typeof timeValue);
//       console.log('✅ hasTimeValue:', !!timeValue);
//       console.log('═══════════════════════════════════════════════════════════\n');

//       // Final safety check
//       if (!timeValue) {
//         console.error('❌❌❌ [CRITICAL] hasTimeValue is FALSE - UI will show N/A! ❌❌❌');
//         console.error('🔍 Debugging checklist:');
//         console.error('  1. ✓ Priority 1 (Direct Config):', !!(resolvedBookingData?.selectedDates && resolvedBookingData?.dateConfigurations));
//         console.error('  2. ✓ Priority 2 (JSON Parsing):', !!(resolvedBookingData?.bookingDetails && resolvedBookingData.bookingDetails.length > 0));
//         console.error('  3. ✓ Priority 3 (Remarks Regex):', !!rawInvoiceData.voucher?.remarks);
//         console.error('  4. Time reconstruction attempted:', mappingStrategy === 'remarks_regex');

//         // Emergency fallback: Try one more time with issued_at
//         if (rawInvoiceData.voucher?.issued_at && mappedDetails.selectedDates?.[0]) {
//           console.warn('⚠️ [Emergency] Attempting last-resort time injection from issued_at...');
//           if (!mappedDetails.dateConfigurations) {
//             mappedDetails.dateConfigurations = {};
//           }
//           const emergencyDate = mappedDetails.selectedDates[0];
//           mappedDetails.dateConfigurations[emergencyDate] = {
//             time: rawInvoiceData.voucher.issued_at
//           };
//           console.warn('✅ [Emergency] Injected time from issued_at:', rawInvoiceData.voucher.issued_at);
//           console.warn('✅ [Emergency] hasTimeValue is now:', !!mappedDetails.dateConfigurations[emergencyDate].time);
//         }
//       } else {
//         console.log('✅✅✅ [SUCCESS] hasTimeValue is TRUE - formatTime will run! ✅✅✅');
//       }

//       setInvoiceData(mappedDetails);
//       setLoading(false);
//     } else {
//       Alert.alert('Error', 'Invoice data not found');
//       navigation.goBack();
//     }
//   }, [rawInvoiceData, bookingData, photoshoot, navigation, route.params, memberInfo]);

//   // handleRefresh - pull-to-refresh that reloads invoice data
//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await loadInvoiceData();
//     } catch (err) {
//       console.warn('Refresh error:', err);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [loadInvoiceData]);

//   useEffect(() => {
//     loadInvoiceData();
//   }, [rawInvoiceData, loadInvoiceData]);

//   // Real-time payment sync - Separate useEffect with proper cleanup
//   useEffect(() => {
//     const voucherId = rawInvoiceData?.voucher?.id;
//     if (!voucherId) return;

//     const unsubscribe = socketService.subscribeToPayment(voucherId, (data) => {
//       if (data.status === 'PAID') {
//         console.log('💰 [Shoot Invoice] Real-time payment detected!');
//         setInvoiceData(prev => prev ? { ...prev, status: 'PAID' } : null);
//       }
//     });

//     return () => {
//       console.log('🧹 [Shoot Invoice] Cleaning up socket subscription');
//       unsubscribe();
//     };
//   }, [rawInvoiceData?.voucher?.id]);

//   const handleCancelBooking = async () => {
//     const bookingId = rawInvoiceData.voucher?.consumer_number;
//     if (!bookingId) {
//       Alert.alert('Error', 'Consumer number not found for cancellation');
//       return;
//     }

//     Alert.alert(
//       'Cancel Booking',
//       'Are you sure you want to cancel this booking request?',
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setBookingLoading(true);
//               await bookingService.deleteBooking(bookingId);
//               await clearVoucher();
//               Alert.alert('Success', 'Booking cancelled successfully');
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'start' }],
//               });
//             } catch (error) {
//               console.error('Error cancelling booking:', error);
//               Alert.alert('Error', error.message || 'Failed to cancel booking. Please try again.');
//             } finally {
//               setBookingLoading(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   // Countdown Timer Logic
//   useEffect(() => {
//     if (!invoiceData?.dueDate || invoiceData?.status === 'PAID') {
//       setTimeLeft('');
//       return;
//     }

//     const targetDate = new Date(invoiceData.dueDate).getTime();

//     // Helper to compute the display string
//     const computeTimeLeft = () => {
//       const now = new Date().getTime();
//       const distance = targetDate - now;
//       if (distance < 0) return 'EXPIRED';
//       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//       let timeStr = '';
//       if (hours > 0) timeStr += `${hours}h `;
//       timeStr += `${minutes}m ${seconds}s`;
//       return timeStr;
//     };

//     // Set the initial value immediately so there is no 1-second blank gap
//     setTimeLeft(computeTimeLeft());

//     const interval = setInterval(() => {
//       const value = computeTimeLeft();
//       setTimeLeft(value);
//       if (value === 'EXPIRED') clearInterval(interval);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [invoiceData?.dueDate, invoiceData?.status]);

//   // handleRefresh is now defined above with loadInvoiceData

//   const handleMakePayment = () => {
//     Alert.alert(
//       'Complete Payment',
//       'Redirect to payment gateway to complete your booking?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Proceed to Payment',
//           onPress: () => {
//             clearVoucher();
//             Alert.alert(
//               'Payment Gateway',
//               'Payment integration would happen here. For now, please check your bookings list after payment completion.',
//               [{ text: 'OK' }]
//             );
//           }
//         }
//       ]
//     );
//   };

//   const handleShareInvoice = async () => {
//     try {
//       setShareLoading(true);
//       if (!invoiceData) return;

//       const slotsText = (() => {
//         // Case 1: Multiple dates with configurations
//         if (invoiceData.selectedDates && Array.isArray(invoiceData.selectedDates)) {
//           return invoiceData.selectedDates.map((date, index) => {
//             const timeValue = invoiceData.dateConfigurations?.[date]?.time;
//             return `• ${formatDate(date)} at ${timeValue ? formatTime(timeValue) : 'N/A'}`;
//           }).join('\n');
//         }

//         // Case 2: Single booking date with time slot
//         if (invoiceData.bookingDate || invoiceData.timeSlot) {
//           return `• ${formatDate(invoiceData.bookingDate)} at ${formatTime(invoiceData.timeSlot)}`;
//         }

//         // Case 3: No data
//         return '• No slots selected';
//       })();

//       const message = `
// 📸 PHOTOSHOOT BOOKING INVOICE

// Invoice Number: ${invoiceData.invoiceNo}
// Consumer Number: ${invoiceData.consumerNumber || 'N/A'}
// Amount: Rs. ${invoiceData.amount}
// Status: ${invoiceData.status}

// 📋 Booking Details:
// • Package: ${invoiceData.packageDescription}
// ${slotsText}

// 👤 Member Information:
// • Name: ${invoiceData.memberName}
// • Membership No: ${invoiceData.membershipNo}

// ${invoiceData.dueDate ? `📅 Payment Due: ${formatDateTime(invoiceData.dueDate)}\n` : ''}

// Thank you for choosing our photoshoot services!
// `.trim();

//       await Share.share({
//         message,
//         title: `Photoshoot Invoice - ${invoiceData.invoiceNo}`,
//       });
//     } catch (error) {
//       console.error('Error sharing:', error);
//       Alert.alert('Error', 'Failed to share invoice');
//     } finally {
//       setShareLoading(false); // Corrected to setShareLoading
//     }
//   };

//   const handleSaveToGallery = async () => {
//     try {
//       setSaveLoading(true);

//       const hasPermission = await permissionService.requestPhotoLibraryPermission();
//       if (!hasPermission) {
//         permissionService.handlePermissionDenied();
//         return;
//       }

//       if (invoiceRef.current) {
//         const uri = await captureRef(invoiceRef, {
//           format: 'png',
//           quality: 1.0,
//         });

//         await CameraRoll.save(uri, { type: 'photo' });
//         Alert.alert('Success', 'Invoice saved to gallery successfully!');
//       } else {
//         Alert.alert('Error', 'Capture reference not found');
//       }

//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       Alert.alert('Error', 'Failed to save invoice. Please try again.');
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return 'N/A';

//     try {
//       let hours, minutes;

//       // Handle Date objects (most common case from dateConfigurations)
//       if (timeString instanceof Date) {
//         hours = timeString.getHours();
//         minutes = timeString.getMinutes();
//         console.log('🕐 formatTime [Date]:', { hours, minutes, original: timeString });
//       }
//       // Handle ISO strings or time strings
//       else if (typeof timeString === 'string') {
//         let timePart = timeString;

//         // Extract time portion from ISO string (e.g., "2024-01-15T14:30:00" -> "14:30")
//         if (timeString.includes('T')) {
//           timePart = timeString.split('T')[1];
//           if (!timePart) return 'N/A'; // No time portion found
//           timePart = timePart.slice(0, 5); // Get HH:MM
//         } else {
//           // Assume it's already a time string, extract first 5 chars (HH:MM)
//           timePart = timeString.slice(0, 5);
//         }

//         // Validate and parse time components
//         const parts = timePart.split(':');
//         hours = parseInt(parts[0], 10);
//         minutes = parseInt(parts[1], 10);

//         // Validate parsed values
//         if (isNaN(hours) || isNaN(minutes)) {
//           console.warn('⚠️ Invalid time format:', timeString);
//           return 'N/A';
//         }

//         console.log('🕐 formatTime [String]:', { hours, minutes, original: timeString });
//       }
//       // For any other type, try to convert
//       else {
//         console.warn('⚠️ Unexpected time format, attempting conversion:', typeof timeString, timeString);
//         const dateObj = new Date(timeString);
//         if (isNaN(dateObj.getTime())) {
//           return 'N/A';
//         }
//         hours = dateObj.getHours();
//         minutes = dateObj.getMinutes();
//       }

//       // Format the time in 12-hour format
//       const ampm = hours >= 12 ? 'PM' : 'AM';
//       const hour12 = hours % 12 || 12;
//       const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
//       console.log('✅ formatTime result:', formattedTime);
//       return formattedTime;

//     } catch (error) {
//       console.error('❌ formatTime error:', error);
//       return 'N/A';
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusUpper = (status || '').toUpperCase();
//     switch (statusUpper) {
//       case 'CONFIRMED':
//       case 'PAID':
//         return {
//           text: 'CONFIRMED',
//           style: styles.statusConfirmed,
//           textColor: '#2e7d32',
//           icon: 'check-circle'
//         };
//       case 'PENDING_PAYMENT':
//       case 'PENDING':
//         return {
//           text: 'PAYMENT PENDING',
//           style: styles.statusPending,
//           textColor: '#dc3545',
//           icon: 'payment'
//         };
//       default:
//         return {
//           text: status || 'PENDING',
//           style: styles.statusPending,
//           textColor: '#dc3545',
//           icon: 'schedule'
//         };
//     }
//   };

//   const statusInfo = getStatusBadge(invoiceData?.status);

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
//         <ImageBackground
//           source={require("../../assets/notch.jpg")}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchRow}>
//             <TouchableOpacity onPress={() => navigation.navigate('shoots')} style={styles.iconWrapper}>
//               <MaterialIcons name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.notchTitle}>Photoshoot Invoice</Text>
//             <View style={styles.iconWrapper} />
//           </View>
//         </ImageBackground>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#b48a64" />
//           <Text style={styles.loadingText}>Generating your invoice...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

//       <ImageBackground
//         source={require("../../assets/notch.jpg")}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchRow}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
//             <MaterialIcons name="arrow-back" size={28} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.notchTitle}>Shoot Invoice</Text>
//           <View style={styles.iconWrapper} />


//         </View>
//       </ImageBackground>

//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={['#b48a64']}
//           />
//         }
//       >
//         <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={{ backgroundColor: '#f9f3eb' }}>
//           <View style={styles.invoiceContainer}>
//             {/* Invoice Header */}
//             <View style={styles.invoiceHeader}>
//               <MaterialIcons
//                 name={statusInfo.icon}
//                 size={40}
//                 color="#b48a64"
//               />
//               <Text style={styles.invoiceTitle}>
//                 PHOTOSHOOT BOOKING VOUCHER
//               </Text>
//               <Text style={styles.invoiceSubtitle}>
//                 Complete payment to confirm your booking
//               </Text>
//               {timeLeft && timeLeft !== 'EXPIRED' && invoiceData?.status !== 'PAID' && (
//                 <View style={styles.timerWrapper}>
//                   <View style={styles.timerContainer}>
//                     <MaterialIcons name="schedule" size={16} color="#dc3545" />
//                     <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.cancelVoucherGhostButton}
//                     onPress={handleCancelBooking}
//                   >
//                     <MaterialIcons name="close" size={14} color="#666" />
//                     <Text style={styles.cancelVoucherGhostText}>Cancel Booking</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//               {timeLeft === 'EXPIRED' && (
//                 <View style={styles.timerWrapper}>
//                   <View style={styles.timerContainer}>
//                     <MaterialIcons name="warning" size={16} color="#dc3545" />
//                     <Text style={styles.expiredText}>EXPIRED</Text>
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Payment Required Alert
//             {invoiceData?.status !== 'PAID' && (
//               <View style={styles.paymentAlert}>
//                 <MaterialIcons name="payment" size={20} color="#856404" />
//                 <View style={styles.paymentAlertContent}>
//                   <Text style={styles.paymentAlertTitle}>Payment Required</Text>
//                   <Text style={styles.paymentAlertText}>
//                     Complete payment within 1 hour to secure your booking.
//                   </Text>
//                   <TouchableOpacity
//                     style={[styles.paymentButton, timeLeft === 'EXPIRED' && { backgroundColor: '#ccc' }]}
//                     onPress={handleMakePayment}
//                     disabled={timeLeft === 'EXPIRED'}
//                   >
//                     <Text style={styles.paymentButtonText}>Make Payment Now</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )} */}

//             {/* Invoice Details */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>Invoice Details</Text>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Invoice Number:</Text>
//                 <Text style={[styles.detailValue, styles.invoiceHighlight]}>
//                   {invoiceData.invoiceNo}
//                 </Text>
//               </View>

//               {invoiceData.consumerNumber && (
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Consumer Number:</Text>
//                   <TouchableOpacity
//                     onPress={() => {
//                       Clipboard.setString(invoiceData.consumerNumber);
//                       // Alert.alert('Copied', 'Consumer number copied to clipboard');
//                     }}
//                     style={styles.copyContainer}
//                   >
//                     <Text style={[styles.detailValue, styles.invoiceHighlight]}>
//                       {invoiceData.consumerNumber}
//                     </Text>
//                     <MaterialIcons name="content-copy" size={16} color="#b48a64" style={{ marginLeft: 8 }} />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Status:</Text>
//                 <View style={[styles.statusBadge, statusInfo.style]}>
//                   <Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text>
//                 </View>
//               </View>

//               {invoiceData.dueDate && (
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Payment Due:</Text>
//                   <Text style={[styles.detailValue, styles.dueDate]}>
//                     {formatDateTime(invoiceData.dueDate)}
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Member Name:</Text>
//                 <Text style={styles.detailValue}>{invoiceData.memberName}</Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Membership No:</Text>
//                 <Text style={styles.detailValue}>{invoiceData.membershipNo}</Text>
//               </View>

//               {invoiceData.numberOfGuests && (
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Guests:</Text>
//                   <Text style={styles.detailValue}>{invoiceData.numberOfGuests} people</Text>
//                 </View>
//               )}

//               {/* {invoiceData?.status !== 'PAID' && (
//                 <TouchableOpacity
//                   style={styles.cardFooterAction}
//                   onPress={handleCancelBooking}
//                   disabled={bookingLoading}
//                 >
//                   {bookingLoading ? (
//                     <ActivityIndicator size="small" color="#dc3545" />
//                   ) : (
//                     <>
//                       <Text style={styles.cardFooterActionText}>Cancel This Booking</Text>
//                       <MaterialIcons name="chevron-right" size={18} color="#dc3545" />
//                     </>
//                   )}
//                 </TouchableOpacity>
//               )} */}
//             </View>

//             {/* Booking Summary */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>Photoshoot Summary</Text>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Package:</Text>
//                 <Text style={styles.detailValue}>{invoiceData.packageDescription}</Text>
//               </View>

//               <View style={styles.divider} />
//               <Text style={[styles.detailLabel, { marginBottom: 10, fontWeight: 'bold' }]}>Selected Slots:</Text>

//               {(() => {
//                 // Comprehensive debug logging
//                 console.log('🔍 [Selected Slots Render] Starting render logic...');
//                 console.log('📅 [Selected Slots] selectedDates:', invoiceData.selectedDates);
//                 console.log('⚙️ [Selected Slots] dateConfigurations:', invoiceData.dateConfigurations);

//                 // Helper function to extract time from various data structures
//                 const extractTimeFromConfig = (config, dateKey) => {
//                   if (!config) {
//                     console.warn(`⚠️ [Extract] No config object for ${dateKey}`);
//                     return null;
//                   }

//                   console.log(`🔎 [Extract] Checking config for ${dateKey}:`, JSON.stringify(config));

//                   // Case A: Direct time property (most common)
//                   if (config.time) {
//                     console.log(`✅ [Extract] Found direct .time for ${dateKey}:`, config.time, 'Type:', typeof config.time);
//                     return config.time;
//                   }

//                   // Case B: slots as array
//                   if (Array.isArray(config.slots)) {
//                     const timeVal = config.slots[0]?.time || config.slots[0];
//                     console.log(`✅ [Extract] Found .slots array for ${dateKey}:`, timeVal);
//                     return timeVal;
//                   }

//                   // Case C: slots as object
//                   if (typeof config.slots === 'object' && config.slots !== null) {
//                     const timeVal = config.slots.time || config.slots.startTime || config.slots.slot;
//                     console.log(`✅ [Extract] Found .slots object for ${dateKey}:`, timeVal);
//                     return timeVal;
//                   }

//                   // Case D: Check for startTime/endTime directly in config
//                   if (config.startTime) {
//                     console.log(`✅ [Extract] Found .startTime for ${dateKey}:`, config.startTime);
//                     return config.startTime;
//                   }

//                   // Case E: Check for timeSlot (ISO string)
//                   if (config.timeSlot) {
//                     console.log(`✅ [Extract] Found .timeSlot for ${dateKey}:`, config.timeSlot);
//                     return config.timeSlot;
//                   }

//                   console.warn(`⚠️ [Extract] No time value found in config for ${dateKey}`);
//                   console.warn('⚠️ [Extract] Available keys:', Object.keys(config));
//                   return null;
//                 };

//                 // Case 1: Multiple dates with configurations
//                 if (invoiceData.selectedDates && Array.isArray(invoiceData.selectedDates) && invoiceData.selectedDates.length > 0) {
//                   console.log('📋 [Selected Slots] Rendering multiple dates:', invoiceData.selectedDates.length);

//                   return invoiceData.selectedDates.map((date, index) => {
//                     const config = invoiceData.dateConfigurations?.[date];
//                     console.log(`\n🔎 [Slot ${index + 1}] Processing date: ${date}`);
//                     console.log(`🔎 [Slot ${index + 1}] Configuration object:`, JSON.stringify(config));

//                     const timeValue = extractTimeFromConfig(config, date);
//                     console.log(`🕐 [Slot ${index + 1}] Extracted timeValue:`, timeValue);
//                     console.log(`🕐 [Slot ${index + 1}] formatTime result:`, timeValue ? formatTime(timeValue) : 'N/A');

//                     return (
//                       <View key={`${date}-${index}`} style={styles.slotRow}>
//                         <View style={styles.slotDateBox}>
//                           <Text style={styles.detailLabelSmall}>{formatDate(date)}</Text>
//                         </View>
//                         <View style={styles.slotTimeBox}>
//                           <Text style={styles.detailValueSmall}>
//                             {timeValue ? formatTime(timeValue) : 'N/A'}
//                           </Text>
//                         </View>
//                       </View>
//                     );
//                   });
//                 }

//                 // Case 2: Single booking date with time slot
//                 if (invoiceData.bookingDate || invoiceData.timeSlot) {
//                   console.log('📋 [Selected Slots] Rendering single date fallback');
//                   return (
//                     <View style={styles.slotRow}>
//                       <View style={styles.slotDateBox}>
//                         <Text style={styles.detailLabelSmall}>{formatDate(invoiceData.bookingDate)}</Text>
//                       </View>
//                       <View style={styles.slotTimeBox}>
//                         <Text style={styles.detailValueSmall}>
//                           {formatTime(invoiceData.timeSlot)}
//                         </Text>
//                       </View>
//                     </View>
//                   );
//                 }

//                 // Case 3: No data available
//                 console.log('⚠️ [Selected Slots] No data available, showing N/A');
//                 return (
//                   <View style={styles.slotRow}>
//                     <View style={styles.slotDateBox}>
//                       <Text style={styles.detailLabelSmall}>No slots selected</Text>
//                     </View>
//                     <View style={styles.slotTimeBox}>
//                       <Text style={styles.detailValueSmall}>N/A</Text>
//                     </View>
//                   </View>
//                 );
//               })()}
//             </View>

//             {/* Payment Details */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>Payment Details</Text>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Total Amount:</Text>
//                 <Text style={[styles.detailValue, styles.amount]}>
//                   Rs. {invoiceData.amount ? parseFloat(invoiceData.amount).toLocaleString() : '0.00'}/-
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Payment Status:</Text>
//                 <View style={[styles.statusBadge, invoiceData.status === 'PAID' ? styles.statusConfirmed : styles.pendingBadge]}>
//                   <Text style={styles.statusText}>{invoiceData.status}</Text>
//                 </View>
//               </View>
//             </View>

//             {/* Important Information */}
//             <View style={[styles.invoiceSection, { marginTop: 5 }]}>
//               <Text style={styles.sectionTitle}>Important Information</Text>
//               <View style={styles.instructionItem}>
//                 <MaterialIcons name="info-outline" size={16} color="#b48a64" />
//                 <Text style={styles.instructionText}>
//                   {invoiceData.remarks || 'Complete payment within 1 hour to secure your booking'}
//                 </Text>
//               </View>
//               <View style={styles.instructionItem}>
//                 <MaterialIcons name="info-outline" size={16} color="#b48a64" />
//                 <Text style={styles.instructionText}>Present this voucher at the club office for verification</Text>
//               </View>
//             </View>

//           </View>
//         </ViewShot>

//         <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}>
//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             {/* <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={handleRefresh}
//               disabled={refreshing}
//             >
//               <MaterialIcons name="refresh" size={20} color="#b48a64" />
//               <Text style={styles.secondaryButtonText}>
//                 {refreshing ? 'Refreshing...' : 'Refresh'}
//               </Text>
//             </TouchableOpacity> */}

//             {/* <TouchableOpacity
//               style={styles.shareButton}
//               onPress={handleShareInvoice}
//               disabled={shareLoading}
//             >
//               <MaterialIcons name="share" size={20} color="#fff" />
//               <Text style={styles.shareButtonText}>
//                 {shareLoading ? 'Sharing...' : 'Share'}
//               </Text>
//             </TouchableOpacity> */}
//           </View>

//           {/* Download Invoice Button */}
//           <TouchableOpacity
//             style={styles.downloadButton}
//             onPress={handleSaveToGallery}
//             disabled={saveLoading}
//           >
//             {saveLoading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <>
//                 <MaterialIcons name="file-download" size={20} color="#fff" />
//                 <Text style={styles.downloadButtonText}>Save to Gallery</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {/* Complete Payment Button */}
//           {/* {invoiceData?.status !== 'PAID' && (
//             <TouchableOpacity
//               style={[styles.paymentActionButton, timeLeft === 'EXPIRED' && { backgroundColor: '#ccc' }]}
//               onPress={handleMakePayment}
//               disabled={timeLeft === 'EXPIRED'}
//             >
//               <MaterialIcons name="payment" size={20} color="#fff" />
//               <Text style={styles.paymentActionButtonText}>Complete Payment Now</Text>
//             </TouchableOpacity>
//           )} */}

//           {/* <TouchableOpacity
//             style={styles.primaryButton}
//             onPress={() => navigation.navigate('Home')}
//           >
//             <MaterialIcons name="home" size={20} color="#fff" />
//             <Text style={styles.primaryButtonText}>Back to Home</Text>
//           </TouchableOpacity> */}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9f3eb' },
//   notch: {
//     paddingTop: 50,
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
//     paddingBottom: 10,
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
//   copyContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     flex: 1,
//   },
//   content: { flex: 1 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   invoiceContainer: {
//     padding: 15,
//   },
//   invoiceHeader: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 15,
//     marginBottom: 20,
//   },
//   invoiceTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2e7d32',
//     marginTop: 10,
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   invoiceSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
//   paymentAlert: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#fff3cd',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffc107',
//   },
//   paymentAlertContent: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   paymentAlertTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#856404',
//     marginBottom: 5,
//   },
//   paymentAlertText: {
//     fontSize: 14,
//     color: '#856404',
//     lineHeight: 18,
//     marginBottom: 10,
//   },
//   paymentButton: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   paymentButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   invoiceSection: {
//     backgroundColor: '#fff',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 8,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//     flex: 1,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2e7d32',
//   },
//   dueDate: {
//     color: '#dc3545',
//     fontWeight: 'bold',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusConfirmed: {
//     backgroundColor: '#d4efdf', // Same green as Lawn/Hall
//   },
//   statusPending: {
//     backgroundColor: '#fadbd8', // Same red as Lawn/Hall
//   },
//   invoiceHighlight: {
//     color: '#b48a64',
//     fontWeight: 'bold',
//   },
//   timerWrapper: {
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff1f0',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#ffa39e',
//   },
//   cancelVoucherGhostButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#d9d9d9',
//     backgroundColor: 'transparent',
//   },
//   cancelVoucherGhostText: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: '#666',
//     marginLeft: 4,
//   },
//   timerText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#dc3545',
//   },
//   cardFooterAction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   cardFooterActionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#dc3545',
//     marginRight: 4,
//   },
//   expiredText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#dc3545',
//   },
//   pendingBadge: {
//     backgroundColor: '#fff3cd',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   instructionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   instructionText: {
//     fontSize: 13,
//     color: '#666',
//     marginLeft: 10,
//     flex: 1,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 15,
//   },
//   secondaryButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#b48a64',
//     backgroundColor: 'transparent',
//     gap: 8,
//   },
//   secondaryButtonText: {
//     color: '#b48a64',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   shareButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: '#2196f3',
//     gap: 8,
//   },
//   shareButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   downloadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#b48a64',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//     gap: 8,
//   },
//   downloadButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   paymentActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#bdaea1ff',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//     gap: 8,
//   },
//   paymentActionButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   primaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: '#b48a64',
//     gap: 8,
//     marginBottom: 30,
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#eee',
//     marginVertical: 12,
//   },
//   slotRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//     paddingVertical: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   slotDateBox: {
//     flex: 1.5,
//   },
//   slotTimeBox: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   detailLabelSmall: {
//     fontSize: 13,
//     color: '#777',
//   },
//   detailValueSmall: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#000',
//   },
// });

// export default InvoiceScreen;


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Share,
  ActivityIndicator,
  Linking,
  RefreshControl,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  Clipboard
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useVoucher } from '../auth/contexts/VoucherContext';
import socketService from '../../services/socket.service';
import { voucherAPI } from '../../config/apis';
import { permissionService } from '../services/PermissionService';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { bookingService } from '../../services/bookingService';
import eventBus from '../../services/eventBus';

const InvoiceScreen = ({ route, navigation }) => {
  const { clearVoucher } = useVoucher();
  const invoiceRef = React.useRef(); // Ref for ViewShot
  const [saveLoading, setSaveLoading] = useState(false);
  const {
    invoiceData: rawInvoiceData,
    bookingData,
    photoshoot,
    memberInfo
  } = route.params || {};

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const loadInvoiceData = useCallback(async () => {
    if (rawInvoiceData) {
      const initialStatus = String(rawInvoiceData?.voucher?.status || '').toUpperCase();
      if (initialStatus === 'CANCELLED' || initialStatus === 'CANCELED') {
        await clearVoucher();
        Alert.alert('Booking Cancelled', 'This voucher is no longer active.');
        navigation.reset({ index: 0, routes: [{ name: 'start' }] });
        return;
      }

      console.log('🔄 [Shoot Invoice] Mapping Data. Raw Voucher:', JSON.stringify(rawInvoiceData.voucher, null, 2));

      let resolvedBookingData = bookingData || {};
      let resolvedPhotoshoot = photoshoot || {};

      // Fetch full details if crucial info is missing
      // Note: selectedDates with multiple dates is valid even without bookingDate
      const hasValidDateInfo = resolvedBookingData?.bookingDate ||
        (resolvedBookingData?.selectedDates?.length > 0);

      if (!hasValidDateInfo || !resolvedPhotoshoot?.description) {
        const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
        const bType = route.params?.bookingType || 'PHOTOSHOOT';

        if (bookingId) {
          try {
            const res = await voucherAPI.getVoucherByType(bType, bookingId);
            const fetched = res?.data?.Data || res?.data || {};
            console.log('🔄 [Shoot Invoice] Fetched details for mapping:', JSON.stringify(fetched, null, 2));

            if (fetched && Object.keys(fetched).length > 0) {
              const bInfo = fetched.booking || fetched;

              // 1. Resolve Time Slot (Check for startTime/endTime pair, or single slot fields)
              let timeStr = bInfo.timeSlot || bInfo.eventTime || bInfo.time_slot || bInfo.startTime || bInfo.slot;
              if (bInfo.startTime && bInfo.endTime) {
                timeStr = `${bInfo.startTime} - ${bInfo.endTime}`;
              }

              // CRITICAL: Preserve original selectedDates/dateConfigurations from navigation params
              // The API might return single bookingDate instead of multiple selectedDates
              const hasOriginalMultiDateData = resolvedBookingData?.selectedDates?.length > 1;

              resolvedBookingData = {
                ...resolvedBookingData,
                bookingDate: bInfo.bookingDate || bInfo.eventDate || bInfo.date || resolvedBookingData?.bookingDate,
                timeSlot: timeStr || resolvedBookingData?.timeSlot,
                // Only use API selectedDates if we don't already have multi-date data from params
                selectedDates: hasOriginalMultiDateData
                  ? resolvedBookingData.selectedDates
                  : (bInfo.selectedDates || resolvedBookingData?.selectedDates),
                dateConfigurations: hasOriginalMultiDateData
                  ? resolvedBookingData.dateConfigurations
                  : (bInfo.dateConfigurations || resolvedBookingData?.dateConfigurations),
                pricingType: bInfo.pricingType || resolvedBookingData?.pricingType,
                guestName: bInfo.guestName || bInfo.guest_name || resolvedBookingData?.guestName,
                guestContact: bInfo.guestContact || bInfo.guest_contact || bInfo.contact || bInfo.phone || bInfo.phone_number || resolvedBookingData?.guestContact,
                numberOfGuests: bInfo.numberOfGuests || bInfo.guests || resolvedBookingData?.numberOfGuests,
              };

              console.log('🔄 [Shoot Invoice] Merged booking data:', {
                hasOriginalMultiDateData,
                selectedDatesCount: resolvedBookingData.selectedDates?.length,
                dateConfigurationsKeys: resolvedBookingData.dateConfigurations ? Object.keys(resolvedBookingData.dateConfigurations) : 'none'
              });

              // 2. Resolve Photoshoot Package (Check multiple nests and name fields)
              const pInfo = fetched.photoshoot || fetched.photoShoot || fetched.package || bInfo.photoShoot || bInfo.photoshoot || {};
              resolvedPhotoshoot = {
                ...pInfo,
                description: pInfo.description || pInfo.name || pInfo.packageName || pInfo.title || bInfo.photoshootDescription || resolvedPhotoshoot?.description,
              };

              console.log('✅ [Shoot Invoice] Resolved Details:', {
                package: resolvedPhotoshoot.description,
                date: resolvedBookingData.bookingDate,
                slot: resolvedBookingData.timeSlot
              });
            }
          } catch (err) {
            console.warn('⚠️ Fallback fetch failed in loadInvoiceData:', err);
          }
        }
      }

      /**
       * STRICT PRIORITY MAPPING LOGIC
       * Priority 1: Direct Config (dateConfigurations with .time property)
       * Priority 2: JSON Parsing (bookingDetails with valid selectedDates array)
       * Priority 3: Regex Fallback (parse voucher.remarks field)
       */

      let parsedSelectedDates = null;
      let parsedDateConfigs = null;
      let mappingStrategy = 'none';
      let bookingDetailsValidCount = 0;

      if (resolvedBookingData?.bookingDetails) {
        try {
          const detailsForCount =
            typeof resolvedBookingData.bookingDetails === 'string'
              ? JSON.parse(resolvedBookingData.bookingDetails)
              : resolvedBookingData.bookingDetails;
          if (Array.isArray(detailsForCount)) {
            bookingDetailsValidCount = detailsForCount.filter(
              d => d?.date && (d?.timeSlot || d?.time)
            ).length;
          }
        } catch (err) {
          console.warn('⚠️ Could not pre-count bookingDetails items:', err?.message || err);
        }
      }

      console.log('🔍 [Mapping Strategy] Starting strict priority mapping...', {
        hasDirectConfig: !!(resolvedBookingData?.selectedDates && resolvedBookingData?.dateConfigurations),
        hasBookingDetails: !!resolvedBookingData?.bookingDetails,
        hasRemarks: !!rawInvoiceData.voucher?.remarks
      });

      // ════════════════════════════════════════════════════════════
      // PRIORITY 1: Direct Config (dateConfigurations has keys + time)
      // ════════════════════════════════════════════════════════════
      if (
        resolvedBookingData?.selectedDates &&
        Array.isArray(resolvedBookingData.selectedDates) &&
        resolvedBookingData.selectedDates.length > 0 &&
        resolvedBookingData?.dateConfigurations &&
        typeof resolvedBookingData.dateConfigurations === 'object'
      ) {
        // Validate that at least one date has a time property
        const hasValidTime = resolvedBookingData.selectedDates.some(date => {
          const config = resolvedBookingData.dateConfigurations[date];
          return config && (config.time || config.startTime || config.timeSlot);
        });

        const shouldPreferBookingDetails =
          bookingDetailsValidCount > resolvedBookingData.selectedDates.length;

        if (hasValidTime && !shouldPreferBookingDetails) {
          parsedSelectedDates = resolvedBookingData.selectedDates;
          // Normalize dateConfigurations to ensure time is in correct format
          parsedDateConfigs = {};
          resolvedBookingData.selectedDates.forEach(date => {
            const config = resolvedBookingData.dateConfigurations[date];
            if (config) {
              // Try to extract time from various possible formats
              let timeValue = config.time || config.startTime || config.timeSlot;

              parsedDateConfigs[date] = {
                ...config,
                time: timeValue
              };
            }
          });
          mappingStrategy = 'direct_config';
          console.log('✅ [Priority 1] Using DIRECT CONFIG from navigation params');
          console.log('📊 [Priority 1] Details:', {
            datesCount: parsedSelectedDates.length,
            configsCount: Object.keys(parsedDateConfigs).length,
            sampleDate: parsedSelectedDates[0],
            sampleConfig: parsedDateConfigs[parsedSelectedDates[0]]
          });
        } else if (shouldPreferBookingDetails) {
          console.log('↪️ [Priority 1] Skipped direct config because bookingDetails has more slots', {
            directConfigCount: resolvedBookingData.selectedDates.length,
            bookingDetailsValidCount,
          });
        }
      }

      // ════════════════════════════════════════════════════════════
      // PRIORITY 2: JSON Parsing (bookingDetails with valid array)
      // ════════════════════════════════════════════════════════════
      if (!parsedSelectedDates && resolvedBookingData?.bookingDetails) {
        try {
          console.log('🔍 [Priority 2] Attempting to parse bookingDetails JSON...');

          const details = typeof resolvedBookingData.bookingDetails === 'string'
            ? JSON.parse(resolvedBookingData.bookingDetails)
            : resolvedBookingData.bookingDetails;

          // CRITICAL: Must be non-empty array
          if (Array.isArray(details) && details.length > 0) {
            // Validate that each item has required fields
            const validItems = details.filter(d => d.date && (d.timeSlot || d.time));

            if (validItems.length > 0) {
              parsedSelectedDates = validItems.map(d => d.date);
              parsedDateConfigs = {};

              validItems.forEach(d => {
                if (d.date && d.timeSlot) {
                  parsedDateConfigs[d.date] = {
                    // Preserve full time value (including timezone) for accurate display conversion.
                    time: d.timeSlot
                  };
                } else if (d.date && d.time) {
                  parsedDateConfigs[d.date] = { time: d.time };
                }
              });

              mappingStrategy = 'bookingDetails_json';
              console.log('✅ [Priority 2] Successfully parsed bookingDetails JSON');
              console.log('📊 [Priority 2] Details:', {
                totalItems: details.length,
                validItems: validItems.length,
                dates: parsedSelectedDates
              });
            } else {
              console.warn('⚠️ [Priority 2] bookingDetails array is empty or invalid - will fall back to Priority 3');
            }
          } else {
            console.warn('⚠️ [Priority 2] bookingDetails is not an array or is empty - will fall back to Priority 3');
          }
        } catch (err) {
          console.error('❌ [Priority 2] Failed to parse bookingDetails:', err.message);
          console.warn('⚠️ [Priority 2] Will attempt Priority 3 (remarks parsing)');
        }
      }

      // ════════════════════════════════════════════════════════════
      // PRIORITY 3: Regex Fallback (CRITICAL - parse voucher.remarks)
      // ════════════════════════════════════════════════════════════
      if (!parsedSelectedDates && rawInvoiceData.voucher?.remarks) {
        try {
          console.log('🔍 [Priority 3] CRITICAL FALLBACK: Parsing remarks field...');
          console.log('📝 [Priority 3] Remarks content:', rawInvoiceData.voucher.remarks);

          const remarks = rawInvoiceData.voucher.remarks;

          // Pattern 1: "Photoshoot booking: Photoshoot on 3/4/2026" or "on 03/04/2026"
          const pattern1 = /on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i;

          // Pattern 2: ISO date format "2026-03-04"
          const pattern2 = /(\d{4}-\d{2}-\d{2})/;

          // Pattern 3: US format "3/4/2026" without "on" prefix
          const pattern3 = /(\d{1,2}\/\d{1,2}\/\d{4})/;

          // Pattern 4: Time pattern - "at 14:30" or "at 2:30 PM" or "14:30:00"
          const timePattern1 = /at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i;
          const timePattern2 = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i;

          let extractedDate = null;
          let matchedPattern = null;

          // Try Pattern 1 first (most specific)
          let match = remarks.match(pattern1);
          if (match && match[1]) {
            matchedPattern = 'Pattern 1 (on MM/DD/YYYY)';
            const parts = match[1].split('/');
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            extractedDate = `${year}-${month}-${day}`;
          }

          // Try Pattern 2 (ISO format)
          if (!extractedDate) {
            match = remarks.match(pattern2);
            if (match && match[1]) {
              matchedPattern = 'Pattern 2 (ISO YYYY-MM-DD)';
              extractedDate = match[1];
            }
          }

          // Try Pattern 3 (US format without "on")
          if (!extractedDate) {
            match = remarks.match(pattern3);
            if (match && match[1]) {
              matchedPattern = 'Pattern 3 (MM/DD/YYYY)';
              const parts = match[1].split('/');
              const month = parts[0].padStart(2, '0');
              const day = parts[1].padStart(2, '0');
              const year = parts[2];
              extractedDate = `${year}-${month}-${day}`;
            }
          }

          // SUCCESS: Date extracted from remarks
          if (extractedDate) {
            console.log(`✅ [Priority 3] Extracted date using ${matchedPattern}:`, extractedDate);

            // Try to extract time from remarks first
            let extractedTime = null;
            let timeMatch = remarks.match(timePattern1);
            if (!timeMatch) {
              timeMatch = remarks.match(timePattern2);
            }

            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10);
              const minutes = timeMatch[2];
              const ampm = timeMatch[4] ? timeMatch[4].toUpperCase() : null;

              // Convert to 24-hour format if PM
              let hours24 = hours;
              if (ampm === 'PM' && hours !== 12) {
                hours24 = hours + 12;
              } else if (ampm === 'AM' && hours === 12) {
                hours24 = 0;
              }

              extractedTime = `${hours24.toString().padStart(2, '0')}:${minutes}:00`;
              console.log('🕐 [Priority 3] Extracted time from remarks:', extractedTime);
            }

            // Reconstruct time - prefer extracted time from remarks, fallback to voucher timestamps
            let reconstructedTime = null;
            let timeSource = null;

            if (extractedTime) {
              // Use the time extracted from remarks
              reconstructedTime = `${extractedDate}T${extractedTime}`;
              timeSource = 'remarks_time';
              console.log('🕐 [Priority 3] Using extracted time from remarks:', reconstructedTime);
            } else if (rawInvoiceData.voucher?.issued_at) {
              // Use issued_at timestamp as fallback time
              reconstructedTime = rawInvoiceData.voucher.issued_at;
              timeSource = 'voucher.issued_at';
              console.log('🕐 [Priority 3] Using voucher.issued_at for time:', reconstructedTime);
            } else if (rawInvoiceData.voucher?.expiresAt) {
              // Fallback to expiresAt
              reconstructedTime = rawInvoiceData.voucher.expiresAt;
              timeSource = 'voucher.expiresAt';
              console.log('🕐 [Priority 3] Using voucher.expiresAt for time:', reconstructedTime);
            } else {
              // Last resort: current time
              reconstructedTime = new Date().toISOString();
              timeSource = 'current_time';
              console.log('🕐 [Priority 3] Using current time as last resort:', reconstructedTime);
            }

            // Build the final structures
            parsedSelectedDates = [extractedDate];
            parsedDateConfigs = {
              [extractedDate]: {
                time: reconstructedTime
              }
            };
            mappingStrategy = 'remarks_regex';

            console.log('✅ [Priority 3] SUCCESS: Reconstructed data structure from remarks');
            console.log('📊 [Priority 3] Final structure:', {
              selectedDates: parsedSelectedDates,
              dateConfigurations: {
                [extractedDate]: {
                  time: reconstructedTime,
                  timeType: typeof reconstructedTime,
                  timeSource: timeSource
                }
              },
              hasTimeValue: true
            });
          } else {
            console.error('❌ [Priority 3] FAILED: Could not extract date from remarks');
            console.error('❌ [Priority 3] Tried patterns:', ['Pattern 1', 'Pattern 2', 'Pattern 3']);
          }
        } catch (err) {
          console.error('❌ [Priority 3] Critical error parsing remarks:', err);
          console.error('❌ [Priority 3] Stack:', err.stack);
        }
      }

      // Log final mapping result
      if (!parsedSelectedDates) {
        console.error('❌ [MAPPING FAILED] All three priorities failed!');
        console.error('❌ [MAPPING FAILED] No structured data available from any source');
      }

      const resolvedPricingType = String(
        resolvedBookingData?.pricingType ||
        rawInvoiceData?.voucher?.pricingType ||
        rawInvoiceData?.voucher?.pricing_type ||
        ''
      ).toLowerCase();

      const resolvedGuestName =
        resolvedBookingData?.guestName ||
        resolvedBookingData?.guest_name ||
        rawInvoiceData?.voucher?.guestName ||
        rawInvoiceData?.voucher?.guest_name ||
        rawInvoiceData?.voucher?.guest?.name ||
        null;

      const resolvedGuestContact =
        resolvedBookingData?.guestContact ||
        resolvedBookingData?.guest_contact ||
        resolvedBookingData?.contact ||
        resolvedBookingData?.phone ||
        resolvedBookingData?.phone_number ||
        rawInvoiceData?.voucher?.guestContact ||
        rawInvoiceData?.voucher?.guest_contact ||
        rawInvoiceData?.voucher?.contact ||
        rawInvoiceData?.voucher?.phone ||
        rawInvoiceData?.voucher?.phone_number ||
        rawInvoiceData?.voucher?.guest?.contact ||
        rawInvoiceData?.voucher?.guest?.phone ||
        null;

      const mappedDetails = {
        invoiceNo: rawInvoiceData.voucher?.invoice_no || rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id || 'N/A',
        invoiceNumber: rawInvoiceData.voucher?.invoice_no || rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id,
        consumerNumber: rawInvoiceData.voucher?.consumer_number,
        amount: rawInvoiceData.voucher?.amount,
        totalPrice: rawInvoiceData.voucher?.amount,
        dueDate: rawInvoiceData.due_date || rawInvoiceData.voucher?.expiresAt,
        status: rawInvoiceData.voucher?.status || 'PENDING',
        membershipNo: rawInvoiceData.membership?.no || rawInvoiceData.voucher?.membership_no || memberInfo?.membership_no || 'N/A',
        memberName: rawInvoiceData.membership?.name || rawInvoiceData.voucher?.member?.Name || rawInvoiceData.voucher?.member_name || memberInfo?.member_name || 'N/A',
        numberOfGuests: rawInvoiceData.voucher?.number_of_guests || resolvedBookingData?.numberOfGuests,
        // Photoshoot specific - USING PARSED VALUES FROM STRICT PRIORITY LOGIC
        packageDescription: resolvedPhotoshoot?.description || 'Photoshoot Package',
        selectedDates: parsedSelectedDates,
        dateConfigurations: parsedDateConfigs,
        bookingDate: resolvedBookingData?.bookingDate,
        timeSlot: resolvedBookingData?.timeSlot,
        pricingType: resolvedBookingData?.pricingType,
        isGuestBooking: resolvedPricingType === 'guest' || !!(resolvedGuestName || resolvedGuestContact),
        guestName: resolvedGuestName,
        guestContact: resolvedGuestContact,
        remarks: rawInvoiceData.voucher?.remarks,
        _mappingStrategy: mappingStrategy // Internal tracking
      };

      // CRITICAL VALIDATION: Ensure hasTimeValue will be true
      const firstDate = mappedDetails.selectedDates?.[0];
      const firstConfig = firstDate ? mappedDetails.dateConfigurations?.[firstDate] : null;
      const timeValue = firstConfig?.time;

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📋 [MAPPING FINALIZATION] Complete validation report:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🎯 Strategy used:', mappingStrategy);
      console.log('📅 selectedDates:', mappedDetails.selectedDates);
      console.log('⚙️ dateConfigurations keys:', parsedDateConfigs ? Object.keys(parsedDateConfigs) : 'NONE');

      if (firstDate && firstConfig) {
        console.log('✅ First date config found:', {
          date: firstDate,
          time: firstConfig.time,
          timeType: typeof firstConfig.time,
          timeSource: firstConfig.time instanceof Date ? 'Date object' : typeof firstConfig.time
        });
      } else {
        console.error('❌ NO CONFIG FOUND for first date!');
      }

      console.log('⏰ timeValue:', timeValue);
      console.log('⏰ timeValueType:', typeof timeValue);
      console.log('✅ hasTimeValue:', !!timeValue);
      console.log('═══════════════════════════════════════════════════════════\n');

      // Final safety check
      if (!timeValue) {
        console.error('❌❌❌ [CRITICAL] hasTimeValue is FALSE - UI will show N/A! ❌❌❌');
        console.error('🔍 Debugging checklist:');
        console.error('  1. ✓ Priority 1 (Direct Config):', !!(resolvedBookingData?.selectedDates && resolvedBookingData?.dateConfigurations));
        console.error('  2. ✓ Priority 2 (JSON Parsing):', !!(resolvedBookingData?.bookingDetails && resolvedBookingData.bookingDetails.length > 0));
        console.error('  3. ✓ Priority 3 (Remarks Regex):', !!rawInvoiceData.voucher?.remarks);
        console.error('  4. Time reconstruction attempted:', mappingStrategy === 'remarks_regex');

        // Emergency fallback: Try one more time with issued_at
        if (rawInvoiceData.voucher?.issued_at && mappedDetails.selectedDates?.[0]) {
          console.warn('⚠️ [Emergency] Attempting last-resort time injection from issued_at...');
          if (!mappedDetails.dateConfigurations) {
            mappedDetails.dateConfigurations = {};
          }
          const emergencyDate = mappedDetails.selectedDates[0];
          mappedDetails.dateConfigurations[emergencyDate] = {
            time: rawInvoiceData.voucher.issued_at
          };
          console.warn('✅ [Emergency] Injected time from issued_at:', rawInvoiceData.voucher.issued_at);
          console.warn('✅ [Emergency] hasTimeValue is now:', !!mappedDetails.dateConfigurations[emergencyDate].time);
        }
      } else {
        console.log('✅✅✅ [SUCCESS] hasTimeValue is TRUE - formatTime will run! ✅✅✅');
      }

      setInvoiceData(mappedDetails);
      setLoading(false);
    } else {
      Alert.alert('Error', 'Invoice data not found');
      navigation.goBack();
    }
  }, [rawInvoiceData, bookingData, photoshoot, navigation, route.params, memberInfo]);

  // handleRefresh - pull-to-refresh that reloads invoice data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInvoiceData();
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadInvoiceData]);

  useEffect(() => {
    loadInvoiceData();
  }, [rawInvoiceData, loadInvoiceData]);

  // Real-time payment sync - Separate useEffect with proper cleanup
  useEffect(() => {
    const voucherId = rawInvoiceData?.voucher?.id;
    if (!voucherId) return;

    const unsubscribe = socketService.subscribeToPayment(voucherId, (data) => {
      if (data.status === 'PAID') {
        console.log('💰 [Shoot Invoice] Real-time payment detected!');
        setInvoiceData(prev => prev ? { ...prev, status: 'PAID' } : null);
      }
    });

    return () => {
      console.log('🧹 [Shoot Invoice] Cleaning up socket subscription');
      unsubscribe();
    };
  }, [rawInvoiceData?.voucher?.id]);

  const handleCancelBooking = async () => {
    const bookingId = rawInvoiceData.voucher?.consumer_number;
    if (!bookingId) {
      Alert.alert('Error', 'Consumer number not found for cancellation');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setBookingLoading(true);
              await bookingService.deleteBooking(bookingId);
              await clearVoucher();

              eventBus.emit('BOOKING_CANCELLED', {
                consumerNumber: rawInvoiceData?.voucher?.consumer_number || bookingId,
                voucherId: rawInvoiceData?.voucher?.id,
                bookingId: rawInvoiceData?.voucher?.booking_id || route.params?.bookingId,
              });

              // Keep existing invoiceData until reset completes to avoid null render access.
              setTimeLeft('');
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.reset({
                index: 0,
                routes: [{ name: 'start' }],
              });
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', error.message || 'Failed to cancel booking. Please try again.');
            } finally {
              setBookingLoading(false);
            }
          }
        }
      ]
    );
  };

  // Countdown Timer Logic
  useEffect(() => {
    if (!invoiceData?.dueDate || invoiceData?.status === 'PAID') {
      setTimeLeft('');
      return;
    }

    const targetDate = new Date(invoiceData.dueDate).getTime();

    // Helper to compute the display string
    const computeTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) return 'EXPIRED';
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      let timeStr = '';
      if (hours > 0) timeStr += `${hours}h `;
      timeStr += `${minutes}m ${seconds}s`;
      return timeStr;
    };

    // Set the initial value immediately so there is no 1-second blank gap
    setTimeLeft(computeTimeLeft());

    const interval = setInterval(() => {
      const value = computeTimeLeft();
      setTimeLeft(value);
      if (value === 'EXPIRED') clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [invoiceData?.dueDate, invoiceData?.status]);

  // handleRefresh is now defined above with loadInvoiceData

  const handleMakePayment = () => {
    Alert.alert(
      'Complete Payment',
      'Redirect to payment gateway to complete your booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Payment',
          onPress: () => {
            clearVoucher();
            Alert.alert(
              'Payment Gateway',
              'Payment integration would happen here. For now, please check your bookings list after payment completion.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleShareInvoice = async () => {
    try {
      setShareLoading(true);
      if (!invoiceData) return;

      const slotsText = (() => {
        // Case 1: Multiple dates with configurations
        if (invoiceData.selectedDates && Array.isArray(invoiceData.selectedDates)) {
          return invoiceData.selectedDates.map((date, index) => {
            const timeValue = invoiceData.dateConfigurations?.[date]?.time;
            return `• ${formatDate(date)} at ${timeValue ? formatTime(timeValue) : 'N/A'}`;
          }).join('\n');
        }

        // Case 2: Single booking date with time slot
        if (invoiceData.bookingDate || invoiceData.timeSlot) {
          return `• ${formatDate(invoiceData.bookingDate)} at ${formatTime(invoiceData.timeSlot)}`;
        }

        // Case 3: No data
        return '• No slots selected';
      })();

      const message = `
📸 PHOTOSHOOT BOOKING INVOICE

Invoice Number: ${invoiceData.invoiceNo}
Consumer Number: ${invoiceData.consumerNumber || 'N/A'}
Amount: Rs. ${invoiceData.amount}
Status: ${invoiceData.status}

📋 Booking Details:
• Package: ${invoiceData.packageDescription}
${slotsText}

👤 Member Information:
• Name: ${invoiceData.memberName}
• Membership No: ${invoiceData.membershipNo}

${invoiceData.dueDate ? `📅 Payment Due: ${formatDateTime(invoiceData.dueDate)}\n` : ''}

Thank you for choosing our photoshoot services!
`.trim();

      await Share.share({
        message,
        title: `Photoshoot Invoice - ${invoiceData.invoiceNo}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share invoice');
    } finally {
      setShareLoading(false); // Corrected to setShareLoading
    }
  };

  const handleSaveToGallery = async () => {
    try {
      setSaveLoading(true);

      const hasPermission = await permissionService.requestPhotoLibraryPermission();
      if (!hasPermission) {
        permissionService.handlePermissionDenied();
        return;
      }

      if (invoiceRef.current) {
        const uri = await captureRef(invoiceRef, {
          format: 'png',
          quality: 1.0,
        });

        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('Success', 'Invoice saved to gallery successfully!');
      } else {
        Alert.alert('Error', 'Capture reference not found');
      }

    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', 'Failed to save invoice. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

    try {
      let hours, minutes;

      // Handle Date objects (most common case from dateConfigurations)
      if (timeString instanceof Date) {
        hours = timeString.getHours();
        minutes = timeString.getMinutes();
        console.log('🕐 formatTime [Date]:', { hours, minutes, original: timeString });
      }
      // Handle ISO strings or time strings
      else if (typeof timeString === 'string') {
        // If it's a full ISO timestamp (with T), convert to local time first
        if (timeString.includes('T')) {
          const dateObj = new Date(timeString);
          if (!isNaN(dateObj.getTime())) {
            hours = dateObj.getHours();
            minutes = dateObj.getMinutes();
            console.log('🕐 formatTime [ISO to Local]:', { hours, minutes, original: timeString, local: dateObj.toString() });
          } else {
            // Fallback: extract time part directly
            const timePart = timeString.split('T')[1];
            if (!timePart) return 'N/A';
            const parts = timePart.substring(0, 5).split(':');
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
          }
        } else {
          // Assume it's already a time string like "14:30" or "14:30:00"
          const timePart = timeString.slice(0, 5);
          const parts = timePart.split(':');
          hours = parseInt(parts[0], 10);
          minutes = parseInt(parts[1], 10);
        }

        // Validate parsed values
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn('⚠️ Invalid time format:', timeString);
          return 'N/A';
        }
      }
      // For any other type, try to convert
      else {
        console.warn('⚠️ Unexpected time format, attempting conversion:', typeof timeString, timeString);
        const dateObj = new Date(timeString);
        if (isNaN(dateObj.getTime())) {
          return 'N/A';
        }
        hours = dateObj.getHours();
        minutes = dateObj.getMinutes();
      }

      // Format the time in 12-hour format
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      console.log('✅ formatTime result:', formattedTime);
      return formattedTime;

    } catch (error) {
      console.error('❌ formatTime error:', error);
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED':
      case 'PAID':
        return {
          text: 'CONFIRMED',
          style: styles.statusConfirmed,
          textColor: '#2e7d32',
          icon: 'check-circle'
        };
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return {
          text: 'PAYMENT PENDING',
          style: styles.statusPending,
          textColor: '#dc3545',
          icon: 'payment'
        };
      default:
        return {
          text: status || 'PENDING',
          style: styles.statusPending,
          textColor: '#dc3545',
          icon: 'schedule'
        };
    }
  };

  const statusInfo = getStatusBadge(invoiceData?.status);

  if (loading || !invoiceData) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
        <ImageBackground
          source={require("../../assets/notch.jpg")}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchRow}>
            <TouchableOpacity onPress={() => navigation.navigate('shoots')} style={styles.iconWrapper}>
              <MaterialIcons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.notchTitle}>Photoshoot Invoice</Text>
            <View style={styles.iconWrapper} />
          </View>
        </ImageBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Generating your invoice...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

      <ImageBackground
        source={require("../../assets/notch.jpg")}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
            <MaterialIcons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>Shoot Invoice</Text>
          <View style={styles.iconWrapper} />


        </View>
      </ImageBackground>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#b48a64']}
          />
        }
      >
        <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={{ backgroundColor: '#f9f3eb' }}>
          <View style={styles.invoiceContainer}>
            {/* Invoice Header */}
            <View style={styles.invoiceHeader}>
              <MaterialIcons
                name={statusInfo.icon}
                size={40}
                color="#b48a64"
              />
              <Text style={styles.invoiceTitle}>
                PHOTOSHOOT BOOKING VOUCHER
              </Text>
              <Text style={styles.invoiceSubtitle}>
                Complete payment to confirm your booking
              </Text>
              {timeLeft && timeLeft !== 'EXPIRED' && invoiceData?.status !== 'PAID' && (
                <View style={styles.timerWrapper}>
                  <View style={styles.timerContainer}>
                    <MaterialIcons name="schedule" size={16} color="#dc3545" />
                    <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cancelVoucherGhostButton}
                    onPress={handleCancelBooking}
                  >
                    <MaterialIcons name="close" size={14} color="#666" />
                    <Text style={styles.cancelVoucherGhostText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
              {timeLeft === 'EXPIRED' && (
                <View style={styles.timerWrapper}>
                  <View style={styles.timerContainer}>
                    <MaterialIcons name="warning" size={16} color="#dc3545" />
                    <Text style={styles.expiredText}>EXPIRED</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Payment Required Alert
            {invoiceData?.status !== 'PAID' && (
              <View style={styles.paymentAlert}>
                <MaterialIcons name="payment" size={20} color="#856404" />
                <View style={styles.paymentAlertContent}>
                  <Text style={styles.paymentAlertTitle}>Payment Required</Text>
                  <Text style={styles.paymentAlertText}>
                    Complete payment within 1 hour to secure your booking.
                  </Text>
                  <TouchableOpacity
                    style={[styles.paymentButton, timeLeft === 'EXPIRED' && { backgroundColor: '#ccc' }]}
                    onPress={handleMakePayment}
                    disabled={timeLeft === 'EXPIRED'}
                  >
                    <Text style={styles.paymentButtonText}>Make Payment Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )} */}

            {/* Invoice Details */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Number:</Text>
                <Text style={[styles.detailValue, styles.invoiceHighlight]}>
                  {invoiceData.invoiceNo}
                </Text>
              </View>

              {invoiceData.consumerNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Consumer Number:</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(invoiceData.consumerNumber);
                      // Alert.alert('Copied', 'Consumer number copied to clipboard');
                    }}
                    style={styles.copyContainer}
                  >
                    <Text style={[styles.detailValue, styles.invoiceHighlight]}>
                      {invoiceData.consumerNumber}
                    </Text>
                    <MaterialIcons name="content-copy" size={16} color="#b48a64" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, statusInfo.style]}>
                  <Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text>
                </View>
              </View>

              {invoiceData.dueDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Due:</Text>
                  <Text style={[styles.detailValue, styles.dueDate]}>
                    {formatDateTime(invoiceData.dueDate)}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member Name:</Text>
                <Text style={styles.detailValue}>{invoiceData.memberName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Membership No:</Text>
                <Text style={styles.detailValue}>{invoiceData.membershipNo}</Text>
              </View>

              {/* Guest Details - Show if guest booking */}
              {invoiceData.isGuestBooking && (invoiceData.guestName || invoiceData.guestContact) && (
                <>
                  <View style={styles.guestDivider} />
                  <Text style={styles.guestSectionLabel}>Guest Information</Text>
                  {invoiceData.guestName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Guest Name:</Text>
                      <Text style={[styles.detailValue, styles.guestHighlight]}>{invoiceData.guestName}</Text>
                    </View>
                  )}
                  {invoiceData.guestContact && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Guest Contact:</Text>
                      <Text style={[styles.detailValue, styles.guestHighlight]}>{invoiceData.guestContact}</Text>
                    </View>
                  )}
                </>
              )}

              {invoiceData.numberOfGuests && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Guests:</Text>
                  <Text style={styles.detailValue}>{invoiceData.numberOfGuests} people</Text>
                </View>
              )}

              {/* {invoiceData?.status !== 'PAID' && (
                <TouchableOpacity
                  style={styles.cardFooterAction}
                  onPress={handleCancelBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator size="small" color="#dc3545" />
                  ) : (
                    <>
                      <Text style={styles.cardFooterActionText}>Cancel This Booking</Text>
                      <MaterialIcons name="chevron-right" size={18} color="#dc3545" />
                    </>
                  )}
                </TouchableOpacity>
              )} */}
            </View>

            {/* Booking Summary */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Photoshoot Summary</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Package:</Text>
                <Text style={styles.detailValue}>{invoiceData.packageDescription}</Text>
              </View>

              <View style={styles.divider} />
              <Text style={[styles.detailLabel, { marginBottom: 10, fontWeight: 'bold' }]}>Selected Slots:</Text>

              {(() => {
                // Comprehensive debug logging
                console.log('🔍 [Selected Slots Render] Starting render logic...');
                console.log('📅 [Selected Slots] selectedDates:', invoiceData.selectedDates);
                console.log('⚙️ [Selected Slots] dateConfigurations:', invoiceData.dateConfigurations);

                // Helper function to extract time from various data structures
                const extractTimeFromConfig = (config, dateKey) => {
                  if (!config) {
                    console.warn(`⚠️ [Extract] No config object for ${dateKey}`);
                    return null;
                  }

                  console.log(`🔎 [Extract] Checking config for ${dateKey}:`, JSON.stringify(config));

                  // Case A: Direct time property (most common)
                  if (config.time) {
                    console.log(`✅ [Extract] Found direct .time for ${dateKey}:`, config.time, 'Type:', typeof config.time);
                    return config.time;
                  }

                  // Case B: slots as array
                  if (Array.isArray(config.slots)) {
                    const timeVal = config.slots[0]?.time || config.slots[0];
                    console.log(`✅ [Extract] Found .slots array for ${dateKey}:`, timeVal);
                    return timeVal;
                  }

                  // Case C: slots as object
                  if (typeof config.slots === 'object' && config.slots !== null) {
                    const timeVal = config.slots.time || config.slots.startTime || config.slots.slot;
                    console.log(`✅ [Extract] Found .slots object for ${dateKey}:`, timeVal);
                    return timeVal;
                  }

                  // Case D: Check for startTime/endTime directly in config
                  if (config.startTime) {
                    console.log(`✅ [Extract] Found .startTime for ${dateKey}:`, config.startTime);
                    return config.startTime;
                  }

                  // Case E: Check for timeSlot (ISO string)
                  if (config.timeSlot) {
                    console.log(`✅ [Extract] Found .timeSlot for ${dateKey}:`, config.timeSlot);
                    return config.timeSlot;
                  }

                  console.warn(`⚠️ [Extract] No time value found in config for ${dateKey}`);
                  console.warn('⚠️ [Extract] Available keys:', Object.keys(config));
                  return null;
                };

                // Case 1: Multiple dates with configurations
                if (invoiceData.selectedDates && Array.isArray(invoiceData.selectedDates) && invoiceData.selectedDates.length > 0) {
                  console.log('📋 [Selected Slots] Rendering multiple dates:', invoiceData.selectedDates.length);

                  return invoiceData.selectedDates.map((date, index) => {
                    const config = invoiceData.dateConfigurations?.[date];
                    console.log(`\n🔎 [Slot ${index + 1}] Processing date: ${date}`);
                    console.log(`🔎 [Slot ${index + 1}] Configuration object:`, JSON.stringify(config));

                    const timeValue = extractTimeFromConfig(config, date);
                    console.log(`🕐 [Slot ${index + 1}] Extracted timeValue:`, timeValue);
                    console.log(`🕐 [Slot ${index + 1}] formatTime result:`, timeValue ? formatTime(timeValue) : 'N/A');

                    return (
                      <View key={`${date}-${index}`} style={styles.slotRow}>
                        <View style={styles.slotDateBox}>
                          <Text style={styles.detailLabelSmall}>{formatDate(date)}</Text>
                        </View>
                        <View style={styles.slotTimeBox}>
                          <Text style={styles.detailValueSmall}>
                            {timeValue ? formatTime(timeValue) : 'N/A'}
                          </Text>
                        </View>
                      </View>
                    );
                  });
                }

                // Case 2: Single booking date with time slot
                if (invoiceData.bookingDate || invoiceData.timeSlot) {
                  console.log('📋 [Selected Slots] Rendering single date fallback');
                  return (
                    <View style={styles.slotRow}>
                      <View style={styles.slotDateBox}>
                        <Text style={styles.detailLabelSmall}>{formatDate(invoiceData.bookingDate)}</Text>
                      </View>
                      <View style={styles.slotTimeBox}>
                        <Text style={styles.detailValueSmall}>
                          {formatTime(invoiceData.timeSlot)}
                        </Text>
                      </View>
                    </View>
                  );
                }

                // Case 3: No data available
                console.log('⚠️ [Selected Slots] No data available, showing N/A');
                return (
                  <View style={styles.slotRow}>
                    <View style={styles.slotDateBox}>
                      <Text style={styles.detailLabelSmall}>No slots selected</Text>
                    </View>
                    <View style={styles.slotTimeBox}>
                      <Text style={styles.detailValueSmall}>N/A</Text>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* Payment Details */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Payment Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={[styles.detailValue, styles.amount]}>
                  Rs. {invoiceData.amount ? parseFloat(invoiceData.amount).toLocaleString() : '0.00'}/-
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status:</Text>
                <View style={[styles.statusBadge, invoiceData.status === 'PAID' ? styles.statusConfirmed : styles.pendingBadge]}>
                  <Text style={styles.statusText}>{invoiceData.status}</Text>
                </View>
              </View>
            </View>

            {/* Important Information */}
            <View style={[styles.invoiceSection, { marginTop: 5 }]}>
              <Text style={styles.sectionTitle}>Important Information</Text>
              <View style={styles.instructionItem}>
                <MaterialIcons name="info-outline" size={16} color="#b48a64" />
                <Text style={styles.instructionText}>
                  {invoiceData.remarks || 'Complete payment within 1 hour to secure your booking'}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialIcons name="info-outline" size={16} color="#b48a64" />
                <Text style={styles.instructionText}>Present this voucher at the club office for verification</Text>
              </View>
            </View>

          </View>
        </ViewShot>

        <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <MaterialIcons name="refresh" size={20} color="#b48a64" />
              <Text style={styles.secondaryButtonText}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareInvoice}
              disabled={shareLoading}
            >
              <MaterialIcons name="share" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>
                {shareLoading ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Download Invoice Button */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleSaveToGallery}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="file-download" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Save to Gallery</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Complete Payment Button */}
          {/* {invoiceData?.status !== 'PAID' && (
            <TouchableOpacity
              style={[styles.paymentActionButton, timeLeft === 'EXPIRED' && { backgroundColor: '#ccc' }]}
              onPress={handleMakePayment}
              disabled={timeLeft === 'EXPIRED'}
            >
              <MaterialIcons name="payment" size={20} color="#fff" />
              <Text style={styles.paymentActionButtonText}>Complete Payment Now</Text>
            </TouchableOpacity>
          )} */}

          {/* <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialIcons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f3eb' },
  notch: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    backgroundColor: "#D2B48C",
  },
  notchImage: {
    resizeMode: "cover",
  },
  notchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
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
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  content: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  invoiceContainer: {
    padding: 15,
  },
  invoiceHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  invoiceSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  paymentAlertContent: {
    flex: 1,
    marginLeft: 10,
  },
  paymentAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  paymentAlertText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
    marginBottom: 10,
  },
  paymentButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  invoiceSection: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  dueDate: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#d4efdf', // Same green as Lawn/Hall
  },
  statusPending: {
    backgroundColor: '#fadbd8', // Same red as Lawn/Hall
  },
  invoiceHighlight: {
    color: '#b48a64',
    fontWeight: 'bold',
  },
  timerWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffa39e',
  },
  cancelVoucherGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: 'transparent',
  },
  cancelVoucherGhostText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardFooterActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
    marginRight: 4,
  },
  expiredText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  guestSectionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guestHighlight: {
    color: '#333',
    fontWeight: 'bold',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b48a64',
    backgroundColor: 'transparent',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#b48a64',
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b48a64',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bdaea1ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  paymentActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#b48a64',
    gap: 8,
    marginBottom: 30,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  slotDateBox: {
    flex: 1.5,
  },
  slotTimeBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailLabelSmall: {
    fontSize: 13,
    color: '#777',
  },
  detailValueSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
});

export default InvoiceScreen;