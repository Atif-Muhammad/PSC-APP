// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   StatusBar,
// //   RefreshControl,
// //   ImageBackground,
// //   Clipboard,
// //   Platform,
// //   PermissionsAndroid,
// //   Share,
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/MaterialIcons';
// // import ViewShot, { captureRef } from 'react-native-view-shot';
// // import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// // import { bookingService } from '../../services/bookingService';
// // import { useAuth } from '../auth/contexts/AuthContext';
// // import { useVoucher } from '../auth/contexts/VoucherContext';
// // import socketService from '../../services/socket.service';
// // import { permissionService } from '../services/PermissionService';
// // import { voucherAPI } from '../../config/apis';

// // export default function Voucher({ navigation, route }) {
// //   const { clearVoucher } = useVoucher();
// //   const { user } = useAuth();
// //   const {
// //     invoiceData: rawInvoiceData,
// //     bookingDetails,
// //     venue,
// //     isGuest,
// //     memberDetails,
// //     guestDetails
// //   } = route.params || {};

// //   const [invoiceData, setInvoiceData] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [timeLeft, setTimeLeft] = useState('');
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [shareLoading, setShareLoading] = useState(false);
// //   const [saveLoading, setSaveLoading] = useState(false);
// //   const [copied, setCopied] = useState(false);
// //   const viewShotRef = useRef(null);
// //   const invoiceRef = useRef(null);

// //   useEffect(() => {
// //     const loadInvoiceData = async () => {
// //       if (rawInvoiceData) {
// //         console.log('🔄 Mapping Lawn Invoice Data');

// //         let resolvedDetails = bookingDetails;

// //         // Fallback fetch if details are missing
// //         if (!resolvedDetails?.bookingDate && !resolvedDetails?.lawnName) {
// //           const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
// //           if (bookingId) {
// //             try {
// //               const res = await voucherAPI.getVoucherByType('LAWN', bookingId);
// //               const fetched = res?.data?.Data || res?.data || {};
// //               resolvedDetails = {
// //                 lawnName: fetched.lawn?.name || fetched.lawnName || fetched.booking?.lawnName,
// //                 bookingDate: fetched.booking?.bookingDate || fetched.bookingDate || fetched.eventDate,
// //                 eventTime: fetched.booking?.timeSlot || fetched.timeSlot || fetched.booking?.eventTime || fetched.eventTime,
// //                 numberOfGuests: fetched.booking?.numberOfGuests || fetched.numberOfGuests,
// //                 selectedDates: fetched.booking?.selectedDates || fetched.selectedDates || [],
// //                 dateConfigurations: fetched.booking?.dateConfigurations || fetched.dateConfigurations || {},
// //                 guestName: fetched.booking?.guestName || fetched.guestName,
// //                 guestContact: fetched.booking?.guestContact || fetched.guestContact,
// //               };
// //             } catch (err) {
// //               console.warn('⚠️ Could not fetch lawn booking details:', err);
// //             }
// //           }
// //         }

// //         const mappedDetails = {
// //           invoiceNo: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id || 'N/A',
// //           invoiceNumber: rawInvoiceData.voucher?.voucher_no || rawInvoiceData.voucher?.id,
// //           consumerNumber: rawInvoiceData.voucher?.consumer_number,
// //           bookingId: rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id,
// //           status: rawInvoiceData.voucher?.status || 'PENDING',
// //           issued_at: rawInvoiceData.issue_date || rawInvoiceData.voucher?.issued_at || new Date().toISOString(),
// //           issued_by: rawInvoiceData.voucher?.issued_by || 'System',
// //           dueDate: rawInvoiceData.due_date || rawInvoiceData.voucher?.expiresAt,
// //           amount: rawInvoiceData.voucher?.amount,
// //           totalPrice: rawInvoiceData.voucher?.amount,
// //           paymentMode: rawInvoiceData.voucher?.payment_mode || 'PENDING',
// //           membershipNo: rawInvoiceData.membership?.no || memberDetails?.membershipNo,
// //           memberName: rawInvoiceData.membership?.name || memberDetails?.memberName,
// //           // Lawn specific keys
// //           lawnName: venue?.description || resolvedDetails?.lawnName,
// //           bookingDate: resolvedDetails?.bookingDate,
// //           eventTime: resolvedDetails?.eventTime,
// //           numberOfGuests: resolvedDetails?.numberOfGuests,
// //           selectedDates: resolvedDetails?.selectedDates || [],
// //           dateConfigurations: resolvedDetails?.dateConfigurations || {},
// //           guestName: guestDetails?.guestName || resolvedDetails?.guestName,
// //           guestContact: guestDetails?.guestContact || resolvedDetails?.guestContact,
// //           isGuest: isGuest,
// //         };

// //         setInvoiceData(mappedDetails);
// //         setLoading(false);
// //       } else {
// //         Alert.alert('Error', 'Invoice data not found');
// //         navigation.goBack();
// //       }
// //     };

// //     loadInvoiceData();
// //   }, [rawInvoiceData]);

// //   // Real-time payment sync
// //   useEffect(() => {
// //     const voucherId = rawInvoiceData?.voucher?.id;
// //     if (!voucherId) return;

// //     const unsubscribe = socketService.subscribeToPayment(voucherId, (data) => {
// //       if (data.status === 'PAID' || data.status === 'CANCELLED' || data.status === 'CONFIRMED') {
// //         setInvoiceData(prev => prev ? { ...prev, status: data.status } : null);
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, [rawInvoiceData?.voucher?.id]);

// //   // Countdown Timer Logic
// //   useEffect(() => {
// //     const targetDateStr = invoiceData?.dueDate;

// //     if (!targetDateStr || invoiceData?.status === 'PAID') {
// //       if (timeLeft !== '') setTimeLeft('');
// //       return;
// //     }

// //     const targetDate = new Date(targetDateStr).getTime();

// //     if (isNaN(targetDate)) {
// //       setTimeLeft('');
// //       return;
// //     }

// //     const interval = setInterval(() => {
// //       const now = new Date().getTime();
// //       const distance = targetDate - now;

// //       if (distance < 0) {
// //         clearInterval(interval);
// //         setTimeLeft('EXPIRED');
// //         return;
// //       }

// //       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
// //       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
// //       const seconds = Math.floor((distance % (1000 * 60)) / 1000);

// //       let timeStr = '';
// //       if (hours > 0) timeStr += `${hours}h `;
// //       timeStr += `${minutes}m ${seconds}s`;

// //       setTimeLeft(timeStr);
// //     }, 1000);

// //     return () => clearInterval(interval);
// //   }, [invoiceData?.dueDate, invoiceData?.status]);

// //   const handleRefresh = () => {
// //     setRefreshing(true);
// //     setTimeout(() => setRefreshing(false), 1000);
// //   };

// //   const handleMakePayment = () => {
// //     // Porting Room's payment flow - DIRECT navigation per request
// //     clearVoucher();
// //     // Here you would integrate with your payment gateway
// //     Alert.alert(
// //       'Payment Gateway',
// //       'Payment integration would happen here. For now, please check your bookings list after payment completion.',
// //       [{ text: 'OK' }]
// //     );
// //   };

// //   const handleSaveToGallery = async () => {
// //     try {
// //       setSaveLoading(true);
// //       const hasPermission = await permissionService.requestPhotoLibraryPermission();
// //       if (!hasPermission) {
// //         permissionService.handlePermissionDenied();
// //         return;
// //       }

// //       const ref = viewShotRef.current || invoiceRef.current;
// //       if (ref) {
// //         const uri = await captureRef(ref, { format: 'png', quality: 1.0 });
// //         await CameraRoll.save(uri, { type: 'photo' });
// //         Alert.alert('Success', 'Voucher saved to gallery successfully!');
// //       }
// //     } catch (error) {
// //       console.error('Error saving invoice:', error);
// //       Alert.alert('Error', 'Failed to save voucher.');
// //     } finally {
// //       setSaveLoading(false);
// //     }
// //   };

// //   const handleShareInvoice = async () => {
// //     try {
// //       setShareLoading(true);
// //       await new Promise(resolve => setTimeout(resolve, 300));

// //       const uri = await captureRef(invoiceRef, {
// //         format: 'png',
// //         quality: 1,
// //         result: 'tmpfile',
// //       });

