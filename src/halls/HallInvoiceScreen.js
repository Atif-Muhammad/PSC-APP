// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StatusBar,
//   RefreshControl,
//   ImageBackground,
//   Clipboard,
//   Platform,
//   PermissionsAndroid,
//   Share,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import ViewShot, { captureRef } from 'react-native-view-shot';
// import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// import { bookingService } from '../../services/bookingService';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { useVoucher } from '../auth/contexts/VoucherContext';
// import socketService from '../../services/socket.service';
// import { permissionService } from '../services/PermissionService';
// import { banquetAPI, getAuthToken, getBaseUrl } from '../../config/apis';

// export default function HallInvoiceScreen({ navigation, route }) {
//   const { clearVoucher } = useVoucher();
//   const { user } = useAuth();
//   const {
//     invoiceData: rawInvoiceData,
//     bookingData,
//     venue,
//     isGuest,
//     memberDetails,
//     guestDetails
//   } = route.params || {};

//   const [invoiceData, setInvoiceData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [shareLoading, setShareLoading] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const viewShotRef = useRef(null);
//   const invoiceRef = useRef(null);

//   const calculateHallAdvance = (price) => {
//     const total = Number(price) || 0;
//     if (total < 50000) return total;
//     return 50000;
//   };

//   useEffect(() => {
//     const loadInvoiceData = async () => {
//       if (rawInvoiceData) {
//         console.log('🔄 Mapping Hall Invoice Data');
//         console.log('📦 Received bookingData:', JSON.stringify(bookingData));
//         console.log('📦 Received venue:', JSON.stringify(venue));
//         console.log('📦 Received memberDetails:', JSON.stringify(memberDetails));

//         // Prioritize passed data over API fetch
//         let resolvedBookingData = {};
//         let resolvedVenue = {};

//         // Use passed bookingData if available AND it has real content
//         // bookingData from SummaryBarTimer is often just {"bookingDetails":[]} (empty shell)
//         const hasRealBookingData = bookingData && (
//           bookingData.eventTime || bookingData.timeSlot || bookingData.time_slot ||
//           bookingData.eventType || bookingData.event_type ||
//           bookingData.numberOfGuests || bookingData.number_of_guests || bookingData.guests ||
//           (bookingData.bookingDetails && bookingData.bookingDetails.length > 0)
//         );

//         if (hasRealBookingData) {
//           console.log('📦 Using passed bookingData (has real content):', JSON.stringify(bookingData));
//           resolvedBookingData = {
//             ...bookingData,
//             hallName: bookingData.hallName || bookingData.hall_name || venue?.name,
//             bookingDate: bookingData.bookingDate || bookingData.booking_date || bookingData.eventDate || bookingData.event_date,
//             eventTime: bookingData.eventTime || bookingData.timeSlot || bookingData.event_time || bookingData.time_slot,
//             eventType: bookingData.eventType || bookingData.event_type,
//             numberOfGuests: bookingData.numberOfGuests || bookingData.number_of_guests || bookingData.guests,
//             bookingDetails: bookingData.bookingDetails || bookingData.booking_details || [],
//           };
//         } else {
//           console.log('⚠️ No real bookingData passed (empty or missing), will fetch from API');
//           // Preserve hallName / bookingDate from the empty shell if they exist
//           if (bookingData) {
//             resolvedBookingData.hallName = bookingData.hallName || bookingData.hall_name;
//             resolvedBookingData.bookingDate = bookingData.bookingDate || bookingData.booking_date || bookingData.eventDate;
//           }
//         }

//         // Use passed venue data
//         if (venue && Object.keys(venue).length > 0) {
//           resolvedVenue = { ...venue };
//         }

//         // Extract from rawInvoiceData nested objects
//         if (rawInvoiceData?.hall) {
//           if (!resolvedBookingData.hallName) resolvedBookingData.hallName = rawInvoiceData.hall.name || rawInvoiceData.hall.Name || rawInvoiceData.hall.hallName;
//         }
//         if (rawInvoiceData?.booking) {
//           if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = rawInvoiceData.booking.bookingDate || rawInvoiceData.booking.eventDate;
//           if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = rawInvoiceData.booking.eventTime || rawInvoiceData.booking.timeSlot || rawInvoiceData.booking.bookingTime;
//           if (!resolvedBookingData.eventType) resolvedBookingData.eventType = rawInvoiceData.booking.eventType;
//           if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = rawInvoiceData.booking.numberOfGuests;
//           if (!resolvedBookingData.bookingDetails?.length) resolvedBookingData.bookingDetails = rawInvoiceData.booking.bookingDetails || [];
//         }

//         // Extract from rawInvoiceData top-level fields
//         if (!resolvedBookingData.hallName) resolvedBookingData.hallName = rawInvoiceData?.hallName || rawInvoiceData?.bookingName;
//         if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = rawInvoiceData?.timeSlot || rawInvoiceData?.time_slot || rawInvoiceData?.eventTime;
//         if (!resolvedBookingData.eventType) resolvedBookingData.eventType = rawInvoiceData?.eventType || rawInvoiceData?.event_type;
//         if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = rawInvoiceData?.numberOfGuests || rawInvoiceData?.guests || rawInvoiceData?.no_of_guests || rawInvoiceData?.guest_count;
//         if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = rawInvoiceData?.eventDate || rawInvoiceData?.bookingDate;

//         // Extract hall name and date from remarks string as partial fallback
//         const remarks = rawInvoiceData?.voucher?.remarks || '';
//         if (remarks) {
//           console.log('🔍 Checking remarks for data:', remarks);

//           if (!resolvedBookingData.hallName) {
//             const hallMatch = remarks.match(/for\s+(.*?)\s+booking/i);
//             if (hallMatch) {
//               resolvedBookingData.hallName = hallMatch[1].trim();
//             }
//           }

//           if (!resolvedBookingData.bookingDate) {
//             const dateMatch = remarks.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
//             if (dateMatch) {
//               const extractedDate = dateMatch[1];
//               let dateObj;
//               if (extractedDate.includes('/')) {
//                 const parts = extractedDate.split('/');
//                 if (parts.length === 3) {
//                   const isoDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
//                   dateObj = new Date(isoDate);
//                 }
//               } else {
//                 dateObj = new Date(extractedDate);
//               }
//               if (dateObj && !isNaN(dateObj.getTime())) {
//                 resolvedBookingData.bookingDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//               } else {
//                 resolvedBookingData.bookingDate = extractedDate;
//               }
//             }
//           }

//           // Try to extract event type from remarks (common event keywords)
//           if (!resolvedBookingData.eventType) {
//             const eventMatch = remarks.match(/(wedding|anniversary|birthday|valima|mehndi|mehandi|reception|party|corporate|seminar|conference|engagement|nikah|aqeeqah)/i);
//             if (eventMatch) {
//               resolvedBookingData.eventType = eventMatch[1].toLowerCase();
//             }
//           }

//           // Try to extract time slot from remarks
//           if (!resolvedBookingData.eventTime) {
//             const timeMatch = remarks.match(/(MORNING|EVENING|DAY|NIGHT)/i);
//             if (timeMatch) {
//               resolvedBookingData.eventTime = timeMatch[1].toUpperCase();
//             }
//           }

//           // Try to extract guest count from remarks
//           if (!resolvedBookingData.numberOfGuests) {
//             const guestsMatch = remarks.match(/(\d+)\s*(?:guests?|persons?|pax)/i) || remarks.match(/(?:guests?|persons?|pax)\s*[:=]?\s*(\d+)/i);
//             if (guestsMatch) {
//               resolvedBookingData.numberOfGuests = parseInt(guestsMatch[1], 10);
//             }
//           }
//         }

//         // Use passed member details
//         const resolvedMemberDetails = memberDetails || {};

//         // Check if we still need to fetch — are any of the KEY display fields missing?
//         const needsFetch = !resolvedBookingData.eventTime ||
//           !resolvedBookingData.eventType ||
//           !resolvedBookingData.numberOfGuests ||
//           (!resolvedBookingData.bookingDetails?.length && !resolvedBookingData.bookingDate);

//         console.log('📊 needsFetch:', needsFetch, '| eventTime:', resolvedBookingData.eventTime, '| eventType:', resolvedBookingData.eventType, '| guests:', resolvedBookingData.numberOfGuests);
//         console.log('📊 resolvedBookingData:', JSON.stringify(resolvedBookingData));
//         console.log('📊 resolvedVenue:', JSON.stringify(resolvedVenue));

