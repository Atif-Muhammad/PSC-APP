// import React, { useState, useRef } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     TouchableOpacity,
//     StatusBar,
//     SafeAreaView,
//     Alert,
//     Modal,
//     Linking,
//     Share,
//     ActivityIndicator,
//     ImageBackground,
//     Platform,
//     TextInput,
//     Clipboard,
//     PermissionsAndroid
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import ViewShot from 'react-native-view-shot';
// import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// import { bookingService } from '../../services/bookingService';
// import { useAuth } from '../auth/contexts/AuthContext';

// export default function BookingDetailsScreen({ navigation, route }) {
//     const booking = route.params?.booking;
//     console.log(booking)
//     const { user } = useAuth();
//     const [loading, setLoading] = useState(false);
//     const [showCancelModal, setShowCancelModal] = useState(false);
//     const [savingImage, setSavingImage] = useState(false);
//     const viewShotRef = useRef(null);
//     const [showInvoiceModal, setShowInvoiceModal] = useState(false);
//     const [invoiceData, setInvoiceData] = useState(null);
//     const [voucherInfo, setVoucherInfo] = useState({ voucherNumber: null, consumerNumber: null });
//     const [cancellationReason, setCancellationReason] = useState('');

//     // Safety check: go back if no booking data is passed
//     if (!booking) {
//         React.useEffect(() => {
//             Alert.alert('Error', 'No booking data found.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
//         }, []);
//         return (
//             <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1EE' }}>
//                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                     <ActivityIndicator size="large" color="#b48a64" />
//                 </View>
//             </SafeAreaView>
//         );
//     }

//     const handleSaveReceipt = async () => {
//         try {
//             // Internal Permission Handling
//             if (Platform.OS === 'android') {
//                 const apiLevel = Platform.Version;
//                 if (apiLevel >= 33) {
//                     const READ_MEDIA_IMAGES = 'android.permission.READ_MEDIA_IMAGES';
//                     const hasPermission = await PermissionsAndroid.check(READ_MEDIA_IMAGES);
//                     if (!hasPermission) {
//                         const result = await PermissionsAndroid.request(READ_MEDIA_IMAGES);
//                         if (result !== PermissionsAndroid.RESULTS.GRANTED) {
//                             Alert.alert('Gallery Permission Required', 'Please enable gallery access to save your receipt.');
//                             return;
//                         }
//                     }
//                 } else {
//                     const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
//                     if (!hasPermission) {
//                         const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
//                         if (result !== PermissionsAndroid.RESULTS.GRANTED) {
//                             Alert.alert('Gallery Permission Required', 'Please enable storage access to save your receipt.');
//                             return;
//                         }
//                     }
//                 }
//             } else if (Platform.OS === 'ios') {
//                 const authStatus = await CameraRoll.requestAuthorization();
//                 if (authStatus === 'denied' || authStatus === 'restricted') {
//                     Alert.alert('Gallery Access Denied', 'Please enable Photos access in Settings to save your receipt.');
//                     return;
//                 }
//             }

//             setSavingImage(true);

//             // Mandatory hardware-inflating delay (150ms)
//             setTimeout(async () => {
//                 if (!viewShotRef.current) {
//                     setSavingImage(false);
//                     return;
//                 }

//                 try {
//                     const uri = await viewShotRef.current.capture();
//                     await CameraRoll.save(uri, { type: 'photo' });
//                     Alert.alert('Receipt Saved', 'Digital receipt has been successfully saved to your gallery.');
//                 } catch (error) {
//                     console.error('Capture Engine Failure:', error);
//                     Alert.alert('Capture Error', 'The capture engine failed to process the view. Please try again.');
//                 } finally {
//                     setSavingImage(false);
//                 }
//             }, 150);

//         } catch (error) {
//             console.error('Saving internal error:', error);
//             Alert.alert('Internal Error', 'An unexpected error occurred while preparing the receipt.');
//             setSavingImage(false);
//         }
//     };

//     // Fetch voucher and consumer number from invoice data
//     React.useEffect(() => {
//         const fetchVoucherInfo = async () => {
//             // First, try to get voucher/consumer numbers directly from booking object
//             const directVoucherNumber = booking.voucherNumber || booking.voucher_no ||
//                 booking.invoiceNumber || booking.invoice_no ||
//                 booking.voucher?.voucher_no || booking.voucher?.voucherNumber ||
//                 booking.voucherData?.voucher?.voucher_no;

//             const directConsumerNumber = booking.consumerNumber || booking.consumer_number ||
//                 booking.consumer_no || booking.consumerNo ||
//                 booking.voucher?.consumer_number || booking.voucher?.consumerNumber ||
//                 booking.voucherData?.voucher?.consumer_number;

//             // If we already have both values from the booking object, use them
//             if (directVoucherNumber || directConsumerNumber) {
//                 setVoucherInfo({
//                     voucherNumber: directVoucherNumber,
//                     consumerNumber: directConsumerNumber
//                 });

//                 // If we already have both, no need to fetch
//                 if (directVoucherNumber && directConsumerNumber) {
//                     return;
//                 }
//             }

//             // Otherwise, try to fetch from API
//             try {
//                 // Determine booking type for API call (inline to avoid hoisting issue)
//                 let bookingType = 'Room';
//                 if (booking.bookingType) {
//                     bookingType = booking.bookingType;
//                 } else if (booking.hallId) {
//                     bookingType = 'Hall';
//                 } else if (booking.lawnId) {
//                     bookingType = 'Lawn';
//                 } else if (booking.photoshootId) {
//                     bookingType = 'Photoshoot';
//                 }

//                 const invoice = await bookingService.getInvoice(
//                     booking.bookingId || booking.id,
//                     null,
//                     bookingType
//                 );
//                 if (invoice) {
//                     setVoucherInfo(prev => ({
//                         voucherNumber: prev.voucherNumber || invoice.invoiceNumber || invoice.invoice_no || invoice.invoiceNo || invoice.voucherNumber || invoice.voucher_no,
//                         consumerNumber: prev.consumerNumber || invoice.consumerNumber || invoice.consumer_number || invoice.consumer_no || invoice.consumerNo
//                     }));
//                 }
//             } catch (error) {
//                 console.log('Voucher info not available from API:', error.message);
//                 // Silent fail - voucher info is optional display
//             }
//         };

//         if (booking.bookingId || booking.id) {
//             fetchVoucherInfo();
//         }
//     }, [booking.bookingId, booking.id]);

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             });
//         } catch (error) {
//             return 'Invalid Date';
//         }
//     };

//     const formatTime = (dateString) => {
//         if (!dateString) return '';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleTimeString('en-US', {
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });
//         } catch (error) {
//             return '';
//         }
//     };

//     const formatCurrency = (amount) => {
//         if (!amount && amount !== 0) return '0 Rs.';
//         const numAmount = parseFloat(amount);
//         if (isNaN(numAmount)) return '0 Rs.';
//         return `${numAmount.toFixed(0)} Rs.`;
//     };

//     const getStatusColor = (status) => {
//         if (!status) return '#6c757d';
//         const statusUpper = status.toUpperCase();
//         switch (statusUpper) {
//             case 'PAID':
//             case 'COMPLETED':
//             case 'CONFIRMED':
//                 return '#28a745';
//             case 'PENDING':
//             case 'HALF_PAID':
//             case 'PARTIAL':
//             case 'ADVANCE_PAYMENT':
//                 return '#ffc107';
//             case 'UNPAID':
//             case 'CANCELLED':
//             case 'REJECTED':
//                 return '#dc3545';
//             default:
//                 return '#6c757d';
//         }
//     };

//     const getPricingLabel = (type) => {
//         if (!type) return 'Guest Rate';
//         const t = type.toLowerCase();
//         if (t === 'member') return 'Member Rate';
//         if (t === 'forces') return 'Forces Rate';
//         if (t === 'forces-guest') return 'Forces Guest Rate';
//         if (t === 'guest') return 'Guest Rate';
//         return t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Rate';
//     };

//     const getStatusText = (status) => {
//         if (!status) return 'Unknown';
//         return status.replace('_', ' ').toUpperCase();
//     };

//     const getPaymentModeLabel = (mode) => {
//         if (!mode) return 'N/A';
//         const m = mode.toUpperCase();
//         if (m === 'CHECK' || m === 'CHEQUE') return 'Cheque';
//         return mode;
//     };

//     const copyToClipboard = (text, label) => {
//         if (!text) return;
//         Clipboard.setString(text);
//         Alert.alert('Copied', `${label} copied to clipboard`);
//     };

//     const getBookingType = () => {
//         if (booking.bookingType) return booking.bookingType;
//         if (booking.roomNumber || booking.roomId) return 'Room';
//         if (booking.hallId) return 'Hall';
//         if (booking.lawnId) return 'Lawn';
//         if (booking.photoshootId) return 'Photoshoot';
//         return 'Booking';
//     };

//     const calculateNights = () => {
//         if (!booking.checkIn || !booking.checkOut) return 0;
//         try {
//             const checkIn = new Date(booking.checkIn);
//             const checkOut = new Date(booking.checkOut);
//             const diffTime = Math.abs(checkOut - checkIn);
//             return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         } catch (error) {
//             return 0;
//         }
//     };

//     const handleCancelBooking = async () => {
//         if (!cancellationReason.trim()) {
//             Alert.alert('Error', 'Please provide a reason for cancellation.');
//             return;
//         }

//         setShowCancelModal(false);

//         try {
//             setLoading(true);
//             const bookingType = getBookingType() === "Room" ? "rooms" : getBookingType() === "Hall" ? "halls" : getBookingType() === "Lawn" ? "lawns" : getBookingType() === "Photoshoot" ? "photoshoots" : "";
//             const bookingId = booking.bookingId || booking.id;

//             await bookingService.cancelReqBooking(
//                 bookingType,
//                 bookingId,
//                 cancellationReason
//             );

//             Alert.alert(
//                 'Success',
//                 'Cancellation request submitted successfully.',
//                 [{ text: 'OK', onPress: () => navigation.goBack() }]
//             );
//         } catch (error) {
//             console.error('Cancel error:', error);
//             Alert.alert(
//                 'Error',
//                 error.message || 'Failed to submit cancellation request.'
//             );
//         } finally {
//             setLoading(false);
//             setCancellationReason('');
//         }
//     };

//     const handleGetInvoice = async () => {
//         try {
//             setLoading(true);
//             const invoice = await bookingService.getInvoice(
//                 booking.bookingId || booking.id
//             );
//             setInvoiceData(invoice);
//             setShowInvoiceModal(true);
//         } catch (error) {
//             console.error('Invoice error:', error);
//             Alert.alert('Error', 'Failed to load invoice. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleShareBooking = async () => {
//         try {
//             const shareMessage = `
// Booking Details:
// Booking ID: ${booking.bookingId || booking.id}
// Type: ${getBookingType()}
// Status: ${getStatusText(booking.paymentStatus)}
// Amount: ${formatCurrency(booking.totalPrice)}
// Check-in: ${formatDate(booking.checkIn)}
// Check-out: ${formatDate(booking.checkOut)}
//       `;

//             await Share.share({
//                 message: shareMessage,
//                 title: 'Booking Details'
//             });
//         } catch (error) {
//             console.error('Share error:', error);
//         }
//     };

//     const handleContactSupport = () => {
//         Alert.alert(
//             'Contact Support',
//             'For any queries or modifications, please contact our support team.',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Call Support',
//                     onPress: () => Linking.openURL('tel:0919212753')
//                 },
//                 {
//                     text: 'Email Support',
//                     onPress: () => Linking.openURL('info@peshawarservicesclub.com')
//                 }
//             ]
//         );
//     };



//     const renderDetailItem = (label, value, icon = null, isHighlight = false) => (
//         <View style={styles.detailItem}>
//             <View style={styles.detailLabelContainer}>
//                 {icon && <Icon name={icon} size={18} color="#666" style={styles.detailIcon} />}
//                 <Text style={styles.detailLabel}>{label}</Text>
//             </View>
//             <Text style={[
//                 styles.detailValue,
//                 isHighlight && styles.detailValueHighlight
//             ]}>
//                 {value}
//             </Text>
//         </View>
//     );

//     // Render a highlighted detail item (for voucher and consumer numbers)
//     const renderHighlightDetailItem = (label, value, icon = null) => (
//         <View style={styles.detailItem}>
//             <View style={styles.detailLabelContainer}>
//                 {icon && <Icon name={icon} size={18} color="#666" style={styles.detailIcon} />}
//                 <Text style={styles.detailLabel}>{label}</Text>
//             </View>
//             <View style={styles.copyableValueContainer}>
//                 <Text style={[styles.detailValue, styles.copyableValue]}>
//                     {value}
//                 </Text>
//             </View>
//         </View>
//     );

