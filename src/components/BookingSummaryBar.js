// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Animated,
//     Platform,
//     AppState,
//     Alert,
//     Clipboard,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AntIcon from 'react-native-vector-icons/AntDesign';
// import { useVoucher } from '../auth/contexts/VoucherContext';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import notifee from '@notifee/react-native';
// import { voucherAPI } from '../../config/apis';
// import socketService from '../../services/socket.service';

// const BookingSummaryBar = () => {
//     const { activeVoucher, clearVoucher } = useVoucher();
//     const { user } = useAuth();
//     const navigation = useNavigation();
//     const [vouchers, setVouchers] = useState([]);
//     const [currentTime, setCurrentTime] = useState(new Date().getTime());
//     const [fadeAnim] = useState(new Animated.Value(0));
//     const [expanded, setExpanded] = useState(false);
//     const expandAnim = useRef(new Animated.Value(0)).current;
//     const notificationSent = useRef(new Set()); // Track notifications per voucher
//     const fetchInterval = useRef(null);
//     const timerInterval = useRef(null);
//     const [copiedId, setCopiedId] = useState(null);

//     // Don't show timer for admin users or when not logged in (login screen)
//     const isAdmin = !user || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

//     const fetchVouchers = async () => {
//         try {
//             const data = await voucherAPI.getTimerVouchers();
//             console.log(data)
//             if (data && Array.isArray(data)) {
//                 // Normalize data: Some responses wrap voucher details in voucherData.voucher
//                 const normalizedData = data.map(item => {
//                     const v = item.voucherData?.voucher || item;

//                     // Booking-level info may be nested in various places depending on type
//                     const bd = item.bookingData || item.booking || {};
//                     const venueInfo = item.venue || item.hall || item.lawn || {};
//                     const memberInfo = item.memberDetails || item.membership || {};

//                     return {
//                         ...item,
//                         id: v.id || item.id,
//                         booking_id: v.booking_id || item.booking_id || item.bookingId,
//                         voucher_no: v.voucher_no || item.voucher_no || item.invoiceNumber,
//                         issued_at: v.issued_at || v.issue_date || item.issued_at || item.issue_date,
//                         expiresAt: v.expiresAt || v.expires_at || item.expiresAt || item.expires_at || item.dueDate || item.due_date,
//                         consumer_number: v.consumer_number || item.consumer_number,
//                         amount: v.amount || item.amount,
//                         status: v.status || item.status,
//                         payment_mode: v.payment_mode || item.payment_mode,
//                         remarks: v.remarks || item.remarks,
//                         membership_no: memberInfo.no || memberInfo.membershipNo || item.membership_no,
//                         member_name: memberInfo.name || memberInfo.memberName || item.member_name,
//                         booking_type: v.booking_type || item.booking_type || item.bookingType || 'ROOM',
//                         // Room dates
//                         check_in: bd.checkIn || bd.check_in || v.check_in || item.check_in,
//                         check_out: bd.checkOut || bd.check_out || v.check_out || item.check_out,
//                         // Hall/Lawn/Shoot booking date
//                         booking_date: bd.bookingDate || bd.booking_date || bd.eventDate || v.booking_date || v.bookingDate || item.booking_date || item.bookingDate || item.date,
//                         // Venue/Hall info
//                         venue: venueInfo,
//                         venue_name: venueInfo.name || bd.hallName || bd.lawnName || bd.venueName || item.venueName,
//                         // Booking detail fields for Hall/Lawn/Shoot
//                         bookingData: item.bookingData || {
//                             bookingDate: bd.bookingDate || bd.eventDate || bd.booking_date,
//                             eventTime: bd.eventTime || bd.timeSlot || bd.time_slot,
//                             eventType: bd.eventType || bd.event_type,
//                             numberOfGuests: bd.numberOfGuests || bd.number_of_guests || bd.guests,
//                             bookingDetails: bd.bookingDetails || bd.booking_details || [],
//                             hallName: venueInfo.name || bd.hallName,
//                             lawnName: venueInfo.name || bd.lawnName,
//                         },
//                         memberDetails: item.memberDetails || {
//                             memberName: memberInfo.name || memberInfo.memberName,
//                             membershipNo: memberInfo.no || memberInfo.membershipNo,
//                         },
//                     };
//                 });

//                 setVouchers(normalizedData);
//                 if (normalizedData.length > 0) {
//                     Animated.timing(fadeAnim, {
//                         toValue: 1,
//                         duration: 500,
//                         useNativeDriver: true,
//                     }).start();
//                 } else {
//                     Animated.timing(fadeAnim, {
//                         toValue: 0,
//                         duration: 500,
//                         useNativeDriver: true,
//                     }).start();
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching timer vouchers:', error);
//         }
//     };

//     useEffect(() => {
//         // Don't fetch vouchers for admin users
//         if (isAdmin) {
//             setVouchers([]);
//             if (fetchInterval.current) clearInterval(fetchInterval.current);
//             if (timerInterval.current) clearInterval(timerInterval.current);
//             return;
//         }

//         fetchVouchers();
//         fetchInterval.current = setInterval(fetchVouchers, 30000); // Fetch every 30s