//         if (needsFetch) {
//           const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
//           console.log('🔍 Missing hall details, fetching from API for bookingId:', bookingId);
//           if (bookingId) {
//             try {
//               // PRIMARY: Fetch all halls — each hall has a bookings[] array with full details
//               const hallsRes = await banquetAPI.getAllHalls();
//               const hallsData = hallsRes?.data?.Data || hallsRes?.data || [];
//               const allHalls = Array.isArray(hallsData) ? hallsData : [];
//               console.log('📥 getAllHalls: found', allHalls.length, 'halls');

//               // Search all halls' bookings for our booking_id
//               let matchedBooking = null;
//               let matchedHall = null;
//               for (const hall of allHalls) {
//                 const bookings = hall.bookings || [];
//                 const found = bookings.find(b => b.id === bookingId || b.id === Number(bookingId));
//                 if (found) {
//                   matchedBooking = found;
//                   matchedHall = hall;
//                   break;
//                 }
//               }

//               if (matchedBooking) {
//                 console.log('✅ Found matching booking:', JSON.stringify({
//                   id: matchedBooking.id,
//                   eventType: matchedBooking.eventType,
//                   numberOfGuests: matchedBooking.numberOfGuests,
//                   bookingTime: matchedBooking.bookingTime,
//                   bookingDetails: matchedBooking.bookingDetails,
//                 }));

//                 const bd = matchedBooking.bookingDetails || [];
//                 let apiEventTime = matchedBooking.bookingTime || matchedBooking.timeSlot || matchedBooking.eventTime;
//                 let apiEventType = matchedBooking.eventType;
//                 let apiGuests = matchedBooking.numberOfGuests;

//                 // Also extract from bookingDetails[0] if top-level is missing
//                 if (bd.length > 0) {
//                   const first = bd[0];
//                   if (!apiEventTime) apiEventTime = first.timeSlot || first.time_slot;
//                   if (!apiEventType) apiEventType = first.eventType || first.event_type;
//                 }

//                 resolvedBookingData = {
//                   ...resolvedBookingData,
//                   bookingDate: resolvedBookingData.bookingDate || matchedBooking.bookingDate,
//                   eventTime: resolvedBookingData.eventTime || apiEventTime,
//                   eventType: resolvedBookingData.eventType || apiEventType,
//                   numberOfGuests: resolvedBookingData.numberOfGuests || apiGuests,
//                   bookingDetails: (resolvedBookingData.bookingDetails?.length > 0) ? resolvedBookingData.bookingDetails : bd,
//                   hallName: resolvedBookingData.hallName || matchedHall?.name,
//                 };

//                 if (!resolvedVenue?.name && matchedHall?.name) {
//                   resolvedVenue = { ...resolvedVenue, name: matchedHall.name };
//                 }

//                 console.log('✅ After hall booking merge:', JSON.stringify(resolvedBookingData));
//               } else {
//                 console.warn('⚠️ No matching booking found in halls for bookingId:', bookingId);
//               }
//             } catch (err) {
//               console.warn('⚠️ getAllHalls fetch failed:', err?.message || err);
//             }

//             // If we still don't have the data after getAllHalls, try the voucher API as a last resort
//             if (!resolvedBookingData.eventTime || !resolvedBookingData.eventType || !resolvedBookingData.numberOfGuests) {
//               try {
//                 const { voucherAPI } = require('../../config/apis');
//                 const res2 = await voucherAPI.getVoucherByType('HALL', bookingId);
//                 console.log('📥 getVoucherByType fallback response:', JSON.stringify(res2?.data));
//                 const fetched = res2?.data?.Data || res2?.data || {};
//                 // Handle if response is an array (voucher list)
//                 const voucherObj = Array.isArray(fetched) ? fetched[0] : fetched;
//                 const booking = voucherObj?.booking || voucherObj?.Booking || {};

//                 if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = booking.bookingTime || booking.timeSlot || booking.eventTime;
//                 if (!resolvedBookingData.eventType) resolvedBookingData.eventType = booking.eventType;
//                 if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = booking.numberOfGuests;
//                 if (!resolvedBookingData.bookingDetails?.length && booking.bookingDetails?.length) {
//                   resolvedBookingData.bookingDetails = booking.bookingDetails;
//                 }
//               } catch (err2) {
//                 console.warn('⚠️ voucherAPI fallback also failed:', err2?.message || err2);
//               }
//             }
//           }

//           // Final fallback: if bookingDetails has items but top-level fields are still empty, extract from first detail
//           if (resolvedBookingData.bookingDetails?.length > 0) {
//             const firstDetail = resolvedBookingData.bookingDetails[0];
//             if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = firstDetail.timeSlot || firstDetail.time_slot;
//             if (!resolvedBookingData.eventType) resolvedBookingData.eventType = firstDetail.eventType || firstDetail.event_type;
//             if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = firstDetail.date;
//           }
//         }

//         const mappedDetails = {
//           invoiceNo: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id || 'N/A',
//           invoiceNumber: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id,
//           consumerNumber: rawInvoiceData.voucher?.consumer_number,
//           bookingId: rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id,
//           status: rawInvoiceData.voucher?.status || 'PENDING',
//           issued_at: rawInvoiceData.issue_date || rawInvoiceData.voucher?.issued_at || new Date().toISOString(),
//           issued_by: rawInvoiceData.voucher?.issued_by || 'System',
//           dueDate: rawInvoiceData.due_date || rawInvoiceData.voucher?.expiresAt,
//           amount: rawInvoiceData.voucher?.amount,
//           totalPrice: rawInvoiceData.voucher?.amount,
//           paymentMode: rawInvoiceData.voucher?.payment_mode || 'PENDING',
//           membershipNo: rawInvoiceData.membership?.no || resolvedMemberDetails?.membershipNo,
//           memberName: rawInvoiceData.membership?.name || resolvedMemberDetails?.memberName,
//           // Hall specific - prioritize passed data
//           hallName: resolvedVenue?.name || resolvedBookingData?.hallName,
//           eventDate: resolvedBookingData?.bookingDate || resolvedBookingData?.eventDate,
//           eventTime: resolvedBookingData?.eventTime,
//           eventType: resolvedBookingData?.eventType,
//           bookingDetails: resolvedBookingData?.bookingDetails || [],
//           numberOfGuests: resolvedBookingData?.numberOfGuests,
//           isGuest: isGuest,
//           advanceAmount: calculateHallAdvance(rawInvoiceData.voucher?.amount || 0),
//         };

//         console.log('📋 Final mapped invoice details:', JSON.stringify(mappedDetails));
//         setInvoiceData(mappedDetails);
//         setLoading(false);
//       } else {
//         Alert.alert('Error', 'Invoice data not found');
//         navigation.goBack();
//       }
//     };

//     loadInvoiceData();
//   }, [rawInvoiceData, bookingData, venue, memberDetails, isGuest]);

//   // Real-time payment sync
//   useEffect(() => {
//     const voucherId = rawInvoiceData?.voucher?.id;
//     if (!voucherId) return;

//     const unsubscribe = socketService.subscribeToPayment(voucherId, (data) => {
//       if (data.status === 'PAID' || data.status === 'CANCELLED' || data.status === 'CONFIRMED') {
//         setInvoiceData(prev => prev ? { ...prev, status: data.status } : null);
//       }
//     });

//     return () => unsubscribe();
//   }, [rawInvoiceData?.voucher?.id]);

//   // Countdown Timer
//   useEffect(() => {
//     const targetDateStr = invoiceData?.dueDate;
//     if (!targetDateStr || invoiceData?.status === 'PAID') {
//       if (timeLeft !== '') setTimeLeft('');
//       return;
//     }
//     const targetDate = new Date(targetDateStr).getTime();
//     if (isNaN(targetDate)) { setTimeLeft(''); return; }
//     const interval = setInterval(() => {
//       const now = new Date().getTime();
//       const distance = targetDate - now;
//       if (distance < 0) { clearInterval(interval); setTimeLeft('EXPIRED'); return; }
//       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//       let timeStr = '';
//       if (hours > 0) timeStr += `${hours}h `;
//       timeStr += `${minutes}m ${seconds}s`;
//       setTimeLeft(timeStr);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [invoiceData?.dueDate, invoiceData?.status]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       // If hall details are missing, try to re-fetch them
//       if (!invoiceData?.hallName || !invoiceData?.eventDate || !invoiceData?.eventTime || !invoiceData?.eventType || !invoiceData?.numberOfGuests) {
//         const bookingId = rawInvoiceData?.voucher?.booking_id || rawInvoiceData?.voucher?.id;
//         if (bookingId) {
//           try {
//             const base_url = getBaseUrl();
//             // Try more specific API calls to get booking details
//             let res;
//             try {
//               // First try the specific booking details API
//               const bookingRes = await fetch(`${base_url}/booking/${bookingId}`, {
//                 headers: {
//                   'Authorization': `Bearer ${await getAuthToken()}`
//                 }
//               });
//               if (bookingRes.ok) {
//                 res = await bookingRes.json();
//                 console.log('✅ Got booking details from specific API');
//               }
//             } catch (specificErr) {
//               console.log('⚠️ Specific booking API failed, falling back to voucher API');
//             }