// //       await Share.share({
// //         title: `Lawn Voucher - ${invoiceData.invoiceNo}`,
// //         url: uri,
// //         message: `Here is the voucher for your PSC lawn booking: ${invoiceData.invoiceNo}`,
// //       });
// //     } catch (error) {
// //       console.log('Share failed:', error);
// //     } finally {
// //       setShareLoading(false);
// //     }
// //   };

// //   const copyToClipboard = () => {
// //     if (!invoiceData?.consumerNumber) return;
// //     Clipboard.setString(invoiceData.consumerNumber);
// //     setCopied(true);
// //     setTimeout(() => setCopied(false), 2000);
// //   };

// //   const handleCancelVoucher = async () => {
// //     if (!invoiceData?.consumerNumber) return;

// //     Alert.alert(
// //       'Cancel Voucher',
// //       'Are you sure you want to cancel this lawn booking voucher?',
// //       [
// //         { text: 'No', style: 'cancel' },
// //         {
// //           text: 'Yes, Cancel',
// //           style: 'destructive',
// //           onPress: async () => {
// //             try {
// //               setRefreshing(true);
// //               await bookingService.deleteBooking(invoiceData?.consumerNumber);
// //               await clearVoucher();
// //               Alert.alert('Success', 'Voucher cancelled');
// //               navigation.reset({ index: 1, routes: [{ name: 'home' }] });
// //             } catch (error) {
// //               Alert.alert('Error', 'Failed to cancel voucher.');
// //             } finally {
// //               setRefreshing(false);
// //             }
// //           }
// //         }
// //       ]
// //     );
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'N/A';
// //     try {
// //       return new Date(dateString).toLocaleDateString('en-US', {
// //         year: 'numeric',
// //         month: 'short',
// //         day: 'numeric'
// //       });
// //     } catch (error) { return dateString; }
// //   };

// //   const formatDateTime = (dateString) => {
// //     if (!dateString) return 'N/A';
// //     try {
// //       return new Date(dateString).toLocaleString('en-US', {
// //         year: 'numeric', month: 'short', day: 'numeric',
// //         hour: '2-digit', minute: '2-digit'
// //       });
// //     } catch (error) { return dateString; }
// //   };

// //   const formatTimeSlot = (timeSlot) => {
// //     if (!timeSlot) return 'N/A';
// //     const slotMap = {
// //       'DAY': 'Day (8:00 AM - 4:00 PM)',
// //       'NIGHT': 'Night (4:00 PM - 12:00 AM)',
// //       'MORNING': 'Morning (8:00 AM - 2:00 PM)',
// //       'EVENING': 'Evening (2:00 PM - 8:00 PM)',
// //     };
// //     return slotMap[timeSlot.toUpperCase()] || timeSlot;
// //   };

// //   const statusInfo = (() => {
// //     const s = invoiceData?.status?.toUpperCase();
// //     switch (s) {
// //       case 'CONFIRMED': case 'PAID':
// //         return { text: 'CONFIRMED', style: styles.statusConfirmed, icon: 'check-circle', textColor: '#2e7d32' };
// //       case 'CANCELLED':
// //         return { text: 'CANCELLED', style: styles.statusCancelled, icon: 'cancel', textColor: '#dc3545' };
// //       default:
// //         return { text: 'PAYMENT PENDING', style: styles.statusPending, icon: 'payment', textColor: '#aa2e25' };
// //     }
// //   })();

// //   if (loading) {
// //     return (
// //       <View style={styles.container}>
// //         <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
// //         <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
// //           <View style={styles.notchRow}>
// //             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
// //               <Icon name="arrow-back" size={28} color="#000" />
// //             </TouchableOpacity>
// //             <Text style={styles.notchTitle}>Lawn Voucher</Text>
// //             <View style={styles.iconWrapper} />
// //           </View>
// //         </ImageBackground>
// //         <View style={styles.loadingContainer}>
// //           <ActivityIndicator size="large" color="#b48a64" />
// //           <Text style={styles.loadingText}>Generating voucher...</Text>
// //         </View>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
// //       <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
// //         <View style={styles.notchRow}>
// //           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
// //             <Icon name="arrow-back" size={28} color="#000" />
// //           </TouchableOpacity>
// //           <Text style={styles.notchTitle}>Lawn Voucher</Text>
// //           <View style={styles.iconWrapper} />
// //         </View>
// //       </ImageBackground>

// //       <ScrollView
// //         style={styles.content}
// //         showsVerticalScrollIndicator={false}
// //         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#b48a64']} />}
// //       >
// //         {invoiceData && (
// //           <>
// //             <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ backgroundColor: '#fffaf2' }}>
// //               <View style={styles.invoiceContainer}>
// //                 {/* Header Section */}
// //                 <View style={styles.invoiceHeader}>
// //                   <Icon name={statusInfo.icon} size={40} color={['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? '#2e7d32' : "#b48a64"} />
// //                   {['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) && (
// //                     <Text style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: 5 }}>Payment Successful</Text>
// //                   )}
// //                   <Text style={styles.invoiceTitle}>LAWN BOOKING VOUCHER</Text>
// //                   <Text style={styles.invoiceSubtitle}>{['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? "Booking finalized!" : "Complete payment to confirm."}</Text>

// //                   {timeLeft && timeLeft !== 'EXPIRED' && invoiceData.status !== 'PAID' && (
// //                     <View style={styles.timerWrapper}>
// //                       <View style={styles.timerContainer}>
// //                         <Icon name="schedule" size={16} color="#dc3545" />
// //                         <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
// //                       </View>
// //                       <TouchableOpacity style={styles.cancelVoucherGhostButton} onPress={handleCancelVoucher}>
// //                         <Icon name="close" size={14} color="#666" />
// //                         <Text style={styles.cancelVoucherGhostText}>Cancel Booking</Text>
// //                       </TouchableOpacity>
// //                     </View>
// //                   )}
// //                   {timeLeft === 'EXPIRED' && <Text style={styles.expiredText}>EXPIRED</Text>}
// //                 </View>

// //                 {/* Details Section */}
// //                 <View style={styles.invoiceSection}>
// //                   <Text style={styles.sectionTitle}>Voucher Details</Text>
// //                   {[
// //                     { label: 'Invoice Number:', value: invoiceData.invoiceNo, highlight: true },
// //                     { label: 'Consumer Number:', value: invoiceData.consumerNumber, copy: true },
// //                     { label: 'Booking ID:', value: invoiceData.bookingId },
// //                     { label: 'Payment Due:', value: formatDateTime(invoiceData.dueDate), warning: true },
// //                     { label: 'Issued At:', value: formatDateTime(invoiceData.issued_at) }
// //                   ].map((row, i) => row.value ? (
// //                     <View key={i} style={styles.detailRow}>
// //                       <Text style={styles.detailLabel}>{row.label}</Text>
// //                       {row.copy ? (
// //                         <TouchableOpacity onPress={copyToClipboard} style={styles.copyContainer}>
// //                           <Text style={[styles.detailValue, styles.invoiceHighlight]}>{row.value}</Text>
// //                           <Icon name={copied ? "check" : "content-copy"} size={16} color={copied ? "#2e7d32" : "#b48a64"} style={{ marginLeft: 8 }} />
// //                         </TouchableOpacity>
// //                       ) : (
// //                         <Text style={[styles.detailValue, row.highlight && styles.invoiceHighlight, row.warning && styles.dueDate]}>{row.value}</Text>
// //                       )}
// //                     </View>
// //                   ) : null)}
// //                 </View>

// //                 {/* Lawn Booking Summary */}
// //                 <View style={styles.invoiceSection}>
// //                   <Text style={styles.sectionTitle}>Lawn Information</Text>
// //                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Lawn Name:</Text><Text style={styles.detailValue}>{invoiceData.lawnName}</Text></View>
// //                   <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Guest Name' : 'Member Name'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestName : invoiceData.memberName}</Text></View>
// //                   <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Contact No' : 'Membership No'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestContact : invoiceData.membershipNo}</Text></View>