//         timerInterval.current = setInterval(() => {
//             setCurrentTime(new Date().getTime());
//         }, 1000);

//         return () => {
//             if (fetchInterval.current) clearInterval(fetchInterval.current);
//             if (timerInterval.current) clearInterval(timerInterval.current);
//         };
//     }, [isAdmin]);

//     // Track which vouchers we've already tried to auto-cancel to avoid loops
//     const autoCancelled = useRef(new Set());

//     // 1. Socket subscriptions for real-time payment updates - Only depend on vouchers
//     useEffect(() => {
//         const unsubscribes = [];

//         vouchers.forEach(voucher => {
//             const voucherId = voucher.id || voucher.booking_id;
//             if (voucherId) {
//                 const unsub = socketService.subscribeToPayment(voucherId, (data) => {
//                     if (data.status === 'PAID' || data.status === 'CANCELLED') {
//                         console.log(`📡 [Voucher Sync] Voucher ${voucherId} status changed to ${data.status}`);

//                         if (data.status === 'PAID') {
//                             Alert.alert(
//                                 'Payment Received',
//                                 `Your payment for ${voucher.venue_name || 'the booking'} has been confirmed!`,
//                                 [{ text: 'Great!' }]
//                             );
//                         }

//                         setVouchers(prev => prev.filter(v => (v.id || v.booking_id) !== voucherId));
//                         notificationSent.current.delete(voucherId);

//                         if (activeVoucher && (activeVoucher.id === voucherId || activeVoucher.bookingId === voucherId)) {
//                             clearVoucher();
//                         }
//                     }
//                 });
//                 unsubscribes.push(unsub);
//             }
//         });

//         return () => {
//             unsubscribes.forEach(unsub => unsub());
//         };
//     }, [vouchers]); // Removed currentTime to avoid re-subscribing every second

//     // 2. Auto-cancellation on expiry - Depends on currentTime
//     useEffect(() => {
//         vouchers.forEach(async (voucher) => {
//             const timer = getVoucherTimer(voucher);
//             const voucherId = voucher.id || voucher.booking_id;

//             if (timer === 'EXPIRED' && !autoCancelled.current.has(voucherId)) {
//                 autoCancelled.current.add(voucherId);
//                 console.log(`⏰ [Auto-Cancel] Voucher ${voucherId} expired. Triggering cancellation...`);

//                 try {
//                     await bookingService.deleteBooking(voucher.consumer_number);
//                     console.log(`✅ [Auto-Cancel] Booking ${voucherId} cancelled successfully.`);

//                     setVouchers(prev => prev.filter(v => (v.id || v.booking_id) !== voucherId));

//                     if (activeVoucher && (activeVoucher.id === voucherId || activeVoucher.bookingId === voucherId)) {
//                         clearVoucher();
//                     }
//                 } catch (error) {
//                     console.error(`❌ [Auto-Cancel] Failed to cancel voucher ${voucherId}:`, error);
//                 }
//             }
//         });
//     }, [vouchers, currentTime]);

//     const getVoucherTimer = (voucher) => {
//         const rawIssueDate = voucher?.issued_at;
//         const rawExpire = voucher?.expiresAt || voucher?.expires_at || 15;

//         const issueTime = rawIssueDate ? new Date(rawIssueDate).getTime() : null;
//         let expiryTime = null;

//         // Try to parse rawExpire as a number of minutes first
//         const expireMinutes = Number(rawExpire);

//         if (!isNaN(expireMinutes) && typeof rawExpire !== 'string') {
//             // It's a number (or number-like string that is just a digit), treat as minutes
//             if (issueTime && !isNaN(issueTime)) {
//                 expiryTime = issueTime + (expireMinutes * 60 * 1000);
//             }
//         } else {
//             // Try to parse as absolute date string
//             const absoluteExp = new Date(rawExpire).getTime();
//             if (!isNaN(absoluteExp)) {
//                 expiryTime = absoluteExp;
//             } else if (issueTime && !isNaN(issueTime) && !isNaN(expireMinutes)) {
//                 // Fallback to minutes if it's a numeric string
//                 expiryTime = issueTime + (expireMinutes * 60 * 1000);
//             }
//         }

//         if (!expiryTime || isNaN(expiryTime)) {
//             return 'EXPIRED';
//         }

//         const distance = expiryTime - currentTime;

//         if (distance <= 0) return 'EXPIRED';

//         const minutes = Math.floor(distance / (1000 * 60));
//         const seconds = Math.floor((distance % (1000 * 60)) / 1000);

//         return {
//             text: `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`,
//             minutes,
//             expired: false,
//             distance
//         };
//     };


//     // Filter valid vouchers and sort by urgency
//     const activeVouchers = vouchers
//         .map(v => ({ ...v, timer: getVoucherTimer(v) }))
//         .filter(v => v.timer !== 'EXPIRED')
//         .sort((a, b) => a.timer.distance - b.timer.distance);

//     useEffect(() => {
//         // Notification logic for the most urgent voucher
//         if (activeVouchers.length > 0) {
//             const mostUrgent = activeVouchers[0];
//             const voucherId = mostUrgent.voucher_no || mostUrgent.id;