//     // Enhanced Booking Processing (Similar to MemberBookingsScreen)
//     const processedBooking = {
//         ...booking,
//         totalPrice: parseFloat(booking.totalPrice || booking.total_price || booking.amount || booking.price ||
//             booking.totalAmount || booking.total_amount || booking.netAmount || booking.net_amount ||
//             booking.payableAmount || booking.payable_amount || booking.charges || booking.rent || 0),

//         paidAmount: (() => {
//             const status = (booking.paymentStatus || booking.status ||
//                 booking.bookingStatus || booking.payment_status ||
//                 booking.state || '').toUpperCase();
//             const total = parseFloat(booking.totalPrice || booking.total_price || booking.amount ||
//                 booking.totalAmount || booking.total_amount || booking.netAmount ||
//                 booking.net_amount || booking.charges || booking.rent || 0);
//             const paid = parseFloat(booking.paidAmount || booking.paid_amount || booking.paid ||
//                 booking.totalPaid || booking.total_paid || booking.advance || 0);

//             if ((status === 'PAID' || status === 'COMPLETED') && paid === 0 && total > 0) return total;
//             return paid;
//         })(),

//         pendingAmount: (() => {
//             const status = (booking.paymentStatus || booking.status ||
//                 booking.bookingStatus || booking.payment_status ||
//                 booking.state || '').toUpperCase();
//             if (status === 'PAID' || status === 'COMPLETED') return 0;
//             return parseFloat(booking.pendingAmount || booking.pending_amount || booking.pending ||
//                 booking.balance || booking.remainingAmount || booking.remaining_amount || 0);
//         })(),

//         paymentStatus: (() => {
//             const originalStatus = (booking.paymentStatus || booking.status ||
//                 booking.bookingStatus || booking.payment_status ||
//                 booking.state || '').toUpperCase();

//             // Trust terminal statuses from API
//             if (['PAID', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REJECT', 'ADVANCE_PAYMENT'].includes(originalStatus)) {
//                 return originalStatus;
//             }

//             const total = parseFloat(booking.totalPrice || booking.total_price || booking.amount ||
//                 booking.totalAmount || booking.total_amount || booking.netAmount ||
//                 booking.net_amount || booking.charges || booking.rent || 0);
//             const paid = parseFloat(booking.paidAmount || booking.paid_amount || booking.paid ||
//                 booking.totalPaid || booking.total_paid || booking.advance || 0);

//             if (total > 0) {
//                 if (paid >= total) return 'PAID';
//                 if (paid > 0) return 'HALF_PAID';
//                 return 'UNPAID';
//             }
//             return originalStatus || 'UNPAID';
//         })(),

//         roomNumber: booking.rooms?.length > 0
//             ? booking.rooms.map(r => r.room?.roomNumber).filter(Boolean).join(', ')
//             : (booking.roomNumber || booking.roomId || (booking.room?.roomNumber)),
//         roomType: booking.rooms?.length > 0
//             ? [...new Set(booking.rooms.map(r => r.room?.roomType?.type).filter(Boolean))].join(', ')
//             : (booking.roomType || booking.room?.roomType?.type || (booking.name?.includes('(') ? booking.name.split('(')[1].split(')')[0] : '')),
//         vouchers: booking.vouchers || [],

//         pricingLabel: getPricingLabel(booking.pricingType),
//         isCancelled: booking.isCancelled === true || booking.is_cancelled === true ||
//             booking.status === 'CANCELLED' || booking.paymentStatus === 'CANCELLED'
//     };

//     const renderPaymentSummary = () => {
//         const sortedVouchers = [...(processedBooking.vouchers || [])].sort((a, b) =>
//             new Date(b.issued_at) - new Date(a.issued_at)
//         );

//         return (
//             <View style={styles.voucherSection}>
//                 <View style={styles.ledgerContainer}>
//                     {/* Financial Summary Breakdown */}
//                     <View style={styles.ledgerRow}>
//                         <Text style={styles.ledgerLabel}>Member Charges</Text>
//                         <View style={styles.ledgerLine} />
//                         <Text style={styles.ledgerValue}>
//                             {formatCurrency(processedBooking.pricingType?.toLowerCase() === 'member' ? processedBooking.totalPrice : 0)}
//                         </Text>
//                     </View>
//                     <View style={styles.ledgerRow}>
//                         <Text style={styles.ledgerLabel}>Guest Charges</Text>
//                         <View style={styles.ledgerLine} />
//                         <Text style={styles.ledgerValue}>
//                             {formatCurrency(processedBooking.pricingType?.toLowerCase() === 'guest' ? processedBooking.totalPrice : 0)}
//                         </Text>
//                     </View>
//                     <View style={styles.ledgerRow}>
//                         <Text style={styles.ledgerLabel}>Service / Add-on Fees</Text>
//                         <View style={styles.ledgerLine} />
//                         <Text style={styles.ledgerValue}>{formatCurrency(0)}</Text>
//                     </View>

//                     <View style={[styles.ledgerRow, { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }]}>
//                         <Text style={[styles.ledgerLabel, { fontWeight: 'bold', color: '#b48a64' }]}>Total Amount</Text>
//                         <View style={[styles.ledgerLine, { borderStyle: 'solid', borderColor: '#b48a64' }]} />
//                         <Text style={[styles.ledgerValue, { fontSize: 18, color: '#b48a64' }]}>{formatCurrency(processedBooking.totalPrice)}</Text>
//                     </View>

//                     <View style={styles.ledgerRow}>
//                         <Text style={styles.ledgerLabel}>Paid To Date</Text>
//                         <View style={styles.ledgerLine} />
//                         <Text style={[styles.ledgerValue, { color: '#28a745' }]}>{formatCurrency(processedBooking.paidAmount)}</Text>
//                     </View>

//                     <View style={[styles.ledgerRow, { marginTop: 5 }]}>
//                         <Text style={[styles.ledgerLabel, { fontWeight: 'bold', color: '#333' }]}>Balance Due</Text>
//                         <View style={[styles.ledgerLine, { borderStyle: 'solid', borderColor: '#eee' }]} />
//                         <Text style={[styles.ledgerValue, { fontSize: 20, color: processedBooking.pendingAmount > 0 ? '#dc3545' : '#28a745' }]}>
//                             {formatCurrency(processedBooking.pendingAmount)}
//                         </Text>
//                     </View>
//                 </View>

//                 <View style={styles.paymentStatusRow}>
//                     <Text style={styles.statusLabel}>STATUS:</Text>
//                     <View style={[
//                         styles.statusBadge,
//                         { backgroundColor: `${getStatusColor(processedBooking.paymentStatus)}15`, borderWidth: 0 }
//                     ]}>
//                         <View style={[
//                             styles.statusDot,
//                             { backgroundColor: getStatusColor(processedBooking.paymentStatus) }
//                         ]} />
//                         <Text style={[
//                             styles.statusText,
//                             { color: getStatusColor(processedBooking.paymentStatus), fontWeight: 'bold' }
//                         ]}>
//                             {getStatusText(processedBooking.paymentStatus)}
//                         </Text>
//                     </View>
//                 </View>

//                 {sortedVouchers.length > 0 && (
//                     <View style={styles.vouchersContainer}>
//                         <Text style={styles.subCardTitle}>Transaction History</Text>
//                         {sortedVouchers.map((voucher, index) => (
//                             <View key={index} style={styles.voucherItem}>
//                                 <View style={styles.voucherHeader}>
//                                     <View style={styles.voucherHeaderLeft}>
//                                         <Icon name="receipt" size={14} color="#b48a64" />
//                                         <Text style={styles.voucherConsumerHeader}>{voucher.consumer_number}</Text>
//                                     </View>
//                                     <View style={[styles.miniStatusBadge, { backgroundColor: voucher.status === 'CONFIRMED' ? '#d4edda' : '#fff3cd' }]}>
//                                         <Text style={[styles.miniStatusText, { color: voucher.status === 'CONFIRMED' ? '#155724' : '#856404' }]}>
//                                             {voucher.status}
//                                         </Text>
//                                     </View>
//                                 </View>

//                                 <View style={styles.voucherBody}>
//                                     <View style={styles.voucherMainRow}>
//                                         <Text style={styles.voucherTypeLabel}>{voucher.voucher_type?.replace('_', ' ')}</Text>
//                                         <Text style={styles.voucherAmountLarge}>{formatCurrency(voucher.amount)}</Text>
//                                     </View>
//                                     <Text style={styles.voucherDateLabel}>{formatDate(voucher.issued_at)}</Text>
//                                 </View>
//                             </View>
//                         ))}
//                     </View>
//                 )}
//             </View>
//         );
//     };

//     const renderBookingTimeline = () => {
//         const type = getBookingType();
//         const isVenue = ['Hall', 'Lawn', 'Photoshoot'].includes(type);

//         return (
//             <View style={styles.timelineCard}>
//                 <Text style={styles.cardTitle}>Booking Timeline</Text>

//                 <View style={styles.timelineItem}>
//                     <View style={styles.timelineDot}>
//                         <Icon name="check-circle" size={20} color="#28a745" />
//                     </View>
//                     <View style={styles.timelineContent}>
//                         <Text style={styles.timelineTitle}>Booking Created</Text>
//                         <Text style={styles.timelineDate}>
//                             {formatDate(booking.createdAt)} • {formatTime(booking.createdAt)}
//                         </Text>
//                     </View>
//                 </View>

//                 {isVenue ? (
//                     <View style={styles.timelineItem}>
//                         <View style={styles.timelineDot}>
//                             <Icon name="event" size={20} color="#b48a64" />
//                         </View>
//                         <View style={styles.timelineContent}>
//                             <Text style={styles.timelineTitle}>Event Date</Text>
//                             <Text style={styles.timelineDate}>
//                                 {formatDate(booking.checkIn || booking.date || booking.eventDate)}
//                             </Text>
//                         </View>
//                     </View>
//                 ) : (
//                     <>
//                         <View style={styles.timelineItem}>
//                             <View style={styles.timelineDot}>
//                                 <Icon name="event" size={20} color="#b48a64" />
//                             </View>
//                             <View style={styles.timelineContent}>
//                                 <Text style={styles.timelineTitle}>Check-in</Text>
//                                 <Text style={styles.timelineDate}>
//                                     {formatDate(booking.checkIn || booking.from || booking.startTime || booking.start_time || booking.start || booking.booking_from || booking.bookingDate || booking.booking_date || booking.date)}
//                                 </Text>
//                             </View>
//                         </View>

//                         <View style={styles.timelineItem}>
//                             <View style={styles.timelineDot}>
//                                 <Icon name="event-busy" size={20} color="#b48a64" />
//                             </View>
//                             <View style={styles.timelineContent}>
//                                 <Text style={styles.timelineTitle}>Check-out</Text>
//                                 <Text style={styles.timelineDate}>
//                                     {formatDate(booking.checkOut || booking.to || booking.endTime || booking.end_time || booking.end || booking.booking_to || booking.endDate || booking.bookingDate || booking.booking_date || booking.date)}
//                                 </Text>
//                             </View>
//                         </View>
//                     </>
//                 )}
//             </View>
//         );
//     };

//     const renderGuestInfo = () => {
//         // Determine if it's a Guest booking
//         const isGuest = (booking.pricingType || '').toLowerCase() === 'guest';

//         return (
//             <View style={styles.guestCard}>
//                 <Text style={styles.cardTitle}>Details</Text>

//                 {renderDetailItem('Booking For', isGuest ? 'Guest' : 'Member', 'badge')}

//                 {isGuest && (
//                     <>
//                         {booking.guestName && renderDetailItem('Name', booking.guestName, 'person')}
//                         {booking.guestContact && renderDetailItem('Contact', booking.guestContact, 'phone')}
//                         {booking.guestEmail && renderDetailItem('Email', booking.guestEmail, 'email')}
//                     </>
//                 )}
//             </View>
//         );
//     };

//     const renderVenueInfo = () => {
//         // Use venueName from passed booking or fallback
//         const type = getBookingType();
//         const venueName = booking.venueName || booking.hallName || booking.lawnName || booking.name || type;
//         const details = booking.bookingDetails || []; // Multi-date details

//         return (
//             <View style={styles.roomCard}>
//                 <Text style={styles.cardTitle}>{type === 'Photoshoot' ? 'Photoshoot Details' : `${type} Information`}</Text>

//                 <View style={styles.roomHeader}>
//                     {/* <Icon name="location-city" size={24} color="#b48a64" /> */}
//                     <Text style={styles.roomNumber}>{venueName}</Text>
//                 </View>

//                 <View style={styles.roomDetails}>
//                     <View style={styles.detailBadge}>
//                         <Icon name="people" size={14} color="#666" />
//                         <Text style={styles.detailBadgeText}>
//                             {booking.numberOfGuests || booking.guests || booking.guest_count || booking.numberOfAdults || 0} Guests
//                         </Text>
//                     </View>

//                     {/* {(booking.eventType || booking.event_type) && (
//                         <View style={styles.detailBadge}>
//                             <Icon name="event" size={14} color="#666" />
//                             <Text style={styles.detailBadgeText}>{booking.eventType || booking.event_type}</Text>
//                         </View>
//                     )} */}