// //                   {invoiceData.selectedDates?.length > 0 ? (
// //                     <View style={styles.multiDateContainer}>
// //                       <Text style={styles.detailLabel}>Dates & Configurations:</Text>
// //                       {invoiceData.selectedDates.map((date, index) => (
// //                         <View key={index} style={styles.dateConfigItem}>
// //                           <View style={styles.itemRow}>
// //                             <View style={styles.dateCol}><Icon name="event" size={16} color="#b48a64" /><Text style={styles.dateText}>{formatDate(date)}</Text></View>
// //                             <View style={styles.configCol}>
// //                               <View style={styles.configChip}><Text style={styles.configText}>{formatTimeSlot(invoiceData.dateConfigurations[date]?.timeSlot || invoiceData.eventTime).split(' ')[0]}</Text></View>
// //                               <View style={styles.configChip}><Text style={styles.configText}>{invoiceData.dateConfigurations[date]?.eventType || 'Event'}</Text></View>
// //                             </View>
// //                           </View>
// //                         </View>
// //                       ))}
// //                     </View>
// //                   ) : (
// //                     <>
// //                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Booking Date:</Text><Text style={styles.detailValue}>{formatDate(invoiceData.bookingDate)}</Text></View>
// //                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Time Slot:</Text><Text style={styles.detailValue}>{formatTimeSlot(invoiceData.eventTime)}</Text></View>
// //                     </>
// //                   )}
// //                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Guests:</Text><Text style={styles.detailValue}>{invoiceData.numberOfGuests} Persons</Text></View>
// //                 </View>

// //                 {/* Payment Breakdown */}
// //                 <View style={styles.invoiceSection}>
// //                   <Text style={styles.sectionTitle}>Payment Information</Text>
// //                   <View style={styles.detailRow}>
// //                     <Text style={styles.detailLabel}>Total Amount:</Text>
// //                     <Text style={[styles.detailValue, styles.amountHighlight]}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text>
// //                   </View>
// //                   <View style={styles.detailRow}>
// //                     <Text style={styles.detailLabel}>Status:</Text>
// //                     <View style={[styles.statusBadge, statusInfo.style]}><Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text></View>
// //                   </View>
// //                 </View>

// //                 {/* Footer Info */}
// //                 <View style={styles.instructions}>
// //                   <Text style={styles.instructionsTitle}>Important Information</Text>
// //                   {["Complete payment to confirm.", "Present this digital voucher at the lawn.", "All club rules applied."].map((txt, i) => (
// //                     <View key={i} style={styles.instructionItem}><Icon name="info-outline" size={16} color="#1565c0" /><Text style={styles.instructionText}>{txt}</Text></View>
// //                   ))}
// //                 </View>
// //               </View>
// //             </ViewShot>

// //             {/* Hidden capture view */}
// //             <View style={shareStyles.offScreenContainer}>
// //               <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={shareStyles.invoiceSheet}>
// //                 <View style={shareStyles.header}><Text style={shareStyles.headerTitle}>PSC LAWN BOOKING</Text><View style={shareStyles.headerDivider} /><Text style={shareStyles.headerSubtitle}>Official Booking Voucher</Text></View>
// //                 <View style={shareStyles.confirmedBadge}><Text style={shareStyles.confirmedBadgeText}>✓ {statusInfo.text}</Text></View>
// //                 <View style={shareStyles.section}>
// //                   <Text style={shareStyles.sectionTitle}>Booking Summary</Text><View style={shareStyles.sectionDivider} />
// //                   <View style={shareStyles.row}><Text style={shareStyles.label}>Invoice:</Text><Text style={shareStyles.value}>{invoiceData.invoiceNo}</Text></View>
// //                   <View style={shareStyles.row}><Text style={shareStyles.label}>Lawn:</Text><Text style={shareStyles.value}>{invoiceData.lawnName}</Text></View>
// //                   <View style={shareStyles.row}><Text style={shareStyles.label}>Amount:</Text><Text style={shareStyles.value}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text></View>
// //                 </View>
// //                 <View style={shareStyles.footer}><View style={shareStyles.footerDivider} /><Text style={shareStyles.footerText}>Thank you for choosing PSC!</Text></View>
// //               </ViewShot>
// //             </View>

// //             {/* Actions */}
// //             <View style={{ padding: 15 }}>
// //               <View style={styles.actionButtons}>
// //                 <TouchableOpacity style={styles.secondaryButton} onPress={handleRefresh} disabled={refreshing}>
// //                   <Icon name="refresh" size={20} color="#b48a64" /><Text style={styles.secondaryButtonText}>Refresh</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.shareButton} onPress={handleShareInvoice} disabled={shareLoading}>
// //                   <Icon name="share" size={20} color="#fff" /><Text style={styles.shareButtonText}>Share</Text>
// //                 </TouchableOpacity>
// //               </View>
// //               <TouchableOpacity style={styles.saveButtonFull} onPress={handleSaveToGallery} disabled={saveLoading}>
// //                 {saveLoading ? <ActivityIndicator color="#fff" /> : <><Icon name="file-download" size={20} color="#fff" /><Text style={styles.saveButtonTextFull}>Save to Gallery</Text></>}
// //               </TouchableOpacity>
// //               {invoiceData.status !== 'PAID' && (
// //                 <TouchableOpacity style={styles.primaryButton} onPress={handleMakePayment}>
// //                   <Icon name="payment" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Complete Payment Now</Text>
// //                 </TouchableOpacity>
// //               )}
// //             </View>
// //           </>
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#f9f3eb' },
// //   notch: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: "hidden", backgroundColor: "#D2B48C" },
// //   notchImage: { resizeMode: "cover" },
// //   notchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 },
// //   iconWrapper: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
// //   notchTitle: { fontSize: 22, fontWeight: "600", color: "#000" },
// //   content: { flex: 1 },
// //   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
// //   loadingText: { marginTop: 10, color: '#666', fontSize: 16 },
// //   invoiceContainer: { padding: 15 },
// //   invoiceHeader: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, elevation: 2 },
// //   invoiceTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
// //   invoiceSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
// //   invoiceSection: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
// //   detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
// //   detailLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
// //   detailValue: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
// //   invoiceHighlight: { color: '#b48a64', fontWeight: 'bold' },
// //   timerWrapper: { alignItems: 'center', marginTop: 10 },
// //   timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, borderWidth: 1, borderColor: '#ffa39e' },
// //   timerText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545' },
// //   cancelVoucherGhostButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d9d9d9' },
// //   cancelVoucherGhostText: { fontSize: 13, fontWeight: '500', color: '#666', marginLeft: 4 },
// //   expiredText: { fontSize: 14, fontWeight: 'bold', color: '#dc3545', marginTop: 10 },
// //   dueDate: { color: '#dc3545', fontWeight: 'bold' },
// //   multiDateContainer: { marginTop: 10, marginBottom: 10 },
// //   dateConfigItem: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#eee' },
// //   itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
// //   dateCol: { flexDirection: 'row', alignItems: 'center' },
// //   dateText: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 6 },
// //   configCol: { flexDirection: 'row', alignItems: 'center' },
// //   configChip: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 4 },
// //   configText: { fontSize: 11, color: '#4A5568', textTransform: 'capitalize' },
// //   amountHighlight: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
// //   statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
// //   statusConfirmed: { backgroundColor: '#d4efdf' },
// //   statusPending: { backgroundColor: '#fadbd8' },
// //   statusCancelled: { backgroundColor: '#f8d7da' },
// //   statusText: { fontSize: 12, fontWeight: 'bold' },
// //   copyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
// //   instructions: { backgroundColor: '#f0f7ff', padding: 16, borderRadius: 12, marginTop: 5 },
// //   instructionsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1565c0', marginBottom: 10 },
// //   instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
// //   instructionText: { fontSize: 12, color: '#1565c0', marginLeft: 8, flex: 1 },
// //   actionButtons: { flexDirection: 'row', marginBottom: 10 },
// //   secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b48a64', marginRight: 10 },
// //   secondaryButtonText: { color: '#b48a64', fontWeight: '600', marginLeft: 8 },
// //   shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#2196f3' },
// //   shareButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
// //   saveButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#388e3c', padding: 15, borderRadius: 8, marginBottom: 10 },
// //   saveButtonTextFull: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
// //   primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#b48a64', padding: 15, borderRadius: 8 },
// //   primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
// // });