//             if (mostUrgent.timer.minutes <= 15 && !notificationSent.current.has(voucherId)) {
//                 triggerUrgencyNotification(mostUrgent);
//                 notificationSent.current.add(voucherId);
//             }
//         }
//     }, [activeVouchers]);

//     const triggerUrgencyNotification = async (voucher) => {
//         const message = `Your booking hold (${voucher.voucher_no || 'Pending'}) expires in 15 minutes. Complete your payment now!`;

//         if (AppState.currentState === 'active') {
//             Alert.alert(
//                 "Booking Expiry Reminder",
//                 message,
//                 [{ text: "Complete Payment", onPress: () => handlePress(voucher) }, { text: "Dismiss" }]
//             );
//         } else {
//             try {
//                 const channelId = await notifee.createChannel({
//                     id: 'urgency-reminder',
//                     name: 'Urgency Reminders',
//                 });

//                 await notifee.displayNotification({
//                     title: 'Hold Expiring Soon!',
//                     body: message,
//                     android: {
//                         channelId,
//                         pressAction: { id: 'default' },
//                     },
//                 });
//             } catch (error) {
//                 console.error('Error triggering local notification:', error);
//             }
//         }
//     };

//     if (isAdmin || activeVouchers.length === 0) return null;

//     const handlePress = (voucher) => {
//         const bookingType = voucher.booking_type || voucher.bookingType || 'ROOM';
//         let screen = 'voucher';

//         // Build a rawInvoiceData-shaped object that all invoice screens expect.
//         // Each screen does: const { invoiceData: rawInvoiceData } = route.params
//         // and then checks `if (rawInvoiceData) { ... } else { Alert "Invoice data not found" }`
//         const builtInvoiceData = {
//             voucher: {
//                 id: voucher.id,
//                 voucher_no: voucher.voucher_no,
//                 consumer_number: voucher.consumer_number,
//                 amount: voucher.amount,
//                 status: voucher.status || 'PENDING',
//                 issued_at: voucher.issued_at,
//                 expiresAt: voucher.expiresAt || voucher.expires_at,
//                 booking_id: voucher.booking_id || voucher.bookingId,
//                 payment_mode: voucher.payment_mode,
//                 remarks: voucher.remarks,
//             },
//             due_date: voucher.expiresAt || voucher.expires_at || voucher.dueDate,
//             membership: {
//                 no: voucher.membership_no || voucher.membershipNo,
//                 name: voucher.member_name || voucher.memberName,
//             },
//             // Preserve any extra data from the API
//             ...((voucher.voucherData) || {}),
//         };

//         const params = {
//             bookingId: voucher.booking_id || voucher.id || voucher.bookingId,
//             numericBookingId: voucher.booking_id || voucher.id || voucher.bookingId,
//             // Pass as both `invoiceData` (for hall/lawn/shoot screens) and `voucherData` (for room screen)
//             invoiceData: builtInvoiceData,
//             voucherData: voucher.voucherData || builtInvoiceData,
//             bookingData: voucher.bookingData,
//             bookingDetails: voucher.bookingDetails,
//             venue: voucher.venue,
//             roomType: voucher.roomType,
//             memberDetails: voucher.memberDetails,
//             isGuest: voucher.isGuest,
//             dueDate: voucher.dueDate || voucher.expiresAt,
//             bookingType: bookingType,
//         };

//         if (bookingType === 'ROOM') {
//             screen = 'voucher';         // lowercase - src/rooms/voucher.js
//         } else if (bookingType === 'HALL') {
//             screen = 'HallInvoiceScreen';
//         } else if (bookingType === 'LAWN') {
//             screen = 'Voucher';         // uppercase - src/lawn/Voucher.js
//         } else if (bookingType === 'SHOOT') {
//             screen = 'InvoiceScreen';
//         }

//         navigation.navigate(screen, params);
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-US', {
//                 month: 'short',
//                 day: 'numeric'
//             });
//         } catch (error) {
//             return dateString;
//         }
//     };

//     const copyToClipboard = (text, id) => {
//         Clipboard.setString(text);
//         setCopiedId(id);
//         setTimeout(() => setCopiedId(null), 2000);
//     };

//     const toggleExpand = () => {
//         const toValue = expanded ? 0 : 1;
//         setExpanded(!expanded);
//         Animated.spring(expandAnim, {
//             toValue,
//             useNativeDriver: false,
//         }).start();
//     };

//     const mostUrgent = activeVouchers[0];
//     const totalVouchers = activeVouchers.length;

//     return (
//         <Animated.View
//             style={[styles.container, { opacity: fadeAnim }]}
//             pointerEvents="box-none"
//         >

//             {!expanded && (
//                 <TouchableOpacity
//                     style={styles.floatingCircle}
//                     onPress={toggleExpand}
//                     activeOpacity={0.9}
//                 >
//                     <AntIcon name="clockcircleo" size={20} color="#fff" />
//                     {totalVouchers > 1 && (
//                         <View style={styles.badge}>
//                             <Text style={styles.badgeText}>{totalVouchers}</Text>
//                         </View>
//                     )}
//                 </TouchableOpacity>
//             )}