//                     {(booking.eventTime || booking.timeSlot) && (
//                         <View style={styles.detailBadge}>
//                             <Icon name="access-time" size={14} color="#666" />
//                             <Text style={styles.detailBadgeText}>{booking.eventTime || booking.timeSlot}</Text>
//                         </View>
//                     )}
//                 </View>

//                 {/* Multi-date list */}
//                 {details.length > 0 && (
//                     <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0e6d8' }}>
//                         <Text style={[styles.detailLabel, { marginBottom: 8 }]}>Selected Dates:</Text>
//                         {details.map((d, index) => (
//                             <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
//                                 <Icon name="event" size={12} color="#b48a64" style={{ marginRight: 6 }} />
//                                 <Text style={{ fontSize: 13, color: '#333', fontWeight: '500' }}>
//                                     {formatDate(d.date)}
//                                 </Text>
//                                 <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
//                                     ({d.timeSlot || booking.eventTime || booking.timeSlot})
//                                     {d.eventType ? ` - ${d.eventType}` : (booking.eventType ? ` - ${booking.eventType}` : '')}
//                                 </Text>
//                             </View>
//                         ))}
//                     </View>
//                 )}
//             </View>
//         );
//     };

//     const renderRoomInfo = () => {
//         if (!processedBooking.roomNumber) return null;

//         return (
//             <View style={styles.roomCard}>
//                 <Text style={styles.cardTitle}>Room Information</Text>

//                 <View style={styles.roomInfoGrid}>
//                     <View style={styles.roomInfoBox}>
//                         <Icon name="meeting-room" size={24} color="#b48a64" />
//                         <Text style={styles.roomInfoLabel}>Room Number</Text>
//                         <Text style={styles.roomInfoValue}>{processedBooking.roomNumber}</Text>
//                     </View>
//                     <View style={styles.roomInfoBox}>
//                         <Icon name="category" size={24} color="#b48a64" />
//                         <Text style={styles.roomInfoLabel}>Room Type</Text>
//                         <Text style={styles.roomInfoValue}>{processedBooking.roomType || 'N/A'}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.roomDetails}>
//                     <View style={styles.detailBadge}>
//                         <Icon name="nights-stay" size={14} color="#666" />
//                         <Text style={styles.detailBadgeText}>{calculateNights()} Night(s)</Text>
//                     </View>

//                     <View style={styles.detailBadge}>
//                         <Icon name="people" size={14} color="#666" />
//                         <Text style={styles.detailBadgeText}>
//                             {processedBooking.numberOfAdults || 1} Adult{processedBooking.numberOfAdults !== 1 ? 's' : ''}
//                             {processedBooking.numberOfChildren ? `, ${processedBooking.numberOfChildren} Child${processedBooking.numberOfChildren !== 1 ? 'ren' : ''}` : ''}
//                         </Text>
//                     </View>

//                     <View style={styles.detailBadge}>
//                         <Icon name="price-change" size={14} color="#666" />
//                         <Text style={styles.detailBadgeText}>
//                             {processedBooking.pricingType === 'guest' ? 'Guest Rate' : 'Member Rate'}
//                         </Text>
//                     </View>
//                 </View>
//             </View>
//         );
//     };

//     const renderCancellationHistory = () => {
//         const requests = booking.cancellationRequests || [];
//         if (requests.length === 0 && !processedBooking.isCancelled) return null;

//         return (
//             <View style={styles.cancellationCard}>
//                 <View style={[styles.cardHeader, { borderBottomColor: '#f8d7da' }]}>
//                     <Icon name="history" size={20} color="#721c24" />
//                     <Text style={[styles.cardTitle, { color: '#721c24', marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0, marginLeft: 10 }]}>
//                         Cancellation Details
//                     </Text>
//                 </View>

//                 {requests.map((req, index) => (
//                     <View key={index} style={[styles.requestItem, index > 0 && styles.requestDivider]}>
//                         <View style={styles.requestHeader}>
//                             <View style={styles.requestDateContainer}>
//                                 <Icon name="event" size={14} color="#666" />
//                                 <Text style={styles.requestDate}>
//                                     Requested: {formatDate(req.createdAt || req.date)}
//                                 </Text>
//                             </View>
//                             <View style={[styles.miniStatusBadge, { backgroundColor: req.status === 'APPROVED' ? '#d4edda' : req.status === 'REJECTED' ? '#f8d7da' : '#fff3cd' }]}>
//                                 <Text style={[styles.miniStatusText, { color: req.status === 'APPROVED' ? '#155724' : req.status === 'REJECTED' ? '#721c24' : '#856404' }]}>
//                                     {req.status || 'PENDING'}
//                                 </Text>
//                             </View>
//                         </View>
//                         <Text style={styles.requestReasonLabel}>Reason:</Text>
//                         <Text style={styles.requestReasonText}>{req.reason || 'No reason provided'}</Text>
//                         {req.adminRemarks && (
//                             <View style={styles.adminRemarksContainer}>
//                                 <Text style={styles.adminRemarksLabel}>Admin Remarks:</Text>
//                                 <Text style={styles.adminRemarksText}>{req.adminRemarks}</Text>
//                             </View>
//                         )}
//                     </View>
//                 ))}

//                 {requests.length === 0 && processedBooking.isCancelled && (
//                     <View style={styles.requestItem}>
//                         <Text style={styles.requestReasonText}>This booking has been cancelled.</Text>
//                     </View>
//                 )}

//                 {requests.some(req => req.status === 'APPROVED') && (
//                     <View style={styles.adminRemarksContainer}>
//                         <Icon name="info" size={14} color="#721c24" style={{ marginBottom: 5 }} />
//                         <Text style={[styles.adminRemarksText, { color: '#721c24', fontWeight: 'bold' }]}>
//                             Please contact the PSC administration for your refund amount.
//                         </Text>
//                     </View>
//                 )}
//             </View>
//         );
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="dark-content" />

//             {/* Header */}
//             <ImageBackground
//                 source={require('../../assets/notch.jpg')}
//                 style={styles.notch}
//                 imageStyle={styles.notchImage}>
//                 <View style={styles.notchContent}>
//                     <TouchableOpacity
//                         style={styles.backButton}
//                         onPress={() => navigation.goBack()}>
//                         <Icon name="arrow-back" size={28} color="#000000" />
//                     </TouchableOpacity>
//                     <Text style={styles.ctext}>Booking Details</Text>
//                     <TouchableOpacity
//                         style={styles.shareButton}
//                         onPress={handleSaveReceipt}
//                         disabled={savingImage}>
//                         {savingImage ? (
//                             <ActivityIndicator size="small" color="#000000" />
//                         ) : (
//                             <Icon name="file-download" size={24} color="#000000" />
//                         )}
//                     </TouchableOpacity>
//                 </View>
//             </ImageBackground>

//             <ScrollView
//                 style={styles.content}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//             >
//                 {/* Booking ID & Status Banner */}
//                 <View style={styles.banner}>
//                     <View style={styles.bannerContent}>
//                         <Text style={styles.bookingId}>
//                             Booking #{booking.bookingId || booking.id}
//                         </Text>
//                         <View style={[
//                             styles.statusBanner,
//                             { backgroundColor: `${getStatusColor(processedBooking.paymentStatus)}20` }
//                         ]}>
//                             <View style={[
//                                 styles.statusDotLarge,
//                                 { backgroundColor: getStatusColor(processedBooking.paymentStatus) }
//                             ]} />
//                             <Text style={[
//                                 styles.statusTextLarge,
//                                 { color: getStatusColor(processedBooking.paymentStatus) }
//                             ]}>
//                                 {getStatusText(processedBooking.paymentStatus)}
//                             </Text>
//                         </View>
//                     </View>
//                     <Text style={styles.bookingType}>{getBookingType()} Booking</Text>
//                 </View>

//                 {/* The Capture Zone - Professional Digital Receipt Layout */}
//                 <ViewShot
//                     ref={viewShotRef}
//                     options={{ format: 'png', quality: 1.0, snapshotContentContainer: false }}
//                     style={styles.captureZone}
//                 >
//                     {/* Watermark/Status Badge - Absolute Background */}
//                     <View style={styles.captureWatermarkBg}>
//                         <Text style={[
//                             styles.largeWatermarkText,
//                             { color: getStatusColor(processedBooking.paymentStatus) + '15' }
//                         ]}>
//                             {processedBooking.paymentStatus === 'PAID' ? 'FULLY PAID' :
//                                 processedBooking.paymentStatus === 'PARTIAL' || processedBooking.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'}
//                         </Text>
//                     </View>

//                     {/* Receipt Header */}
//                     <View style={styles.receiptHeaderZone}>
//                         <View style={styles.receiptHeaderLine} />
//                         <View style={styles.pscReceiptBrand}>
//                             <Icon name="verified" size={24} color="#b48a64" />
//                             <Text style={styles.pscReceiptBrandText}>OFFICIAL DIGITAL RECEIPT</Text>
//                         </View>
//                         <Text style={styles.receiptBookingId}>Booking #{booking.bookingId || booking.id}</Text>
//                         <Text style={styles.receiptAgency}>Peshawar Services Club</Text>
//                     </View>

//                     {/* Section 1: Guest Details (Top) - Only for guest bookings */}
//                     {(booking.pricingType || '').toLowerCase() === 'guest' && (
//                         <View style={styles.receiptSection}>
//                             <View style={styles.receiptSectionHeader}>
//                                 <Icon name="people" size={18} color="#b48a64" />
//                                 <Text style={styles.receiptSectionTitle}>Guest Details</Text>
//                             </View>
//                             <View style={styles.receiptGrid}>
//                                 <View style={styles.receiptGridItem}>
//                                     <Text style={styles.receiptGridLabel}>Lead Guest</Text>
//                                     <Text style={styles.receiptGridValue}>{booking.guestName || 'N/A'}</Text>
//                                 </View>
//                                 <View style={styles.receiptGridItem}>
//                                     <Text style={styles.receiptGridLabel}>Contact No</Text>
//                                     <Text style={styles.receiptGridValue}>{booking.guestContact || 'N/A'}</Text>
//                                 </View>
//                                 <View style={styles.receiptGridItem}>
//                                     <Text style={styles.receiptGridLabel}>Total Guests</Text>
//                                     <Text style={styles.receiptGridValue}>
//                                         {processedBooking.numberOfAdults || 0} Adult(s)
//                                         {processedBooking.numberOfChildren ? `, ${processedBooking.numberOfChildren} Child(ren)` : ''}
//                                     </Text>
//                                 </View>
//                                 <View style={styles.receiptGridItem}>
//                                     <Text style={styles.receiptGridLabel}>Membership No</Text>
//                                     <Text style={styles.receiptGridValue}>{user?.membershipNo || 'N/A'}</Text>
//                                 </View>
//                             </View>
//                         </View>
//                     )}

//                     {/* Section 2: Payment Ledger (Middle) */}
//                     <View style={styles.receiptSection}>
//                         <View style={styles.receiptSectionHeader}>
//                             <Icon name="payments" size={18} color="#b48a64" />
//                             <Text style={styles.receiptSectionTitle}>Payment Ledger</Text>
//                         </View>
//                         {renderPaymentSummary()}
//                     </View>

//                     {/* Footnote for Authenticity */}
//                     <View style={styles.watermarkContainer}>
//                         <Icon name="lock" size={14} color="#b48a64" />
//                         <Text style={styles.watermarkText}>SECURE DIGITAL COPY • GENERATED ON {new Date().toLocaleDateString()}</Text>
//                     </View>
//                 </ViewShot>

//                 {/* Timeline */}
//                 {renderBookingTimeline()}

//                 {/* Cancellation History */}
//                 {renderCancellationHistory()}

//                 {/* Actions Section */}
//                 <View style={styles.actionsCard}>
//                     {/* <Text style={styles.cardTitle}>Actions</Text> */}

//                     <View style={styles.actionsGrid}>

//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.downloadButton, { flex: 1, backgroundColor: '#b48a64', borderColor: '#b48a64' }]}
//                             onPress={handleSaveReceipt}
//                             disabled={savingImage}
//                         >
//                             {savingImage ? (
//                                 <ActivityIndicator size="small" color="#ffffff" />
//                             ) : (
//                                 <Icon name="file-download" size={24} color="#ffffff" />
//                             )}
//                             <Text style={[styles.actionButtonText, { marginLeft: 8, color: '#ffffff' }]}>
//                                 {savingImage ? 'Saving...' : 'Save Receipt'}
//                             </Text>
//                         </TouchableOpacity>
//                         {!processedBooking.isCancelled && (() => {
//                             const latestReq = booking.cancellationRequests && booking.cancellationRequests.length > 0
//                                 ? booking.cancellationRequests[booking.cancellationRequests.length - 1]
//                                 : null;
//                             const hasPendingRequest = latestReq && latestReq.status === 'PENDING';
//                             const isPastBooking = booking.checkIn && new Date(booking.checkIn) < new Date().setHours(0, 0, 0, 0);