// // const shareStyles = StyleSheet.create({
// //   offScreenContainer: { position: 'absolute', left: -9999, top: 0, opacity: 1 },
// //   invoiceSheet: { width: 380, backgroundColor: '#ffffff', padding: 24 },
// //   header: { alignItems: 'center', marginBottom: 16 },
// //   headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 1.5 },
// //   headerDivider: { width: 60, height: 3, backgroundColor: '#b48a64', marginVertical: 10, borderRadius: 2 },
// //   headerSubtitle: { fontSize: 13, color: '#777' },
// //   confirmedBadge: { backgroundColor: '#e8f5e9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#c8e6c9' },
// //   confirmedBadgeText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
// //   section: { marginBottom: 16 },
// //   sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 6, textTransform: 'uppercase' },
// //   sectionDivider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 10 },
// //   row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
// //   label: { fontSize: 13, color: '#666' },
// //   value: { fontSize: 13, color: '#222', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
// //   footer: { alignItems: 'center', marginTop: 8, paddingTop: 12 },
// //   footerDivider: { width: '100%', height: 1, backgroundColor: '#e0e0e0', marginBottom: 12 },
// //   footerText: { fontSize: 14, fontWeight: '600', color: '#333' },
// // });

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
// import { voucherAPI } from '../../config/apis';

// export default function Voucher({ navigation, route }) {
//   const { clearVoucher } = useVoucher();
//   const { user } = useAuth();
//   const {
//     invoiceData: rawInvoiceData,
//     bookingDetails,
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

//   useEffect(() => {
//     const loadInvoiceData = async () => {
//       if (rawInvoiceData) {
//         console.log('🔄 Mapping Lawn Invoice Data');
//         console.log('📦 Received bookingDetails:', JSON.stringify(bookingDetails));
//         console.log('📦 Received venue:', JSON.stringify(venue));
//         console.log('📦 Received memberDetails:', JSON.stringify(memberDetails));
//         console.log('📦 Received guestDetails:', JSON.stringify(guestDetails));

//         // Prioritize passed data over API fetch
//         let resolvedDetails = {};

//         // Use passed bookingDetails if available
//         if (bookingDetails) {
//           console.log('📦 Using passed bookingDetails:', JSON.stringify(bookingDetails));
//           resolvedDetails = {
//             ...bookingDetails,
//             lawnName: bookingDetails.lawnName || bookingDetails.lawn_name || venue?.description || venue?.name,
//             bookingDate: bookingDetails.bookingDate || bookingDetails.booking_date || bookingDetails.eventDate || bookingDetails.event_date,
//             eventTime: bookingDetails.eventTime || bookingDetails.timeSlot || bookingDetails.event_time || bookingDetails.time_slot,
//             numberOfGuests: bookingDetails.numberOfGuests || bookingDetails.number_of_guests || bookingDetails.guests,
//             selectedDates: bookingDetails.selectedDates || bookingDetails.selected_dates || [],
//             dateConfigurations: bookingDetails.dateConfigurations || bookingDetails.date_configurations || {},
//             guestName: bookingDetails.guestName || bookingDetails.guest_name,
//             guestContact: bookingDetails.guestContact || bookingDetails.guest_contact,
//           };
//         } else {
//           console.log('⚠️ No bookingDetails passed, will attempt API fetch');
//         }

//         // Also check if booking details exist in rawInvoiceData
//         if (!resolvedDetails.lawnName && rawInvoiceData?.lawn) {
//           resolvedDetails.lawnName = rawInvoiceData.lawn.name || rawInvoiceData.lawn.Name || rawInvoiceData.lawn.lawnName;
//         }
//         if (!resolvedDetails.bookingDate && rawInvoiceData?.booking) {
//           resolvedDetails.bookingDate = rawInvoiceData.booking.bookingDate || rawInvoiceData.booking.eventDate;
//         }
//         if (!resolvedDetails.eventTime && rawInvoiceData?.booking) {
//           resolvedDetails.eventTime = rawInvoiceData.booking.eventTime || rawInvoiceData.booking.timeSlot;
//         }
//         if (!resolvedDetails.numberOfGuests && rawInvoiceData?.booking) {
//           resolvedDetails.numberOfGuests = rawInvoiceData.booking.numberOfGuests;
//         }

//         // Extract booking information from remarks if available
//         if (!resolvedDetails.lawnName && rawInvoiceData?.voucher?.remarks) {
//           const remarks = rawInvoiceData.voucher.remarks;
//           console.log('🔍 Extracting lawn info from remarks:', remarks);

//           // Extract lawn name from remarks like "Full payment for Lawn booking: on 3/13/2026"
//           const lawnMatch = remarks.match(/(Lawn|Lawn Service|Lawn Booking).*?booking/i);
//           if (lawnMatch) {
//             resolvedDetails.lawnName = lawnMatch[0].replace('booking', '').trim();
//           }

//           // Extract date from remarks
//           const dateMatch = remarks.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
//           if (dateMatch && !resolvedDetails.bookingDate) {
//             resolvedDetails.bookingDate = dateMatch[1];
//           }
//         }

//         // Extract from other possible sources in rawInvoiceData
//         if (!resolvedDetails.lawnName && rawInvoiceData?.bookingName) {
//           resolvedDetails.lawnName = rawInvoiceData.bookingName;
//         }
//         if (!resolvedDetails.lawnName && rawInvoiceData?.lawnName) {
//           resolvedDetails.lawnName = rawInvoiceData.lawnName;
//         }
//         if (!resolvedDetails.bookingDate && rawInvoiceData?.eventDate) {
//           resolvedDetails.bookingDate = rawInvoiceData.eventDate;
//         }
//         if (!resolvedDetails.eventTime && rawInvoiceData?.timeSlot) {
//           resolvedDetails.eventTime = rawInvoiceData.timeSlot;
//         }
//         if (!resolvedDetails.numberOfGuests && rawInvoiceData?.guests) {
//           resolvedDetails.numberOfGuests = rawInvoiceData.guests;
//         }

//         // Use passed venue data
//         const resolvedVenue = venue || {};

//         // Use passed member/guest details
//         const resolvedMemberDetails = memberDetails || {};
//         const resolvedGuestDetails = guestDetails || {};

//         console.log('📊 Final resolvedDetails before mapping:', JSON.stringify(resolvedDetails));
//         console.log('📊 Raw invoice data:', JSON.stringify(rawInvoiceData));

//         // Only fetch from API if critical data is missing
//         const hasCriticalData = resolvedDetails.lawnName && resolvedDetails.bookingDate;

//         if (!hasCriticalData) {
//           const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
//           if (bookingId) {
//             try {
//               console.log('🔍 Fetching additional data for bookingId:', bookingId);
//               const res = await voucherAPI.getVoucherByType('LAWN', bookingId);
//               const fetched = res?.data?.Data || res?.data || {};

//               // Merge with existing data, don't overwrite passed data
//               resolvedDetails = {
//                 ...resolvedDetails,
//                 lawnName: resolvedDetails.lawnName || fetched.lawn?.name || fetched.lawnName || fetched.booking?.lawnName,
//                 bookingDate: resolvedDetails.bookingDate || fetched.booking?.bookingDate || fetched.bookingDate || fetched.eventDate,
//                 eventTime: resolvedDetails.eventTime || fetched.booking?.timeSlot || fetched.timeSlot || fetched.booking?.eventTime || fetched.eventTime,
//                 numberOfGuests: resolvedDetails.numberOfGuests || fetched.booking?.numberOfGuests || fetched.numberOfGuests,
//                 selectedDates: resolvedDetails.selectedDates.length > 0 ? resolvedDetails.selectedDates : (fetched.booking?.selectedDates || fetched.selectedDates || []),
//                 dateConfigurations: Object.keys(resolvedDetails.dateConfigurations).length > 0 ? resolvedDetails.dateConfigurations : (fetched.booking?.dateConfigurations || fetched.dateConfigurations || {}),
//                 guestName: resolvedDetails.guestName || fetched.booking?.guestName || fetched.guestName,
//                 guestContact: resolvedDetails.guestContact || fetched.booking?.guestContact || fetched.guestContact,
//               };