//             {expanded && (
//                 <Animated.View style={[
//                     styles.content,
//                     {
//                         transform: [
//                             { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
//                             { translateY: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
//                         ],
//                         opacity: expandAnim
//                     }
//                 ]}>
//                     <TouchableOpacity
//                         style={styles.mainBar}
//                         onPress={toggleExpand}
//                         activeOpacity={0.7}
//                     >
//                         <Icon name="keyboard-arrow-down" size={24} color="#fff" />
//                     </TouchableOpacity>

//                     <Animated.View style={[
//                         styles.expandedContent,
//                         {
//                             height: expandAnim.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: [0, Math.min(activeVouchers.length * 80 + 20, 400)]
//                             })
//                         }
//                     ]}>
//                         <View style={styles.divider} />

//                         {activeVouchers.map((v, index) => (
//                             <View key={v.id || index} style={styles.voucherItem}>
//                                 <View style={styles.infoRow}>
//                                     <View style={styles.infoBlock}>
//                                         <View style={styles.voucherLabelRow}>
//                                             <View style={styles.consumerContainer}>
//                                                 <Text style={styles.infoLabel}>
//                                                     Consumer #{' '}
//                                                 </Text>
//                                                 <Text style={styles.consumerValue} numberOfLines={1}>
//                                                     {v.consumer_number || 'N/A'}
//                                                 </Text>
//                                                 {v.consumer_number && (
//                                                     <TouchableOpacity
//                                                         onPress={() => copyToClipboard(v.consumer_number, v.id || index)}
//                                                         style={styles.copyButton}
//                                                     >
//                                                         <Icon
//                                                             name={copiedId === (v.id || index) ? "check" : "content-copy"}
//                                                             size={12}
//                                                             color="#fff"
//                                                         />
//                                                     </TouchableOpacity>
//                                                 )}
//                                             </View>
//                                             <Text style={styles.infoType}>
//                                                 {v.booking_type || 'ROOM'}
//                                             </Text>
//                                         </View>

//                                         <Text style={styles.infoValue}>
//                                             {v.timer.text}
//                                         </Text>

//                                         {v.booking_type === 'ROOM' ? (
//                                             (v.check_in || v.check_out) && (
//                                                 <Text style={styles.dateRangeText}>
//                                                     {formatDate(v.check_in)} - {formatDate(v.check_out)}
//                                                 </Text>
//                                             )
//                                         ) : (
//                                             v.booking_date && (
//                                                 <Text style={styles.dateRangeText}>
//                                                     Booking: {formatDate(v.booking_date)}
//                                                 </Text>
//                                             )
//                                         )}
//                                     </View>

//                                     <TouchableOpacity
//                                         style={styles.viewButton}
//                                         onPress={() => handlePress(v)}
//                                     >
//                                         <Text style={styles.viewButtonText}>Pay Now</Text>
//                                     </TouchableOpacity>
//                                 </View>

//                                 {index < activeVouchers.length - 1 && (
//                                     <View style={styles.itemDivider} />
//                                 )}
//                             </View>
//                         ))}
//                     </Animated.View>
//                 </Animated.View>
//             )}
//         </Animated.View>
//     );

// };

// const styles = StyleSheet.create({
//     container: {
//         position: 'absolute',
//         width: '100%',
//         bottom: 80,
//         right: 20,
//         zIndex: 10000,
//         alignItems: 'flex-end',
//         justifyContent: 'flex-end',
//     },
//     content: {
//         backgroundColor: '#dc3545',
//         borderRadius: 16,
//         width: '90%',
//         overflow: 'hidden',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 10,
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.2)',
//     },
//     floatingCircle: {
//         backgroundColor: '#dc3545',
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 8,
//         shadowColor: '#000',
//         shadowOpacity: 0.3,
//         shadowOffset: { width: 0, height: 4 },
//         shadowRadius: 5,
//     },

//     badge: {
//         position: 'absolute',
//         bottom: 0,
//         right: 0,
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         paddingHorizontal: 0,
//         paddingVertical: 2,
//     },

//     badgeText: {
//         color: '#dc3545',
//         fontSize: 10,
//         fontWeight: 'bold',
//     },