//                             if (hasPendingRequest) {
//                                 return (
//                                     <View style={[styles.actionButton, { backgroundColor: '#fff3cd', borderColor: '#ffeeba', flex: 1 }]}>
//                                         <Icon name="hourglass-empty" size={24} color="#856404" />
//                                         <Text style={[styles.actionButtonText, { color: '#856404', marginLeft: 8 }]}>Req Pending</Text>
//                                     </View>
//                                 );
//                             }

//                             if (isPastBooking) {
//                                 return (
//                                     <View style={[styles.actionButton, { backgroundColor: '#e2e3e5', borderColor: '#d6d8db', flex: 1 }]}>
//                                         <Icon name="info" size={24} color="#383d41" />
//                                         <Text style={[styles.actionButtonText, { color: '#383d41', marginLeft: 8 }]}>N/A (Past Date)</Text>
//                                     </View>
//                                 );
//                             }

//                             return (
//                                 <TouchableOpacity
//                                     style={[styles.actionButton, styles.cancelButton, { flex: 1 }]}
//                                     onPress={() => setShowCancelModal(true)}
//                                 >
//                                     <Icon name="cancel" size={24} color="#dc3545" />
//                                     <Text style={[styles.cancelButtonText, { marginLeft: 8 }]}>Request Cancellation</Text>
//                                 </TouchableOpacity>
//                             );
//                         })()}

//                         {/* <TouchableOpacity
//                             style={[styles.actionButton, styles.supportButton]}
//                             onPress={handleContactSupport}
//                         >
//                             <Icon name="support-agent" size={22} color="#007bff" />
//                             <Text style={styles.supportButtonText}>Support</Text>
//                         </TouchableOpacity> */}
//                     </View>
//                 </View>

//                 {/* Footer Info */}
//                 <View style={styles.footerInfo}>
//                     <Icon name="info" size={16} color="#666" />
//                     <Text style={styles.footerText}>
//                         Need help? Contact our support team for any queries or modifications.
//                     </Text>
//                 </View>
//             </ScrollView>

//             {/* Floating Action Button (FAB) for Capture */}
//             <TouchableOpacity
//                 style={styles.fabButton}
//                 onPress={handleSaveReceipt}
//                 disabled={savingImage}
//                 activeOpacity={0.8}
//             >
//                 {savingImage ? (
//                     <View style={styles.fabLoading}>
//                         <ActivityIndicator size="small" color="#ffffff" />
//                     </View>
//                 ) : (
//                     <Icon name="file-download" size={30} color="#ffffff" />
//                 )}
//             </TouchableOpacity>

//             {/* Cancel Booking Modal */}
//             <Modal
//                 visible={showCancelModal}
//                 transparent={true}
//                 animationType="slide"
//                 onRequestClose={() => setShowCancelModal(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContainer}>
//                         <View style={styles.modalHeader}>
//                             <Icon name="warning" size={30} color="#dc3545" />
//                             <Text style={styles.modalTitle}>Cancel Booking</Text>
//                             <TouchableOpacity onPress={() => setShowCancelModal(false)}>
//                                 <Icon name="close" size={24} color="#666" />
//                             </TouchableOpacity>
//                         </View>

//                         <View style={styles.modalContent}>
//                             <Text style={styles.modalText}>
//                                 Please provide a reason for cancelling booking #{booking.bookingId || booking.id}:
//                             </Text>

//                             <TextInput
//                                 style={styles.reasonInput}
//                                 placeholder="Enter reason for cancellation..."
//                                 multiline
//                                 numberOfLines={4}
//                                 value={cancellationReason}
//                                 onChangeText={setCancellationReason}
//                             />

//                             <Text style={styles.modalSubtext}>
//                                 This request will be submitted to club administration for approval.
//                             </Text>

//                             <View style={styles.modalActions}>
//                                 <TouchableOpacity
//                                     style={[styles.modalButton, styles.cancelModalButton]}
//                                     onPress={() => setShowCancelModal(false)}
//                                 >
//                                     <Text style={styles.cancelModalButtonText}>No, Keep It</Text>
//                                 </TouchableOpacity>

//                                 <TouchableOpacity
//                                     style={[styles.modalButton, styles.confirmCancelButton]}
//                                     onPress={handleCancelBooking}
//                                 >
//                                     <Text style={styles.confirmCancelButtonText}>Yes, Cancel</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>

//             {/* Invoice Modal */}
//             <Modal
//                 visible={showInvoiceModal}
//                 transparent={true}
//                 animationType="slide"
//                 onRequestClose={() => setShowInvoiceModal(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContainer}>
//                         <View style={styles.modalHeader}>
//                             <Icon name="receipt" size={30} color="#b48a64" />
//                             <Text style={styles.modalTitle}>Invoice Details</Text>
//                             <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
//                                 <Icon name="close" size={24} color="#666" />
//                             </TouchableOpacity>
//                         </View>

//                         <ScrollView style={styles.invoiceContent}>
//                             {invoiceData ? (
//                                 <>
//                                     <View style={styles.invoiceHeader}>
//                                         <Text style={styles.invoiceTitle}>Invoice #{invoiceData.invoiceNumber || invoiceData.invoice_no}</Text>
//                                         <Text style={styles.invoiceDate}>
//                                             Issued: {formatDate(invoiceData.issued_at || new Date())}
//                                         </Text>
//                                     </View>

//                                     <View style={styles.invoiceDetails}>
//                                         {renderDetailItem('Invoice Number', invoiceData.invoiceNumber || invoiceData.invoice_no)}
//                                         {renderDetailItem('Booking ID', booking.bookingId || booking.id)}
//                                         {renderDetailItem('Total Amount', formatCurrency(
//                                             invoiceData.total ||
//                                             invoiceData.totalPrice ||
//                                             invoiceData.amount ||
//                                             invoiceData.totalAmount ||
//                                             booking.totalPrice ||
//                                             booking.amount ||
//                                             0
//                                         ))}
//                                         {renderDetailItem('Payment Mode', invoiceData.paymentMode || invoiceData.payment_mode || 'N/A')}
//                                         {renderDetailItem('Issued By', invoiceData.issued_by || invoiceData.issuedBy || 'System')}
//                                     </View>

//                                     <TouchableOpacity
//                                         style={styles.printButton}
//                                         onPress={() => {
//                                             // Implement print functionality
//                                             Alert.alert('Print', 'Print functionality would be implemented here.');
//                                         }}
//                                     >
//                                         <Icon name="print" size={20} color="#fff" />
//                                         <Text style={styles.printButtonText}>Print Invoice</Text>
//                                     </TouchableOpacity>
//                                 </>
//                             ) : (
//                                 <Text style={styles.noInvoiceText}>No invoice data available</Text>
//                             )}
//                         </ScrollView>
//                     </View>
//                 </View>
//             </Modal>