//               console.log('✅ Fetched and merged data:', JSON.stringify(resolvedDetails));
//             } catch (err) {
//               console.warn('⚠️ Could not fetch lawn booking details:', err);
//             }
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
//           // Lawn specific keys - prioritize passed data
//           lawnName: resolvedVenue?.description || resolvedDetails?.lawnName,
//           bookingDate: resolvedDetails?.bookingDate,
//           eventTime: resolvedDetails?.eventTime,
//           numberOfGuests: resolvedDetails?.numberOfGuests,
//           selectedDates: resolvedDetails?.selectedDates || [],
//           dateConfigurations: resolvedDetails?.dateConfigurations || {},
//           guestName: resolvedGuestDetails?.guestName || resolvedDetails?.guestName,
//           guestContact: resolvedGuestDetails?.guestContact || resolvedDetails?.guestContact,
//           isGuest: isGuest,
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
//   }, [rawInvoiceData, bookingDetails, venue, memberDetails, guestDetails, isGuest]);

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

//   // Countdown Timer Logic
//   useEffect(() => {
//     const targetDateStr = invoiceData?.dueDate;

//     if (!targetDateStr || invoiceData?.status === 'PAID') {
//       if (timeLeft !== '') setTimeLeft('');
//       return;
//     }

//     const targetDate = new Date(targetDateStr).getTime();

//     if (isNaN(targetDate)) {
//       setTimeLeft('');
//       return;
//     }

//     const interval = setInterval(() => {
//       const now = new Date().getTime();
//       const distance = targetDate - now;

//       if (distance < 0) {
//         clearInterval(interval);
//         setTimeLeft('EXPIRED');
//         return;
//       }

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
//       // If lawn details are missing, try to re-fetch them
//       if (!invoiceData?.lawnName || !invoiceData?.bookingDate) {
//         const bookingId = rawInvoiceData?.voucher?.booking_id || rawInvoiceData?.voucher?.id;
//         if (bookingId) {
//           try {
//             const res = await voucherAPI.getVoucherByType('LAWN', bookingId);
//             const fetched = res?.data?.Data || res?.data || {};
//             const booking = fetched.booking || fetched.Booking || {};
//             const lawn = fetched.lawn || fetched.Lawn || {};