//             // If specific API didn't work, fall back to voucher API
//             if (!res) {
//               res = await banquetAPI.getHallVoucher(bookingId);
//             }

//             const fetched = res?.data?.Data || res?.data || {};
//             const booking = fetched.booking || fetched.Booking || {};
//             const hall = fetched.hall || fetched.Hall || {};

//             // Process date if available
//             let processedEventDate = invoiceData?.eventDate;
//             const rawDate = booking.bookingDate || booking.booking_date || fetched.bookingDate || fetched.eventDate;
//             if (rawDate && typeof rawDate === 'string') {
//               if (rawDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
//                 // Format MM/DD/YYYY
//                 const [month, day, year] = rawDate.split('/');
//                 const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//                 const dateObj = new Date(isoDate);
//                 if (!isNaN(dateObj.getTime())) {
//                   processedEventDate = dateObj.toLocaleDateString('en-US', {
//                     year: 'numeric',
//                     month: 'short',
//                     day: 'numeric'
//                   });
//                 } else {
//                   processedEventDate = rawDate;
//                 }
//               } else {
//                 processedEventDate = rawDate;
//               }
//             }

//             setInvoiceData(prev => ({
//               ...prev,
//               hallName: prev?.hallName || hall.name || booking.hallName || fetched.hallName,
//               eventDate: processedEventDate,
//               eventTime: prev?.eventTime || booking.timeSlot || booking.time_slot || booking.eventTime || fetched.timeSlot || fetched.eventTime,
//               eventType: prev?.eventType || booking.eventType || booking.event_type || fetched.eventType,
//               numberOfGuests: prev?.numberOfGuests || booking.numberOfGuests || booking.number_of_guests || fetched.numberOfGuests || booking.guests || fetched.guests,
//               bookingDetails: (prev?.bookingDetails?.length > 0) ? prev.bookingDetails : (booking.bookingDetails || booking.booking_details || fetched.bookingDetails || []),
//             }));
//             console.log('✅ Refreshed hall booking details successfully');
//           } catch (err) {
//             console.warn('⚠️ Refresh: Could not fetch hall details:', err);
//           }
//         }
//       }
//     } catch (error) {
//       console.warn('⚠️ Refresh error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleMakePayment = () => {
//     // Porting Room's payment flow - DIRECT navigation per request
//     clearVoucher();
//     Alert.alert(
//       'Payment Gateway',
//       'Payment integration would happen here. For now, please check your bookings list after payment completion.',
//       [{ text: 'OK' }]
//     );
//   };