//             {/* Processing Overlay for Receipt Save */}
//             {savingImage && (
//                 <View style={styles.processingOverlay}>
//                     <View style={styles.processingContent}>
//                         <ActivityIndicator size="large" color="#b48a64" />
//                         <Text style={styles.processingText}>Processing Receipt...</Text>
//                         <Text style={styles.processingSubtext}>Preparing a high-fidelity copy for your gallery</Text>
//                     </View>
//                 </View>
//             )}
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     captureZone: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 24,
//         padding: 24,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.15,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     voucherSection: {
//         paddingVertical: 10,
//     },
//     subtleDivider: {
//         height: 1,
//         backgroundColor: '#f0e6d8',
//         marginVertical: 10,
//         marginHorizontal: 10,
//     },
//     watermarkContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 20,
//         paddingTop: 15,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//         gap: 8,
//     },
//     watermarkText: {
//         fontSize: 12,
//         color: '#b48a64',
//         fontWeight: '600',
//         textTransform: 'uppercase',
//         letterSpacing: 1,
//     },
//     receiptBreakdown: {
//         backgroundColor: '#f8f9fa',
//         borderRadius: 12,
//         padding: 15,
//         marginTop: 15,
//         marginBottom: 10,
//     },
//     ledgerContainer: {
//         backgroundColor: '#f9f9f9',
//         borderRadius: 15,
//         padding: 20,
//         marginTop: 15,
//     },
//     ledgerRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 12,
//     },
//     ledgerLabel: {
//         fontSize: 14,
//         color: '#666',
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     ledgerLine: {
//         flex: 1,
//         height: 1,
//         borderBottomWidth: 1,
//         borderStyle: 'dashed',
//         borderColor: '#ddd',
//         marginHorizontal: 10,
//     },
//     ledgerValue: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     paymentStatusRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginTop: 15,
//         paddingTop: 15,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     statusLabel: {
//         fontSize: 12,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         letterSpacing: 1,
//     },
//     receiptSection: {
//         marginBottom: 20,
//         backgroundColor: '#fdfdfd',
//         padding: 15,
//         borderRadius: 15,
//         borderWidth: 1,
//         borderColor: '#f0f0f0',
//     },
//     receiptSectionHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0e6d8',
//         paddingBottom: 8,
//     },
//     receiptSectionTitle: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         marginLeft: 10,
//         textTransform: 'uppercase',
//         letterSpacing: 1,
//     },
//     receiptHeaderZone: {
//         alignItems: 'center',
//         marginBottom: 25,
//         marginTop: 10,
//     },
//     pscReceiptBrand: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//         marginBottom: 5,
//     },
//     pscReceiptBrandText: {
//         fontSize: 16,
//         fontWeight: '800',
//         color: '#b48a64',
//         letterSpacing: 2,
//     },
//     receiptBookingId: {
//         fontSize: 14,
//         color: '#666',
//         fontWeight: '600',
//     },
//     receiptAgency: {
//         fontSize: 12,
//         color: '#999',
//         textTransform: 'uppercase',
//         marginTop: 2,
//     },
//     receiptGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 15,
//     },
//     receiptGridItem: {
//         width: '45%',
//     },
//     receiptGridLabel: {
//         fontSize: 10,
//         color: '#999',
//         textTransform: 'uppercase',
//         marginBottom: 2,
//     },
//     receiptGridValue: {
//         fontSize: 13,
//         color: '#333',
//         fontWeight: '600',
//     },
//     captureWatermarkBg: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         justifyContent: 'center',
//         alignItems: 'center',
//         opacity: 0.1,
//         transform: [{ rotate: '-30deg' }],
//         zIndex: -1,
//     },
//     largeWatermarkText: {
//         fontSize: 100,
//         fontWeight: '900',
//         textAlign: 'center',
//     },
//     processingOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1000,
//     },
//     processingContent: {
//         backgroundColor: '#FFFFFF',
//         padding: 30,
//         borderRadius: 20,
//         alignItems: 'center',
//         width: '80%',
//     },
//     processingText: {
//         marginTop: 15,
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     processingSubtext: {
//         marginTop: 8,
//         fontSize: 12,
//         color: '#666',
//         textAlign: 'center',
//     },
//     fabButton: {
//         position: 'absolute',
//         bottom: 30,
//         right: 30,
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: '#b48a64',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.3,
//         shadowRadius: 10,
//         elevation: 10,
//         zIndex: 100,
//     },
//     fabLoading: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: 'rgba(180, 138, 100, 0.9)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#F4F1EE',
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
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     backButton: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     shareButton: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     ctext: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#000000',
//         flex: 1,
//         textAlign: 'center',
//     },
//     content: {
//         flex: 1,
//     },
//     scrollContent: {
//         padding: 20,
//         paddingBottom: 40,
//     },
//     banner: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     bannerContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 10,
//     },
//     bookingId: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     statusBanner: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     statusDotLarge: {
//         width: 10,
//         height: 10,
//         borderRadius: 5,
//         marginRight: 8,
//     },
//     statusTextLarge: {
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     bookingType: {
//         fontSize: 14,
//         color: '#666',
//         fontStyle: 'italic',
//     },
//     roomCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     roomHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     roomNumber: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         marginLeft: 12,
//     },
//     roomInfoGrid: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//         gap: 15,
//     },
//     roomInfoBox: {
//         flex: 1,
//         backgroundColor: '#f9f3eb',
//         padding: 15,
//         borderRadius: 12,
//         alignItems: 'center',
//     },
//     roomInfoLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 5,
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     roomInfoValue: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//         marginTop: 2,
//     },
//     roomDetails: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 10,
//     },
//     detailBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f8f9fa',
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 8,
//     },
//     detailBadgeText: {
//         fontSize: 12,
//         color: '#666',
//         marginLeft: 6,
//     },
//     guestCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     detailsCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     cardTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
//     subCardTitle: {
//         fontSize: 15,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         marginBottom: 15,
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     sectionDivider: {
//         height: 1,
//         backgroundColor: '#f0f0f0',
//         marginVertical: 15,
//     },
//     multiDateItem: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         marginBottom: 12,
//         backgroundColor: '#f8f9fa',
//         padding: 10,
//         borderRadius: 8,
//     },
//     multiDateContent: {
//         marginLeft: 10,
//     },
//     multiDateText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#333',
//     },
//     multiDateSubtext: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 2,
//     },
//     detailItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     detailLabelContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     detailIcon: {
//         marginRight: 10,
//     },
//     detailLabel: {
//         fontSize: 14,
//         color: '#666',
//     },
//     detailValue: {
//         fontSize: 15,
//         fontWeight: '500',
//         color: '#333',
//         textAlign: 'right',
//         flex: 1,
//     },
//     detailValueHighlight: {
//         color: '#b48a64',
//         fontWeight: 'bold',
//     },
//     copyableValueContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'flex-end',
//         flex: 1,
//     },
//     copyableValue: {
//         color: '#b48a64',
//         fontWeight: '600',
//         marginRight: 8,
//     },
//     copyIcon: {
//         marginLeft: 4,
//     },
//     specialRequestContainer: {
//         marginTop: 15,
//         paddingTop: 15,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     specialRequestText: {
//         fontSize: 14,
//         color: '#666',
//         fontStyle: 'italic',
//         lineHeight: 20,
//         marginTop: 5,
//     },
//     remarksContainer: {
//         marginTop: 15,
//         paddingTop: 15,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     remarksText: {
//         fontSize: 14,
//         color: '#666',
//         lineHeight: 20,
//         marginTop: 5,
//     },
//     paymentSummaryCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     paymentRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 12,
//         paddingVertical: 8,
//     },
//     paymentRowTotal: {
//         borderTopWidth: 1,
//         borderTopColor: '#e9ecef',
//         paddingTop: 15,
//         marginTop: 5,
//     },
//     paymentLabel: {
//         fontSize: 15,
//         color: '#666',
//     },
//     totalAmount: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#b48a64',
//     },
//     amountValue: {
//         fontSize: 16,
//         fontWeight: '500',
//     },
//     statusBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 12,
//     },
//     statusDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         marginRight: 6,
//     },
//     statusText: {
//         fontSize: 12,
//         fontWeight: '500',
//     },
//     vouchersContainer: {
//         marginTop: 20,
//         paddingTop: 20,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     voucherTitle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 15,
//     },
//     voucherItem: {
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         marginBottom: 15,
//         overflow: 'hidden',
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.05,
//         shadowRadius: 8,
//     },
//     voucherHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#f8f9fa',
//         paddingHorizontal: 15,
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#e9ecef',
//     },
//     voucherHeaderLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     voucherConsumerHeader: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#b48a64',
//         letterSpacing: 0.5,
//     },
//     copyIconBtn: {
//         padding: 5,
//         marginLeft: 4,
//     },
//     voucherBody: {
//         padding: 15,
//     },
//     voucherMainRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 12,
//     },
//     voucherTypeLabel: {
//         fontSize: 13,
//         fontWeight: 'bold',
//         color: '#333',
//         textTransform: 'uppercase',
//     },
//     voucherDateLabel: {
//         fontSize: 11,
//         color: '#666',
//         marginTop: 2,
//     },
//     voucherAmountLarge: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#b48a64',
//     },
//     voucherDivider: {
//         height: 1,
//         backgroundColor: '#f0f0f0',
//         marginBottom: 12,
//     },
//     voucherDetailsGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 15,
//     },
//     voucherDetailItem: {
//         width: '47%',
//     },
//     voucherDetailLabel: {
//         fontSize: 10,
//         color: '#888',
//         textTransform: 'uppercase',
//         marginBottom: 2,
//     },
//     voucherDetailValue: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: '#444',
//     },
//     voucherRemarks: {
//         fontSize: 11,
//         color: '#666',
//         fontStyle: 'italic',
//         marginTop: 12,
//         paddingTop: 8,
//         borderTopWidth: 1,
//         borderTopColor: '#f9f9f9',
//     },
//     noVouchersContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 30,
//         backgroundColor: '#f8f9fa',
//         borderRadius: 12,
//         marginTop: 15,
//     },
//     noVouchersText: {
//         fontSize: 14,
//         color: '#999',
//         marginTop: 10,
//         fontWeight: '500',
//     },
//     timelineCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     timelineItem: {
//         flexDirection: 'row',
//         marginBottom: 20,
//     },
//     timelineDot: {
//         width: 40,
//         alignItems: 'center',
//     },
//     timelineContent: {
//         flex: 1,
//         marginLeft: 10,
//     },
//     timelineTitle: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 4,
//     },
//     timelineDate: {
//         fontSize: 13,
//         color: '#666',
//     },
//     cancellationCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//         paddingBottom: 10,
//         borderBottomWidth: 1,
//     },
//     requestItem: {
//         paddingVertical: 10,
//     },
//     requestDivider: {
//         borderTopWidth: 1,
//         borderTopColor: '#f8d7da',
//         marginTop: 10,
//         paddingTop: 15,
//     },
//     requestHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     requestDateContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     requestDate: {
//         fontSize: 12,
//         color: '#666',
//         marginLeft: 6,
//         fontWeight: '500',
//     },
//     miniStatusBadge: {
//         paddingHorizontal: 8,
//         paddingVertical: 2,
//         borderRadius: 10,
//     },
//     miniStatusText: {
//         fontSize: 10,
//         fontWeight: 'bold',
//     },
//     requestReasonLabel: {
//         fontSize: 13,
//         fontWeight: '700',
//         color: '#333',
//         marginBottom: 4,
//     },
//     requestReasonText: {
//         fontSize: 13,
//         color: '#555',
//         lineHeight: 18,
//     },
//     adminRemarksContainer: {
//         marginTop: 8,
//         padding: 10,
//         backgroundColor: '#f8f9fa',
//         borderRadius: 8,
//         borderLeftWidth: 3,
//         borderLeftColor: '#6c757d',
//     },
//     adminRemarksLabel: {
//         fontSize: 12,
//         fontWeight: '700',
//         color: '#444',
//         marginBottom: 2,
//     },
//     adminRemarksText: {
//         fontSize: 12,
//         color: '#666',
//         fontStyle: 'italic',
//     },
//     actionsCard: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 15,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 12 },
//         shadowOpacity: 0.1,
//         shadowRadius: 16,
//         elevation: 12,
//     },
//     actionsGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 12,
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 15,
//         borderRadius: 10,
//         flex: 1,
//         minWidth: '48%',
//         gap: 8,
//     },
//     payButton: {
//         backgroundColor: '#28a745',
//     },
//     invoiceButton: {
//         backgroundColor: '#f9f3eb',
//     },
//     cancelButton: {
//         backgroundColor: '#fff5f5',
//     },
//     supportButton: {
//         backgroundColor: '#fff',
//         borderWidth: 1,
//         borderColor: '#007bff',
//     },
//     actionButtonText: {
//         color: 'black',
//         fontWeight: '600',
//         fontSize: 14,
//     },
//     cancelButtonText: {
//         color: '#dc3545',
//         fontWeight: '600',
//         fontSize: 14,
//     },
//     supportButtonText: {
//         color: '#007bff',
//         fontWeight: '600',
//         fontSize: 14,
//     },
//     footerInfo: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         backgroundColor: '#f0f7ff',
//         padding: 15,
//         borderRadius: 10,
//         borderLeftWidth: 4,
//         borderLeftColor: '#b48a64',
//     },
//     footerText: {
//         flex: 1,
//         fontSize: 13,
//         color: '#666',
//         marginLeft: 10,
//         lineHeight: 18,
//     },
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     modalContainer: {
//         backgroundColor: '#fff',
//         borderRadius: 20,
//         width: '100%',
//         maxWidth: 400,
//         maxHeight: '80%',
//     },
//     modalHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#e9ecef',
//     },
//     modalTitle: {
//         flex: 1,
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         textAlign: 'center',
//         marginLeft: 10,
//     },
//     modalContent: {
//         padding: 20,
//     },
//     reasonInput: {
//         borderWidth: 1,
//         borderColor: '#e9ecef',
//         borderRadius: 10,
//         padding: 12,
//         fontSize: 14,
//         color: '#333',
//         backgroundColor: '#f8f9fa',
//         textAlignVertical: 'top',
//         height: 100,
//         marginBottom: 15,
//     },
//     modalText: {
//         fontSize: 16,
//         color: '#333',
//         marginBottom: 10,
//         textAlign: 'center',
//     },
//     modalSubtext: {
//         fontSize: 14,
//         color: '#666',
//         textAlign: 'center',
//         marginBottom: 20,
//         lineHeight: 20,
//     },
//     modalActions: {
//         flexDirection: 'row',
//         gap: 10,
//     },
//     modalButton: {
//         flex: 1,
//         padding: 15,
//         borderRadius: 10,
//         alignItems: 'center',
//     },
//     cancelModalButton: {
//         backgroundColor: '#f1f3f5',
//     },
//     confirmCancelButton: {
//         backgroundColor: '#dc3545',
//     },
//     cancelModalButtonText: {
//         color: '#333',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     confirmCancelButtonText: {
//         color: '#fff',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     invoiceContent: {
//         padding: 20,
//     },
//     invoiceHeader: {
//         alignItems: 'center',
//         marginBottom: 20,
//         paddingBottom: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#e9ecef',
//     },
//     invoiceTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 5,
//     },
//     invoiceDate: {
//         fontSize: 14,
//         color: '#666',
//     },
//     invoiceDetails: {
//         marginBottom: 20,
//     },
//     printButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#b48a64',
//         padding: 15,
//         borderRadius: 10,
//         gap: 10,
//         marginTop: 20,
//     },
//     printButtonText: {
//         color: '#fff',
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     noInvoiceText: {
//         fontSize: 16,
//         color: '#666',
//         textAlign: 'center',
//         padding: 20,
//     },
// });


import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Alert,
    Modal,
    Linking,
    Share,
    ActivityIndicator,
    ImageBackground,
    Platform,
    TextInput,
    Clipboard,
    PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';

export default function BookingDetailsScreen({ navigation, route }) {
    const booking = route.params?.booking;
    console.log(booking)
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [savingImage, setSavingImage] = useState(false);
    const viewShotRef = useRef(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [voucherInfo, setVoucherInfo] = useState({ voucherNumber: null, consumerNumber: null });
    const [cancellationReason, setCancellationReason] = useState('');

    // Safety check: go back if no booking data is passed
    if (!booking) {
        React.useEffect(() => {
            Alert.alert('Error', 'No booking data found.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }, []);
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1EE' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#b48a64" />
                </View>
            </SafeAreaView>
        );
    }

    const handleSaveReceipt = async () => {
        try {
            // Internal Permission Handling
            if (Platform.OS === 'android') {
                const apiLevel = Platform.Version;
                if (apiLevel >= 33) {
                    const READ_MEDIA_IMAGES = 'android.permission.READ_MEDIA_IMAGES';
                    const hasPermission = await PermissionsAndroid.check(READ_MEDIA_IMAGES);
                    if (!hasPermission) {
                        const result = await PermissionsAndroid.request(READ_MEDIA_IMAGES);
                        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                            Alert.alert('Gallery Permission Required', 'Please enable gallery access to save your receipt.');
                            return;
                        }
                    }
                } else {
                    const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                    if (!hasPermission) {
                        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                            Alert.alert('Gallery Permission Required', 'Please enable storage access to save your receipt.');
                            return;
                        }
                    }
                }
            } else if (Platform.OS === 'ios') {
                const authStatus = await CameraRoll.requestAuthorization();
                if (authStatus === 'denied' || authStatus === 'restricted') {
                    Alert.alert('Gallery Access Denied', 'Please enable Photos access in Settings to save your receipt.');
                    return;
                }
            }

            setSavingImage(true);

            // Mandatory hardware-inflating delay (150ms)
            setTimeout(async () => {
                if (!viewShotRef.current) {
                    setSavingImage(false);
                    return;
                }

                try {
                    const uri = await viewShotRef.current.capture();
                    await CameraRoll.save(uri, { type: 'photo' });
                    Alert.alert('Receipt Saved', 'Digital receipt has been successfully saved to your gallery.');
                } catch (error) {
                    console.error('Capture Engine Failure:', error);
                    Alert.alert('Capture Error', 'The capture engine failed to process the view. Please try again.');
                } finally {
                    setSavingImage(false);
                }
            }, 150);

        } catch (error) {
            console.error('Saving internal error:', error);
            Alert.alert('Internal Error', 'An unexpected error occurred while preparing the receipt.');
            setSavingImage(false);
        }
    };

    // Fetch voucher and consumer number from invoice data
    React.useEffect(() => {
        const fetchVoucherInfo = async () => {
            // First, try to get voucher/consumer numbers directly from booking object
            const directVoucherNumber = booking.voucherNumber || booking.voucher_no ||
                booking.invoiceNumber || booking.invoice_no ||
                booking.voucher?.voucher_no || booking.voucher?.voucherNumber ||
                booking.voucherData?.voucher?.voucher_no;

            const directConsumerNumber = booking.consumerNumber || booking.consumer_number ||
                booking.consumer_no || booking.consumerNo ||
                booking.voucher?.consumer_number || booking.voucher?.consumerNumber ||
                booking.voucherData?.voucher?.consumer_number;

            // If we already have both values from the booking object, use them
            if (directVoucherNumber || directConsumerNumber) {
                setVoucherInfo({
                    voucherNumber: directVoucherNumber,
                    consumerNumber: directConsumerNumber
                });

                // If we already have both, no need to fetch
                if (directVoucherNumber && directConsumerNumber) {
                    return;
                }
            }

            // Otherwise, try to fetch from API
            try {
                // Determine booking type for API call (inline to avoid hoisting issue)
                let bookingType = 'Room';
                if (booking.bookingType) {
                    bookingType = booking.bookingType;
                } else if (booking.hallId) {
                    bookingType = 'Hall';
                } else if (booking.lawnId) {
                    bookingType = 'Lawn';
                } else if (booking.photoshootId) {
                    bookingType = 'Photoshoot';
                }

                const invoice = await bookingService.getInvoice(
                    booking.bookingId || booking.id,
                    null,
                    bookingType
                );
                if (invoice) {
                    setVoucherInfo(prev => ({
                        voucherNumber: prev.voucherNumber || invoice.invoiceNumber || invoice.invoice_no || invoice.invoiceNo || invoice.voucherNumber || invoice.voucher_no,
                        consumerNumber: prev.consumerNumber || invoice.consumerNumber || invoice.consumer_number || invoice.consumer_no || invoice.consumerNo
                    }));
                }
            } catch (error) {
                console.log('Voucher info not available from API:', error.message);
                // Silent fail - voucher info is optional display
            }
        };

        if (booking.bookingId || booking.id) {
            fetchVoucherInfo();
        }
    }, [booking.bookingId, booking.id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 Rs.';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return '0 Rs.';
        return `${numAmount.toFixed(0)} Rs.`;
    };

    const getStatusColor = (status) => {
        if (!status) return '#6c757d';
        const statusUpper = status.toUpperCase();
        switch (statusUpper) {
            case 'PAID':
            case 'COMPLETED':
            case 'CONFIRMED':
                return '#28a745';
            case 'PENDING':
            case 'HALF_PAID':
            case 'PARTIAL':
            case 'ADVANCE_PAYMENT':
                return '#ffc107';
            case 'UNPAID':
            case 'CANCELLED':
            case 'REJECTED':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getPricingLabel = (type) => {
        if (!type) return 'Guest Rate';
        const t = type.toLowerCase();
        if (t === 'member') return 'Member Rate';
        if (t === 'forces') return 'Forces Rate';
        if (t === 'forces-guest') return 'Forces Guest Rate';
        if (t === 'guest') return 'Guest Rate';
        return t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Rate';
    };

    const getStatusText = (status) => {
        if (!status) return 'Unknown';
        return status.replace('_', ' ').toUpperCase();
    };

    const getPaymentModeLabel = (mode) => {
        if (!mode) return 'N/A';
        const m = mode.toUpperCase();
        if (m === 'CHECK' || m === 'CHEQUE') return 'Cheque';
        return mode;
    };

    const copyToClipboard = (text, label) => {
        if (!text) return;
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    const getBookingType = () => {
        if (booking.bookingType) return booking.bookingType;
        if (booking.roomNumber || booking.roomId) return 'Room';
        if (booking.hallId) return 'Hall';
        if (booking.lawnId) return 'Lawn';
        if (booking.photoshootId) return 'Photoshoot';
        return 'Booking';
    };

    const calculateNights = () => {
        if (!booking.checkIn || !booking.checkOut) return 0;
        try {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const diffTime = Math.abs(checkOut - checkIn);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            return 0;
        }
    };

    const handleCancelBooking = async () => {
        if (!cancellationReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for cancellation.');
            return;
        }

        setShowCancelModal(false);

        try {
            setLoading(true);
            const bookingType = getBookingType() === "Room" ? "rooms" : getBookingType() === "Hall" ? "halls" : getBookingType() === "Lawn" ? "lawns" : getBookingType() === "Photoshoot" ? "photoshoots" : "";
            const bookingId = booking.bookingId || booking.id;

            await bookingService.cancelReqBooking(
                bookingType,
                bookingId,
                cancellationReason
            );

            Alert.alert(
                'Success',
                'Cancellation request submitted successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Cancel error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to submit cancellation request.'
            );
        } finally {
            setLoading(false);
            setCancellationReason('');
        }
    };

    const handleGetInvoice = async () => {
        try {
            setLoading(true);
            const invoice = await bookingService.getInvoice(
                booking.bookingId || booking.id
            );
            setInvoiceData(invoice);
            setShowInvoiceModal(true);
        } catch (error) {
            console.error('Invoice error:', error);
            Alert.alert('Error', 'Failed to load invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleShareBooking = async () => {
        try {
            const shareMessage = `
Booking Details:
Booking ID: ${booking.bookingId || booking.id}
Type: ${getBookingType()}
Status: ${getStatusText(booking.paymentStatus)}
Amount: ${formatCurrency(booking.totalPrice)}
Check-in: ${formatDate(booking.checkIn)}
Check-out: ${formatDate(booking.checkOut)}
      `;

            await Share.share({
                message: shareMessage,
                title: 'Booking Details'
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'For any queries or modifications, please contact our support team.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call Support',
                    onPress: () => Linking.openURL('tel:0919212753')
                },
                {
                    text: 'Email Support',
                    onPress: () => Linking.openURL('info@peshawarservicesclub.com')
                }
            ]
        );
    };



    const renderDetailItem = (label, value, icon = null, isHighlight = false) => (
        <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
                {icon && <Icon name={icon} size={18} color="#666" style={styles.detailIcon} />}
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={[
                styles.detailValue,
                isHighlight && styles.detailValueHighlight
            ]}>
                {value}
            </Text>
        </View>
    );

    // Render a highlighted detail item (for voucher and consumer numbers)
    const renderHighlightDetailItem = (label, value, icon = null) => (
        <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
                {icon && <Icon name={icon} size={18} color="#666" style={styles.detailIcon} />}
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <View style={styles.copyableValueContainer}>
                <Text style={[styles.detailValue, styles.copyableValue]}>
                    {value}
                </Text>
            </View>
        </View>
    );

    // Enhanced Booking Processing (Similar to MemberBookingsScreen)
    const processedBooking = {
        ...booking,
        totalPrice: parseFloat(booking.totalPrice || booking.total_price || booking.amount || booking.price ||
            booking.totalAmount || booking.total_amount || booking.netAmount || booking.net_amount ||
            booking.payableAmount || booking.payable_amount || booking.charges || booking.rent || 0),

        paidAmount: (() => {
            const status = (booking.paymentStatus || booking.status ||
                booking.bookingStatus || booking.payment_status ||
                booking.state || '').toUpperCase();
            const total = parseFloat(booking.totalPrice || booking.total_price || booking.amount ||
                booking.totalAmount || booking.total_amount || booking.netAmount ||
                booking.net_amount || booking.charges || booking.rent || 0);
            const paid = parseFloat(booking.paidAmount || booking.paid_amount || booking.paid ||
                booking.totalPaid || booking.total_paid || booking.advance || 0);

            if ((status === 'PAID' || status === 'COMPLETED') && paid === 0 && total > 0) return total;
            return paid;
        })(),

        pendingAmount: (() => {
            const status = (booking.paymentStatus || booking.status ||
                booking.bookingStatus || booking.payment_status ||
                booking.state || '').toUpperCase();
            if (status === 'PAID' || status === 'COMPLETED') return 0;
            return parseFloat(booking.pendingAmount || booking.pending_amount || booking.pending ||
                booking.balance || booking.remainingAmount || booking.remaining_amount || 0);
        })(),

        paymentStatus: (() => {
            const originalStatus = (booking.paymentStatus || booking.status ||
                booking.bookingStatus || booking.payment_status ||
                booking.state || '').toUpperCase();

            // Trust terminal statuses from API
            if (['PAID', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REJECT', 'ADVANCE_PAYMENT'].includes(originalStatus)) {
                return originalStatus;
            }

            const total = parseFloat(booking.totalPrice || booking.total_price || booking.amount ||
                booking.totalAmount || booking.total_amount || booking.netAmount ||
                booking.net_amount || booking.charges || booking.rent || 0);
            const paid = parseFloat(booking.paidAmount || booking.paid_amount || booking.paid ||
                booking.totalPaid || booking.total_paid || booking.advance || 0);

            if (total > 0) {
                if (paid >= total) return 'PAID';
                if (paid > 0) return 'HALF_PAID';
                return 'UNPAID';
            }
            return originalStatus || 'UNPAID';
        })(),

        roomNumber: booking.rooms?.length > 0
            ? booking.rooms.map(r => r.room?.roomNumber).filter(Boolean).join(', ')
            : (booking.roomNumber || booking.roomId || (booking.room?.roomNumber)),
        roomType: booking.rooms?.length > 0
            ? [...new Set(booking.rooms.map(r => r.room?.roomType?.type).filter(Boolean))].join(', ')
            : (booking.roomType || booking.room?.roomType?.type || (booking.name?.includes('(') ? booking.name.split('(')[1].split(')')[0] : '')),
        vouchers: booking.vouchers || [],

        pricingLabel: getPricingLabel(booking.pricingType),
        isCancelled: booking.isCancelled === true || booking.is_cancelled === true ||
            booking.status === 'CANCELLED' || booking.paymentStatus === 'CANCELLED'
    };

    const renderPaymentSummary = () => {
        const sortedVouchers = [...(processedBooking.vouchers || [])].sort((a, b) =>
            new Date(b.issued_at) - new Date(a.issued_at)
        );

        return (
            <View style={styles.voucherSection}>
                <View style={styles.ledgerContainer}>
                    {/* Financial Summary Breakdown */}
                    <View style={styles.ledgerRow}>
                        <Text style={styles.ledgerLabel}>Member Charges</Text>
                        <View style={styles.ledgerLine} />
                        <Text style={styles.ledgerValue}>
                            {formatCurrency(processedBooking.pricingType?.toLowerCase() === 'member' ? processedBooking.totalPrice : 0)}
                        </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                        <Text style={styles.ledgerLabel}>Guest Charges</Text>
                        <View style={styles.ledgerLine} />
                        <Text style={styles.ledgerValue}>
                            {formatCurrency(processedBooking.pricingType?.toLowerCase() === 'guest' ? processedBooking.totalPrice : 0)}
                        </Text>
                    </View>
                    <View style={styles.ledgerRow}>
                        <Text style={styles.ledgerLabel}>Service / Add-on Fees</Text>
                        <View style={styles.ledgerLine} />
                        <Text style={styles.ledgerValue}>{formatCurrency(0)}</Text>
                    </View>

                    <View style={[styles.ledgerRow, { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }]}>
                        <Text style={[styles.ledgerLabel, { fontWeight: 'bold', color: '#b48a64' }]}>Total Amount</Text>
                        <View style={[styles.ledgerLine, { borderStyle: 'solid', borderColor: '#b48a64' }]} />
                        <Text style={[styles.ledgerValue, { fontSize: 18, color: '#b48a64' }]}>{formatCurrency(processedBooking.totalPrice)}</Text>
                    </View>

                    <View style={styles.ledgerRow}>
                        <Text style={styles.ledgerLabel}>Paid To Date</Text>
                        <View style={styles.ledgerLine} />
                        <Text style={[styles.ledgerValue, { color: '#28a745' }]}>{formatCurrency(processedBooking.paidAmount)}</Text>
                    </View>

                    <View style={[styles.ledgerRow, { marginTop: 5 }]}>
                        <Text style={[styles.ledgerLabel, { fontWeight: 'bold', color: '#333' }]}>Balance Due</Text>
                        <View style={[styles.ledgerLine, { borderStyle: 'solid', borderColor: '#eee' }]} />
                        <Text style={[styles.ledgerValue, { fontSize: 20, color: processedBooking.pendingAmount > 0 ? '#dc3545' : '#28a745' }]}>
                            {formatCurrency(processedBooking.pendingAmount)}
                        </Text>
                    </View>
                </View>

                <View style={styles.paymentStatusRow}>
                    <Text style={styles.statusLabel}>STATUS:</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(processedBooking.paymentStatus)}15`, borderWidth: 0 }
                    ]}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(processedBooking.paymentStatus) }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: getStatusColor(processedBooking.paymentStatus), fontWeight: 'bold' }
                        ]}>
                            {getStatusText(processedBooking.paymentStatus)}
                        </Text>
                    </View>
                </View>

                {sortedVouchers.length > 0 && (
                    <View style={styles.vouchersContainer}>
                        <Text style={styles.subCardTitle}>Transaction History</Text>
                        {sortedVouchers.map((voucher, index) => (
                            <View key={index} style={styles.voucherItem}>
                                <View style={styles.voucherHeader}>
                                    <View style={styles.voucherHeaderLeft}>
                                        <Icon name="receipt" size={14} color="#b48a64" />
                                        <Text style={styles.voucherConsumerHeader}>{voucher.consumer_number}</Text>
                                    </View>
                                    <View style={[styles.miniStatusBadge, { backgroundColor: voucher.status === 'CONFIRMED' ? '#d4edda' : '#fff3cd' }]}>
                                        <Text style={[styles.miniStatusText, { color: voucher.status === 'CONFIRMED' ? '#155724' : '#856404' }]}>
                                            {voucher.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.voucherBody}>
                                    <View style={styles.voucherMainRow}>
                                        <Text style={styles.voucherTypeLabel}>{voucher.voucher_type?.replace('_', ' ')}</Text>
                                        <Text style={styles.voucherAmountLarge}>{formatCurrency(voucher.amount)}</Text>
                                    </View>
                                    <Text style={styles.voucherDateLabel}>{formatDate(voucher.issued_at)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderBookingTimeline = () => {
        const type = getBookingType();
        const isVenue = ['Hall', 'Lawn', 'Photoshoot'].includes(type);

        return (
            <View style={styles.timelineCard}>
                <Text style={styles.cardTitle}>Booking Timeline</Text>

                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                        <Icon name="check-circle" size={20} color="#28a745" />
                    </View>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Booking Created</Text>
                        <Text style={styles.timelineDate}>
                            {formatDate(booking.createdAt)} • {formatTime(booking.createdAt)}
                        </Text>
                    </View>
                </View>

                {isVenue ? (
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineDot}>
                            <Icon name="event" size={20} color="#b48a64" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Event Date</Text>
                            <Text style={styles.timelineDate}>
                                {formatDate(booking.checkIn || booking.date || booking.eventDate)}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot}>
                                <Icon name="event" size={20} color="#b48a64" />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Check-in</Text>
                                <Text style={styles.timelineDate}>
                                    {formatDate(booking.checkIn || booking.from || booking.startTime || booking.start_time || booking.start || booking.booking_from || booking.bookingDate || booking.booking_date || booking.date)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot}>
                                <Icon name="event-busy" size={20} color="#b48a64" />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Check-out</Text>
                                <Text style={styles.timelineDate}>
                                    {formatDate(booking.checkOut || booking.to || booking.endTime || booking.end_time || booking.end || booking.booking_to || booking.endDate || booking.bookingDate || booking.booking_date || booking.date)}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        );
    };

    const renderGuestInfo = () => {
        // Determine if it's a Guest booking
        const isGuest = (booking.pricingType || '').toLowerCase() === 'guest';

        return (
            <View style={styles.guestCard}>
                <Text style={styles.cardTitle}>Details</Text>

                {renderDetailItem('Booking For', isGuest ? 'Guest' : 'Member', 'badge')}

                {isGuest && (
                    <>
                        {booking.guestName && renderDetailItem('Name', booking.guestName, 'person')}
                        {booking.guestContact && renderDetailItem('Contact', booking.guestContact, 'phone')}
                        {booking.guestEmail && renderDetailItem('Email', booking.guestEmail, 'email')}
                    </>
                )}
            </View>
        );
    };

    const renderVenueInfo = () => {
        // Use venueName from passed booking or fallback
        const type = getBookingType();
        const venueName = booking.venueName || booking.hallName || booking.lawnName || booking.name || type;
        const details = booking.bookingDetails || []; // Multi-date details

        return (
            <View style={styles.roomCard}>
                <Text style={styles.cardTitle}>{type === 'Photoshoot' ? 'Photoshoot Details' : `${type} Information`}</Text>

                <View style={styles.roomHeader}>
                    {/* <Icon name="location-city" size={24} color="#b48a64" /> */}
                    <Text style={styles.roomNumber}>{venueName}</Text>
                </View>

                <View style={styles.roomDetails}>
                    <View style={styles.detailBadge}>
                        <Icon name="people" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>
                            {booking.numberOfGuests || booking.guests || booking.guest_count || booking.numberOfAdults || 0} Guests
                        </Text>
                    </View>

                    {/* {(booking.eventType || booking.event_type) && (
                        <View style={styles.detailBadge}>
                            <Icon name="event" size={14} color="#666" />
                            <Text style={styles.detailBadgeText}>{booking.eventType || booking.event_type}</Text>
                        </View>
                    )} */}

                    {(booking.eventTime || booking.timeSlot) && (
                        <View style={styles.detailBadge}>
                            <Icon name="access-time" size={14} color="#666" />
                            <Text style={styles.detailBadgeText}>{booking.eventTime || booking.timeSlot}</Text>
                        </View>
                    )}
                </View>

                {/* Multi-date list */}
                {details.length > 0 && (
                    <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0e6d8' }}>
                        <Text style={[styles.detailLabel, { marginBottom: 8 }]}>Selected Dates:</Text>
                        {details.map((d, index) => (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Icon name="event" size={12} color="#b48a64" style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 13, color: '#333', fontWeight: '500' }}>
                                    {formatDate(d.date)}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                                    ({d.timeSlot || booking.eventTime || booking.timeSlot})
                                    {d.eventType ? ` - ${d.eventType}` : (booking.eventType ? ` - ${booking.eventType}` : '')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderRoomInfo = () => {
        if (!processedBooking.roomNumber) return null;

        return (
            <View style={styles.roomCard}>
                <Text style={styles.cardTitle}>Room Information</Text>

                <View style={styles.roomInfoGrid}>
                    <View style={styles.roomInfoBox}>
                        <Icon name="meeting-room" size={24} color="#b48a64" />
                        <Text style={styles.roomInfoLabel}>Room Number</Text>
                        <Text style={styles.roomInfoValue}>{processedBooking.roomNumber}</Text>
                    </View>
                    <View style={styles.roomInfoBox}>
                        <Icon name="category" size={24} color="#b48a64" />
                        <Text style={styles.roomInfoLabel}>Room Type</Text>
                        <Text style={styles.roomInfoValue}>{processedBooking.roomType || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.roomDetails}>
                    <View style={styles.detailBadge}>
                        <Icon name="nights-stay" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>{calculateNights()} Night(s)</Text>
                    </View>

                    <View style={styles.detailBadge}>
                        <Icon name="people" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>
                            {processedBooking.numberOfAdults || 1} Adult{processedBooking.numberOfAdults !== 1 ? 's' : ''}
                            {processedBooking.numberOfChildren ? `, ${processedBooking.numberOfChildren} Child${processedBooking.numberOfChildren !== 1 ? 'ren' : ''}` : ''}
                        </Text>
                    </View>

                    <View style={styles.detailBadge}>
                        <Icon name="price-change" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>
                            {processedBooking.pricingType === 'guest' ? 'Guest Rate' : 'Member Rate'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderCancellationHistory = () => {
        const requests = booking.cancellationRequests || [];
        if (requests.length === 0 && !processedBooking.isCancelled) return null;

        return (
            <View style={styles.cancellationCard}>
                <View style={[styles.cardHeader, { borderBottomColor: '#f8d7da' }]}>
                    <Icon name="history" size={20} color="#721c24" />
                    <Text style={[styles.cardTitle, { color: '#721c24', marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0, marginLeft: 10 }]}>
                        Cancellation Details
                    </Text>
                </View>

                {requests.map((req, index) => (
                    <View key={index} style={[styles.requestItem, index > 0 && styles.requestDivider]}>
                        <View style={styles.requestHeader}>
                            <View style={styles.requestDateContainer}>
                                <Icon name="event" size={14} color="#666" />
                                <Text style={styles.requestDate}>
                                    Requested: {formatDate(req.createdAt || req.date)}
                                </Text>
                            </View>
                            <View style={[styles.miniStatusBadge, { backgroundColor: req.status === 'APPROVED' ? '#d4edda' : req.status === 'REJECTED' ? '#f8d7da' : '#fff3cd' }]}>
                                <Text style={[styles.miniStatusText, { color: req.status === 'APPROVED' ? '#155724' : req.status === 'REJECTED' ? '#721c24' : '#856404' }]}>
                                    {req.status || 'PENDING'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.requestReasonLabel}>Reason:</Text>
                        <Text style={styles.requestReasonText}>{req.reason || 'No reason provided'}</Text>
                        {req.adminRemarks && (
                            <View style={styles.adminRemarksContainer}>
                                <Text style={styles.adminRemarksLabel}>Admin Remarks:</Text>
                                <Text style={styles.adminRemarksText}>{req.adminRemarks}</Text>
                            </View>
                        )}
                    </View>
                ))}

                {requests.length === 0 && processedBooking.isCancelled && (
                    <View style={styles.requestItem}>
                        <Text style={styles.requestReasonText}>This booking has been cancelled.</Text>
                    </View>
                )}

                {requests.some(req => req.status === 'APPROVED') && (
                    <View style={styles.adminRemarksContainer}>
                        <Icon name="info" size={14} color="#721c24" style={{ marginBottom: 5 }} />
                        <Text style={[styles.adminRemarksText, { color: '#721c24', fontWeight: 'bold' }]}>
                            Please contact the PSC administration for your refund amount.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <ImageBackground
                source={require('../../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}>
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={28} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.ctext}>Booking Details</Text>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleSaveReceipt}
                        disabled={savingImage}>
                        {savingImage ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Icon name="file-download" size={24} color="#000000" />
                        )}
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Booking ID & Status Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bookingId}>
                            Booking #{booking.bookingId || booking.id}
                        </Text>
                        <View style={[
                            styles.statusBanner,
                            { backgroundColor: `${getStatusColor(processedBooking.paymentStatus)}20` }
                        ]}>
                            <View style={[
                                styles.statusDotLarge,
                                { backgroundColor: getStatusColor(processedBooking.paymentStatus) }
                            ]} />
                            <Text style={[
                                styles.statusTextLarge,
                                { color: getStatusColor(processedBooking.paymentStatus) }
                            ]}>
                                {getStatusText(processedBooking.paymentStatus)}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.bookingType}>{getBookingType()} Booking</Text>
                </View>

                {/* The Capture Zone - Professional Digital Receipt Layout */}
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 1.0, snapshotContentContainer: false }}
                    style={styles.captureZone}
                >
                    {/* Watermark/Status Badge - Absolute Background */}
                    <View style={styles.captureWatermarkBg}>
                        <Text style={[
                            styles.largeWatermarkText,
                            { color: getStatusColor(processedBooking.paymentStatus) + '15' }
                        ]}>
                            {processedBooking.paymentStatus === 'PAID' ? 'FULLY PAID' :
                                processedBooking.paymentStatus === 'PARTIAL' || processedBooking.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'}
                        </Text>
                    </View>

                    {/* Receipt Header */}
                    <View style={styles.receiptHeaderZone}>
                        <View style={styles.receiptHeaderLine} />
                        <View style={styles.pscReceiptBrand}>
                            <Icon name="verified" size={24} color="#b48a64" />
                            <Text style={styles.pscReceiptBrandText}>OFFICIAL DIGITAL RECEIPT</Text>
                        </View>
                        <Text style={styles.receiptBookingId}>Booking #{booking.bookingId || booking.id}</Text>
                        <Text style={styles.receiptAgency}>Peshawar Services Club</Text>
                    </View>

                    {/* Section 1: Guest Details (Top) - Only for guest bookings */}
                    {(booking.pricingType || '').toLowerCase() === 'guest' && (
                        <View style={styles.receiptSection}>
                            <View style={styles.receiptSectionHeader}>
                                <Icon name="people" size={18} color="#b48a64" />
                                <Text style={styles.receiptSectionTitle}>Guest Details</Text>
                            </View>
                            <View style={styles.receiptGrid}>
                                <View style={styles.receiptGridItem}>
                                    <Text style={styles.receiptGridLabel}>Lead Guest</Text>
                                    <Text style={styles.receiptGridValue}>{booking.guestName || 'N/A'}</Text>
                                </View>
                                <View style={styles.receiptGridItem}>
                                    <Text style={styles.receiptGridLabel}>Contact No</Text>
                                    <Text style={styles.receiptGridValue}>{booking.guestContact || 'N/A'}</Text>
                                </View>
                                <View style={styles.receiptGridItem}>
                                    <Text style={styles.receiptGridLabel}>Total Guests</Text>
                                    <Text style={styles.receiptGridValue}>
                                        {processedBooking.numberOfAdults || 0} Adult(s)
                                        {processedBooking.numberOfChildren ? `, ${processedBooking.numberOfChildren} Child(ren)` : ''}
                                    </Text>
                                </View>
                                <View style={styles.receiptGridItem}>
                                    <Text style={styles.receiptGridLabel}>Membership No</Text>
                                    <Text style={styles.receiptGridValue}>{user?.membershipNo || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Section 2: Payment Ledger (Middle) */}
                    <View style={styles.receiptSection}>
                        <View style={styles.receiptSectionHeader}>
                            <Icon name="payments" size={18} color="#b48a64" />
                            <Text style={styles.receiptSectionTitle}>Payment Ledger</Text>
                        </View>
                        {renderPaymentSummary()}
                    </View>

                    {/* Footnote for Authenticity */}
                    <View style={styles.watermarkContainer}>
                        <Icon name="lock" size={14} color="#b48a64" />
                        <Text style={styles.watermarkText}>SECURE DIGITAL COPY • GENERATED ON {new Date().toLocaleDateString()}</Text>
                    </View>
                </ViewShot>

                {/* Timeline */}
                {renderBookingTimeline()}

                {/* Cancellation History */}
                {renderCancellationHistory()}

                {/* Actions Section */}
                <View style={styles.actionsCard}>
                    {/* <Text style={styles.cardTitle}>Actions</Text> */}

                    <View style={styles.actionsGrid}>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.downloadButton, { flex: 1, backgroundColor: '#b48a64', borderColor: '#b48a64' }]}
                            onPress={handleSaveReceipt}
                            disabled={savingImage}
                        >
                            {savingImage ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Icon name="file-download" size={24} color="#ffffff" />
                            )}
                            <Text style={[styles.actionButtonText, { marginLeft: 8, color: '#ffffff' }]}>
                                {savingImage ? 'Saving...' : 'Save Receipt'}
                            </Text>
                        </TouchableOpacity>
                        {!processedBooking.isCancelled && (() => {
                            // Hide cancellation button for paid photoshoot bookings
                            const isPhotoshootPaid = getBookingType() === 'Photoshoot' && processedBooking.paymentStatus === 'PAID';
                            if (isPhotoshootPaid) return null;

                            const latestReq = booking.cancellationRequests && booking.cancellationRequests.length > 0
                                ? booking.cancellationRequests[booking.cancellationRequests.length - 1]
                                : null;
                            const hasPendingRequest = latestReq && latestReq.status === 'PENDING';
                            const isPastBooking = booking.checkIn && new Date(booking.checkIn) < new Date().setHours(0, 0, 0, 0);

                            if (hasPendingRequest) {
                                return (
                                    <View style={[styles.actionButton, { backgroundColor: '#fff3cd', borderColor: '#ffeeba', flex: 1 }]}>
                                        <Icon name="hourglass-empty" size={24} color="#856404" />
                                        <Text style={[styles.actionButtonText, { color: '#856404', marginLeft: 8 }]}>Req Pending</Text>
                                    </View>
                                );
                            }

                            if (isPastBooking) {
                                return (
                                    <View style={[styles.actionButton, { backgroundColor: '#e2e3e5', borderColor: '#d6d8db', flex: 1 }]}>
                                        <Icon name="info" size={24} color="#383d41" />
                                        <Text style={[styles.actionButtonText, { color: '#383d41', marginLeft: 8 }]}>N/A (Past Date)</Text>
                                    </View>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton, { flex: 1 }]}
                                    onPress={() => setShowCancelModal(true)}
                                >
                                    <Icon name="cancel" size={24} color="#dc3545" />
                                    <Text style={[styles.cancelButtonText, { marginLeft: 8 }]}>Request Cancellation</Text>
                                </TouchableOpacity>
                            );
                        })()}

                        {/* <TouchableOpacity
                            style={[styles.actionButton, styles.supportButton]}
                            onPress={handleContactSupport}
                        >
                            <Icon name="support-agent" size={22} color="#007bff" />
                            <Text style={styles.supportButtonText}>Support</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Footer Info */}
                <View style={styles.footerInfo}>
                    <Icon name="info" size={16} color="#666" />
                    <Text style={styles.footerText}>
                        Need help? Contact our support team for any queries or modifications.
                    </Text>
                </View>
            </ScrollView>

            {/* Floating Action Button (FAB) for Capture */}
            <TouchableOpacity
                style={styles.fabButton}
                onPress={handleSaveReceipt}
                disabled={savingImage}
                activeOpacity={0.8}
            >
                {savingImage ? (
                    <View style={styles.fabLoading}>
                        <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                ) : (
                    <Icon name="file-download" size={30} color="#ffffff" />
                )}
            </TouchableOpacity>

            {/* Cancel Booking Modal */}
            <Modal
                visible={showCancelModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="warning" size={30} color="#dc3545" />
                            <Text style={styles.modalTitle}>Cancel Booking</Text>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                Please provide a reason for cancelling booking #{booking.bookingId || booking.id}:
                            </Text>

                            <TextInput
                                style={styles.reasonInput}
                                placeholder="Enter reason for cancellation..."
                                multiline
                                numberOfLines={4}
                                value={cancellationReason}
                                onChangeText={setCancellationReason}
                            />

                            <Text style={styles.modalSubtext}>
                                This request will be submitted to club administration for approval.
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={() => setShowCancelModal(false)}
                                >
                                    <Text style={styles.cancelModalButtonText}>No, Keep It</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmCancelButton]}
                                    onPress={handleCancelBooking}
                                >
                                    <Text style={styles.confirmCancelButtonText}>Yes, Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Invoice Modal */}
            <Modal
                visible={showInvoiceModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowInvoiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="receipt" size={30} color="#b48a64" />
                            <Text style={styles.modalTitle}>Invoice Details</Text>
                            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.invoiceContent}>
                            {invoiceData ? (
                                <>
                                    <View style={styles.invoiceHeader}>
                                        <Text style={styles.invoiceTitle}>Invoice #{invoiceData.invoiceNumber || invoiceData.invoice_no}</Text>
                                        <Text style={styles.invoiceDate}>
                                            Issued: {formatDate(invoiceData.issued_at || new Date())}
                                        </Text>
                                    </View>

                                    <View style={styles.invoiceDetails}>
                                        {renderDetailItem('Invoice Number', invoiceData.invoiceNumber || invoiceData.invoice_no)}
                                        {renderDetailItem('Booking ID', booking.bookingId || booking.id)}
                                        {renderDetailItem('Total Amount', formatCurrency(
                                            invoiceData.total ||
                                            invoiceData.totalPrice ||
                                            invoiceData.amount ||
                                            invoiceData.totalAmount ||
                                            booking.totalPrice ||
                                            booking.amount ||
                                            0
                                        ))}
                                        {renderDetailItem('Payment Mode', invoiceData.paymentMode || invoiceData.payment_mode || 'N/A')}
                                        {renderDetailItem('Issued By', invoiceData.issued_by || invoiceData.issuedBy || 'System')}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.printButton}
                                        onPress={() => {
                                            // Implement print functionality
                                            Alert.alert('Print', 'Print functionality would be implemented here.');
                                        }}
                                    >
                                        <Icon name="print" size={20} color="#fff" />
                                        <Text style={styles.printButtonText}>Print Invoice</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text style={styles.noInvoiceText}>No invoice data available</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Processing Overlay for Receipt Save */}
            {savingImage && (
                <View style={styles.processingOverlay}>
                    <View style={styles.processingContent}>
                        <ActivityIndicator size="large" color="#b48a64" />
                        <Text style={styles.processingText}>Processing Receipt...</Text>
                        <Text style={styles.processingSubtext}>Preparing a high-fidelity copy for your gallery</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    captureZone: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    voucherSection: {
        paddingVertical: 10,
    },
    subtleDivider: {
        height: 1,
        backgroundColor: '#f0e6d8',
        marginVertical: 10,
        marginHorizontal: 10,
    },
    watermarkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 8,
    },
    watermarkText: {
        fontSize: 12,
        color: '#b48a64',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    receiptBreakdown: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        marginTop: 15,
        marginBottom: 10,
    },
    ledgerContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 20,
        marginTop: 15,
    },
    ledgerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    ledgerLabel: {
        fontSize: 14,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ledgerLine: {
        flex: 1,
        height: 1,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ddd',
        marginHorizontal: 10,
    },
    ledgerValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    paymentStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#b48a64',
        letterSpacing: 1,
    },
    receiptSection: {
        marginBottom: 20,
        backgroundColor: '#fdfdfd',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    receiptSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0e6d8',
        paddingBottom: 8,
    },
    receiptSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b48a64',
        marginLeft: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    receiptHeaderZone: {
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10,
    },
    pscReceiptBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    pscReceiptBrandText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#b48a64',
        letterSpacing: 2,
    },
    receiptBookingId: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    receiptAgency: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    receiptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    receiptGridItem: {
        width: '45%',
    },
    receiptGridLabel: {
        fontSize: 10,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    receiptGridValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    captureWatermarkBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.1,
        transform: [{ rotate: '-30deg' }],
        zIndex: -1,
    },
    largeWatermarkText: {
        fontSize: 100,
        fontWeight: '900',
        textAlign: 'center',
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    processingContent: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
    },
    processingText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    processingSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    fabButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#b48a64',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 100,
    },
    fabLoading: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(180, 138, 100, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#F4F1EE',
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctext: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    banner: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    bannerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDotLarge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusTextLarge: {
        fontSize: 14,
        fontWeight: '600',
    },
    bookingType: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    roomCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    roomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    roomNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b48a64',
        marginLeft: 12,
    },
    roomInfoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    roomInfoBox: {
        flex: 1,
        backgroundColor: '#f9f3eb',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    roomInfoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    roomInfoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 2,
    },
    roomDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    detailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    detailBadgeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    guestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#b48a64',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 15,
    },
    multiDateItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    multiDateContent: {
        marginLeft: 10,
    },
    multiDateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    multiDateSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailIcon: {
        marginRight: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        textAlign: 'right',
        flex: 1,
    },
    detailValueHighlight: {
        color: '#b48a64',
        fontWeight: 'bold',
    },
    copyableValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    copyableValue: {
        color: '#b48a64',
        fontWeight: '600',
        marginRight: 8,
    },
    copyIcon: {
        marginLeft: 4,
    },
    specialRequestContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    specialRequestText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 20,
        marginTop: 5,
    },
    remarksContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    remarksText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 5,
    },
    paymentSummaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
    },
    paymentRowTotal: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 15,
        marginTop: 5,
    },
    paymentLabel: {
        fontSize: 15,
        color: '#666',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    vouchersContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    voucherTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    voucherItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    voucherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    voucherHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    voucherConsumerHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b48a64',
        letterSpacing: 0.5,
    },
    copyIconBtn: {
        padding: 5,
        marginLeft: 4,
    },
    voucherBody: {
        padding: 15,
    },
    voucherMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    voucherTypeLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
    },
    voucherDateLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    voucherAmountLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    voucherDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
    },
    voucherDetailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    voucherDetailItem: {
        width: '47%',
    },
    voucherDetailLabel: {
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    voucherDetailValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444',
    },
    voucherRemarks: {
        fontSize: 11,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f9f9f9',
    },
    noVouchersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginTop: 15,
    },
    noVouchersText: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
        fontWeight: '500',
    },
    timelineCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineDot: {
        width: 40,
        alignItems: 'center',
    },
    timelineContent: {
        flex: 1,
        marginLeft: 10,
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 13,
        color: '#666',
    },
    cancellationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    requestItem: {
        paddingVertical: 10,
    },
    requestDivider: {
        borderTopWidth: 1,
        borderTopColor: '#f8d7da',
        marginTop: 10,
        paddingTop: 15,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    requestDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestDate: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    miniStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    miniStatusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    requestReasonLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    requestReasonText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    adminRemarksContainer: {
        marginTop: 8,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#6c757d',
    },
    adminRemarksLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#444',
        marginBottom: 2,
    },
    adminRemarksText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    actionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
        minWidth: '48%',
        gap: 8,
    },
    payButton: {
        backgroundColor: '#28a745',
    },
    invoiceButton: {
        backgroundColor: '#f9f3eb',
    },
    cancelButton: {
        backgroundColor: '#fff5f5',
    },
    supportButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007bff',
    },
    actionButtonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButtonText: {
        color: '#dc3545',
        fontWeight: '600',
        fontSize: 14,
    },
    supportButtonText: {
        color: '#007bff',
        fontWeight: '600',
        fontSize: 14,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f7ff',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
    },
    footerText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 10,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginLeft: 10,
    },
    modalContent: {
        padding: 20,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f8f9fa',
        textAlignVertical: 'top',
        height: 100,
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelModalButton: {
        backgroundColor: '#f1f3f5',
    },
    confirmCancelButton: {
        backgroundColor: '#dc3545',
    },
    cancelModalButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmCancelButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    invoiceContent: {
        padding: 20,
    },
    invoiceHeader: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    invoiceDate: {
        fontSize: 14,
        color: '#666',
    },
    invoiceDetails: {
        marginBottom: 20,
    },
    printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#b48a64',
        padding: 15,
        borderRadius: 10,
        gap: 10,
        marginTop: 20,
    },
    printButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    noInvoiceText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
});