//             setInvoiceData(prev => ({
//               ...prev,
//               lawnName: prev?.lawnName || lawn.name || lawn.Name || booking.lawnName || fetched.lawnName,
//               bookingDate: prev?.bookingDate || booking.bookingDate || booking.booking_date || fetched.bookingDate || fetched.eventDate,
//               eventTime: prev?.eventTime || booking.eventTime || booking.timeSlot || fetched.eventTime || fetched.timeSlot,
//               numberOfGuests: prev?.numberOfGuests || booking.numberOfGuests || booking.number_of_guests || fetched.numberOfGuests,
//               selectedDates: (prev?.selectedDates?.length > 0) ? prev.selectedDates : (booking.selectedDates || booking.selected_dates || fetched.selectedDates || []),
//               dateConfigurations: Object.keys(prev?.dateConfigurations || {}).length > 0 ? prev.dateConfigurations : (booking.dateConfigurations || booking.date_configurations || fetched.dateConfigurations || {}),
//             }));
//             console.log('✅ Refreshed lawn booking details successfully');
//           } catch (err) {
//             console.warn('⚠️ Refresh: Could not fetch lawn details:', err);
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
//     // Here you would integrate with your payment gateway
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
//         Alert.alert('Success', 'Voucher saved to gallery successfully!');
//       }
//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       Alert.alert('Error', 'Failed to save voucher.');
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const handleShareInvoice = async () => {
//     try {
//       setShareLoading(true);
//       await new Promise(resolve => setTimeout(resolve, 300));

//       const uri = await captureRef(invoiceRef, {
//         format: 'png',
//         quality: 1,
//         result: 'tmpfile',
//       });

//       await Share.share({
//         title: `Lawn Voucher - ${invoiceData.invoiceNo}`,
//         url: uri,
//         message: `Here is the voucher for your PSC lawn booking: ${invoiceData.invoiceNo}`,
//       });
//     } catch (error) {
//       console.log('Share failed:', error);
//     } finally {
//       setShareLoading(false);
//     }
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
//       'Are you sure you want to cancel this lawn booking voucher?',
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
//               Alert.alert('Success', 'Voucher cancelled');
//               navigation.reset({ index: 1, routes: [{ name: 'home' }] });
//             } catch (error) {
//               Alert.alert('Error', 'Failed to cancel voucher.');
//             } finally {
//               setRefreshing(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) { return dateString; }
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleString('en-US', {
//         year: 'numeric', month: 'short', day: 'numeric',
//         hour: '2-digit', minute: '2-digit'
//       });
//     } catch (error) { return dateString; }
//   };

//   const formatTimeSlot = (timeSlot) => {
//     if (!timeSlot) return 'N/A';
//     const slotMap = {
//       'DAY': 'Day (8:00 AM - 4:00 PM)',
//       'NIGHT': 'Night (4:00 PM - 12:00 AM)',
//       'MORNING': 'Morning (8:00 AM - 2:00 PM)',
//       'EVENING': 'Evening (2:00 PM - 8:00 PM)',
//     };
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
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
//               <Icon name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.notchTitle}>Lawn Voucher</Text>
//             <View style={styles.iconWrapper} />
//           </View>
//         </ImageBackground>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#b48a64" />
//           <Text style={styles.loadingText}>Generating voucher...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
//       <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
//         <View style={styles.notchRow}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
//             <Icon name="arrow-back" size={28} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.notchTitle}>Lawn Voucher</Text>
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
//                   <Text style={styles.invoiceTitle}>LAWN BOOKING VOUCHER</Text>
//                   <Text style={styles.invoiceSubtitle}>{['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? "Booking finalized!" : "Complete payment to confirm."}</Text>

//                   {timeLeft && timeLeft !== 'EXPIRED' && invoiceData.status !== 'PAID' && (
//                     <View style={styles.timerWrapper}>
//                       <View style={styles.timerContainer}>
//                         <Icon name="schedule" size={16} color="#dc3545" />
//                         <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
//                       </View>
//                       <TouchableOpacity style={styles.cancelVoucherGhostButton} onPress={handleCancelVoucher}>
//                         <Icon name="close" size={14} color="#666" />
//                         <Text style={styles.cancelVoucherGhostText}>Cancel Booking</Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                   {timeLeft === 'EXPIRED' && <Text style={styles.expiredText}>EXPIRED</Text>}
//                 </View>

//                 {/* Details Section */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Voucher Details</Text>
//                   {[
//                     { label: 'Invoice Number:', value: invoiceData.invoiceNo, highlight: true },
//                     { label: 'Consumer Number:', value: invoiceData.consumerNumber, copy: true },
//                     { label: 'Booking ID:', value: invoiceData.bookingId },
//                     { label: 'Payment Due:', value: formatDateTime(invoiceData.dueDate), warning: true },
//                     { label: 'Issued At:', value: formatDateTime(invoiceData.issued_at) }
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

//                 {/* Lawn Booking Summary */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Lawn Information</Text>
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Lawn Name:</Text><Text style={styles.detailValue}>{invoiceData.lawnName}</Text></View>
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Guest Name' : 'Member Name'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestName : invoiceData.memberName}</Text></View>
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Contact No' : 'Membership No'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestContact : invoiceData.membershipNo}</Text></View>

//                   {invoiceData.selectedDates?.length > 0 ? (
//                     <View style={styles.multiDateContainer}>
//                       <Text style={styles.detailLabel}>Dates & Configurations:</Text>
//                       {invoiceData.selectedDates.map((date, index) => (
//                         <View key={index} style={styles.dateConfigItem}>
//                           <View style={styles.itemRow}>
//                             <View style={styles.dateCol}><Icon name="event" size={16} color="#b48a64" /><Text style={styles.dateText}>{formatDate(date)}</Text></View>
//                             <View style={styles.configCol}>
//                               <View style={styles.configChip}><Text style={styles.configText}>{formatTimeSlot(invoiceData.dateConfigurations[date]?.timeSlot || invoiceData.eventTime).split(' ')[0]}</Text></View>
//                               <View style={styles.configChip}><Text style={styles.configText}>{invoiceData.dateConfigurations[date]?.eventType || 'Event'}</Text></View>
//                             </View>
//                           </View>
//                         </View>
//                       ))}
//                     </View>
//                   ) : (
//                     <>
//                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Booking Date:</Text><Text style={styles.detailValue}>{formatDate(invoiceData.bookingDate)}</Text></View>
//                       <View style={styles.detailRow}><Text style={styles.detailLabel}>Time Slot:</Text><Text style={styles.detailValue}>{formatTimeSlot(invoiceData.eventTime)}</Text></View>
//                     </>
//                   )}
//                   <View style={styles.detailRow}><Text style={styles.detailLabel}>Guests:</Text><Text style={styles.detailValue}>{invoiceData.numberOfGuests} Persons</Text></View>
//                 </View>

//                 {/* Payment Breakdown */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Payment Information</Text>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Total Amount:</Text>
//                     <Text style={[styles.detailValue, styles.amountHighlight]}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Status:</Text>
//                     <View style={[styles.statusBadge, statusInfo.style]}><Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text></View>
//                   </View>
//                 </View>

//                 {/* Footer Info */}
//                 <View style={styles.invoiceSection}>
//                   <Text style={styles.sectionTitle}>Important Information</Text>
//                   {["Complete payment to confirm.", "Present this digital voucher at the lawn.", "All club rules applied."].map((txt, i) => (
//                     <View key={i} style={styles.instructionItem}><Icon name="info-outline" size={16} color="#b48a64" /><Text style={[styles.instructionText, { color: '#333' }]}>{txt}</Text></View>
//                   ))}
//                 </View>
//               </View>
//             </ViewShot>

//             {/* Hidden capture view */}
//             <View style={shareStyles.offScreenContainer}>
//               <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={shareStyles.invoiceSheet}>
//                 <View style={shareStyles.header}><Text style={shareStyles.headerTitle}>PSC LAWN BOOKING</Text><View style={shareStyles.headerDivider} /><Text style={shareStyles.headerSubtitle}>Official Booking Voucher</Text></View>
//                 <View style={shareStyles.confirmedBadge}><Text style={shareStyles.confirmedBadgeText}>✓ {statusInfo.text}</Text></View>
//                 <View style={shareStyles.section}>
//                   <Text style={shareStyles.sectionTitle}>Booking Summary</Text><View style={shareStyles.sectionDivider} />
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Invoice:</Text><Text style={shareStyles.value}>{invoiceData.invoiceNo}</Text></View>
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Lawn:</Text><Text style={shareStyles.value}>{invoiceData.lawnName}</Text></View>
//                   <View style={shareStyles.row}><Text style={shareStyles.label}>Amount:</Text><Text style={shareStyles.value}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text></View>
//                 </View>
//                 <View style={shareStyles.footer}><View style={shareStyles.footerDivider} /><Text style={shareStyles.footerText}>Thank you for choosing PSC!</Text></View>
//               </ViewShot>
//             </View>

//             {/* Actions */}
//             <View style={{ padding: 15 }}>
//               <View style={styles.actionButtons}>
//                 {/* <TouchableOpacity style={styles.secondaryButton} onPress={handleRefresh} disabled={refreshing}>
//                   <Icon name="refresh" size={20} color="#b48a64" /><Text style={styles.secondaryButtonText}>Refresh</Text>
//                 </TouchableOpacity> */}
//                 <TouchableOpacity style={styles.shareButton} onPress={handleShareInvoice} disabled={shareLoading}>
//                   <Icon name="share" size={20} color="#fff" /><Text style={styles.shareButtonText}>Share</Text>
//                 </TouchableOpacity>
//               </View>
//               <TouchableOpacity style={styles.saveButtonFull} onPress={handleSaveToGallery} disabled={saveLoading}>
//                 {saveLoading ? <ActivityIndicator color="#fff" /> : <><Icon name="file-download" size={20} color="#fff" /><Text style={styles.saveButtonTextFull}>Save to Gallery</Text></>}
//               </TouchableOpacity>
//               {/* {invoiceData.status !== 'PAID' && (
//                 <TouchableOpacity style={styles.primaryButton} onPress={handleMakePayment}>
//                   <Icon name="payment" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Complete Payment Now</Text>
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
//   cancelVoucherGhostButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d9d9d9' },
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
//   amountHighlight: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
//   statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
//   statusConfirmed: { backgroundColor: '#d4efdf' },
//   statusPending: { backgroundColor: '#fadbd8' },
//   statusCancelled: { backgroundColor: '#f8d7da' },
//   statusText: { fontSize: 12, fontWeight: 'bold' },
//   copyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
//   instructions: { backgroundColor: '#f0f7ff', padding: 16, borderRadius: 12, marginTop: 5 },
//   instructionsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1565c0', marginBottom: 10 },
//   instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   instructionText: { fontSize: 12, color: '#1565c0', marginLeft: 8, flex: 1 },
//   actionButtons: { flexDirection: 'row', marginBottom: 10 },
//   secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b48a64', marginRight: 10 },
//   secondaryButtonText: { color: '#b48a64', fontWeight: '600', marginLeft: 8 },
//   shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#2196f3' },
//   shareButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
//   saveButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#388e3c', padding: 15, borderRadius: 8, marginBottom: 10 },
//   saveButtonTextFull: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
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
import { voucherAPI, getAuthToken, getBaseUrl } from '../../config/apis';

export default function Voucher({ navigation, route }) {
  const { clearVoucher } = useVoucher();
  const { user } = useAuth();
  const {
    invoiceData: rawInvoiceData,
    bookingDetails,
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

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (rawInvoiceData) {
        console.log('🔄 Mapping Lawn Invoice Data');
        console.log('📦 Received bookingDetails:', JSON.stringify(bookingDetails));
        console.log('📦 Received venue:', JSON.stringify(venue));
        console.log('📦 Received memberDetails:', JSON.stringify(memberDetails));
        console.log('📦 Received guestDetails:', JSON.stringify(guestDetails));

        // Prioritize passed data over API fetch
        let resolvedDetails = {};

        // Use passed bookingDetails if available
        if (bookingDetails) {
          console.log('📦 Using passed bookingDetails:', JSON.stringify(bookingDetails));
          resolvedDetails = {
            ...bookingDetails,
            lawnName: bookingDetails.lawnName || bookingDetails.lawn_name || venue?.description || venue?.name,
            bookingDate: bookingDetails.bookingDate || bookingDetails.booking_date || bookingDetails.eventDate || bookingDetails.event_date,
            eventTime: bookingDetails.eventTime || bookingDetails.timeSlot || bookingDetails.event_time || bookingDetails.time_slot,
            numberOfGuests: bookingDetails.numberOfGuests || bookingDetails.number_of_guests || bookingDetails.guests,
            selectedDates: bookingDetails.selectedDates || bookingDetails.selected_dates || [],
            dateConfigurations: bookingDetails.dateConfigurations || bookingDetails.date_configurations || {},
            guestName: bookingDetails.guestName || bookingDetails.guest_name,
            guestContact: bookingDetails.guestContact || bookingDetails.guest_contact,
          };
        } else {
          console.log('⚠️ No bookingDetails passed, will attempt API fetch');
        }

        // Also check if booking details exist in rawInvoiceData
        if (!resolvedDetails.lawnName && rawInvoiceData?.lawn) {
          resolvedDetails.lawnName = rawInvoiceData.lawn.name || rawInvoiceData.lawn.Name || rawInvoiceData.lawn.lawnName;
        }
        if (!resolvedDetails.bookingDate && rawInvoiceData?.booking) {
          resolvedDetails.bookingDate = rawInvoiceData.booking.bookingDate || rawInvoiceData.booking.eventDate;
        }
        if (!resolvedDetails.eventTime && rawInvoiceData?.booking) {
          resolvedDetails.eventTime = rawInvoiceData.booking.eventTime || rawInvoiceData.booking.timeSlot;
        }
        if (!resolvedDetails.numberOfGuests && rawInvoiceData?.booking) {
          resolvedDetails.numberOfGuests = rawInvoiceData.booking.numberOfGuests;
        }

        // Extract booking information from remarks if available
        if (rawInvoiceData?.voucher?.remarks) {
          const remarks = rawInvoiceData.voucher.remarks;
          console.log('🔍 Extracting lawn info from remarks:', remarks);

          // Extract lawn name from remarks like "Full payment for Lawn booking: on 3/13/2026"
          if (!resolvedDetails.lawnName) {
            const lawnMatch = remarks.match(/(Lawn|Lawn Service|Lawn Booking).*?booking/i);
            if (lawnMatch) {
              resolvedDetails.lawnName = lawnMatch[0].replace('booking', '').trim();
            }
          }

          // Extract date from remarks
          if (!resolvedDetails.bookingDate) {
            const dateMatch = remarks.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
            if (dateMatch) {
              const extractedDate = dateMatch[1];
              // Handle different date formats properly
              let dateObj;

              if (extractedDate.includes('/')) {
                // Handle MM/DD/YYYY format
                const parts = extractedDate.split('/');
                if (parts.length === 3) {
                  // Convert to YYYY-MM-DD format for proper parsing
                  const month = parts[0].padStart(2, '0');
                  const day = parts[1].padStart(2, '0');
                  const year = parts[2];
                  const isoDate = `${year}-${month}-${day}`;
                  dateObj = new Date(isoDate);
                }
              } else {
                // Handle YYYY-MM-DD format
                dateObj = new Date(extractedDate);
              }

              if (dateObj && !isNaN(dateObj.getTime())) {
                // Convert to a readable format
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                resolvedDetails.bookingDate = formattedDate;
              } else {
                resolvedDetails.bookingDate = extractedDate; // Use original if conversion fails
              }
            }
          }

          // Extract time slot from remarks if present
          if (!resolvedDetails.eventTime) {
            const timeMatch = remarks.match(/(day|night|morning|evening|time:\s*[^,]+)/i);
            if (timeMatch) {
              resolvedDetails.eventTime = timeMatch[0];
            }
          }
        }

        // Extract from other possible sources in rawInvoiceData
        if (!resolvedDetails.lawnName && rawInvoiceData?.bookingName) {
          resolvedDetails.lawnName = rawInvoiceData.bookingName;
        }
        if (!resolvedDetails.lawnName && rawInvoiceData?.lawnName) {
          resolvedDetails.lawnName = rawInvoiceData.lawnName;
        }
        if (!resolvedDetails.bookingDate && rawInvoiceData?.eventDate) {
          resolvedDetails.bookingDate = rawInvoiceData.eventDate;
        }
        if (!resolvedDetails.eventTime && rawInvoiceData?.timeSlot) {
          resolvedDetails.eventTime = rawInvoiceData.timeSlot;
        }
        if (!resolvedDetails.numberOfGuests && rawInvoiceData?.guests) {
          resolvedDetails.numberOfGuests = rawInvoiceData.guests;
        }

        // Use passed venue data
        const resolvedVenue = venue || {};

        // Use passed member/guest details
        const resolvedMemberDetails = memberDetails || {};
        const resolvedGuestDetails = guestDetails || {};

        // Only fetch from API if critical data is missing
        const hasCriticalData = resolvedDetails.lawnName && resolvedDetails.bookingDate;

        console.log('📊 hasCriticalData check:', hasCriticalData);
        console.log('📊 resolvedDetails:', JSON.stringify(resolvedDetails));
        console.log('📊 resolvedVenue:', JSON.stringify(resolvedVenue));

        if (!hasCriticalData) {
          const bookingId = rawInvoiceData.voucher?.booking_id || rawInvoiceData.voucher?.id;
          if (bookingId) {
            try {
              console.log('🔍 Fetching additional data for bookingId:', bookingId);
              const res = await voucherAPI.getVoucherByType('LAWN', bookingId);
              const fetched = res?.data?.Data || res?.data || {};

              // Merge with existing data, don't overwrite passed data
              resolvedDetails = {
                ...resolvedDetails,
                lawnName: resolvedDetails.lawnName || fetched.lawn?.name || fetched.lawnName || fetched.booking?.lawnName,
                bookingDate: resolvedDetails.bookingDate || fetched.booking?.bookingDate || fetched.bookingDate || fetched.eventDate,
                eventTime: resolvedDetails.eventTime || fetched.booking?.timeSlot || fetched.timeSlot || fetched.booking?.eventTime || fetched.eventTime,
                numberOfGuests: resolvedDetails.numberOfGuests || fetched.booking?.numberOfGuests || fetched.numberOfGuests,
                selectedDates: resolvedDetails.selectedDates.length > 0 ? resolvedDetails.selectedDates : (fetched.booking?.selectedDates || fetched.selectedDates || []),
                dateConfigurations: Object.keys(resolvedDetails.dateConfigurations).length > 0 ? resolvedDetails.dateConfigurations : (fetched.booking?.dateConfigurations || fetched.dateConfigurations || {}),
                guestName: resolvedDetails.guestName || fetched.booking?.guestName || fetched.guestName,
                guestContact: resolvedDetails.guestContact || fetched.booking?.guestContact || fetched.guestContact,
              };

              console.log('✅ Fetched and merged data:', JSON.stringify(resolvedDetails));
            } catch (err) {
              console.warn('⚠️ Could not fetch lawn booking details:', err);
            }
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
          // Lawn specific keys - prioritize passed data
          lawnName: resolvedVenue?.description || resolvedDetails?.lawnName,
          bookingDate: resolvedDetails?.bookingDate,
          eventTime: resolvedDetails?.eventTime,
          numberOfGuests: resolvedDetails?.numberOfGuests,
          selectedDates: resolvedDetails?.selectedDates || [],
          dateConfigurations: resolvedDetails?.dateConfigurations || {},
          guestName: resolvedGuestDetails?.guestName || resolvedDetails?.guestName,
          guestContact: resolvedGuestDetails?.guestContact || resolvedDetails?.guestContact,
          isGuest: isGuest,
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
  }, [rawInvoiceData, bookingDetails, venue, memberDetails, guestDetails, isGuest]);

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

  // Countdown Timer Logic
  useEffect(() => {
    const targetDateStr = invoiceData?.dueDate;

    if (!targetDateStr || invoiceData?.status === 'PAID') {
      if (timeLeft !== '') setTimeLeft('');
      return;
    }

    const targetDate = new Date(targetDateStr).getTime();

    if (isNaN(targetDate)) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
        return;
      }

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
      // If lawn details are missing, try to re-fetch them
      if (!invoiceData?.lawnName || !invoiceData?.bookingDate) {
        const { getAuthToken, getBaseUrl } = require('../../config/apis');
        const base_url = getBaseUrl();

        const bookingId = rawInvoiceData?.voucher?.booking_id || rawInvoiceData?.voucher?.id;
        if (bookingId) {
          try {
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
              const { voucherAPI } = require('../../config/apis');
              res = await voucherAPI.getVoucherByType('LAWN', bookingId);
            }

            const fetched = res?.data?.Data || res?.data || {};
            const booking = fetched.booking || fetched.Booking || {};
            const lawn = fetched.lawn || fetched.Lawn || {};

            setInvoiceData(prev => ({
              ...prev,
              lawnName: prev?.lawnName || lawn.name || lawn.Name || booking.lawnName || fetched.lawnName,
              bookingDate: prev?.bookingDate || booking.bookingDate || booking.booking_date || fetched.bookingDate || fetched.eventDate,
              eventTime: prev?.eventTime || booking.eventTime || booking.timeSlot || fetched.eventTime || fetched.timeSlot,
              numberOfGuests: prev?.numberOfGuests || booking.numberOfGuests || booking.number_of_guests || fetched.numberOfGuests,
              selectedDates: (prev?.selectedDates?.length > 0) ? prev.selectedDates : (booking.selectedDates || booking.selected_dates || fetched.selectedDates || []),
              dateConfigurations: Object.keys(prev?.dateConfigurations || {}).length > 0 ? prev.dateConfigurations : (booking.dateConfigurations || booking.date_configurations || fetched.dateConfigurations || {}),
            }));
            console.log('✅ Refreshed lawn booking details successfully');
          } catch (err) {
            console.warn('⚠️ Refresh: Could not fetch lawn details:', err);
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
    // Here you would integrate with your payment gateway
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
        Alert.alert('Success', 'Voucher saved to gallery successfully!');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', 'Failed to save voucher.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShareInvoice = async () => {
    try {
      setShareLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const uri = await captureRef(invoiceRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      await Share.share({
        title: `Lawn Voucher - ${invoiceData.invoiceNo}`,
        url: uri,
        message: `Here is the voucher for your PSC lawn booking: ${invoiceData.invoiceNo}`,
      });
    } catch (error) {
      console.log('Share failed:', error);
    } finally {
      setShareLoading(false);
    }
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
      'Are you sure you want to cancel this lawn booking voucher?',
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
              Alert.alert('Success', 'Voucher cancelled');
              navigation.reset({ index: 1, routes: [{ name: 'Lawn' }] });
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel voucher.');
            } finally {
              setRefreshing(false);
            }
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
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) { return dateString; }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return 'N/A';
    const slotMap = {
      'DAY': 'Day (8:00 AM - 4:00 PM)',
      'NIGHT': 'Night (4:00 PM - 12:00 AM)',
      'MORNING': 'Morning (8:00 AM - 2:00 PM)',
      'EVENING': 'Evening (2:00 PM - 8:00 PM)',
    };
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.notchTitle}>Lawn Voucher</Text>
            <View style={styles.iconWrapper} />
          </View>
        </ImageBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Generating voucher...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <ImageBackground source={require("../../assets/notch.jpg")} style={styles.notch} imageStyle={styles.notchImage}>
        <View style={styles.notchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.notchTitle}>Lawn Invoice</Text>
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
                  <Text style={styles.invoiceTitle}>LAWN BOOKING VOUCHER</Text>
                  <Text style={styles.invoiceSubtitle}>{['PAID', 'CONFIRMED'].includes(invoiceData.status.toUpperCase()) ? "Booking finalized!" : "Complete payment to confirm."}</Text>

                  {timeLeft && timeLeft !== 'EXPIRED' && invoiceData.status !== 'PAID' && (
                    <View style={styles.timerWrapper}>
                      <View style={styles.timerContainer}>
                        <Icon name="schedule" size={16} color="#dc3545" />
                        <Text style={styles.timerText}> Expires in: {timeLeft}</Text>
                      </View>
                      <TouchableOpacity style={styles.cancelVoucherGhostButton} onPress={handleCancelVoucher}>
                        <Icon name="close" size={14} color="#666" />
                        <Text style={styles.cancelVoucherGhostText}>Cancel Booking</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {timeLeft === 'EXPIRED' && <Text style={styles.expiredText}>EXPIRED</Text>}
                </View>

                {/* Details Section */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Voucher Details</Text>
                  {[
                    { label: 'Invoice Number:', value: invoiceData.invoiceNo, highlight: true },
                    { label: 'Consumer Number:', value: invoiceData.consumerNumber, copy: true },
                    { label: 'Booking ID:', value: invoiceData.bookingId },
                    { label: 'Payment Due:', value: formatDateTime(invoiceData.dueDate), warning: true },
                    { label: 'Issued At:', value: formatDateTime(invoiceData.issued_at) }
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
                </View>

                {/* Lawn Booking Summary */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Lawn Information</Text>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Guest Name' : 'Member Name'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestName : invoiceData.memberName}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>{invoiceData.isGuest ? 'Contact No' : 'Membership No'}:</Text><Text style={styles.detailValue}>{invoiceData.isGuest ? invoiceData.guestContact : invoiceData.membershipNo}</Text></View>

                  {invoiceData.selectedDates?.length > 0 ? (
                    <View style={styles.multiDateContainer}>
                      <Text style={styles.detailLabel}>Dates & Configurations:</Text>
                      {invoiceData.selectedDates.map((date, index) => (
                        <View key={index} style={styles.dateConfigItem}>
                          <View style={styles.itemRow}>
                            <View style={styles.dateCol}><Icon name="event" size={16} color="#b48a64" /><Text style={styles.dateText}>{formatDate(date)}</Text></View>
                            <View style={styles.configCol}>
                              <View style={styles.configChip}><Text style={styles.configText}>{formatTimeSlot(invoiceData.dateConfigurations[date]?.timeSlot || invoiceData.eventTime).split(' ')[0]}</Text></View>
                              <View style={styles.configChip}><Text style={styles.configText}>{invoiceData.dateConfigurations[date]?.eventType || 'Event'}</Text></View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <>
                      <View style={styles.detailRow}><Text style={styles.detailLabel}>Booking Date:</Text><Text style={styles.detailValue}>{formatDate(invoiceData.bookingDate)}</Text></View>
                      {/* <View style={styles.detailRow}><Text style={styles.detailLabel}>Time Slot:</Text><Text style={styles.detailValue}>{formatTimeSlot(invoiceData.eventTime)}</Text></View> */}
                    </>
                  )}
                  {/* <View style={styles.detailRow}><Text style={styles.detailLabel}>Guests:</Text><Text style={styles.detailValue}>{invoiceData.numberOfGuests} Persons</Text></View> */}
                </View>

                {/* Payment Breakdown */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Payment Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount:</Text>
                    <Text style={[styles.detailValue, styles.amountHighlight]}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, statusInfo.style]}><Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.text}</Text></View>
                  </View>
                </View>

                {/* Footer Info */}
                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionTitle}>Important Information</Text>
                  {["Complete payment to confirm.", "Present this digital voucher at the lawn.", "All club rules applied."].map((txt, i) => (
                    <View key={i} style={styles.instructionItem}><Icon name="info-outline" size={16} color="#b48a64" /><Text style={[styles.instructionText, { color: '#333' }]}>{txt}</Text></View>
                  ))}
                </View>
              </View>
            </ViewShot>

            {/* Hidden capture view */}
            <View style={shareStyles.offScreenContainer}>
              <ViewShot ref={invoiceRef} options={{ format: 'png', quality: 1.0 }} style={shareStyles.invoiceSheet}>
                <View style={shareStyles.header}><Text style={shareStyles.headerTitle}>PSC LAWN BOOKING</Text><View style={shareStyles.headerDivider} /><Text style={shareStyles.headerSubtitle}>Official Booking Voucher</Text></View>
                <View style={shareStyles.confirmedBadge}><Text style={shareStyles.confirmedBadgeText}>✓ {statusInfo.text}</Text></View>
                <View style={shareStyles.section}>
                  <Text style={shareStyles.sectionTitle}>Booking Summary</Text><View style={shareStyles.sectionDivider} />
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Invoice:</Text><Text style={shareStyles.value}>{invoiceData.invoiceNo}</Text></View>
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Lawn:</Text><Text style={shareStyles.value}>{invoiceData.lawnName}</Text></View>
                  <View style={shareStyles.row}><Text style={shareStyles.label}>Amount:</Text><Text style={shareStyles.value}>Rs. {parseFloat(invoiceData.totalPrice || 0).toLocaleString()}</Text></View>
                </View>
                <View style={shareStyles.footer}><View style={shareStyles.footerDivider} /><Text style={shareStyles.footerText}>Thank you for choosing PSC!</Text></View>
              </ViewShot>
            </View>

            {/* Actions */}
            <View style={{ padding: 15 }}>
              <View style={styles.actionButtons}>
                {/* <TouchableOpacity style={styles.secondaryButton} onPress={handleRefresh} disabled={refreshing}>
                  <Icon name="refresh" size={20} color="#b48a64" /><Text style={styles.secondaryButtonText}>Refresh</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity style={styles.shareButton} onPress={handleShareInvoice} disabled={shareLoading}>
                  <Icon name="share" size={20} color="#fff" /><Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity> */}
              </View>
              <TouchableOpacity style={styles.saveButtonFull} onPress={handleSaveToGallery} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#fff" /> : <><Icon name="file-download" size={20} color="#fff" /><Text style={styles.saveButtonTextFull}>Save to Gallery</Text></>}
              </TouchableOpacity>
              {/* {invoiceData.status !== 'PAID' && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleMakePayment}>
                  <Icon name="payment" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Complete Payment Now</Text>
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
  amountHighlight: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#d4efdf' },
  statusPending: { backgroundColor: '#fadbd8' },
  statusCancelled: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  copyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  instructions: { backgroundColor: '#f0f7ff', padding: 16, borderRadius: 12, marginTop: 5 },
  instructionsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1565c0', marginBottom: 10 },
  instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  instructionText: { fontSize: 12, color: '#1565c0', marginLeft: 8, flex: 1 },
  actionButtons: { flexDirection: 'row', marginBottom: 10 },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b48a64', marginRight: 10 },
  secondaryButtonText: { color: '#b48a64', fontWeight: '600', marginLeft: 8 },
  shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#2196f3' },
  shareButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  saveButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#b48a64', padding: 15, borderRadius: 8 },
  saveButtonTextFull: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
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