//     mainBar: {
//         width: '100%',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 10,
//     },
//     timerSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     timerText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginLeft: 8,
//         marginRight: 4,
//         minWidth: 80,
//     },
//     payNowButton: {
//         backgroundColor: '#fff',
//         paddingHorizontal: 12,
//         paddingVertical: 4,
//         borderRadius: 15,
//     },
//     payNowText: {
//         color: '#dc3545',
//         fontSize: 12,
//         fontWeight: 'bold',
//     },
//     expandedContent: {
//         paddingHorizontal: 15,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: 'rgba(255,255,255,0.2)',
//         marginBottom: 10,
//     },
//     infoRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 12,
//     },
//     infoBlock: {
//         flex: 1,
//         marginRight: 10,
//     },
//     infoLabel: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 12,
//     },
//     consumerValue: {
//         color: '#fff',
//         fontSize: 12,
//         fontWeight: '500',
//         flexShrink: 1,
//     },
//     infoValue: {
//         color: '#fff',
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginTop: 4,
//     },
//     fullPayButton: {
//         backgroundColor: '#fff',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 8,
//         borderRadius: 8,
//         marginBottom: 10,
//     },
//     fullPayButtonText: {
//         color: '#dc3545',
//         fontSize: 14,
//         fontWeight: 'bold',
//         marginRight: 5,
//     },
//     voucherItem: {
//         paddingVertical: 8,
//     },
//     itemDivider: {
//         height: 1,
//         backgroundColor: 'rgba(255,255,255,0.1)',
//         marginVertical: 4,
//     },
//     voucherLabelRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 2,
//         paddingEnd: 3
//     },
//     infoType: {
//         color: 'rgba(255,255,255,0.6)',
//         fontSize: 10,
//         fontWeight: 'bold',
//         textTransform: 'uppercase',
//     },
//     viewButton: {
//         backgroundColor: '#fff',
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 7,
//         paddingVertical: 0,
//         borderRadius: 10,
//     },
//     viewButtonText: {
//         color: '#dc3545',
//         fontSize: 10,
//         fontWeight: 'bold',
//         marginRight: 2,
//     },
//     consumerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     copyButton: {
//         marginLeft: 8,
//         padding: 4,
//         backgroundColor: 'rgba(255,255,255,0.2)',
//         borderRadius: 4,
//     },
//     dateRangeText: {
//         color: 'rgba(255,255,255,0.9)',
//         fontSize: 11,
//         marginTop: 2,
//         fontWeight: '500',
//     }
// });

// export default BookingSummaryBar;

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
    AppState,
    Alert,
    Clipboard,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useVoucher } from '../auth/contexts/VoucherContext';
import { useAuth } from '../auth/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import notifee from '@notifee/react-native';
import { voucherAPI } from '../../config/apis';
import socketService from '../../services/socket.service';