//   const handleSaveToGallery = async () => {
//     try {
//       setSaveLoading(true);
//       const hasPermission = await permissionService.requestPhotoLibraryPermission();
//       if (!hasPermission) {
//         permissionService.handlePermissionDenied();
//         return;
//       }
//       const ref = viewShotRef.current || invoiceRef.current;
//       if (ref) {
//         const uri = await captureRef(ref, { format: 'png', quality: 1.0 });
//         await CameraRoll.save(uri, { type: 'photo' });
//         Alert.alert('Success', 'Invoice saved to gallery successfully!');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to save invoice.');
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleShareInvoice = async () => {
//     try {
//       setShareLoading(true);
//       await new Promise(resolve => setTimeout(resolve, 300));
//       const uri = await captureRef(invoiceRef, { format: 'png', quality: 1, result: 'tmpfile' });
//       await Share.share({
//         title: `Hall Invoice - ${invoiceData.invoiceNo}`,
//         url: uri,
//         message: `Here is the invoice for your PSC hall booking: ${invoiceData.invoiceNo}`,
//       });
//     } catch (error) { console.log('Share failed:', error); } finally { setShareLoading(false); }
//   };

//   const copyToClipboard = () => {
//     if (!invoiceData?.consumerNumber) return;
//     Clipboard.setString(invoiceData.consumerNumber);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleCancelVoucher = async () => {
//     if (!invoiceData?.consumerNumber) return;

//     Alert.alert(
//       'Cancel Voucher',
//       'Are you sure you want to cancel this hall booking request?',
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setRefreshing(true);
//               await bookingService.deleteBooking(invoiceData?.consumerNumber);
//               await clearVoucher();
//               Alert.alert('Success', 'Booking cancelled');
//               navigation.navigate('start');
//             } catch (error) {
//               Alert.alert('Error', 'Failed to cancel.');
//             } finally { setRefreshing(false); }
//           }
//         }
//       ]
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';

//     // If it's already a properly formatted date string, return as is
//     if (typeof dateString === 'string' && isNaN(Date.parse(dateString)) === false) {
//       try {
//         return new Date(dateString).toLocaleDateString('en-US', {
//           year: 'numeric',
//           month: 'short',
//           day: 'numeric'
//         });
//       } catch (error) {
//         return dateString;
//       }
//     }

//     // If it's already a formatted date string like "Mar 14, 2026", return as is
//     if (typeof dateString === 'string' && dateString.match(/^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/)) {
//       return dateString;
//     }

//     // Handle MM/DD/YYYY format from remarks
//     if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
//       const [month, day, year] = dateString.split('/');
//       const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//       try {
//         return new Date(isoDate).toLocaleDateString('en-US', {
//           year: 'numeric',
//           month: 'short',
//           day: 'numeric'
//         });
//       } catch (error) {
//         return dateString;
//       }
//     }

//     return dateString;
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
//     } catch (error) { return dateString; }
//   };

//   const formatTimeSlot = (timeSlot) => {
//     if (!timeSlot) return 'N/A';
//     const slotMap = { 'DAY': 'Day', 'NIGHT': 'Night', 'MORNING': 'Morning', 'EVENING': 'Evening' };
//     return slotMap[timeSlot.toUpperCase()] || timeSlot;
//   };

//   const statusInfo = (() => {
//     const s = invoiceData?.status?.toUpperCase();
//     switch (s) {
//       case 'CONFIRMED': case 'PAID':
//         return { text: 'CONFIRMED', style: styles.statusConfirmed, icon: 'check-circle', textColor: '#2e7d32' };
//       case 'CANCELLED':
//         return { text: 'CANCELLED', style: styles.statusCancelled, icon: 'cancel', textColor: '#dc3545' };
//       default:
//         return { text: 'PAYMENT PENDING', style: styles.statusPending, icon: 'payment', textColor: '#aa2e25' };
//     }
//   })();

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
//         <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
//           <View style={styles.notchRow}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
//             <Text style={styles.notchTitle}>Hall Invoice</Text>
//             <View style={styles.iconWrapper} />
//           </View>
//         </ImageBackground>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#b48a64" />
//           <Text style={styles.loadingText}>Generating invoice...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
//       <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
//         <View style={styles.notchRow}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
//           <Text style={styles.notchTitle}>Hall Invoice</Text>
//           <View style={styles.iconWrapper} />
//         </View>
//       </ImageBackground>

//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#b48a64']} />}
//       >
//         {invoiceData && (
//           <>
//             <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ backgroundColor: '#fffaf2' }}>
//               <View style={styles.invoiceContainer}>
//                 {/* Header Section */}
//                 <View style={styles.invoiceHeader}>
//                   <Icon name={statusInfo.icon} size={40} color={['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? '#2e7d32' : "#b48a64"} />
//                   {['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) && (
//                     <Text style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: 5 }}>Payment Successful</Text>
//                   )}
//                   <Text style={styles.invoiceTitle}>BANQUET HALL BOOKING</Text>
//                   <Text style={styles.invoiceSubtitle}>{['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? "Booking confirmed!" : "Complete payment to confirm."}</Text>

//                   {timeLeft && timeLeft !== 'EXPIRED' && invoiceData.status !== 'PAID' && (
//                     <View style={styles.timerWrapper}>
//                       <View style={styles.timerContainer}>
//                         <Icon name="schedule" size={16} color="#dc3545" />
//                         <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
//                       </View>
//                       <TouchableOpacity style={styles.cancelVoucherGhostButton} onPress={handleCancelVoucher}>
//                         <Icon name="close" size={14} color="#666" />
//                         <Text style={styles.cancelVoucherGhostText}>Cancel Voucher</Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                   {timeLeft === 'EXPIRED' && <Text style={styles.expiredText}>EXPIRED</Text>}
//                 </View>

//                 {/* Details Section */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Invoice Details</Text>
//                   {[
//                     { label: 'Invoice Number:', value: invoiceData.invoiceNo, highlight: true },
//                     { label: 'Consumer Number:', value: invoiceData.consumerNumber, copy: true },
//                     { label: 'Booking ID:', value: invoiceData.bookingId },
//                     { label: 'Payment Due:', value: formatDateTime(invoiceData.dueDate), warning: true },
//                     { label: 'Member Name:', value: invoiceData.memberName },
//                     { label: 'Membership No:', value: invoiceData.membershipNo }
//                   ].map((row, i) => row.value ? (
//                     <View key={i} style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{row.label}</Text>
//                       {row.copy ? (
//                         <TouchableOpacity onPress={copyToClipboard} style={styles.copyContainer}>
//                           <Text style={[styles.detailValue, styles.invoiceHighlight]}>{row.value}</Text>
//                           <Icon name={copied ? "check" : "content-copy"} size={16} color={copied ? "#2e7d32" : "#b48a64"} style={{ marginLeft: 8 }} />
//                         </TouchableOpacity>
//                       ) : (
//                         <Text style={[styles.detailValue, row.highlight && styles.invoiceHighlight, row.warning && styles.dueDate]}>{row.value}</Text>
//                       )}
//                     </View>
//                   ) : null)}
//                 </View>

//                 {/* Hall Booking Summary */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Hall Booking Information</Text>
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Hall Name:</Text><Text style={styles.detailValue}>{invoiceData.hallName || 'N/A'}</Text></View>

//                   {invoiceData.bookingDetails?.length > 0 ? (
//                     <View style={styles.multiDateContainer}>
//                       <Text style={styles.detailLabel}>Dates & Configurations:</Text>
//                       {invoiceData.bookingDetails.map((item, index) => (
//                         <View key={index} style={styles.dateConfigItem}>
//                           <View style={styles.itemRow}>
//                             <View style={styles.dateCol}><Icon name="event" size={16} color="#b48a64" /><Text style={styles.dateText}>{formatDate(item.date)}</Text></View>
//                             <View style={styles.configCol}>
//                               <View style={styles.configChip}><Text style={styles.configText}>{formatTimeSlot(item.timeSlot)}</Text></View>
//                               <View style={styles.configChip}><Text style={styles.configText}>{item.eventType}</Text></View>
//                             </View>
//                           </View>
//                         </View>
//                       ))}
//                     </View>
//                   ) : (
//                     <>
//                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Event Date:</Text><Text style={styles.detailValue}>{formatDate(invoiceData.eventDate)}</Text></View>
//                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Time Slot:</Text><Text style={styles.detailValue}>{formatTimeSlot(invoiceData.eventTime)}</Text></View>
//                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Event Type:</Text><Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{invoiceData.eventType || 'N/A'}</Text></View>
//                     </>
//                   )}
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Expected Guests:</Text><Text style={styles.detailValue}>{invoiceData.numberOfGuests ? `${invoiceData.numberOfGuests} Persons` : 'N/A'}</Text></View>
//                 </View>

//                 {/* Payment Breakdown */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Payment Details</Text>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Total Amount:</Text>
//                     <Text style={[styles.detailValue, styles.totalAmountText]}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Advance Deposit Required:</Text>
//                     <Text style={[styles.detailValue, styles.advanceAmountText]}>Rs. {parseFloat(invoiceData.advanceAmount || 0).toLocaleString()}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Status:</Text>
//                     <View style={[styles.statusBadge, statusInfo.style]}><Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text></View>
//                   </View>
//                 </View>

//                 {/* Footer Info */}
//                 <View style={[styles.invoiceSection, { marginTop: 5 }]}>
//                   <Text style={styles.sectionTitle}>Important Information</Text>
//                   {["Complete payment within 1 hour.", "Present this voucher at the club office.", "Adhere to hall booking policies."].map((txt, i) => (
//                     <View key={i} style={styles.instructionItem}>
//                       <Icon name="info-outline" size={16} color="#b48a64" />
//                       <Text style={styles.instructionText}>{txt}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             </ViewShot>

//             {/* Hidden capture view */}
//             <View style={shareStyles.offScreenContainer}>
//               <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={shareStyles.invoiceSheet}>
//                 <View style={shareStyles.header}><Text style={shareStyles.headerTitle}>PSC BANQUET HALL</Text><View style={shareStyles.headerDivider} /><Text style={shareStyles.headerSubtitle}>Official Booking Invoice</Text></View>
//                 <View style={shareStyles.confirmedBadge}><Text style={shareStyles.confirmedBadgeText}>✓ {statusInfo.text}</Text></View>
//                 <View style={shareStyles.section}>
//                   <Text style={shareStyles.sectionTitle}>Booking Summary</Text><View style={shareStyles.sectionDivider} />
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Invoice:</Text><Text style={shareStyles.value}>{invoiceData.invoiceNo}</Text></View>
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Hall:</Text><Text style={shareStyles.value}>{invoiceData.hallName}</Text></View>
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Advance:</Text><Text style={shareStyles.value}>Rs. {parseFloat(invoiceData.advanceAmount || 0).toLocaleString()}</Text></View>
//                 </View>
//                 <View style={shareStyles.footer}><View style={shareStyles.footerDivider} /><Text style={shareStyles.footerText}>Thank you for choosing PSC!</Text></View>
//               </ViewShot>
//             </View>

//             {/* Actions */}
//             <View style={{ padding: 15 }}>
//               <View style={styles.actionButtons}>
//                 <TouchableOpacity
//                   style={styles.saveButton}
//                   onPress={handleSaveToGallery}
//                   disabled={saveLoading}
//                 >
//                   <Icon name="file-download" size={20} color="#fff" />
//                   <Text style={styles.saveButtonText}>
//                     {saveLoading ? 'Saving...' : 'Save to Gallery'}
//                   </Text>
//                 </TouchableOpacity>
//                 {/* <TouchableOpacity style={styles.shareButton} onPress={handleShareInvoice} disabled={shareLoading}>
//                   <Icon name="share" size={20} color="#fff" /><Text style={styles.shareButtonText}>Share Invoice</Text>
//                 </TouchableOpacity> */}
//               </View>
//               {/* {invoiceData.status !== 'PAID' && (
//                 <TouchableOpacity style={styles.primaryButton} onPress={handleMakePayment}>
//                   <Icon name="payment" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Pay Advance Now</Text>
//                 </TouchableOpacity>
//               )} */}
//             </View>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9f3eb' },
//   notch: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: "hidden", backgroundColor: "#D2B48C" },
//   notchImage: { resizeMode: "cover" },
//   notchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 },
//   iconWrapper: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
//   notchTitle: { fontSize: 22, fontWeight: "600", color: "#000" },
//   content: { flex: 1 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
//   loadingText: { marginTop: 10, color: '#666', fontSize: 16 },
//   invoiceContainer: { padding: 15 },
//   invoiceHeader: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, elevation: 2 },
//   invoiceTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
//   invoiceSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
//   invoiceSection: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   detailLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
//   detailValue: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
//   invoiceHighlight: { color: '#b48a64', fontWeight: 'bold' },
//   timerWrapper: { alignItems: 'center', marginTop: 10 },
//   timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, borderWidth: 1, borderColor: '#ffa39e' },
//   timerText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545' },
//   cancelVoucherGhostButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d9d9d9', backgroundColor: 'transparent' },
//   cancelVoucherGhostText: { fontSize: 13, fontWeight: '500', color: '#666', marginLeft: 4 },
//   expiredText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545', marginTop: 10 },
//   dueDate: { color: '#dc3545', fontWeight: 'bold' },
//   multiDateContainer: { marginTop: 10, marginBottom: 10 },
//   dateConfigItem: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#eee' },
//   itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   dateCol: { flexDirection: 'row', alignItems: 'center' },
//   dateText: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 6 },
//   configCol: { flexDirection: 'row', alignItems: 'center' },
//   configChip: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 4 },
//   configText: { fontSize: 11, color: '#4A5568', textTransform: 'capitalize' },
//   totalAmountText: { fontSize: 15, color: '#333', fontWeight: '600' },
//   advanceAmountText: { fontSize: 18, fontWeight: 'bold', color: '#b48a64' },
//   statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
//   statusConfirmed: { backgroundColor: '#d4efdf' },
//   statusPending: { backgroundColor: '#fadbd8' },
//   statusCancelled: { backgroundColor: '#f8d7da' },
//   statusText: { fontSize: 12, fontWeight: 'bold' },
//   copyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
//   instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   instructionText: { fontSize: 13, color: '#666', marginLeft: 10, flex: 1 },
//   actionButtons: {
//     flexDirection: 'row',
//     marginBottom: 15,
//     paddingHorizontal: 0, // Padding handled by parent container
//   },
//   saveButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: '#b48a64',
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b48a64', marginRight: 10 },
//   secondaryButtonText: { color: '#b48a64', fontWeight: '600', marginLeft: 8 },
//   shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#2196f3' },
//   shareButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
//   primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#b48a64', padding: 15, borderRadius: 8 },
//   primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
// });

// const shareStyles = StyleSheet.create({
//   offScreenContainer: { position: 'absolute', left: -9999, top: 0, opacity: 1 },
//   invoiceSheet: { width: 380, backgroundColor: '#ffffff', padding: 24 },
//   header: { alignItems: 'center', marginBottom: 16 },
//   headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 1.5 },
//   headerDivider: { width: 60, height: 3, backgroundColor: '#b48a64', marginVertical: 10, borderRadius: 2 },
//   headerSubtitle: { fontSize: 13, color: '#777' },
//   confirmedBadge: { backgroundColor: '#e8f5e9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#c8e6c9' },
//   confirmedBadgeText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
//   section: { marginBottom: 16 },
//   sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 6, textTransform: 'uppercase' },
//   sectionDivider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 10 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
//   label: { fontSize: 13, color: '#666' },
//   value: { fontSize: 13, color: '#222', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
//   footer: { alignItems: 'center', marginTop: 8, paddingTop: 12 },
//   footerDivider: { width: '100%', height: 1, backgroundColor: '#e0e0e0', marginBottom: 12 },
//   footerText: { fontSize: 14, fontWeight: '600', color: '#333' },
// });


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  ImageBackground,
  Clipboard,
  Platform,
  PermissionsAndroid,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';
import { useVoucher } from '../auth/contexts/VoucherContext';
import socketService from '../../services/socket.service';
import { permissionService } from '../services/PermissionService';
import { banquetAPI, getAuthToken, getBaseUrl } from '../../config/apis';

export default function HallInvoiceScreen({ navigation, route }) {
  const { clearVoucher } = useVoucher();
  const { user } = useAuth();
  const {
    invoiceData: rawInvoiceData,
    bookingData,
    venue,
    isGuest,
    memberDetails,
    guestDetails
  } = route.params || {};

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewShotRef = useRef(null);
  const invoiceRef = useRef(null);

  const calculateHallAdvance = (price) => {
    const total = Number(price) || 0;
    if (total < 50000) return total;
    return 50000;
  };

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (rawInvoiceData) {
        console.log('🔄 Mapping Hall Invoice Data');

        // Prioritize passed data over API fetch
        let resolvedBookingData = {};
        let resolvedVenue = {};

        // Use passed bookingData if available AND it has real content
        // bookingData from SummaryBarTimer is often just {"bookingDetails":[]} (empty shell)
        const hasRealBookingData = bookingData && (
          bookingData.eventTime || bookingData.timeSlot || bookingData.time_slot ||
          bookingData.eventType || bookingData.event_type ||
          bookingData.numberOfGuests || bookingData.number_of_guests || bookingData.guests ||
          (bookingData.bookingDetails && bookingData.bookingDetails.length > 0)
        );

        if (hasRealBookingData) {
          console.log('📦 Using passed bookingData (has real content):', JSON.stringify(bookingData));
          resolvedBookingData = {
            ...bookingData,
            hallName: bookingData.hallName || bookingData.hall_name || venue?.name,
            bookingDate: bookingData.bookingDate || bookingData.booking_date || bookingData.eventDate || bookingData.event_date,
            eventTime: bookingData.eventTime || bookingData.timeSlot || bookingData.event_time || bookingData.time_slot,
            eventType: bookingData.eventType || bookingData.event_type,
            numberOfGuests: bookingData.numberOfGuests || bookingData.number_of_guests || bookingData.guests,
            bookingDetails: bookingData.bookingDetails || bookingData.booking_details || [],
          };
        } else {
          console.log('⚠️ No real bookingData passed (empty or missing), will fetch from API');
          // Preserve hallName / bookingDate from the empty shell if they exist
          if (bookingData) {
            resolvedBookingData.hallName = bookingData.hallName || bookingData.hall_name;
            resolvedBookingData.bookingDate = bookingData.bookingDate || bookingData.booking_date || bookingData.eventDate;
          }
        }

        // Use passed venue data
        if (venue && Object.keys(venue).length > 0) {
          resolvedVenue = { ...venue };
        }

        // Extract from rawInvoiceData nested objects
        if (rawInvoiceData?.hall) {
          if (!resolvedBookingData.hallName) resolvedBookingData.hallName = rawInvoiceData.hall.name || rawInvoiceData.hall.Name || rawInvoiceData.hall.hallName;
        }
        if (rawInvoiceData?.booking) {
          if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = rawInvoiceData.booking.bookingDate || rawInvoiceData.booking.eventDate;
          if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = rawInvoiceData.booking.eventTime || rawInvoiceData.booking.timeSlot || rawInvoiceData.booking.bookingTime;
          if (!resolvedBookingData.eventType) resolvedBookingData.eventType = rawInvoiceData.booking.eventType;
          if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = rawInvoiceData.booking.numberOfGuests;
          if (!resolvedBookingData.bookingDetails?.length) resolvedBookingData.bookingDetails = rawInvoiceData.booking.bookingDetails || [];
        }

        // Extract from rawInvoiceData top-level fields
        if (!resolvedBookingData.hallName) resolvedBookingData.hallName = rawInvoiceData?.hallName || rawInvoiceData?.bookingName;
        if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = rawInvoiceData?.timeSlot || rawInvoiceData?.time_slot || rawInvoiceData?.eventTime;
        if (!resolvedBookingData.eventType) resolvedBookingData.eventType = rawInvoiceData?.eventType || rawInvoiceData?.event_type;
        if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = rawInvoiceData?.numberOfGuests || rawInvoiceData?.guests || rawInvoiceData?.no_of_guests || rawInvoiceData?.guest_count;
        if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = rawInvoiceData?.eventDate || rawInvoiceData?.bookingDate;

        // Extract hall name and date from remarks string as partial fallback
        const remarks = rawInvoiceData?.voucher?.remarks || '';
        if (remarks) {
          console.log('🔍 Checking remarks for data:', remarks);

          if (!resolvedBookingData.hallName) {
            const hallMatch = remarks.match(/for\s+(.*?)\s+booking/i);
            if (hallMatch) {
              resolvedBookingData.hallName = hallMatch[1].trim();
            }
          }

          if (!resolvedBookingData.bookingDate) {
            const dateMatch = remarks.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
            if (dateMatch) {
              const extractedDate = dateMatch[1];
              let dateObj;
              if (extractedDate.includes('/')) {
                const parts = extractedDate.split('/');
                if (parts.length === 3) {
                  const isoDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                  dateObj = new Date(isoDate);
                }
              } else {
                dateObj = new Date(extractedDate);
              }
              if (dateObj && !isNaN(dateObj.getTime())) {
                resolvedBookingData.bookingDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              } else {
                resolvedBookingData.bookingDate = extractedDate;
              }
            }
          }

          // Try to extract event type from remarks (common event keywords)
          if (!resolvedBookingData.eventType) {
            const eventMatch = remarks.match(/(wedding|anniversary|birthday|valima|mehndi|mehandi|reception|party|corporate|seminar|conference|engagement|nikah|aqeeqah)/i);
            if (eventMatch) {
              resolvedBookingData.eventType = eventMatch[1].toLowerCase();
            }
          }

          // Try to extract time slot from remarks
          if (!resolvedBookingData.eventTime) {
            const timeMatch = remarks.match(/(MORNING|EVENING|DAY|NIGHT)/i);
            if (timeMatch) {
              resolvedBookingData.eventTime = timeMatch[1].toUpperCase();
            }
          }

          // Try to extract guest count from remarks
          if (!resolvedBookingData.numberOfGuests) {
            const guestsMatch = remarks.match(/(\d+)\s*(?:guests?|persons?|pax)/i) || remarks.match(/(?:guests?|persons?|pax)\s*[:=]?\s*(\d+)/i);
            if (guestsMatch) {
              resolvedBookingData.numberOfGuests = parseInt(guestsMatch[1], 10);
            }
          }
        }

        // Use passed member details
        const resolvedMemberDetails = memberDetails || {};

        // Check if we still need to fetch — are any of the KEY display fields missing?
        const needsFetch = !resolvedBookingData.eventTime ||
          !resolvedBookingData.eventType ||
          !resolvedBookingData.numberOfGuests ||
          (!resolvedBookingData.bookingDetails?.length && !resolvedBookingData.bookingDate);

        console.log('📊 needsFetch:', needsFetch, '| eventTime:', resolvedBookingData.eventTime, '| eventType:', resolvedBookingData.eventType, '| guests:', resolvedBookingData.numberOfGuests);
        console.log('📊 resolvedBookingData:', JSON.stringify(resolvedBookingData));
        console.log('📊 resolvedVenue:', JSON.stringify(resolvedVenue));

        if (needsFetch) {
          const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
          console.log('🔍 Missing hall details, fetching from API for bookingId:', bookingId);
          if (bookingId) {
            try {
              // PRIMARY: Fetch all halls — each hall has a bookings[] array with full details
              const hallsRes = await banquetAPI.getAllHalls();
              const hallsData = hallsRes?.data?.Data || hallsRes?.data || [];
              const allHalls = Array.isArray(hallsData) ? hallsData : [];
              console.log('📥 getAllHalls: found', allHalls.length, 'halls');

              // Search all halls' bookings for our booking_id
              let matchedBooking = null;
              let matchedHall = null;
              for (const hall of allHalls) {
                const bookings = hall.bookings || [];
                const found = bookings.find(b => b.id === bookingId || b.id === Number(bookingId));
                if (found) {
                  matchedBooking = found;
                  matchedHall = hall;
                  break;
                }
              }

              if (matchedBooking) {
                console.log('✅ Found matching booking:', JSON.stringify({
                  id: matchedBooking.id,
                  eventType: matchedBooking.eventType,
                  numberOfGuests: matchedBooking.numberOfGuests,
                  bookingTime: matchedBooking.bookingTime,
                  bookingDetails: matchedBooking.bookingDetails,
                }));

                const bd = matchedBooking.bookingDetails || [];
                let apiEventTime = matchedBooking.bookingTime || matchedBooking.timeSlot || matchedBooking.eventTime;
                let apiEventType = matchedBooking.eventType;
                let apiGuests = matchedBooking.numberOfGuests;

                // Also extract from bookingDetails[0] if top-level is missing
                if (bd.length > 0) {
                  const first = bd[0];
                  if (!apiEventTime) apiEventTime = first.timeSlot || first.time_slot;
                  if (!apiEventType) apiEventType = first.eventType || first.event_type;
                }

                resolvedBookingData = {
                  ...resolvedBookingData,
                  bookingDate: resolvedBookingData.bookingDate || matchedBooking.bookingDate,
                  eventTime: resolvedBookingData.eventTime || apiEventTime,
                  eventType: resolvedBookingData.eventType || apiEventType,
                  numberOfGuests: resolvedBookingData.numberOfGuests || apiGuests,
                  bookingDetails: (resolvedBookingData.bookingDetails?.length > 0) ? resolvedBookingData.bookingDetails : bd,
                  hallName: resolvedBookingData.hallName || matchedHall?.name,
                };

                if (!resolvedVenue?.name && matchedHall?.name) {
                  resolvedVenue = { ...resolvedVenue, name: matchedHall.name };
                }

                console.log('✅ After hall booking merge:', JSON.stringify(resolvedBookingData));
              } else {
                console.warn('⚠️ No matching booking found in halls for bookingId:', bookingId);
              }
            } catch (err) {
              console.warn('⚠️ getAllHalls fetch failed:', err?.message || err);
            }

            // If we still don't have the data after getAllHalls, try the voucher API as a last resort
            if (!resolvedBookingData.eventTime || !resolvedBookingData.eventType || !resolvedBookingData.numberOfGuests) {
              try {
                const { voucherAPI } = require('../../config/apis');
                const res2 = await voucherAPI.getVoucherByType('HALL', bookingId);
                console.log('📥 getVoucherByType fallback response:', JSON.stringify(res2?.data));
                const fetched = res2?.data?.Data || res2?.data || {};
                // Handle if response is an array (voucher list)
                const voucherObj = Array.isArray(fetched) ? fetched[0] : fetched;
                const booking = voucherObj?.booking || voucherObj?.Booking || {};

                if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = booking.bookingTime || booking.timeSlot || booking.eventTime;
                if (!resolvedBookingData.eventType) resolvedBookingData.eventType = booking.eventType;
                if (!resolvedBookingData.numberOfGuests) resolvedBookingData.numberOfGuests = booking.numberOfGuests;
                if (!resolvedBookingData.bookingDetails?.length && booking.bookingDetails?.length) {
                  resolvedBookingData.bookingDetails = booking.bookingDetails;
                }
              } catch (err2) {
                console.warn('⚠️ voucherAPI fallback also failed:', err2?.message || err2);
              }
            }
          }

          // Final fallback: if bookingDetails has items but top-level fields are still empty, extract from first detail
          if (resolvedBookingData.bookingDetails?.length > 0) {
            const firstDetail = resolvedBookingData.bookingDetails[0];
            if (!resolvedBookingData.eventTime) resolvedBookingData.eventTime = firstDetail.timeSlot || firstDetail.time_slot;
            if (!resolvedBookingData.eventType) resolvedBookingData.eventType = firstDetail.eventType || firstDetail.event_type;
            if (!resolvedBookingData.bookingDate) resolvedBookingData.bookingDate = firstDetail.date;
          }
        }

        const mappedDetails = {
          invoiceNo: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id || 'N/A',
          invoiceNumber: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id,
          consumerNumber: rawInvoiceData.voucher?.consumer_number,
          bookingId: rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id,
          status: rawInvoiceData.voucher?.status || 'PENDING',
          issued_at: rawInvoiceData.issue_date || rawInvoiceData.voucher?.issued_at || new Date().toISOString(),
          issued_by: rawInvoiceData.voucher?.issued_by || 'System',
          dueDate: rawInvoiceData.due_date || rawInvoiceData.voucher?.expiresAt,
          amount: rawInvoiceData.voucher?.amount,
          totalPrice: rawInvoiceData.voucher?.amount,
          paymentMode: rawInvoiceData.voucher?.payment_mode || 'PENDING',
          membershipNo: rawInvoiceData.membership?.no || resolvedMemberDetails?.membershipNo,
          memberName: rawInvoiceData.membership?.name || resolvedMemberDetails?.memberName,
          // Hall specific - prioritize passed data
          hallName: resolvedVenue?.name || resolvedBookingData?.hallName,
          eventDate: resolvedBookingData?.bookingDate || resolvedBookingData?.eventDate,
          eventTime: resolvedBookingData?.eventTime,
          eventType: resolvedBookingData?.eventType,
          bookingDetails: resolvedBookingData?.bookingDetails || [],
          numberOfGuests: resolvedBookingData?.numberOfGuests,
          isGuest: isGuest,
          isGuestBooking: Boolean(isGuest) ||
            bookingData?.pricingType === 'guest' ||
            rawInvoiceData?.pricingType === 'guest' ||
            rawInvoiceData?.booking?.pricingType === 'guest' ||
            Boolean(
              guestDetails?.name ||
              guestDetails?.guestName ||
              bookingData?.guestName ||
              bookingData?.guest_name ||
              rawInvoiceData?.booking?.guestName ||
              rawInvoiceData?.guestName ||
              rawInvoiceData?.guest_name ||
              guestDetails?.contact ||
              guestDetails?.guestContact ||
              bookingData?.guestContact ||
              bookingData?.guest_contact ||
              rawInvoiceData?.booking?.guestContact ||
              rawInvoiceData?.guestContact ||
              rawInvoiceData?.guest_contact
            ),
          guestName:
            guestDetails?.name ||
            guestDetails?.guestName ||
            resolvedBookingData?.guestName ||
            bookingData?.guestName ||
            bookingData?.guest_name ||
            rawInvoiceData?.booking?.guestName ||
            rawInvoiceData?.guestName ||
            rawInvoiceData?.guest_name,
          guestContact:
            guestDetails?.contact ||
            guestDetails?.guestContact ||
            resolvedBookingData?.guestContact ||
            bookingData?.guestContact ||
            bookingData?.guest_contact ||
            rawInvoiceData?.booking?.guestContact ||
            rawInvoiceData?.guestContact ||
            rawInvoiceData?.guest_contact,
          advanceAmount: calculateHallAdvance(rawInvoiceData.voucher?.amount || 0),
        };

        console.log('📋 Final mapped invoice details:', JSON.stringify(mappedDetails));
        setInvoiceData(mappedDetails);
        setLoading(false);
      } else {
        Alert.alert('Error', 'Invoice data not found');
        navigation.goBack();
      }
    };

    loadInvoiceData();
  }, [rawInvoiceData, bookingData, venue, memberDetails, isGuest]);

  // Real-time payment sync
  useEffect(() => {
    const voucherId = rawInvoiceData?.voucher?.id;
    if (!voucherId) return;

    const unsubscribe = socketService.subscribeToPayment(voucherId, (data) => {
      if (data.status === 'PAID' || data.status === 'CANCELLED' || data.status === 'CONFIRMED') {
        setInvoiceData(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    return () => unsubscribe();
  }, [rawInvoiceData?.voucher?.id]);

  // Countdown Timer
  useEffect(() => {
    const targetDateStr = invoiceData?.dueDate;
    if (!targetDateStr || invoiceData?.status === 'PAID') {
      if (timeLeft !== '') setTimeLeft('');
      return;
    }
    const targetDate = new Date(targetDateStr).getTime();
    if (isNaN(targetDate)) { setTimeLeft(''); return; }
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(interval); setTimeLeft('EXPIRED'); return; }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      let timeStr = '';
      if (hours > 0) timeStr += `${hours}h `;
      timeStr += `${minutes}m ${seconds}s`;
      setTimeLeft(timeStr);
    }, 1000);
    return () => clearInterval(interval);
  }, [invoiceData?.dueDate, invoiceData?.status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // If hall details are missing, try to re-fetch them
      if (!invoiceData?.hallName || !invoiceData?.eventDate || !invoiceData?.eventTime || !invoiceData?.eventType || !invoiceData?.numberOfGuests) {
        const bookingId = rawInvoiceData?.voucher?.booking_id || rawInvoiceData?.voucher?.id;
        if (bookingId) {
          try {
            const base_url = getBaseUrl();
            // Try more specific API calls to get booking details
            let res;
            try {
              // First try the specific booking details API
              const bookingRes = await fetch(`${base_url}/booking/${bookingId}`, {
                headers: {
                  'Authorization': `Bearer ${await getAuthToken()}`
                }
              });
              if (bookingRes.ok) {
                res = await bookingRes.json();
                console.log('✅ Got booking details from specific API');
              }
            } catch (specificErr) {
              console.log('⚠️ Specific booking API failed, falling back to voucher API');
            }

            // If specific API didn't work, fall back to voucher API
            if (!res) {
              res = await banquetAPI.getHallVoucher(bookingId);
            }

            const fetched = res?.data?.Data || res?.data || {};
            const booking = fetched.booking || fetched.Booking || {};
            const hall = fetched.hall || fetched.Hall || {};

            // Process date if available
            let processedEventDate = invoiceData?.eventDate;
            const rawDate = booking.bookingDate || booking.booking_date || fetched.bookingDate || fetched.eventDate;
            if (rawDate && typeof rawDate === 'string') {
              if (rawDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                // Format MM/DD/YYYY
                const [month, day, year] = rawDate.split('/');
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const dateObj = new Date(isoDate);
                if (!isNaN(dateObj.getTime())) {
                  processedEventDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                } else {
                  processedEventDate = rawDate;
                }
              } else {
                processedEventDate = rawDate;
              }
            }

            setInvoiceData(prev => ({
              ...prev,
              hallName: prev?.hallName || hall.name || booking.hallName || fetched.hallName,
              eventDate: processedEventDate,
              eventTime: prev?.eventTime || booking.timeSlot || booking.time_slot || booking.eventTime || fetched.timeSlot || fetched.eventTime,
              eventType: prev?.eventType || booking.eventType || booking.event_type || fetched.eventType,
              numberOfGuests: prev?.numberOfGuests || booking.numberOfGuests || booking.number_of_guests || fetched.numberOfGuests || booking.guests || fetched.guests,
              bookingDetails: (prev?.bookingDetails?.length > 0) ? prev.bookingDetails : (booking.bookingDetails || booking.booking_details || fetched.bookingDetails || []),
            }));
            console.log('✅ Refreshed hall booking details successfully');
          } catch (err) {
            console.warn('⚠️ Refresh: Could not fetch hall details:', err);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMakePayment = () => {
    // Porting Room's payment flow - DIRECT navigation per request
    clearVoucher();
    Alert.alert(
      'Payment Gateway',
      'Payment integration would happen here. For now, please check your bookings list after payment completion.',
      [{ text: 'OK' }]
    );
  };

  const handleSaveToGallery = async () => {
    try {
      setSaveLoading(true);
      const hasPermission = await permissionService.requestPhotoLibraryPermission();
      if (!hasPermission) {
        permissionService.handlePermissionDenied();
        return;
      }
      const ref = viewShotRef.current || invoiceRef.current;
      if (ref) {
        const uri = await captureRef(ref, { format: 'png', quality: 1.0 });
        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('Success', 'Invoice saved to gallery successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShareInvoice = async () => {
    try {
      setShareLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = await captureRef(invoiceRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Share.share({
        title: `Hall Invoice - ${invoiceData.invoiceNo}`,
        url: uri,
        message: `Here is the invoice for your PSC hall booking: ${invoiceData.invoiceNo}`,
      });
    } catch (error) { console.log('Share failed:', error); } finally { setShareLoading(false); }
  };

  const copyToClipboard = () => {
    if (!invoiceData?.consumerNumber) return;
    Clipboard.setString(invoiceData.consumerNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelVoucher = async () => {
    if (!invoiceData?.consumerNumber) return;

    Alert.alert(
      'Cancel Voucher',
      'Are you sure you want to cancel this hall booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshing(true);
              await bookingService.deleteBooking(invoiceData?.consumerNumber);
              await clearVoucher();
              Alert.alert('Success', 'Booking cancelled');
              navigation.navigate('start');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel.');
            } finally { setRefreshing(false); }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    // If it's already a properly formatted date string, return as is
    if (typeof dateString === 'string' && isNaN(Date.parse(dateString)) === false) {
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    }

    // If it's already a formatted date string like "Mar 14, 2026", return as is
    if (typeof dateString === 'string' && dateString.match(/^[A-Za-z]{3}\s\d{1,2},\s\d{4}$/)) {
      return dateString;
    }

    // Handle MM/DD/YYYY format from remarks
    if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [month, day, year] = dateString.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      try {
        return new Date(isoDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    }

    return dateString;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (error) { return dateString; }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return 'N/A';
    const slotMap = { 'DAY': 'Day', 'NIGHT': 'Night', 'MORNING': 'Morning', 'EVENING': 'Evening' };
    return slotMap[timeSlot.toUpperCase()] || timeSlot;
  };

  const statusInfo = (() => {
    const s = invoiceData?.status?.toUpperCase();
    switch (s) {
      case 'CONFIRMED': case 'PAID':
        return { text: 'CONFIRMED', style: styles.statusConfirmed, icon: 'check-circle', textColor: '#2e7d32' };
      case 'CANCELLED':
        return { text: 'CANCELLED', style: styles.statusCancelled, icon: 'cancel', textColor: '#dc3545' };
      default:
        return { text: 'PAYMENT PENDING', style: styles.statusPending, icon: 'payment', textColor: '#aa2e25' };
    }
  })();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
        <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
          <View style={styles.notchRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
            <Text style={styles.notchTitle}>Hall Invoice</Text>
            <View style={styles.iconWrapper} />
          </View>
        </ImageBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Generating invoice...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
        <View style={styles.notchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
          <Text style={styles.notchTitle}>Hall Invoice</Text>
          <View style={styles.iconWrapper} />
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#b48a64']} />}
      >
        {invoiceData && (
          <>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ backgroundColor: '#fffaf2' }}>
              <View style={styles.invoiceContainer}>
                {/* Header Section */}
                <View style={styles.invoiceHeader}>
                  <Icon name={statusInfo.icon} size={40} color={['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? '#2e7d32' : "#b48a64"} />
                  {['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) && (
                    <Text style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: 5 }}>Payment Successful</Text>
                  )}
                  <Text style={styles.invoiceTitle}>BANQUET HALL BOOKING</Text>
                  <Text style={styles.invoiceSubtitle}>{['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? "Booking confirmed!" : "Complete payment to confirm."}</Text>

                  {timeLeft && timeLeft !== 'EXPIRED' && invoiceData.status !== 'PAID' && (
                    <View style={styles.timerWrapper}>
                      <View style={styles.timerContainer}>
                        <Icon name="schedule" size={16} color="#dc3545" />
                        <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
                      </View>
                      <TouchableOpacity style={styles.cancelVoucherGhostButton} onPress={handleCancelVoucher}>
                        <Icon name="close" size={14} color="#666" />
                        <Text style={styles.cancelVoucherGhostText}>Cancel Voucher</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {timeLeft === 'EXPIRED' && <Text style={styles.expiredText}>EXPIRED</Text>}
                </View>

                {/* Details Section */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Invoice Details</Text>
                  {[
                    { label: 'Invoice Number:', value: invoiceData.invoiceNo, highlight: true },
                    { label: 'Consumer Number:', value: invoiceData.consumerNumber, copy: true },
                    { label: 'Booking ID:', value: invoiceData.bookingId },
                    { label: 'Payment Due:', value: formatDateTime(invoiceData.dueDate), warning: true },
                    { label: 'Member Name:', value: invoiceData.memberName },
                    { label: 'Membership No:', value: invoiceData.membershipNo }
                  ].map((row, i) => row.value ? (
                    <View key={i} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      {row.copy ? (
                        <TouchableOpacity onPress={copyToClipboard} style={styles.copyContainer}>
                          <Text style={[styles.detailValue, styles.invoiceHighlight]}>{row.value}</Text>
                          <Icon name={copied ? "check" : "content-copy"} size={16} color={copied ? "#2e7d32" : "#b48a64"} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.detailValue, row.highlight && styles.invoiceHighlight, row.warning && styles.dueDate]}>{row.value}</Text>
                      )}
                    </View>
                  ) : null)}

                  {/* Guest Details - Show if guest booking */}
                  {invoiceData.isGuestBooking && (
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
                </View>

                {/* Hall Booking Summary */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Hall Booking Information</Text>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Hall Name:</Text><Text style={styles.detailValue}>{invoiceData.hallName || 'N/A'}</Text></View>

                  {invoiceData.bookingDetails?.length > 0 ? (
                    <View style={styles.multiDateContainer}>
                      <Text style={styles.detailLabel}>Dates & Configurations:</Text>
                      {invoiceData.bookingDetails.map((item, index) => (
                        <View key={index} style={styles.dateConfigItem}>
                          <View style={styles.itemRow}>
                            <View style={styles.dateCol}><Icon name="event" size={16} color="#b48a64" /><Text style={styles.dateText}>{formatDate(item.date)}</Text></View>
                            <View style={styles.configCol}>
                              <View style={styles.configChip}><Text style={styles.configText}>{formatTimeSlot(item.timeSlot)}</Text></View>
                              <View style={styles.configChip}><Text style={styles.configText}>{item.eventType}</Text></View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <>
                      <View style={styles.detailRow}><Text style={styles.detailLabel}>Event Date:</Text><Text style={styles.detailValue}>{formatDate(invoiceData.eventDate)}</Text></View>
                      <View style={styles.detailRow}><Text style={styles.detailLabel}>Time Slot:</Text><Text style={styles.detailValue}>{formatTimeSlot(invoiceData.eventTime)}</Text></View>
                      <View style={styles.detailRow}><Text style={styles.detailLabel}>Event Type:</Text><Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{invoiceData.eventType || 'N/A'}</Text></View>
                    </>
                  )}
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Expected Guests:</Text><Text style={styles.detailValue}>{invoiceData.numberOfGuests ? `${invoiceData.numberOfGuests} Persons` : 'N/A'}</Text></View>
                </View>

                {/* Payment Breakdown */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Payment Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount:</Text>
                    <Text style={[styles.detailValue, styles.totalAmountText]}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Advance Deposit Required:</Text>
                    <Text style={[styles.detailValue, styles.advanceAmountText]}>Rs. {parseFloat(invoiceData.advanceAmount || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, statusInfo.style]}><Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text></View>
                  </View>
                </View>

                {/* Footer Info */}
                <View style={[styles.invoiceSection, { marginTop: 5 }]}>
                  <Text style={styles.sectionTitle}>Important Information</Text>
                  {["Complete payment within 1 hour.", "Present this voucher at the club office.", "Adhere to hall booking policies."].map((txt, i) => (
                    <View key={i} style={styles.instructionItem}>
                      <Icon name="info-outline" size={16} color="#b48a64" />
                      <Text style={styles.instructionText}>{txt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ViewShot>

            {/* Hidden capture view */}
            <View style={shareStyles.offScreenContainer}>
              <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={shareStyles.invoiceSheet}>
                <View style={shareStyles.header}><Text style={shareStyles.headerTitle}>PSC BANQUET HALL</Text><View style={shareStyles.headerDivider} /><Text style={shareStyles.headerSubtitle}>Official Booking Invoice</Text></View>
                <View style={shareStyles.confirmedBadge}><Text style={shareStyles.confirmedBadgeText}>✓ {statusInfo.text}</Text></View>
                <View style={shareStyles.section}>
                  <Text style={shareStyles.sectionTitle}>Booking Summary</Text><View style={shareStyles.sectionDivider} />
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Invoice:</Text><Text style={shareStyles.value}>{invoiceData.invoiceNo}</Text></View>
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Hall:</Text><Text style={shareStyles.value}>{invoiceData.hallName}</Text></View>
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Advance:</Text><Text style={shareStyles.value}>Rs. {parseFloat(invoiceData.advanceAmount || 0).toLocaleString()}</Text></View>
                </View>
                <View style={shareStyles.footer}><View style={shareStyles.footerDivider} /><Text style={shareStyles.footerText}>Thank you for choosing PSC!</Text></View>
              </ViewShot>
            </View>

            {/* Actions */}
            <View style={{ padding: 15 }}>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveToGallery}
                  disabled={saveLoading}
                >
                  <Icon name="file-download" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {saveLoading ? 'Saving...' : 'Save to Gallery'}
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.shareButton} onPress={handleShareInvoice} disabled={shareLoading}>
                  <Icon name="share" size={20} color="#fff" /><Text style={styles.shareButtonText}>Share Invoice</Text>
                </TouchableOpacity> */}
              </View>
              {/* {invoiceData.status !== 'PAID' && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleMakePayment}>
                  <Icon name="payment" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Pay Advance Now</Text>
                </TouchableOpacity>
              )} */}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f3eb' },
  notch: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: "hidden", backgroundColor: "#D2B48C" },
  notchImage: { resizeMode: "cover" },
  notchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 },
  iconWrapper: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  notchTitle: { fontSize: 22, fontWeight: "600", color: "#000" },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 10, color: '#666', fontSize: 16 },
  invoiceContainer: { padding: 15 },
  invoiceHeader: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, elevation: 2 },
  invoiceTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  invoiceSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  invoiceSection: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
  invoiceHighlight: { color: '#b48a64', fontWeight: 'bold' },
  timerWrapper: { alignItems: 'center', marginTop: 10 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, borderWidth: 1, borderColor: '#ffa39e' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545' },
  cancelVoucherGhostButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d9d9d9', backgroundColor: 'transparent' },
  cancelVoucherGhostText: { fontSize: 13, fontWeight: '500', color: '#666', marginLeft: 4 },
  expiredText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545', marginTop: 10 },
  dueDate: { color: '#dc3545', fontWeight: 'bold' },
  multiDateContainer: { marginTop: 10, marginBottom: 10 },
  dateConfigItem: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#eee' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCol: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 6 },
  configCol: { flexDirection: 'row', alignItems: 'center' },
  configChip: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 4 },
  configText: { fontSize: 11, color: '#4A5568', textTransform: 'capitalize' },
  totalAmountText: { fontSize: 15, color: '#333', fontWeight: '600' },
  advanceAmountText: { fontSize: 18, fontWeight: 'bold', color: '#b48a64' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#d4efdf' },
  statusPending: { backgroundColor: '#fadbd8' },
  statusCancelled: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  copyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  guestDivider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  guestSectionLabel: { fontSize: 12, color: '#333', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  guestHighlight: { color: '#333', fontWeight: 'bold' },
  instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  instructionText: { fontSize: 13, color: '#666', marginLeft: 10, flex: 1 },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 0, // Padding handled by parent container
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#b48a64',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b48a64', marginRight: 10 },
  secondaryButtonText: { color: '#b48a64', fontWeight: '600', marginLeft: 8 },
  shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#2196f3' },
  shareButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#b48a64', padding: 15, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});

const shareStyles = StyleSheet.create({
  offScreenContainer: { position: 'absolute', left: -9999, top: 0, opacity: 1 },
  invoiceSheet: { width: 380, backgroundColor: '#ffffff', padding: 24 },
  header: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 1.5 },
  headerDivider: { width: 60, height: 3, backgroundColor: '#b48a64', marginVertical: 10, borderRadius: 2 },
  headerSubtitle: { fontSize: 13, color: '#777' },
  confirmedBadge: { backgroundColor: '#e8f5e9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#c8e6c9' },
  confirmedBadgeText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 6, textTransform: 'uppercase' },
  sectionDivider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 13, color: '#666' },
  value: { fontSize: 13, color: '#222', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
  footer: { alignItems: 'center', marginTop: 8, paddingTop: 12 },
  footerDivider: { width: '100%', height: 1, backgroundColor: '#e0e0e0', marginBottom: 12 },
  footerText: { fontSize: 14, fontWeight: '600', color: '#333' },
});