const BookingSummaryBar = () => {
    const { activeVoucher, clearVoucher } = useVoucher();
    const { user, isAuthenticated } = useAuth();
    const navigation = useNavigation();
    const [vouchers, setVouchers] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().getTime());
    const [fadeAnim] = useState(new Animated.Value(0));
    const [expanded, setExpanded] = useState(false);
    const expandAnim = useRef(new Animated.Value(0)).current;
    const notificationSent = useRef(new Set()); // Track notifications per voucher
    const fetchInterval = useRef(null);
    const timerInterval = useRef(null);
    const [copiedId, setCopiedId] = useState(null);

    // Don't show timer for admin users or when not logged in (login screen)
    const isAdmin = !user || !isAuthenticated || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchVouchers = async () => {
        // Double-check: don't fetch if not authenticated or is admin
        if (!user || !isAuthenticated || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            return;
        }
        try {
            const data = await voucherAPI.getTimerVouchers();
            if (data && Array.isArray(data)) {
                const normalizedData = data.map(item => {
                    const v = item.voucherData?.voucher || item;

                    // Booking-level info may be nested in various places depending on type
                    const bd = item.bookingData || item.booking || {};
                    const venueInfo = item.venue || item.hall || item.lawn || {};
                    const memberInfo = item.memberDetails || item.membership || {};

                    // Infer booking_type from explicit fields first, then from contextual clues
                    let detectedType = v.booking_type || item.booking_type || item.bookingType;
                    if (!detectedType) {
                        // Check for type-specific objects / fields in the API response
                        if (item.photoshoot || item.package || bd.photoshootId) {
                            detectedType = 'SHOOT';
                        } else if (item.hall || bd.hallName || bd.hallId) {
                            detectedType = 'HALL';
                        } else if (item.lawn || bd.lawnName || bd.lawnId) {
                            detectedType = 'LAWN';
                        } else {
                            // Try to detect from remarks (server often embeds the type keyword)
                            const remarks = (v.remarks || item.remarks || '').toUpperCase();
                            if (remarks.includes('PHOTOSHOOT') || remarks.includes('SHOOT')) {
                                detectedType = 'SHOOT';
                            } else if (remarks.includes('HALL') || remarks.includes('BANQUET')) {
                                detectedType = 'HALL';
                            } else if (remarks.includes('LAWN')) {
                                detectedType = 'LAWN';
                            } else {
                                detectedType = 'ROOM'; // Default only when no other signal
                            }
                        }
                    }

                    return {
                        ...item,
                        id: v.id || item.id,
                        booking_id: v.booking_id || item.booking_id || item.bookingId,
                        voucher_no: v.voucher_no || item.voucher_no || item.invoiceNumber,
                        issued_at: v.issued_at || v.issue_date || item.issued_at || item.issue_date,
                        expiresAt: v.expiresAt || v.expires_at || item.expiresAt || item.expires_at || item.dueDate || item.due_date,
                        consumer_number: v.consumer_number || item.consumer_number,
                        amount: v.amount || item.amount,
                        status: v.status || item.status,
                        payment_mode: v.payment_mode || item.payment_mode,
                        remarks: v.remarks || item.remarks,
                        membership_no: memberInfo.no || memberInfo.membershipNo || item.membership_no,
                        member_name: memberInfo.name || memberInfo.memberName || item.member_name,
                        booking_type: detectedType,
                        // Room dates
                        check_in: bd.checkIn || bd.check_in || v.check_in || item.check_in,
                        check_out: bd.checkOut || bd.check_out || v.check_out || item.check_out,
                        // Hall/Lawn/Shoot booking date
                        booking_date: bd.bookingDate || bd.booking_date || bd.eventDate || v.booking_date || v.bookingDate || item.booking_date || item.bookingDate || item.date,
                        // Venue/Hall info
                        venue: venueInfo,
                        venue_name: venueInfo.name || bd.hallName || bd.lawnName || bd.venueName || item.venueName,
                        // Booking detail fields for Hall/Lawn/Shoot
                        bookingData: item.bookingData || {
                            bookingDate: bd.bookingDate || bd.eventDate || bd.booking_date,
                            eventTime: bd.eventTime || bd.timeSlot || bd.time_slot,
                            eventType: bd.eventType || bd.event_type,
                            numberOfGuests: bd.numberOfGuests || bd.number_of_guests || bd.guests,
                            bookingDetails: bd.bookingDetails || bd.booking_details || [],
                            hallName: venueInfo.name || bd.hallName,
                            lawnName: venueInfo.name || bd.lawnName,
                        },
                        memberDetails: item.memberDetails || {
                            memberName: memberInfo.name || memberInfo.memberName,
                            membershipNo: memberInfo.no || memberInfo.membershipNo,
                        },
                        // Preserve photoshoot reference for InvoiceScreen
                        photoshoot: item.photoshoot || item.package,
                    };
                });

                setVouchers(normalizedData);
                if (normalizedData.length > 0) {
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();
                } else {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();
                }
            }
        } catch (error) {
            console.error('Error fetching timer vouchers:', error);
        }
    };

    // Immediately clear all state when user logs out or becomes admin
    useEffect(() => {
        if (isAdmin) {
            // Immediately clear vouchers and reset UI state
            setVouchers([]);
            setExpanded(false);
            fadeAnim.setValue(0);
            expandAnim.setValue(0);
            notificationSent.current.clear();
            if (fetchInterval.current) {
                clearInterval(fetchInterval.current);
                fetchInterval.current = null;
            }
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
            return;
        }

        fetchVouchers();
        fetchInterval.current = setInterval(fetchVouchers, 30000); // Fetch every 30s

        timerInterval.current = setInterval(() => {
            setCurrentTime(new Date().getTime());
        }, 1000);

        return () => {
            if (fetchInterval.current) {
                clearInterval(fetchInterval.current);
                fetchInterval.current = null;
            }
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
        };
    }, [isAdmin]);

    // Track which vouchers we've already tried to auto-cancel to avoid loops
    const autoCancelled = useRef(new Set());

    // 1. Socket subscriptions for real-time payment updates - Only depend on vouchers
    useEffect(() => {
        const unsubscribes = [];

        vouchers.forEach(voucher => {
            const voucherId = voucher.id || voucher.booking_id;
            if (voucherId) {
                const unsub = socketService.subscribeToPayment(voucherId, (data) => {
                    if (data.status === 'PAID' || data.status === 'CANCELLED') {
                        console.log(`📡 [Voucher Sync] Voucher ${voucherId} status changed to ${data.status}`);

                        if (data.status === 'PAID') {
                            Alert.alert(
                                'Payment Received',
                                `Your payment for ${voucher.venue_name || 'the booking'} has been confirmed!`,
                                [{ text: 'Great!' }]
                            );
                        }

                        setVouchers(prev => prev.filter(v => (v.id || v.booking_id) !== voucherId));
                        notificationSent.current.delete(voucherId);

                        if (activeVoucher && (activeVoucher.id === voucherId || activeVoucher.bookingId === voucherId)) {
                            clearVoucher();
                        }
                    }
                });
                unsubscribes.push(unsub);
            }
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [vouchers]); // Removed currentTime to avoid re-subscribing every second

    // 2. Auto-cancellation on expiry - Depends on currentTime
    useEffect(() => {
        vouchers.forEach(async (voucher) => {
            const timer = getVoucherTimer(voucher);
            const voucherId = voucher.id || voucher.booking_id;

            if (timer === 'EXPIRED' && !autoCancelled.current.has(voucherId)) {
                autoCancelled.current.add(voucherId);
                console.log(`⏰ [Auto-Cancel] Voucher ${voucherId} expired. Triggering cancellation...`);

                try {
                    await bookingService.deleteBooking(voucher.consumer_number);
                    console.log(`✅ [Auto-Cancel] Booking ${voucherId} cancelled successfully.`);

                    setVouchers(prev => prev.filter(v => (v.id || v.booking_id) !== voucherId));

                    if (activeVoucher && (activeVoucher.id === voucherId || activeVoucher.bookingId === voucherId)) {
                        clearVoucher();
                    }
                } catch (error) {
                    console.error(`❌ [Auto-Cancel] Failed to cancel voucher ${voucherId}:`, error);
                }
            }
        });
    }, [vouchers, currentTime]);

    const getVoucherTimer = (voucher) => {
        const rawIssueDate = voucher?.issued_at;
        const rawExpire = voucher?.expiresAt || voucher?.expires_at || 15;

        const issueTime = rawIssueDate ? new Date(rawIssueDate).getTime() : null;
        let expiryTime = null;

        // Try to parse rawExpire as a number of minutes first
        const expireMinutes = Number(rawExpire);

        if (!isNaN(expireMinutes) && typeof rawExpire !== 'string') {
            // It's a number (or number-like string that is just a digit), treat as minutes
            if (issueTime && !isNaN(issueTime)) {
                expiryTime = issueTime + (expireMinutes * 60 * 1000);
            }
        } else {
            // Try to parse as absolute date string
            const absoluteExp = new Date(rawExpire).getTime();
            if (!isNaN(absoluteExp)) {
                expiryTime = absoluteExp;
            } else if (issueTime && !isNaN(issueTime) && !isNaN(expireMinutes)) {
                // Fallback to minutes if it's a numeric string
                expiryTime = issueTime + (expireMinutes * 60 * 1000);
            }
        }

        if (!expiryTime || isNaN(expiryTime)) {
            return 'EXPIRED';
        }

        const distance = expiryTime - currentTime;

        if (distance <= 0) return 'EXPIRED';

        const minutes = Math.floor(distance / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        return {
            text: `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`,
            minutes,
            expired: false,
            distance
        };
    };


    // Filter valid vouchers and sort by urgency
    const activeVouchers = vouchers
        .map(v => ({ ...v, timer: getVoucherTimer(v) }))
        .filter(v => v.timer !== 'EXPIRED')
        .sort((a, b) => a.timer.distance - b.timer.distance);

    useEffect(() => {
        // Notification logic for the most urgent voucher
        if (activeVouchers.length > 0) {
            const mostUrgent = activeVouchers[0];
            const voucherId = mostUrgent.voucher_no || mostUrgent.id;

            if (mostUrgent.timer.minutes <= 15 && !notificationSent.current.has(voucherId)) {
                triggerUrgencyNotification(mostUrgent);
                notificationSent.current.add(voucherId);
            }
        }
    }, [activeVouchers]);

    const triggerUrgencyNotification = async (voucher) => {
        const message = `Your booking hold (${voucher.voucher_no || 'Pending'}) expires in 15 minutes. Complete your payment now!`;

        if (AppState.currentState === 'active') {
            Alert.alert(
                "Booking Expiry Reminder",
                message,
                [{ text: "Complete Payment", onPress: () => handlePress(voucher) }, { text: "Dismiss" }]
            );
        } else {
            try {
                const channelId = await notifee.createChannel({
                    id: 'urgency-reminder',
                    name: 'Urgency Reminders',
                });

                await notifee.displayNotification({
                    title: 'Hold Expiring Soon!',
                    body: message,
                    android: {
                        channelId,
                        pressAction: { id: 'default' },
                    },
                });
            } catch (error) {
                console.error('Error triggering local notification:', error);
            }
        }
    };

    // Don't render anything if user is not authenticated, is admin, or has no active vouchers
    if (isAdmin || !isAuthenticated || !user || activeVouchers.length === 0) return null;

    const handlePress = async (voucher) => {
        let bookingType = voucher.booking_type || voucher.bookingType || 'ROOM';
        const bookingId = voucher.booking_id || voucher.id || voucher.bookingId;

        let screen = 'voucher';

        // Build a rawInvoiceData-shaped object that all invoice screens expect.
        // Each screen does: const { invoiceData: rawInvoiceData } = route.params
        // and then checks `if (rawInvoiceData) { ... } else { Alert "Invoice data not found" }`
        const builtInvoiceData = {
            voucher: {
                id: voucher.id,
                voucher_no: voucher.voucher_no,
                consumer_number: voucher.consumer_number,
                amount: voucher.amount,
                status: voucher.status || 'PENDING',
                issued_at: voucher.issued_at,
                expiresAt: voucher.expiresAt || voucher.expires_at,
                booking_id: voucher.booking_id || voucher.bookingId,
                payment_mode: voucher.payment_mode,
                remarks: voucher.remarks,
            },
            due_date: voucher.expiresAt || voucher.expires_at || voucher.dueDate,
            membership: {
                no: voucher.membership_no || voucher.membershipNo,
                name: voucher.member_name || voucher.memberName,
            },
            // Preserve any extra data from the API
            ...((voucher.voucherData) || {}),
        };

        const params = {
            bookingId: bookingId,
            numericBookingId: bookingId,
            // Pass as both `invoiceData` (for hall/lawn/shoot screens) and `voucherData` (for room screen)
            invoiceData: builtInvoiceData,
            voucherData: voucher.voucherData || builtInvoiceData,
            bookingData: voucher.bookingData,
            bookingDetails: voucher.bookingDetails,
            venue: voucher.venue,
            roomType: voucher.roomType,
            memberDetails: voucher.memberDetails,
            isGuest: voucher.isGuest,
            dueDate: voucher.dueDate || voucher.expiresAt,
            bookingType: bookingType,
            // Photoshoot-specific: InvoiceScreen expects `photoshoot` and `memberInfo`
            photoshoot: voucher.photoshoot,
            memberInfo: voucher.memberDetails,
        };

        if (bookingType === 'ROOM') {
            screen = 'voucher';         // lowercase - src/rooms/voucher.js
        } else if (bookingType === 'HALL') {
            screen = 'HallInvoiceScreen';
        } else if (bookingType === 'LAWN') {
            screen = 'Voucher';         // uppercase - src/lawn/Voucher.js
        } else if (bookingType === 'SHOOT' || bookingType === 'PHOTOSHOOT') {
            screen = 'InvoiceScreen';
        }

        console.log(`🧭 [BookingSummaryBar] Navigating to ${screen} with type ${bookingType}`);
        navigation.navigate(screen, params);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const copyToClipboard = (text, id) => {
        Clipboard.setString(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.spring(expandAnim, {
            toValue,
            useNativeDriver: false,
        }).start();
    };

    const mostUrgent = activeVouchers[0];
    const totalVouchers = activeVouchers.length;

    return (
        <Animated.View
            style={[styles.container, { opacity: fadeAnim }]}
            pointerEvents="box-none"
        >

            {!expanded && (
                <TouchableOpacity
                    style={styles.floatingCircle}
                    onPress={toggleExpand}
                    activeOpacity={0.9}
                >
                    <AntIcon name="clockcircleo" size={20} color="#fff" />
                    {totalVouchers > 1 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalVouchers}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {expanded && (
                <Animated.View style={[
                    styles.content,
                    {
                        transform: [
                            { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                            { translateY: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                        ],
                        opacity: expandAnim
                    }
                ]}>
                    <TouchableOpacity
                        style={styles.mainBar}
                        onPress={toggleExpand}
                        activeOpacity={0.7}
                    >
                        <Icon name="keyboard-arrow-down" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Animated.View style={[
                        styles.expandedContent,
                        {
                            height: expandAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.min(activeVouchers.length * 80 + 30, 400)]
                            })
                        }
                    ]}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                            <View style={styles.divider} />

                            {activeVouchers.map((v, index) => (
                                <View key={v.id || index} style={styles.voucherItem}>
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoBlock}>
                                            <View style={styles.voucherLabelRow}>
                                                <View style={styles.consumerContainer}>
                                                    <Text style={styles.infoLabel}>
                                                        Consumer #{' '}
                                                    </Text>
                                                    <Text style={styles.consumerValue} numberOfLines={1}>
                                                        {v.consumer_number || 'N/A'}
                                                    </Text>
                                                    {v.consumer_number && (
                                                        <TouchableOpacity
                                                            onPress={() => copyToClipboard(v.consumer_number, v.id || index)}
                                                            style={styles.copyButton}
                                                        >
                                                            <Icon
                                                                name={copiedId === (v.id || index) ? "check" : "content-copy"}
                                                                size={12}
                                                                color="#fff"
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <Text style={styles.infoType}>
                                                    {v.booking_type || 'ROOM'}
                                                </Text>
                                            </View>

                                            <Text style={styles.infoValue}>
                                                {v.timer.text}
                                            </Text>

                                            {v.booking_type === 'ROOM' ? (
                                                (v.check_in || v.check_out) && (
                                                    <Text style={styles.dateRangeText}>
                                                        {formatDate(v.check_in)} - {formatDate(v.check_out)}
                                                    </Text>
                                                )
                                            ) : (
                                                v.booking_date && (
                                                    <Text style={styles.dateRangeText}>
                                                        Booking: {formatDate(v.booking_date)}
                                                    </Text>
                                                )
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={styles.viewButton}
                                            onPress={() => handlePress(v)}
                                        >
                                            <Text style={styles.viewButtonText}>Pay Now</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {index < activeVouchers.length - 1 && (
                                        <View style={styles.itemDivider} />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            )}
        </Animated.View>
    );

};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        bottom: 80,
        right: 20,
        zIndex: 10000,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#dc3545',
        borderRadius: 16,
        width: '90%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    floatingCircle: {
        backgroundColor: '#dc3545',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 5,
    },

    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 0,
        paddingVertical: 2,
    },

    badgeText: {
        color: '#dc3545',
        fontSize: 10,
        fontWeight: 'bold',
    },

    mainBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    timerSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        marginRight: 4,
        minWidth: 80,
    },
    payNowButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
    },
    payNowText: {
        color: '#dc3545',
        fontSize: 12,
        fontWeight: 'bold',
    },
    expandedContent: {
        paddingHorizontal: 15,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoBlock: {
        flex: 1,
        marginRight: 10,
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    consumerValue: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        flexShrink: 1,
    },
    infoValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    fullPayButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
    },
    fullPayButtonText: {
        color: '#dc3545',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 5,
    },
    voucherItem: {
        paddingVertical: 8,
    },
    itemDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    voucherLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
        paddingEnd: 3
    },
    infoType: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    viewButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 0,
        borderRadius: 10,
    },
    viewButtonText: {
        color: '#dc3545',
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 2,
    },
    consumerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    copyButton: {
        marginLeft: 8,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
    },
    dateRangeText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    }
});

export default BookingSummaryBar;