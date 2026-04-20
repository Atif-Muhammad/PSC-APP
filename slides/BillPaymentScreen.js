// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   StatusBar,
//   Linking,
//   Platform,
//   ImageBackground,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Clipboard,
//   BackHandler,
//   Animated,
//   Dimensions,
//   Modal,
//   FlatList,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getBaseUrl, paymentAPI, listMonthlyBills } from '../config/apis';
// import ViewShot, { captureRef } from 'react-native-view-shot';
// import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// import { permissionService } from '../src/services/PermissionService';

// const API_BASE_URL = getBaseUrl ? getBaseUrl() : 'https://admin.peshawarservicesclub.com/api';

// // API functions
// const storeAuthData = async (tokens, userData) => {
//   try {
//     await AsyncStorage.setItem('access_token', tokens.access_token);
//     await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
//     await AsyncStorage.setItem('user_data', JSON.stringify(userData));
//     console.log('✅ Auth data stored');
//   } catch (error) {
//     console.error('Error storing auth data:', error);
//   }
// };

// const getAuthToken = async () => {
//   try {
//     return await AsyncStorage.getItem('access_token');
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// const getUserData = async () => {
//   try {
//     const userData = await AsyncStorage.getItem('user_data');
//     return userData ? JSON.parse(userData) : null;
//   } catch (error) {
//     console.error('Error getting user data:', error);
//     return null;
//   }
// };

// const getMembershipNumberFromUserData = (userData) => {
//   // Try different possible field names for membership number
//   return userData?.Membership_No ||
//     userData?.membershipNo ||
//     userData?.membershipNumber ||
//     userData?.memberId ||
//     userData?.id ||
//     '';
// };

// const Bills = ({ navigation }) => {
//   const [membershipNumber, setMembershipNumber] = useState('');
//   const [membershipName, setMembershipName] = useState('');
//   const [memberData, setMemberData] = useState(null);
//   const [selectedMethod, setSelectedMethod] = useState('');
//   const [selectedBank, setSelectedBank] = useState('');
//   const [showBankDropdown, setShowBankDropdown] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userRole, setUserRole] = useState('');
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Monthly Bill History states
//   const [activeTab, setActiveTab] = useState('pay');
//   const [historyBills, setHistoryBills] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState('03');
//   const [selectedYear, setSelectedYear] = useState('2026');
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [allBills, setAllBills] = useState([]);

//   // Current year for dropdown
//   const currentYear = new Date().getFullYear();

//   // Balance Payment states
//   const [amountToPay, setAmountToPay] = useState('');
//   const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
//   const [generatedVoucher, setGeneratedVoucher] = useState(null);
//   // showVoucherModal removed — we navigate to BillPaymentReceipt instead

//   // Payment apps for bank dropdown (for 1 Bill payment)
//   const paymentApps = [
//     { name: 'Easypaisa' },
//     { name: 'JazzCash' },
//     { name: 'HBL Mobile' },
//     { name: 'Meezan Bank' },
//     { name: 'UBL Digital' },
//     { name: 'Bank Alfalah' },
//     { name: 'MCB Mobile' },
//     { name: 'Allied Bank' },
//   ];

//   // Payment modes - Only Cash and Kuickpay
//   const paymentModes = [
//     { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
//     { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
//   ];

//   // Handle bank selection from dropdown
//   const handleBankSelect = (bank) => {
//     setSelectedBank(bank.name);
//     setShowBankDropdown(false);
//   };

//   // Handle Generate Balance Voucher
//   const handleGenerateBalanceVoucher = async () => {
//     try {
//       // Validate amount
//       if (!amountToPay || amountToPay.trim() === '') {
//         Alert.alert('Error', 'Please enter an amount to pay');
//         return;
//       }

//       const paymentAmount = Number(amountToPay);

//       if (isNaN(paymentAmount) || paymentAmount <= 0) {
//         Alert.alert('Error', 'Please enter a valid amount');
//         return;
//       }

//       if (paymentAmount > memberData.Balance) {
//         Alert.alert('Error', `Amount exceeds your balance of Rs ${memberData.Balance.toLocaleString()}`);
//         return;
//       }

//       setIsGeneratingVoucher(true);

//       const token = await getAuthToken();
//       const membershipNo = membershipNumber;

//       console.log('🔵 Generating balance voucher:', { amountToPay: paymentAmount, membership_no: membershipNo });

//       const response = await fetch(
//         `${API_BASE_URL}/payment/generate/invoice/balance`,
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             amountToPay: String(paymentAmount),
//             membership_no: membershipNo,
//           }),
//         }
//       );

//       const responseData = await response.json();

//       if (response.ok) {
//         console.log('✅ Voucher generated successfully:', responseData);

//         const voucherData = responseData.voucher || responseData;
//         setGeneratedVoucher(voucherData);

//         // Clear the input
//         setAmountToPay('');

//         // Navigate to the receipt screen
//         navigation.navigate('BillPaymentReceipt', {
//           voucher: voucherData,
//           memberName: membershipName,
//           membershipNumber: membershipNumber,
//         });
//       } else {
//         console.error('❌ Voucher generation failed:', responseData);

//         // Handle specific error cases
//         const errorMessage = responseData.message || responseData.error || 'Failed to generate payment code';

//         if (errorMessage.includes('Member not found')) {
//           Alert.alert('Error', 'Member not found. Please contact support.');
//         } else if (errorMessage.includes('Amount exceeds')) {
//           Alert.alert('Error', 'Amount exceeds your balance. Please enter a lower amount.');
//         } else if (errorMessage.includes('Invalid amount')) {
//           Alert.alert('Error', 'Invalid amount entered. Please try again.');
//         } else {
//           Alert.alert('Error', errorMessage);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error generating voucher:', error);
//       Alert.alert('Error', 'Failed to generate payment code. Please try again.');
//     } finally {
//       setIsGeneratingVoucher(false);
//     }
//   };

//   // Copy consumer number to clipboard
//   const copyConsumerNumber = () => {
//     if (generatedVoucher?.consumer_number) {
//       Clipboard.setString(String(generatedVoucher.consumer_number));
//       Alert.alert('Copied!', 'Consumer number copied to clipboard');
//     }
//   };

//   // Monthly Bill History functions
//   const fetchBills = async () => {
//     if (!membershipNumber) return;
    
//     try {
//       setLoading(true);
//       console.log(`📋 Fetching all bills for month: ${selectedMonth}, year: ${selectedYear}`);
      
//       // Fetch ALL bills for the selected month/year
//       const billsData = await listMonthlyBills(selectedMonth, selectedYear);
//       console.log('📦 All bills received:', billsData);
      
//       // Store all bills
//       const billsArray = Array.isArray(billsData) ? billsData : [billsData].filter(Boolean);
//       setAllBills(billsArray);
      
//       // CLIENT-SIDE FILTERING: Filter bills for current user only using DATA-DRIVEN INTEGER COMPARISON
//       // 1. Sanitize the user's ID to a clean string
//       const targetId = String(membershipNumber).replace(/[^0-9]/g, '');
      
//       console.log(`🔍 User Membership Number: ${membershipNumber} → Target ID: ${targetId}`);
      
//       const myBills = billsArray.filter(bill => {
//         // 2. Use the dedicated membershipNo field from the API if it exists
//         // If not, fall back to extracting it from the filename strictly
//         const billMemberId = bill.membershipNo 
//           ? String(bill.membershipNo).replace(/[^0-9]/g, '')
//           : (bill.filename || "").split('_')[0].replace(/[^0-9]/g, '');

//         // 3. EXACT INTEGER COMPARISON
//         // This ensures '3' NEVER matches '803'
//         const isMatch = parseInt(billMemberId, 10) === parseInt(targetId, 10);

//         console.log(`Comparing: Bill ID (${billMemberId}) with User ID (${targetId}) -> Match: ${isMatch}`);
        
//         return isMatch;
//       });
      
//       console.log(`✅ Filtered to ${myBills.length} bills for member ${membershipNumber}`);
//       setHistoryBills(myBills);
      
//     } catch (err) {
//       console.error('❌ Error fetching bills:', err);
//       Alert.alert('Error', err.message || 'Failed to fetch bills');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewBill = async (bill) => {
//     try {
//       console.log('📄 Opening bill:', bill);
      
//       // Construct full URL from relative path
//       let fullUrl = bill.url;
//       if (!fullUrl) {
//         Alert.alert('Error', 'Bill URL not available');
//         return;
//       }
      
//       // Ensure URL starts with http/https - ROBUST URL HANDLING
//       if (fullUrl.startsWith('/')) {
//         // Remove/api from base URL and append the relative path
//         const baseUrl = getBaseUrl().replace('/api', '');
//         fullUrl = `${baseUrl}${fullUrl}`;
//       } else if (!fullUrl.startsWith('http')) {
//         fullUrl = `https://admin.peshawarservicesclub.com${fullUrl}`;
//       }
      
//       console.log('🔗 Full bill URL:', fullUrl);
      
//       const supported = await Linking.canOpenURL(fullUrl);
//       if (supported) {
//         await Linking.openURL(fullUrl);
//       } else {
//         // Fallback: Try opening anyway
//         try {
//           await Linking.openURL(fullUrl);
//         } catch (fallbackErr) {
//           Alert.alert(
//             'Cannot Open PDF',
//             'Unable to open the PDF. Please try downloading instead.',
//             [{ text: 'OK' }]
//           );
//           console.error('❌ Fallback also failed:', fallbackErr);
//         }
//       }
//     } catch (err) {
//       console.error('❌ Error opening bill:', err);
//       Alert.alert(
//         'Error', 
//         'Failed to open bill PDF. Please try downloading instead.'
//       );
//     }
//   };

//   const handleDownloadBill = async (bill) => {
//     try {
//       console.log('📥 Downloading bill:', bill);
      
//       // Construct full URL from relative path
//       let fullUrl = bill.url;
//       if (!fullUrl) {
//         Alert.alert('Error', 'Bill URL not available');
//         return;
//       }
      
//       // Ensure URL starts with http/https - ROBUST URL HANDLING
//       if (fullUrl.startsWith('/')) {
//         // Remove/api from base URL and append the relative path
//         const baseUrl = getBaseUrl().replace('/api', '');
//         fullUrl = `${baseUrl}${fullUrl}`;
//       } else if (!fullUrl.startsWith('http')) {
//         fullUrl = `https://admin.peshawarservicesclub.com${fullUrl}`;
//       }
      
//       console.log('🔗 Full bill URL for download:', fullUrl);
      
//       // For React Native without RNFS/ expo-sharing, use this approach
//       // This opens the PDF which user can then save from browser
//       const supported = await Linking.canOpenURL(fullUrl);
//       if (supported) {
//         await Linking.openURL(fullUrl);
//         setTimeout(() => {
//           Alert.alert(
//             'Download Started',
//             'The PDF has been opened in your browser. You can save it from there by:\n\n1. Tapping the share/download icon\n2. Selecting "Save to Files" or "Download"',
//             [{ text: 'OK' }]
//           );
//         }, 500);
//       } else {
//         // Try opening anyway as fallback
//         try {
//           await Linking.openURL(fullUrl);
//           setTimeout(() => {
//             Alert.alert(
//               'Download Started',
//               'The PDF has been opened in your browser. You can save it from there.',
//               [{ text: 'OK' }]
//             );
//           }, 500);
//         } catch (fallbackErr) {
//           Alert.alert('Error', `Cannot open URL: ${fullUrl}`);
//         }
//       }
//     } catch (err) {
//       console.error('❌ Error downloading bill:', err);
//       Alert.alert(
//         'Error', 
//         'Failed to download bill. Please try again later.'
//       );
//     }
//   };

//   // Check user role and initialize
//   const initializeApp = async () => {
//     try {
//       setLoading(true);
//       const userData = await getUserData();

//       if (!userData) {
//         Alert.alert('Error', 'Please login first');
//         navigation.navigate('Login');
//         return;
//       }

//       // Check if user is admin based on role field
//       const role = userData?.role || userData?.Role || 'MEMBER';
//       setUserRole(role);
//       const isUserAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'admin';
//       setIsAdmin(isUserAdmin);

//       if (isUserAdmin) {
//         // For admin, don't auto-fetch member data
//         setLoading(false);
//       } else {
//         // For member, fetch their own data
//         fetchMemberData(userData);
//       }
//     } catch (error) {
//       console.error('Error initializing app:', error);
//       Alert.alert('Error', 'Failed to initialize app');
//       setLoading(false);
//     }
//   };

//   // Fetch member data
//   const fetchMemberData = async (userData) => {
//     try {
//       const token = await getAuthToken();
//       const memberId = getMembershipNumberFromUserData(userData);

//       if (!memberId) {
//         Alert.alert('Error', 'No membership number found');
//         setLoading(false);
//         return;
//       }

//       console.log('🔍 Fetching data for membership:', memberId);

//       const response = await fetch(
//         `${API_BASE_URL}/member/get/members?membershipNo=${memberId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.data && data.data.length > 0) {
//           // Find the EXACT match for the membership number
//           const exactMember = data.data.find(
//             m => m.Membership_No === memberId ||
//               m.membershipNo === memberId ||
//               String(m.Membership_No) === String(memberId)
//           );

//           // If exact match found, use it. Otherwise fall back to first result
//           const member = exactMember || data.data[0];

//           console.log('✅ Found member:', member.Name, 'with ID:', member.Membership_No);

//           setMemberData(member);
//           setMembershipNumber(member.Membership_No);
//           setMembershipName(member.Name);

//           // Fetch additional data
//           fetchMemberVouchers(member.Membership_No);
//           fetchMemberBookings(member.Membership_No);
//         } else {
//           Alert.alert('Error', 'Member data not found');
//         }
//       } else {
//         Alert.alert('Error', 'Failed to fetch member data');
//       }
//     } catch (error) {
//       console.error('Error fetching member data:', error);
//       Alert.alert('Error', 'Failed to load member data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Search members (admin only)
//   const searchMembers = async () => {
//     if (!searchTerm.trim()) {
//       Alert.alert('Error', 'Please enter search term');
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await getAuthToken();

//       const response = await fetch(
//         `${API_BASE_URL}/member/get/members?search=${encodeURIComponent(searchTerm)}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.data && data.data.length > 0) {
//           const member = data.data[0];
//           setMemberData(member);
//           setMembershipNumber(member.Membership_No);
//           setMembershipName(member.Name);
//           setSearchTerm('');

//           // Fetch additional data for the selected member
//           fetchMemberVouchers(member.Membership_No);
//           fetchMemberBookings(member.Membership_No);
//         } else {
//           Alert.alert('Not Found', 'No member found with that search term');
//         }
//       } else {
//         Alert.alert('Error', 'Failed to search members');
//       }
//     } catch (error) {
//       console.error('Error searching members:', error);
//       Alert.alert('Error', 'Failed to search members');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMemberVouchers = async (membershipNo) => {
//     if (!membershipNo) return;

//     try {
//       const token = await getAuthToken();
//       const response = await fetch(
//         `${API_BASE_URL}/payment/member/vouchers?membershipNo=${membershipNo}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const vouchers = await response.json();
//         console.log('Vouchers:', vouchers);
//       }
//     } catch (error) {
//       console.error('Error fetching vouchers:', error);
//     }
//   };

//   const fetchMemberBookings = async (membershipNo) => {
//     if (!membershipNo) return;

//     try {
//       const token = await getAuthToken();
//       const response = await fetch(
//         `${API_BASE_URL}/booking/member/bookings?membershipNo=${membershipNo}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const bookings = await response.json();
//         console.log('Bookings:', bookings);
//       }
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//     }
//   };

//   useEffect(() => {
//     initializeApp();
//   }, []);

//   // Fetch bills when month/year changes
//   useEffect(() => {
//     if (membershipNumber && activeTab === 'history') {
//       fetchBills();
//     }
//   }, [selectedMonth, selectedYear, membershipNumber, activeTab]);

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'PAID':
//       case 'CONFIRMED':
//       case 'ACTIVE':
//         return <Text style={styles.statusBadgePaid}>{status}</Text>;
//       case 'HALF_PAID':
//       case 'PENDING':
//         return <Text style={styles.statusBadgeHalfPaid}>{status}</Text>;
//       case 'UNPAID':
//       case 'INACTIVE':
//         return <Text style={styles.statusBadgeUnpaid}>{status}</Text>;
//       default:
//         return <Text style={styles.statusBadge}>{status}</Text>;
//     }
//   };

//   // Month names for display
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   // Generate year options (current year ± 2)
//   const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

//   // Render bill item for FlatList
//   const renderBillItem = ({ item }) => (
//     <View style={styles.billCard}>
//       <View style={styles.billHeader}>
//         <Icon name="file-pdf-box" size={28} color="#b48a64" />
//         <View style={styles.billInfo}>
//           <Text style={styles.billFilename} numberOfLines={1}>
//             {item.filename || `Bill_${selectedMonth}_${selectedYear}.pdf`}
//           </Text>
//           <Text style={styles.billPeriod}>
//             {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
//           </Text>
//         </View>
//       </View>
      
//       <View style={styles.billActions}>
//         <TouchableOpacity
//           style={[styles.actionButton, styles.viewButton]}
//           onPress={() => handleViewBill(item)}
//         >
//           <Icon name="eye-outline" size={20} color="#fff" />
//           <Text style={styles.actionButtonText}>View</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.actionButton, styles.downloadButton]}
//           onPress={() => handleDownloadBill(item)}
//         >
//           <Icon name="download" size={20} color="#b48a64" />
//           <Text style={styles.downloadButtonText}>Download</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Icon name="file-remove-outline" size={80} color="#999" />
//       <Text style={styles.emptyTitle}>No Bills Found</Text>
//       <Text style={styles.emptyText}>
//         There are no bills found for {monthNames[parseInt(selectedMonth) - 1] || ''} {selectedYear || ''}
//         {membershipNumber ? ` for membership ${membershipNumber}` : ''}.
//       </Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#b48a64" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="black" />

//       {/* 🔹 Notch Header with Background Image */}
//       <ImageBackground
//         source={require('../assets/notch.jpg')}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="arrow-left" size={24} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.headerText}>Bill Payment</Text>

//           <TouchableOpacity
//             style={styles.refreshButton}
//             onPress={initializeApp}
//           >
//             <Icon name="refresh" size={24} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Content Container with Beige Background */}
//         <View style={styles.contentWrapper}>
//         {/* Role Badge */}
//         {/* <View style={styles.roleBadgeContainer}>
//           <Text style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.memberBadge]}>
//             {isAdmin ? 'Super-Admin' : 'MEMBER'}
//           </Text>
//         </View> */}

//         {/* Search Section - Only for Admin */}
//         {isAdmin && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Search Member</Text>
//             <View style={styles.searchContainer}>
//               <TextInput
//                 style={styles.searchInput}
//                 value={searchTerm}
//                 onChangeText={setSearchTerm}
//                 placeholder="Search by name or membership number"
//                 placeholderTextColor="#999"
//               />
//               <TouchableOpacity
//                 style={styles.searchButton}
//                 onPress={searchMembers}
//               >
//                 <Text style={styles.searchButtonText}>Search</Text>
//               </TouchableOpacity>
//             </View>
//             {searchTerm && !memberData && (
//               <Text style={styles.searchHint}>
//                 Enter a member's name or membership number to search
//               </Text>
//             )}
//           </View>
//         )}

//         {/* User Information Section - Enhanced Member Info Card */}
//         <View style={styles.memberInfoCard}>
//           <Text style={styles.cardTitle}>
//             {isAdmin ? 'Member Information' : 'Your Information'}
//           </Text>

//           {(!isAdmin || (isAdmin && memberData)) ? (
//             <>
//               <View style={styles.infoRow}>
//                 <View style={styles.infoLabelContainer}>
//                   <Text style={styles.infoLabel}>Membership Number</Text>
//                 </View>
//                 <View style={styles.infoValueContainer}>
//                   <TextInput
//                     style={styles.infoInput}
//                     value={membershipNumber}
//                     editable={false}
//                     selectTextOnFocus={false}
//                   />
//                 </View>
//               </View>

//               <View style={styles.infoRow}>
//                 <View style={styles.infoLabelContainer}>
//                   <Text style={styles.infoLabel}>Member Name</Text>
//                 </View>
//                 <View style={styles.infoValueContainer}>
//                   <TextInput
//                     style={styles.infoInput}
//                     value={membershipName}
//                     editable={false}
//                     selectTextOnFocus={false}
//                   />
//                 </View>
//               </View>

//               {memberData && (
//                 <View style={styles.balanceCard}>
//                   <View style={styles.balanceHeader}>
//                     <Text style={styles.balanceLabel}>Current Balance</Text>
//                     {getStatusBadge(memberData.Status)}
//                   </View>
//                   <Text style={[
//                     styles.balanceAmountDisplay,
//                     memberData.Balance < 0 && styles.negativeBalanceDisplay
//                   ]}>
//                     Rs {memberData.Balance?.toLocaleString() || 0}
//                   </Text>
                  
//                   {memberData.totalBookings !== undefined && (
//                     <View style={styles.bookingsRow}>
//                       <Text style={styles.bookingsLabel}>Total Bookings:</Text>
//                       <Text style={styles.bookingsValue}>{memberData.totalBookings || 0}</Text>
//                     </View>
//                   )}
//                 </View>
//               )}
//             </>
//           ) : isAdmin ? (
//             <View style={styles.noMemberContainer}>
//               <Text style={styles.noMemberText}>
//                 Search for a member to view their information
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.noMemberContainer}>
//               <Text style={styles.noMemberText}>
//                 Unable to load member information
//               </Text>
//               <TouchableOpacity
//                 style={styles.retryButton}
//                 onPress={initializeApp}
//               >
//                 <Text style={styles.retryButtonText}>Retry</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         {/* Custom Payment Section - Enhanced Layout */}
//         {!isAdmin && memberData && (
//           <View style={styles.paymentCard}>
//             <Text style={styles.cardTitle}>Custom Payment</Text>

//             <View style={styles.paymentInputGroup}>
//               <Text style={styles.paymentLabel}>Amount to Pay (Rs)</Text>
//               <TextInput
//                 style={styles.paymentInput}
//                 value={amountToPay}
//                 onChangeText={setAmountToPay}
//                 placeholder="Enter amount (e.g., 5000)"
//                 placeholderTextColor="#999"
//                 keyboardType="numeric"
//                 editable={!isGeneratingVoucher}
//               />
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.generateVoucherButton,
//                 (!amountToPay || Number(amountToPay) <= 0 || Number(amountToPay) > memberData.Balance) && styles.disabledButton
//               ]}
//               onPress={handleGenerateBalanceVoucher}
//               disabled={isGeneratingVoucher || !amountToPay || Number(amountToPay) <= 0 || Number(amountToPay) > memberData.Balance}
//             >
//               {isGeneratingVoucher ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.generateVoucherButtonText}>Generate Consumer Number</Text>
//               )}
//             </TouchableOpacity>

//             <Text style={styles.paymentNote}>
//               Amount cannot exceed your current balance
//             </Text>
//           </View>
//         )}

//         {/* View Monthly Bills Button */}
//         {!isAdmin && memberData && (
//           <View style={styles.viewBillsButtonContainer}>
//             <TouchableOpacity
//               style={styles.viewBillsButton}
//               onPress={() => navigation.navigate('MonthlyBillHistory', { 
//                 membershipNumber: membershipNumber,
//                 membershipName: membershipName 
//               })}
//               activeOpacity={0.7}
//             >
//               <Icon name="file-document-outline" size={24} color="#FFF" style={styles.viewBillsIcon} />
//               <Text style={styles.viewBillsButtonText}>View Monthly Bills</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Tab 1: Pay Current Bill */}
//         {activeTab === 'pay' && !isAdmin && memberData && (
//           <>
//             {/* BILL PAYMENT VIA MOBILE APP & OTHER PAYMENT MODES */}
//             <View style={styles.section}>
//               <Text style={styles.proceduresTitle}>BILL PAYMENT VIA MOBILE APP & OTHER PAYMENT MODES</Text>

//               <Text style={styles.procedureItem}>
//                 This guide explains the step-by-step procedure for bill payment through the mobile application of Peshawar Services Club, along with alternative payment options available for members.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 1. Mobile App Payment Procedure (via Kuick Pay)
//               </Text>

//               <Text style={styles.procedureItem}>
//                 Please note that payment through the mobile app is processed using Kuick Pay services via your personal bank application. Members may pay in advance, partially, or the exact billed amount.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 • Steps to Pay:
//               </Text>
//               <Text style={styles.procedureItem}>
//                 1. Open the Club Mobile App and click "Pay Now."{'\n'}
//                 2. Enter the amount you wish to pay.{'\n'}
//                 3. A unique payment code will be generated.{'\n'}
//                 4. Open your personal bank's mobile app.{'\n'}
//                 5. Select the Kuick Pay payment option.{'\n'}
//                 6. Enter or paste the unique payment code.{'\n'}
//                 7. Confirm payment.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 • After Payment:
//               </Text>
//               <Text style={styles.procedureItem}>
//                 ✓ You will receive a payment confirmation message on PSC mobile app.{'\n'}
//                 ✓ Payment will be reflected in the Club system on the next working day.{'\n'}
//                 ✓ All transactions will be automatically recorded in the app payment history.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 2. Other Modes of Payment
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 A. HBL Bill Payment (via HBL Mobile App)
//               </Text>
//               <Text style={styles.procedureItem}>
//                 1. Open the HBL mobile app.{'\n'}
//                 2. Go to More → Other Payments → Corporate Payments.{'\n'}
//                 3. Search for Peshawar Services Club.{'\n'}
//                 4. Enter your Membership Number.{'\n'}
//                 5. Review bill details and enter payment amount.{'\n'}
//                 6. Confirm the transaction.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 Note:
//               </Text>
//               <Text style={styles.procedureItem}>
//                 ✓ You will receive confirmation on your banking app.{'\n'}
//                 ✓ Payment will be reflected in the Club system on the next working day.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 B. POS (Card) Payment
//               </Text>
//               <Text style={styles.procedureItem}>
//                 • Visit the Accounts Department during office hours.{'\n'}
//                 • Pay via credit or debit card using the POS machine.{'\n'}
//                 • Payment will be recorded immediately and reflected in the system accordingly.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 C. Cash Payment
//               </Text>
//               <Text style={styles.procedureItem}>
//                 • Visit the Accounts Department during office hours.{'\n'}
//                 • Pay outstanding dues in cash.{'\n'}
//                 • Payment will be reflected instantly.
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 D. Cheque Payment
//               </Text>
//               <Text style={styles.procedureItem}>
//                 • Submit cheque in favour (Title) of "Secretary PSC" at the Accounts Department.{'\n'}
//                 • Payment will be reflected after 2–3 working days (subject to cheque clearance).
//               </Text>

//               <Text style={styles.procedureItemHighlight}>
//                 3. Terms & Conditions
//               </Text>
//               <Text style={styles.procedureItem}>
//                 • Updated outstanding balances will be available on the mobile app on the next working day after payment.{'\n'}
//                 • Monthly bills are generated on the 1st of every month.{'\n'}
//                 • Members are requested to clear dues before the 25th of each month.{'\n'}
//                 • 5% surcharge will be applied if payment is not made before the due date.{'\n'}
//                 • Updated bills and previous month bills can be viewed in the mobile app.{'\n'}
//                 • The mobile app and banking platforms will display outstanding balances of active members only. Members with suspended, terminated, absent, or cancelled status may contact the Accounts Office for bill inquiries.{'\n'}
//                 • For any clarification regarding billing, members may contact the Accounts Department during office hours.{'\n'}
//                 • For further information, please visit or call 091-9212753-4
//               </Text>
//             </View>
//           </>
//         )}

//         {/* Tab 2: Monthly History */}
//         {activeTab === 'history' && !isAdmin && memberData && (
//           <View style={styles.section}>
//             {/* Filter Section */}
//             <View style={styles.filterSection}>
//               <View style={styles.filterHeader}>
//                 <Icon name="filter" size={20} color="#b48a64" />
//                 <Text style={styles.filterTitle}>Filter Period</Text>
//               </View>

//               <View style={styles.filterRow}>
//                 {/* Month Selector */}
//                 <View style={styles.filterField}>
//                   <Text style={styles.filterLabel}>Month</Text>
//                   <TouchableOpacity
//                     style={styles.dropdown}
//                     onPress={() => {
//                       setShowMonthDropdown(!showMonthDropdown);
//                       setShowYearDropdown(false);
//                     }}
//                   >
//                     <Text style={styles.dropdownText}>
//                       {monthNames[parseInt(selectedMonth) - 1]}
//                     </Text>
//                     <Icon name="chevron-down" size={20} color="#b48a64" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Year Selector */}
//                 <View style={styles.filterField}>
//                   <Text style={styles.filterLabel}>Year</Text>
//                   <TouchableOpacity
//                     style={styles.dropdown}
//                     onPress={() => {
//                       setShowYearDropdown(!showYearDropdown);
//                       setShowMonthDropdown(false);
//                     }}
//                   >
//                     <Text style={styles.dropdownText}>
//                       {selectedYear}
//                     </Text>
//                     <Icon name="chevron-down" size={20} color="#b48a64" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Membership Info */}
//               <View style={styles.membershipInfo}>
//                 <Icon name="account" size={16} color="#b48a64" />
//                 <Text style={styles.membershipText}>
//                   Membership: {membershipNumber || 'Loading...'}
//                 </Text>
//               </View>
//             </View>

//             {/* Bills List */}
//             {loading ? (
//               <View style={styles.loadingBillContainer}>
//                 <ActivityIndicator size="large" color="#b48a64" />
//                 <Text style={styles.loadingBillText}>Loading Bills...</Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={historyBills}
//                 renderItem={renderBillItem}
//                 keyExtractor={(item, index) => item.id || item.filename || index.toString()}
//                 contentContainerStyle={styles.listContent}
//                 ListEmptyComponent={renderEmptyComponent}
//               />
//             )}
//           </View>
//         )}

//         {/* Month Dropdown Modal */}
//         <Modal
//           visible={showMonthDropdown}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setShowMonthDropdown(false)}
//         >
//           <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={() => setShowMonthDropdown(false)}
//           >
//             <View style={styles.modalContent}>
//               <ScrollView>
//                 {monthNames.map((month, index) => (
//                   <TouchableOpacity
//                     key={month}
//                     style={[
//                       styles.monthOption,
//                       selectedMonth === (index + 1).toString().padStart(2, '0') && styles.selectedMonthOption
//                     ]}
//                     onPress={() => {
//                       setSelectedMonth((index + 1).toString().padStart(2, '0'));
//                       setShowMonthDropdown(false);
//                     }}
//                   >
//                     <Text style={styles.monthOptionText}>
//                       {month}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>
//           </TouchableOpacity>
//         </Modal>

//         {/* Year Dropdown Modal */}
//         <Modal
//           visible={showYearDropdown}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setShowYearDropdown(false)}
//         >
//           <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={() => setShowYearDropdown(false)}
//           >
//             <View style={styles.modalContent}>
//               {yearOptions.map((year) => (
//                 <TouchableOpacity
//                   key={year}
//                   style={[
//                     styles.yearOption,
//                     selectedYear === year.toString() && styles.selectedYearOption
//                   ]}
//                   onPress={() => {
//                     setSelectedYear(year.toString());
//                     setShowYearDropdown(false);
//                   }}
//                 >
//                   <Text style={styles.yearOptionText}>
//                     {year}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </TouchableOpacity>
//         </Modal>


//         {/* Admin Message - Only for admin when member data is loaded */}
//         {/* {isAdmin && memberData && (
//           <View style={styles.section}>
//             <Text style={styles.adminMessage}>
//               Payment section is only available to members. As an admin, you can only view member information.
//             </Text>
//           </View>
//         )} */}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// // Payment modes data (these are only used for members)
// const paymentModes = [
//   { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
//   { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
// ];

// const handleBankSelect = (bank) => {
//   // This function is only used in member context
//   // We'll define this inside the component but it's only called for members
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F1E9',
//   },
//   contentWrapper: {
//     paddingVertical: 20,
//   },
//   scrollView: {
//     backgroundColor: '#F5F1E9',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9EFE6',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#333',
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
//   backIcon: {
//     fontSize: 36,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//   },
//   placeholder: {
//     width: 40,
//   },
//   refreshButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   refreshIcon: {
//     fontSize: 24,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   // Role Badge Styles
//   roleBadgeContainer: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   roleBadge: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     paddingHorizontal: 20,
//     paddingVertical: 6,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   adminBadge: {
//     backgroundColor: '#FF6B6B',
//     color: '#fff',
//   },
//   memberBadge: {
//     backgroundColor: '#4CAF50',
//     color: '#fff',
//   },
//   // Professional Card Style
//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     marginHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   section: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     marginHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#543A14',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 15,
//   },
//   sectionSubtitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   billTopUp: {
//     color: '#666',
//     fontSize: 14,
//   },
//   selectChannel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//     marginTop: 8,
//   },
//   // Search Styles (Admin)
//   searchContainer: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   searchButton: {
//     backgroundColor: '#C9A962',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     justifyContent: 'center',
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   searchHint: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   // Input Styles
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#999',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 5,
//   },
//   input: {
//     backgroundColor: '#F2E8DF',
//     borderRadius: 10,
//     padding: 15,
//     fontSize: 16,
//     color: '#333',
//   },
//   // Enhanced Member Info Card Styles
//   memberInfoCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     marginHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#543A14',
//     marginBottom: 20,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E8E0',
//   },
//   infoLabelContainer: {
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 5,
//   },
//   infoValueContainer: {
//     flex: 1.5,
//   },
//   infoInput: {
//     backgroundColor: '#F2E8DF',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 15,
//     color: '#333',
//     textAlign: 'right',
//   },
//   balanceCard: {
//     backgroundColor: '#F9EFE6',
//     borderRadius: 12,
//     padding: 20,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: '#E8DDD0',
//   },
//   balanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   balanceLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   balanceAmountDisplay: {
//     fontSize: 32,
//     fontWeight: '800',
//     color: '#B48A64',
//     letterSpacing: 0.5,
//     marginBottom: 10,
//   },
//   negativeBalanceDisplay: {
//     color: '#E74C3C',
//   },
//   bookingsRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#E8DDD0',
//   },
//   bookingsLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#666',
//     marginRight: 8,
//   },
//   bookingsValue: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#333',
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: '#666',
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#333',
//   },
//   negativeBalance: {
//     color: '#E74C3C',
//   },
//   statusBadge: {
//     backgroundColor: '#4C7A57',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusBadgeText: {
//     color: '#FFF',
//     fontSize: 12,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//   },
//   statusBadgePaid: {
//     backgroundColor: '#4C7A57',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusBadgeHalfPaid: {
//     backgroundColor: '#D4A574',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusBadgeUnpaid: {
//     backgroundColor: '#E74C3C',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusBadgeContainer: {
//     alignSelf: 'flex-start',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E8DDD0',
//     marginVertical: 20,
//   },
//   // No Member Styles
//   noMemberContainer: {
//     alignItems: 'center',
//     paddingVertical: 30,
//   },
//   noMemberText: {
//     fontSize: 15,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   retryButton: {
//     backgroundColor: '#C9A962',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   // Dropdown Styles
//   dropdown: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   dropdownTextPlaceholder: {
//     fontSize: 16,
//     color: '#999',
//   },
//   dropdownTextSelected: {
//     fontSize: 16,
//     color: '#333',
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   dropdownArrow: {
//     fontSize: 12,
//     color: '#666',
//   },
//   dropdownContainer: {
//     position: 'relative',
//     zIndex: 1000,
//   },
//   dropdownList: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     maxHeight: 300,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     zIndex: 1001,
//   },
//   dropdownScrollView: {
//     maxHeight: 300,
//   },
//   dropdownItem: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   dropdownItemText: {
//     fontSize: 15,
//     color: '#333',
//   },
//   // Payment Modes Styles
//   paymentModesSection: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   paymentModesTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     marginBottom: 24,
//     letterSpacing: 2,
//   },
//   paymentModesTitleGold: {
//     color: '#C9A962',
//   },
//   paymentGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   paymentCard: {
//     width: '48%',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#C9A962',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   paymentCardSelected: {
//     borderColor: '#00A651',
//     backgroundColor: '#F0F8F4',
//   },
//   paymentMethod: {
//     width: '48%',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#C9A962',
//   },
//   paymentMethodSelected: {
//     borderColor: '#00A651',
//     backgroundColor: '#F0F8F4',
//   },
//   paymentIconContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   paymentIcon: {
//     fontSize: 48,
//   },
//   paymentImageContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     backgroundColor: '#F5F5F5',
//     overflow: 'hidden',
//   },
//   paymentImage: {
//     width: 100,
//     height: 100,
//   },
//   paymentLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     textAlign: 'center',
//   },
//   iconCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   icon: {
//     fontSize: 36,
//   },
//   methodLabel: {
//     fontSize: 13,
//     color: '#333',
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   // Procedures Styles
//   proceduresTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   proceduresSubtitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 16,
//   },
//   proceduresList: {
//     paddingLeft: 4,
//   },
//   procedureItem: {
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   procedureItemHighlight: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//     marginTop: 4,
//   },
//   // Button Styles
//   submitButton: {
//     backgroundColor: '#00A651',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   downloadButton: {
//     backgroundColor: '#C9A962',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   downloadButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   downloadNote: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   // Important Notice Styles
//   noticeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 12,
//   },
//   noticeBox: {
//     backgroundColor: '#FFF9E6',
//     borderLeftWidth: 4,
//     borderLeftColor: '#FFC107',
//     padding: 12,
//     borderRadius: 6,
//   },
//   noticeItem: {
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     width: '85%',
//     maxHeight: '70%',
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   bankList: {
//     maxHeight: 300,
//   },
//   bankItem: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   bankItemText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   closeButton: {
//     backgroundColor: '#C9A962',
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Enhanced Payment Section Styles
//   paymentCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     marginHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   paymentInputGroup: {
//     marginBottom: 20,
//   },
//   paymentLabel: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#666',
//     marginBottom: 8,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   paymentInput: {
//     backgroundColor: '#F2E8DF',
//     borderRadius: 10,
//     padding: 15,
//     fontSize: 16,
//     color: '#333',
//   },
//   generateVoucherButton: {
//     backgroundColor: '#B48A64',
//     borderRadius: 12,
//     height: 55,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#B48A64',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   disabledButton: {
//     backgroundColor: '#CCCCCC',
//     shadowOpacity: 0,
//   },
//   generateVoucherButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   paymentNote: {
//     fontSize: 13,
//     color: '#999',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   // View Monthly Bills Button Styles
//   viewBillsButtonContainer: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   viewBillsButton: {
//     backgroundColor: '#B48A64',
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#B48A64',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   viewBillsIcon: {
//     marginRight: 12,
//   },
//   viewBillsButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   // Voucher Modal Styles
//   voucherModalContent: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     width: '90%',
//     maxHeight: '80%',
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   successHeader: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   successTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 12,
//   },
//   voucherDetails: {
//     backgroundColor: '#FFF9E6',
//     borderLeftWidth: 4,
//     borderLeftColor: '#C9A962',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   voucherRow: {
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E8E0',
//   },
//   voucherLabel: {
//     fontSize: 13,
//     color: '#666',
//     marginBottom: 6,
//     fontWeight: '600',
//   },
//   voucherValue: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '700',
//   },
//   consumerNumberContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   consumerNumber: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//   },
//   copyButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   instructionsContainer: {
//     backgroundColor: '#F5F5F5',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   instructionsTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//   },
//   instructionStep: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   stepNumber: {
//     backgroundColor: '#C9A962',
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     textAlign: 'center',
//     lineHeight: 24,
//     marginRight: 10,
//     flexShrink: 0,
//   },
//   instructionText: {
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 20,
//     flex: 1,
//     paddingTop: 2,
//   },
//   highlightText: {
//     fontWeight: 'bold',
//     color: '#C9A962',
//   },
//   warningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3CD',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     gap: 10,
//   },
//   warningText: {
//     fontSize: 13,
//     color: '#856404',
//     flex: 1,
//     lineHeight: 18,
//   },
//   closeModalButton: {
//     backgroundColor: '#C9A962',
//     borderRadius: 12,
//     padding: 14,
//     alignItems: 'center',
//   },
//   closeModalButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Admin Message
//   adminMessage: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     fontStyle: 'italic',
//     paddingVertical: 10,
//   },
//   // Tab Switcher Styles - Professional Card
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 15,
//     alignItems: 'center',
//     position: 'relative',
//     borderBottomWidth: 3,
//     borderBottomColor: 'transparent',
//   },
//   activeTab: {
//     borderBottomColor: '#B48A64',
//   },
//   tabButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#999',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   activeTabText: {
//     color: '#543A14',
//     fontWeight: '700',
//   },
//   activeTabIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     left: '25%',
//     right: '25%',
//     height: 3,
//     backgroundColor: '#B48A64',
//     borderRadius: 3,
//   },
//   // History Filter Styles - Card Based
//   filterSection: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     marginHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   filterRow: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   filterField: {
//     flex: 1,
//   },
//   filterLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#999',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 8,
//   },
//   dropdown: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#F2E8DF',
//     padding: 15,
//     borderRadius: 10,
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//   },
//   membershipInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F0E8E0',
//   },
//   membershipText: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 8,
//   },
//   // Bill Card Styles - Professional Horizontal Layout
//   billCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     marginHorizontal: 15,
//     borderWidth: 1,
//     borderColor: '#E8DDD0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   billHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   billIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#F2E8DF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   billInfo: {
//     flex: 1,
//   },
//   billFilename: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#543A14',
//     letterSpacing: 0.5,
//     marginBottom: 4,
//   },
//   billPeriod: {
//     fontSize: 12,
//     color: '#999',
//   },
//   billActions: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#B48A64',
//     backgroundColor: 'transparent',
//     gap: 8,
//   },
//   viewButtonText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#B48A64',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   downloadButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     backgroundColor: '#F5E6D3',
//     borderWidth: 2,
//     borderColor: '#B48A64',
//     gap: 8,
//   },
//   downloadButtonText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#B48A64',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   listContent: {
//     padding: 8,
//     paddingBottom: 40,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 80,
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     marginHorizontal: 15,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#E8DDD0',
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#543A14',
//     marginTop: 16,
//     letterSpacing: 0.5,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     marginTop: 8,
//     paddingHorizontal: 32,
//     lineHeight: 20,
//   },
//   loadingBillContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   loadingBillText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   // Dropdown Modal Styles
//   monthOption: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   selectedMonthOption: {
//     backgroundColor: '#FFF9F0',
//   },
//   monthOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   yearOption: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   selectedYearOption: {
//     backgroundColor: '#FFF9F0',
//   },
//   yearOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });

// // =============================================================================
// // BillPaymentReceipt Screen
// // =============================================================================
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const BillPaymentReceipt = ({ navigation, route }) => {
//   const { voucher, memberName, membershipNumber: memNo } = route.params || {};

//   // Timer: 1 hour = 3600 seconds
//   const TIMER_DURATION = 3600;
//   const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION);
//   const [isExpired, setIsExpired] = useState(false);
//   const [isPaid, setIsPaid] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [isCancelling, setIsCancelling] = useState(false);
//   const [downloadLoading, setDownloadLoading] = useState(false);

//   // Refs
//   const viewShotRef = useRef(null);

//   // Animated values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(40)).current;
//   const scaleAnim = useRef(new Animated.Value(0.6)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   // Generation time – captured once when the screen mounts
//   const generationTime = useRef(new Date()).current;

//   // ── Entrance animation ──
//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   // ── Pulse animation for timer when < 5 min ──
//   useEffect(() => {
//     if (secondsLeft <= 300 && secondsLeft > 0) {
//       const pulse = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
//           Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
//         ])
//       );
//       pulse.start();
//       return () => pulse.stop();
//     }
//   }, [secondsLeft <= 300]);

//   // ── Poll backend for payment status every 10 seconds ──
//   useEffect(() => {
//     if (isPaid || isExpired) return;
//     const consumerNumber = voucher?.consumer_number;
//     if (!consumerNumber) return;

//     const checkPaymentStatus = async () => {
//       try {
//         const token = await AsyncStorage.getItem('access_token');
//         if (!token) return;

//         // Try /payment/member/vouchers first (returns all vouchers for this member)
//         const vouchersRes = await fetch(
//           `${API_BASE_URL}/payment/member/vouchers?membershipNo=${memNo}`,
//           { headers: { 'Authorization': `Bearer ${token}` } }
//         );

//         if (vouchersRes.ok) {
//           const vouchersData = await vouchersRes.json();
//           // vouchersData could be an array or { data: [...] }
//           const list = Array.isArray(vouchersData)
//             ? vouchersData
//             : (vouchersData?.data || vouchersData?.vouchers || []);

//           const match = list.find(v =>
//             String(v.consumer_number || v.consumerNumber || v.consumer_no) ===
//             String(consumerNumber)
//           );

//           if (match) {
//             const paidStatuses = ['PAID', 'paid', 'CONFIRMED', 'confirmed', 'SUCCESS', 'success'];
//             const voucherStatus = match.status || match.paymentStatus || match.payment_status || '';
//             if (paidStatuses.includes(voucherStatus)) {
//               console.log('✅ Payment confirmed via voucher polling!');
//               setIsPaid(true);
//               return;
//             }
//           }
//         }

//         // Fallback: check bill-payment-history
//         const histRes = await fetch(
//           `${API_BASE_URL}/payment/bill-payment-history/${memNo}`,
//           { headers: { 'Authorization': `Bearer ${token}` } }
//         );

//         if (histRes.ok) {
//           const histData = await histRes.json();
//           const histList = Array.isArray(histData)
//             ? histData
//             : (histData?.data || histData?.bills || []);

//           const histMatch = histList.find(b =>
//             String(b.consumer_number || b.consumerNo || b.invoice_number) ===
//             String(consumerNumber)
//           );

//           if (histMatch) {
//             console.log('✅ Payment confirmed via bill history!');
//             setIsPaid(true);
//           }
//         }
//       } catch (err) {
//         console.log('⚠️ Payment status poll error:', err.message);
//       }
//     };

//     // Check immediately on mount
//     checkPaymentStatus();

//     // Then poll every 10 seconds
//     const pollInterval = setInterval(checkPaymentStatus, 10000);

//     return () => clearInterval(pollInterval);
//   }, [isPaid, isExpired, voucher?.consumer_number, memNo]);

//   // ── Countdown timer ──
//   useEffect(() => {
//     if (isExpired || isPaid) return;
//     const interval = setInterval(() => {
//       setSecondsLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           setIsExpired(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [isExpired, isPaid]);

//   // ── Navigation guard ──
//   useEffect(() => {
//     const onBackPress = () => {
//       if (isPaid) {
//         // Payment done — go back to start freely
//         navigation.reset({ index: 0, routes: [{ name: 'start' }] });
//         return true;
//       }
//       showLeaveAlert();
//       return true; // prevent default
//     };
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

//     const unsubscribe = navigation.addListener('beforeRemove', (e) => {
//       if (isPaid) return; // allow leaving after payment
//       e.preventDefault();
//       showLeaveAlert(() => navigation.dispatch(e.data.action));
//     });

//     return () => {
//       backHandler.remove();
//       unsubscribe();
//     };
//   }, [navigation, isPaid]);

//   const showLeaveAlert = (onConfirm) => {
//     Alert.alert(
//       'Leave Payment?',
//       'Leaving this screen will cancel your active consumer session. Do you wish to proceed?',
//       [
//         { text: 'Stay', style: 'cancel' },
//         {
//           text: 'Leave',
//           style: 'destructive',
//           onPress: () => {
//             if (onConfirm) {
//               onConfirm();
//             } else {
//               navigation.goBack();
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ── Copy handler ──
//   const handleCopy = () => {
//     if (isExpired || isPaid) return;
//     if (voucher?.consumer_number) {
//       Clipboard.setString(String(voucher.consumer_number));
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   // ── Cancel handler ──
//   const handleCancel = () => {
//     Alert.alert(
//       'Cancel Payment',
//       'Are you sure you want to cancel this bill payment? This action cannot be undone.',
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setIsCancelling(true);
//               const voucherId = voucher?.id || voucher?.voucherId || voucher?.invoice_id;
//               if (!voucherId) {
//                 Alert.alert('Error', 'Voucher ID not found.');
//                 return;
//               }
//               await paymentAPI.cancelBalanceVoucher(voucherId);
//               Alert.alert('Cancelled', 'Your bill payment has been cancelled.', [
//                 {
//                   text: 'OK',
//                   onPress: () => navigation.goBack(),
//                 },
//               ]);
//             } catch (error) {
//               const msg = error?.response?.data?.message || error?.message || 'Failed to cancel payment.';
//               Alert.alert('Error', msg);
//             } finally {
//               setIsCancelling(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ── Download handler ──
//   const handleDownloadReceipt = async () => {
//     try {
//       setDownloadLoading(true);

//       const hasPermission = await permissionService.requestPhotoLibraryPermission();
//       if (!hasPermission) {
//         permissionService.handlePermissionDenied();
//         return;
//       }

//       if (viewShotRef.current) {
//         const uri = await captureRef(viewShotRef, {
//           format: 'png',
//           quality: 1.0,
//         });

//         await CameraRoll.save(uri, { type: 'photo' });
//         Alert.alert('Success', 'Receipt saved to gallery successfully!');
//       } else {
//         Alert.alert('Error', 'Capture reference not found.');
//       }
//     } catch (error) {
//       console.error('Error saving receipt:', error);
//       Alert.alert('Error', 'Failed to save receipt. Please try again.');
//     } finally {
//       setDownloadLoading(false);
//     }
//   };

//   // ── Helpers ──
//   const formatTime = (secs) => {
//     const m = Math.floor(secs / 60);
//     const s = secs % 60;
//     return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   };

//   const formattedDate = generationTime.toLocaleDateString('en-PK', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });
//   const formattedTime = generationTime.toLocaleTimeString('en-PK', {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//   });

//   // Determine status
//   const getStatus = () => {
//     if (isExpired) return 'expired';
//     if (isPaid) return 'paid';
//     return 'pending';
//   };

//   const status = getStatus();

//   const statusConfig = {
//     pending: {
//       icon: 'clock-outline',
//       color: '#FF9800',
//       bgColor: '#FFF3E0',
//       title: 'Payment Pending',
//       subtitle: 'Please complete your payment via Kuickpay.',
//     },
//     paid: {
//       icon: 'check-circle',
//       color: '#4CAF50',
//       bgColor: '#E8F5E9',
//       title: 'Payment Success!',
//       subtitle: 'Your payment was successful.',
//     },
//     expired: {
//       icon: 'clock-alert-outline',
//       color: '#F44336',
//       bgColor: '#FFEBEE',
//       title: 'Session Expired',
//       subtitle: 'Your consumer number has expired.',
//     },
//   };

//   const cfg = statusConfig[status];

//   return (
//     <View style={receiptStyles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9EFE6" />

//       <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ flex: 1, backgroundColor: '#F9EFE6' }}>
//         <View style={receiptStyles.scrollContent}>
//           {/* ── Status Icon ── */}
//           <Animated.View
//             style={[
//               receiptStyles.iconWrapper,
//               {
//                 backgroundColor: cfg.bgColor,
//                 transform: [{ scale: scaleAnim }],
//               },
//             ]}
//           >
//             <Icon name={cfg.icon} size={40} color={cfg.color} />
//           </Animated.View>

//           {/* ── Title ── */}
//           <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
//             <Text style={[receiptStyles.title, { color: cfg.color }]}>{cfg.title}</Text>
//             <Text style={receiptStyles.subtitle}>{cfg.subtitle}</Text>
//             {/* Cancel Button — only when pending */}
//             {status === 'pending' && (
//               <TouchableOpacity
//                 style={receiptStyles.cancelBtn}
//                 onPress={handleCancel}
//                 disabled={isCancelling}
//                 activeOpacity={0.7}
//               >
//                 {isCancelling ? (
//                   <ActivityIndicator size="small" color="#F44336" />
//                 ) : (
//                   <>
//                     <Icon name="close-circle-outline" size={16} color="#F44336" />
//                     <Text style={receiptStyles.cancelBtnText}>Cancel Bill Payment</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             )}
//           </Animated.View>
//           {!isPaid && (
//             <Animated.View
//               style={[
//                 receiptStyles.timerBanner,
//                 isExpired && receiptStyles.timerBannerExpired,
//                 { transform: [{ scale: secondsLeft <= 300 && !isExpired ? pulseAnim : 1 }] },
//               ]}
//             >
//               <Icon
//                 name={isExpired ? 'timer-off-outline' : 'timer-outline'}
//                 size={24}
//                 color={isExpired ? '#F44336' : '#FF9800'}
//               />
//               <View style={receiptStyles.timerTextWrap}>
//                 <Text style={receiptStyles.timerTitle}>
//                   {isExpired ? 'Session Expired' : 'Time Remaining'}
//                 </Text>
//                 <Text
//                   style={[
//                     receiptStyles.timerValue,
//                     isExpired && { color: '#F44336' },
//                     secondsLeft <= 300 && !isExpired && { color: '#F44336' },
//                   ]}
//                 >
//                   {isExpired ? '00:00' : formatTime(secondsLeft)}
//                 </Text>
//               </View>
//             </Animated.View>
//           )}
//           {/* ── Receipt Card ── */}
//           <Animated.View
//             style={[
//               receiptStyles.card,
//               { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
//             ]}
//           >
//             {/* Consumer Number */}
//             <Text style={receiptStyles.cardLabel}>Consumer Number</Text>
//             <View style={receiptStyles.consumerRow}>
//               <Text style={receiptStyles.consumerText}>
//                 {voucher?.consumer_number || '—'}
//               </Text>
//               <TouchableOpacity
//                 onPress={handleCopy}
//                 disabled={isExpired || isPaid}
//                 style={[
//                   receiptStyles.copyBtn,
//                   (isExpired || isPaid) && { opacity: 0.35 },
//                 ]}
//                 activeOpacity={0.6}
//               >
//                 <Icon
//                   name={copied ? 'check-circle' : 'content-copy'}
//                   size={20}
//                   color={copied ? '#4CAF50' : '#C9A962'}
//                 />
//               </TouchableOpacity>
//             </View>
//             {copied && (
//               <Text style={receiptStyles.copiedLabel}>Copied to clipboard!</Text>
//             )}

//             {/* Divider */}
//             <View style={receiptStyles.divider} />

//             {/* Amount */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Amount</Text>
//               <Text style={receiptStyles.rowValueBold}>
//                 Rs {voucher?.amount ? Number(voucher.amount).toLocaleString() : '0'}
//               </Text>
//             </View>

//             {/* Status */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Status</Text>
//               <View style={[receiptStyles.statusBadge, { backgroundColor: cfg.bgColor }]}>
//                 <Text style={[receiptStyles.statusBadgeText, { color: cfg.color }]}>
//                   {status === 'pending' ? 'Pending' : status === 'paid' ? 'Success' : 'Expired'}
//                 </Text>
//               </View>
//             </View>

//             <View style={receiptStyles.dividerLight} />

//             {/* Member Name */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Member Name</Text>
//               <Text style={receiptStyles.rowValue}>{memberName || '—'}</Text>
//             </View>

//             {/* Membership Number */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Membership No.</Text>
//               <Text style={receiptStyles.rowValue}>{memNo || '—'}</Text>
//             </View>

//             {/* Payment Method */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Payment Method</Text>
//               <Text style={receiptStyles.rowValue}>Kuickpay</Text>
//             </View>

//             {/* Generation Time */}
//             <View style={receiptStyles.row}>
//               <Text style={receiptStyles.rowLabel}>Generated</Text>
//               <Text style={receiptStyles.rowValue}>
//                 {formattedDate}, {formattedTime}
//               </Text>
//             </View>
//           </Animated.View>

//           {/* ── Timer Banner ── */}


//           {/* ── Spacer pushes buttons to bottom ── */}
//           <View style={{ flex: 1 }} />

//           {/* ── Action Buttons ── */}
//           <View style={receiptStyles.actions}>
//             {/* Download Receipt */}
//             <TouchableOpacity
//               style={receiptStyles.outlineBtn}
//               onPress={handleDownloadReceipt}
//               disabled={downloadLoading}
//               activeOpacity={0.7}
//             >
//               {downloadLoading ? (
//                 <ActivityIndicator size="small" color="#C9A962" />
//               ) : (
//                 <>
//                   <Icon name="download-outline" size={18} color="#C9A962" />
//                   <Text style={receiptStyles.outlineBtnText}>Download Receipt</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {/* Back to Home - Only visible when paid */}
//             {isPaid && (
//               <TouchableOpacity
//                 style={receiptStyles.solidBtn}
//                 onPress={() => {
//                   navigation.reset({
//                     index: 0,
//                     routes: [{ name: 'start' }],
//                   });
//                 }}
//                 activeOpacity={0.7}
//               >
//                 <Icon name="home-outline" size={18} color="#fff" />
//                 <Text style={receiptStyles.solidBtnText}>Back to Home</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </ViewShot>
//     </View>
//   );
// };

// // ── Receipt Styles ──
// const receiptStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9EFE6',
//   },
//   scrollContent: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 36,
//     paddingBottom: 16,
//     alignItems: 'center',
//   },
//   iconWrapper: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: '#777',
//     textAlign: 'center',
//     marginBottom: 14,
//   },
//   // Card
//   card: {
//     width: '100%',
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.07,
//     shadowRadius: 8,
//     elevation: 4,
//     marginBottom: 12,
//   },
//   cardLabel: {
//     fontSize: 15,
//     color: '#888',
//     marginBottom: 6,
//     fontWeight: '600',
//   },
//   consumerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF9E6',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderWidth: 1.5,
//     borderColor: '#E8DDD0',
//   },
//   consumerText: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: '800',
//     color: '#222',
//     letterSpacing: 0.3,
//   },
//   copyBtn: {
//     padding: 4,
//     marginLeft: 6,
//   },
//   copiedLabel: {
//     fontSize: 11,
//     color: '#4CAF50',
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#EEE',
//     marginVertical: 10,
//   },
//   dividerLight: {
//     height: 1,
//     backgroundColor: '#F5F0EA',
//     marginVertical: 8,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   rowLabel: {
//     fontSize: 14,
//     color: '#888',
//   },
//   rowValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'right',
//     flexShrink: 1,
//     marginLeft: 12,
//   },
//   rowValueBold: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#222',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   statusBadgeText: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   // Timer
//   timerBanner: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFF3E0',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FFE0B2',
//   },
//   timerBannerExpired: {
//     backgroundColor: '#FFEBEE',
//     borderColor: '#FFCDD2',
//   },
//   timerTextWrap: {
//     marginLeft: 12,
//   },
//   timerTitle: {
//     fontSize: 12,
//     color: '#777',
//     fontWeight: '600',
//   },
//   timerValue: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#FF9800',
//     letterSpacing: 1,
//   },
//   // Buttons
//   actions: {
//     width: '100%',
//     gap: 10,
//   },
//   outlineBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#C9A962',
//     borderRadius: 12,
//     paddingVertical: 12,
//     gap: 8,
//     backgroundColor: '#FFF',
//   },
//   outlineBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#C9A962',
//   },
//   solidBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#b48a64',
//     borderRadius: 12,
//     paddingVertical: 12,
//     gap: 8,
//     shadowColor: '#b48a64',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   solidBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#FFF',
//   },
//   cancelBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     marginTop: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1.5,
//     borderColor: '#F4433620',
//     backgroundColor: '#FFF',
//     marginBottom: 10,
//   },
//   cancelBtnText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#F44336',
//   },
// });

// export { BillPaymentReceipt };
// export default Bills;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  Platform,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Image,
  Clipboard,
  BackHandler,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl, paymentAPI, listMonthlyBills } from '../config/apis';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { permissionService } from '../src/services/PermissionService';

const API_BASE_URL = getBaseUrl ? getBaseUrl() : 'https://admin.peshawarservicesclub.com/api';

// Returns a friendly message for server-side (5xx) or network failures
const getServerErrorMessage = (statusOrError) => {
  if (typeof statusOrError === 'number' && statusOrError >= 500) {
    return 'Service is temporarily unavailable. Please try again later.';
  }
  if (statusOrError instanceof Error) {
    // Network / connection errors
    if (
      statusOrError.message?.toLowerCase().includes('network') ||
      statusOrError.message?.toLowerCase().includes('failed to fetch') ||
      statusOrError.message?.toLowerCase().includes('timeout')
    ) {
      return 'Service is temporarily unavailable. Please try again later.';
    }
  }
  return null;
};

// API functions
const storeAuthData = async (tokens, userData) => {
  try {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    console.log('✅ Auth data stored');
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

const getMembershipNumberFromUserData = (userData) => {
  // Try different possible field names for membership number
  return userData?.Membership_No ||
    userData?.membershipNo ||
    userData?.membershipNumber ||
    userData?.memberId ||
    userData?.id ||
    '';
};

const Bills = ({ navigation }) => {
  const [membershipNumber, setMembershipNumber] = useState('');
  const [membershipName, setMembershipName] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Monthly Bill History states
  const [activeTab, setActiveTab] = useState('pay');
  const [historyBills, setHistoryBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [allBills, setAllBills] = useState([]);

  // Current year for dropdown
  const currentYear = new Date().getFullYear();

  // Balance Payment states
  const [amountToPay, setAmountToPay] = useState('');
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);
  // showVoucherModal removed — we navigate to BillPaymentReceipt instead

  // Payment apps for bank dropdown (for 1 Bill payment)
  const paymentApps = [
    { name: 'Easypaisa' },
    { name: 'JazzCash' },
    { name: 'HBL Mobile' },
    { name: 'Meezan Bank' },
    { name: 'UBL Digital' },
    { name: 'Bank Alfalah' },
    { name: 'MCB Mobile' },
    { name: 'Allied Bank' },
  ];

  // Payment modes - Only Cash and Kuickpay
  const paymentModes = [
    { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
    { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
  ];

  // Handle bank selection from dropdown
  const handleBankSelect = (bank) => {
    setSelectedBank(bank.name);
    setShowBankDropdown(false);
  };

  // Handle Generate Balance Voucher
  const handleGenerateBalanceVoucher = async () => {
    try {
      // Validate amount
      if (!amountToPay || amountToPay.trim() === '') {
        Alert.alert('Error', 'Please enter an amount to pay');
        return;
      }

      const paymentAmount = Number(amountToPay);

      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (paymentAmount > memberData.Balance) {
        Alert.alert('Error', `Amount exceeds your balance of Rs ${memberData.Balance.toLocaleString()}`);
        return;
      }

      setIsGeneratingVoucher(true);

      const token = await getAuthToken();
      const membershipNo = membershipNumber;

      console.log('🔵 Generating balance voucher:', { amountToPay: paymentAmount, membership_no: membershipNo });

      const response = await fetch(
        `${API_BASE_URL}/payment/generate/invoice/balance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amountToPay: String(paymentAmount),
            membership_no: membershipNo,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        console.log('✅ Voucher generated successfully:', responseData);

        const voucherData = responseData.voucher || responseData;
        setGeneratedVoucher(voucherData);

        // Clear the input
        setAmountToPay('');

        // Navigate to the receipt screen
        navigation.navigate('BillPaymentReceipt', {
          voucher: voucherData,
          memberName: membershipName,
          membershipNumber: membershipNumber,
        });
      } else {
        console.error('❌ Voucher generation failed:', responseData);

        const serverMsg = getServerErrorMessage(response.status);
        if (serverMsg) {
          Alert.alert('Service Unavailable', serverMsg);
        } else {
          // Handle specific error cases
          const errorMessage = responseData.message || responseData.error || 'Failed to generate payment code';

          if (errorMessage.includes('Member not found')) {
            Alert.alert('Error', 'Member not found. Please contact support.');
          } else if (errorMessage.includes('Amount exceeds')) {
            Alert.alert('Error', 'Amount exceeds your balance. Please enter a lower amount.');
          } else if (errorMessage.includes('Invalid amount')) {
            Alert.alert('Error', 'Invalid amount entered. Please try again.');
          } else {
            Alert.alert('Error', errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error generating voucher:', error);
      const serverMsg = getServerErrorMessage(error);
      Alert.alert(
        serverMsg ? 'Service Unavailable' : 'Error',
        serverMsg || 'Failed to generate payment code. Please try again.',
      );
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  // Copy consumer number to clipboard
  const copyConsumerNumber = () => {
    if (generatedVoucher?.consumer_number) {
      Clipboard.setString(String(generatedVoucher.consumer_number));
      Alert.alert('Copied!', 'Consumer number copied to clipboard');
    }
  };

  // Monthly Bill History functions
  const fetchBills = async () => {
    if (!membershipNumber) return;
    
    try {
      setLoading(true);
      console.log(`📋 Fetching all bills for month: ${selectedMonth}, year: ${selectedYear}`);
      
      // Fetch ALL bills for the selected month/year
      const billsData = await listMonthlyBills(selectedMonth, selectedYear);
      console.log('📦 All bills received:', billsData);
      
      // Store all bills
      const billsArray = Array.isArray(billsData) ? billsData : [billsData].filter(Boolean);
      setAllBills(billsArray);
      
      // CLIENT-SIDE FILTERING: Filter bills for current user only using DATA-DRIVEN INTEGER COMPARISON
      // 1. Sanitize the user's ID to a clean string
      const targetId = String(membershipNumber).replace(/[^0-9]/g, '');
      
      console.log(`🔍 User Membership Number: ${membershipNumber} → Target ID: ${targetId}`);
      
      const myBills = billsArray.filter(bill => {
        // 2. Use the dedicated membershipNo field from the API if it exists
        // If not, fall back to extracting it from the filename strictly
        const billMemberId = bill.membershipNo 
          ? String(bill.membershipNo).replace(/[^0-9]/g, '')
          : (bill.filename || "").split('_')[0].replace(/[^0-9]/g, '');

        // 3. EXACT INTEGER COMPARISON
        // This ensures '3' NEVER matches '803'
        const isMatch = parseInt(billMemberId, 10) === parseInt(targetId, 10);

        console.log(`Comparing: Bill ID (${billMemberId}) with User ID (${targetId}) -> Match: ${isMatch}`);
        
        return isMatch;
      });
      
      console.log(`✅ Filtered to ${myBills.length} bills for member ${membershipNumber}`);
      setHistoryBills(myBills);
      
    } catch (err) {
      console.error('❌ Error fetching bills:', err);
      const serverMsg = getServerErrorMessage(err);
      Alert.alert(
        serverMsg ? 'Service Unavailable' : 'Error',
        serverMsg || err.message || 'Failed to fetch bills',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = async (bill) => {
    try {
      console.log('📄 Opening bill:', bill);
      
      // Construct full URL from relative path
      let fullUrl = bill.url;
      if (!fullUrl) {
        Alert.alert('Error', 'Bill URL not available');
        return;
      }
      
      // Ensure URL starts with http/https - ROBUST URL HANDLING
      if (fullUrl.startsWith('/')) {
        // Remove/api from base URL and append the relative path
        const baseUrl = getBaseUrl().replace('/api', '');
        fullUrl = `${baseUrl}${fullUrl}`;
      } else if (!fullUrl.startsWith('http')) {
        fullUrl = `https://admin.peshawarservicesclub.com${fullUrl}`;
      }
      
      console.log('🔗 Full bill URL:', fullUrl);
      
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        // Fallback: Try opening anyway
        try {
          await Linking.openURL(fullUrl);
        } catch (fallbackErr) {
          Alert.alert(
            'Cannot Open PDF',
            'Unable to open the PDF. Please try downloading instead.',
            [{ text: 'OK' }]
          );
          console.error('❌ Fallback also failed:', fallbackErr);
        }
      }
    } catch (err) {
      console.error('❌ Error opening bill:', err);
      Alert.alert(
        'Error', 
        'Failed to open bill PDF. Please try downloading instead.'
      );
    }
  };

  const handleDownloadBill = async (bill) => {
    try {
      console.log('📥 Downloading bill:', bill);
      
      // Construct full URL from relative path
      let fullUrl = bill.url;
      if (!fullUrl) {
        Alert.alert('Error', 'Bill URL not available');
        return;
      }
      
      // Ensure URL starts with http/https - ROBUST URL HANDLING
      if (fullUrl.startsWith('/')) {
        // Remove/api from base URL and append the relative path
        const baseUrl = getBaseUrl().replace('/api', '');
        fullUrl = `${baseUrl}${fullUrl}`;
      } else if (!fullUrl.startsWith('http')) {
        fullUrl = `https://admin.peshawarservicesclub.com${fullUrl}`;
      }
      
      console.log('🔗 Full bill URL for download:', fullUrl);
      
      // For React Native without RNFS/ expo-sharing, use this approach
      // This opens the PDF which user can then save from browser
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
        setTimeout(() => {
          Alert.alert(
            'Download Started',
            'The PDF has been opened in your browser. You can save it from there by:\n\n1. Tapping the share/download icon\n2. Selecting "Save to Files" or "Download"',
            [{ text: 'OK' }]
          );
        }, 500);
      } else {
        // Try opening anyway as fallback
        try {
          await Linking.openURL(fullUrl);
          setTimeout(() => {
            Alert.alert(
              'Download Started',
              'The PDF has been opened in your browser. You can save it from there.',
              [{ text: 'OK' }]
            );
          }, 500);
        } catch (fallbackErr) {
          Alert.alert('Error', `Cannot open URL: ${fullUrl}`);
        }
      }
    } catch (err) {
      console.error('❌ Error downloading bill:', err);
      Alert.alert(
        'Error', 
        'Failed to download bill. Please try again later.'
      );
    }
  };

  // Check user role and initialize
  const initializeApp = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();

      if (!userData) {
        Alert.alert('Error', 'Please login first');
        navigation.navigate('Login');
        return;
      }

      // Check if user is admin based on role field
      const role = userData?.role || userData?.Role || 'MEMBER';
      setUserRole(role);
      const isUserAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'admin';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // For admin, don't auto-fetch member data
        setLoading(false);
      } else {
        // For member, fetch their own data
        fetchMemberData(userData);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      const serverMsg = getServerErrorMessage(error);
      Alert.alert(
        serverMsg ? 'Service Unavailable' : 'Error',
        serverMsg || 'Failed to initialize app',
      );
      setLoading(false);
    }
  };

  // Fetch member data
  const fetchMemberData = async (userData) => {
    try {
      const token = await getAuthToken();
      const memberId = getMembershipNumberFromUserData(userData);

      if (!memberId) {
        Alert.alert('Error', 'No membership number found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching data for membership:', memberId);

      const response = await fetch(
        `${API_BASE_URL}/member/get/members?membershipNo=${memberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Find the EXACT match for the membership number
          const exactMember = data.data.find(
            m => m.Membership_No === memberId ||
              m.membershipNo === memberId ||
              String(m.Membership_No) === String(memberId)
          );

          // If exact match found, use it. Otherwise fall back to first result
          const member = exactMember || data.data[0];

          console.log('✅ Found member:', member.Name, 'with ID:', member.Membership_No);

          setMemberData(member);
          setMembershipNumber(member.Membership_No);
          setMembershipName(member.Name);

          // Fetch additional data
          fetchMemberVouchers(member.Membership_No);
          fetchMemberBookings(member.Membership_No);
        } else {
          Alert.alert('Error', 'Member data not found');
        }
      } else {
        const serverMsg = getServerErrorMessage(response.status);
        Alert.alert(
          serverMsg ? 'Service Unavailable' : 'Error',
          serverMsg || 'Failed to fetch member data',
        );
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      const serverMsg = getServerErrorMessage(error);
      Alert.alert(
        serverMsg ? 'Service Unavailable' : 'Error',
        serverMsg || 'Failed to load member data',
      );
    } finally {
      setLoading(false);
    }
  };

  // Search members (admin only)
  const searchMembers = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter search term');
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/member/get/members?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const member = data.data[0];
          setMemberData(member);
          setMembershipNumber(member.Membership_No);
          setMembershipName(member.Name);
          setSearchTerm('');

          // Fetch additional data for the selected member
          fetchMemberVouchers(member.Membership_No);
          fetchMemberBookings(member.Membership_No);
        } else {
          Alert.alert('Not Found', 'No member found with that search term');
        }
      } else {
        const serverMsg = getServerErrorMessage(response.status);
        Alert.alert(
          serverMsg ? 'Service Unavailable' : 'Error',
          serverMsg || 'Failed to search members',
        );
      }
    } catch (error) {
      console.error('Error searching members:', error);
      const serverMsg = getServerErrorMessage(error);
      Alert.alert(
        serverMsg ? 'Service Unavailable' : 'Error',
        serverMsg || 'Failed to search members',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberVouchers = async (membershipNo) => {
    if (!membershipNo) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/payment/member/vouchers?membershipNo=${membershipNo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const vouchers = await response.json();
        console.log('Vouchers:', vouchers);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchMemberBookings = async (membershipNo) => {
    if (!membershipNo) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/booking/member/bookings?membershipNo=${membershipNo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const bookings = await response.json();
        console.log('Bookings:', bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // Fetch bills when month/year changes
  useEffect(() => {
    if (membershipNumber && activeTab === 'history') {
      fetchBills();
    }
  }, [selectedMonth, selectedYear, membershipNumber, activeTab]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'CONFIRMED':
      case 'ACTIVE':
        return <Text style={styles.statusBadgePaid}>{status}</Text>;
      case 'HALF_PAID':
      case 'PENDING':
        return <Text style={styles.statusBadgeHalfPaid}>{status}</Text>;
      case 'UNPAID':
      case 'INACTIVE':
        return <Text style={styles.statusBadgeUnpaid}>{status}</Text>;
      default:
        return <Text style={styles.statusBadge}>{status}</Text>;
    }
  };

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year ± 2)
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  // Render bill item for FlatList
  const renderBillItem = ({ item }) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <Icon name="file-pdf-box" size={28} color="#b48a64" />
        <View style={styles.billInfo}>
          <Text style={styles.billFilename} numberOfLines={1}>
            {item.filename || `Bill_${selectedMonth}_${selectedYear}.pdf`}
          </Text>
          <Text style={styles.billPeriod}>
            {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
          </Text>
        </View>
      </View>
      
      <View style={styles.billActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewBill(item)}
        >
          <Icon name="eye-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => handleDownloadBill(item)}
        >
          <Icon name="download" size={20} color="#b48a64" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-remove-outline" size={80} color="#999" />
      <Text style={styles.emptyTitle}>No Bills Found</Text>
      <Text style={styles.emptyText}>
        There are no bills found for {monthNames[parseInt(selectedMonth) - 1] || ''} {selectedYear || ''}
        {membershipNumber ? ` for membership ${membershipNumber}` : ''}.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b48a64" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* 🔹 Notch Header with Background Image */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Bill Payment</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={initializeApp}
          >
            <Icon name="refresh" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content Container with Beige Background */}
        <View style={styles.contentWrapper}>
        {/* Role Badge */}
        {/* <View style={styles.roleBadgeContainer}>
          <Text style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.memberBadge]}>
            {isAdmin ? 'Super-Admin' : 'MEMBER'}
          </Text>
        </View> */}

        {/* Search Section - Only for Admin */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Member</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search by name or membership number"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchMembers}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
            {searchTerm && !memberData && (
              <Text style={styles.searchHint}>
                Enter a member's name or membership number to search
              </Text>
            )}
          </View>
        )}

        {/* User Information Section - Enhanced Member Info Card */}
        <View style={styles.memberInfoCard}>
          <Text style={styles.cardTitle}>
            {isAdmin ? 'Member Information' : 'Your Information'}
          </Text>

          {(!isAdmin || (isAdmin && memberData)) ? (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoLabel}>Membership Number</Text>
                </View>
                <View style={styles.infoValueContainer}>
                  <TextInput
                    style={styles.infoInput}
                    value={membershipNumber}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoLabel}>Member Name</Text>
                </View>
                <View style={styles.infoValueContainer}>
                  <TextInput
                    style={styles.infoInput}
                    value={membershipName}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              {memberData && (
                <View style={styles.balanceCard}>
                  <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    {getStatusBadge(memberData.Status)}
                  </View>
                  <Text style={[
                    styles.balanceAmountDisplay,
                    memberData.Balance < 0 && styles.negativeBalanceDisplay
                  ]}>
                    Rs {memberData.Balance?.toLocaleString() || 0}
                  </Text>
                  
                  {memberData.totalBookings !== undefined && (
                    <View style={styles.bookingsRow}>
                      <Text style={styles.bookingsLabel}>Total Bookings:</Text>
                      <Text style={styles.bookingsValue}>{memberData.totalBookings || 0}</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : isAdmin ? (
            <View style={styles.noMemberContainer}>
              <Text style={styles.noMemberText}>
                Search for a member to view their information
              </Text>
            </View>
          ) : (
            <View style={styles.noMemberContainer}>
              <Text style={styles.noMemberText}>
                Unable to load member information
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeApp}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Custom Payment Section - Enhanced Layout */}
        {!isAdmin && memberData && (
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Custom Payment</Text>

            <View style={styles.paymentInputGroup}>
              <Text style={styles.paymentLabel}>Amount to Pay (Rs)</Text>
              <TextInput
                style={styles.paymentInput}
                value={amountToPay}
                onChangeText={setAmountToPay}
                placeholder="Enter amount (e.g., 5000)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isGeneratingVoucher}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.generateVoucherButton,
                (!amountToPay || Number(amountToPay) <= 0 || Number(amountToPay) > memberData.Balance) && styles.disabledButton
              ]}
              onPress={handleGenerateBalanceVoucher}
              disabled={isGeneratingVoucher || !amountToPay || Number(amountToPay) <= 0 || Number(amountToPay) > memberData.Balance}
            >
              {isGeneratingVoucher ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.generateVoucherButtonText}>Generate Consumer Number</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.paymentNote}>
              Amount cannot exceed your current balance
            </Text>
          </View>
        )}

        {/* View Monthly Bills Button */}
        {!isAdmin && memberData && (
          <View style={styles.viewBillsButtonContainer}>
            <TouchableOpacity
              style={styles.viewBillsButton}
              onPress={() => navigation.navigate('MonthlyBillHistory', { 
                membershipNumber: membershipNumber,
                membershipName: membershipName 
              })}
              activeOpacity={0.7}
            >
              <Icon name="file-document-outline" size={24} color="#FFF" style={styles.viewBillsIcon} />
              <Text style={styles.viewBillsButtonText}>View Monthly Bills</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab 1: Pay Current Bill */}
        {activeTab === 'pay' && !isAdmin && memberData && (
          <>
            {/* BILL PAYMENT VIA MOBILE APP & OTHER PAYMENT MODES */}
            <View style={styles.section}>
              <Text style={styles.proceduresTitle}>BILL PAYMENT VIA MOBILE APP & OTHER PAYMENT MODES</Text>

              <Text style={styles.procedureItem}>
                This guide explains the step-by-step procedure for bill payment through the mobile application of Peshawar Services Club, along with alternative payment options available for members.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                1. Mobile App Payment Procedure (via Kuick Pay)
              </Text>

              <Text style={styles.procedureItem}>
                Please note that payment through the mobile app is processed using Kuick Pay services via your personal bank application. Members may pay in advance, partially, or the exact billed amount.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                • Steps to Pay:
              </Text>
              <Text style={styles.procedureItem}>
                1. Open the Club Mobile App and click "Pay Now."{'\n'}
                2. Enter the amount you wish to pay.{'\n'}
                3. A unique payment code will be generated.{'\n'}
                4. Open your personal bank's mobile app.{'\n'}
                5. Select the Kuick Pay payment option.{'\n'}
                6. Enter or paste the unique payment code.{'\n'}
                7. Confirm payment.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                • After Payment:
              </Text>
              <Text style={styles.procedureItem}>
                ✓ You will receive a payment confirmation message on PSC mobile app.{'\n'}
                ✓ Payment will be reflected in the Club system on the next working day.{'\n'}
                ✓ All transactions will be automatically recorded in the app payment history.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                2. Other Modes of Payment
              </Text>

              <Text style={styles.procedureItemHighlight}>
                A. HBL Bill Payment (via HBL Mobile App)
              </Text>
              <Text style={styles.procedureItem}>
                1. Open the HBL mobile app.{'\n'}
                2. Go to More → Other Payments → Corporate Payments.{'\n'}
                3. Search for Peshawar Services Club.{'\n'}
                4. Enter your Membership Number.{'\n'}
                5. Review bill details and enter payment amount.{'\n'}
                6. Confirm the transaction.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                Note:
              </Text>
              <Text style={styles.procedureItem}>
                ✓ You will receive confirmation on your banking app.{'\n'}
                ✓ Payment will be reflected in the Club system on the next working day.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                B. POS (Card) Payment
              </Text>
              <Text style={styles.procedureItem}>
                • Visit the Accounts Department during office hours.{'\n'}
                • Pay via credit or debit card using the POS machine.{'\n'}
                • Payment will be recorded immediately and reflected in the system accordingly.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                C. Cash Payment
              </Text>
              <Text style={styles.procedureItem}>
                • Visit the Accounts Department during office hours.{'\n'}
                • Pay outstanding dues in cash.{'\n'}
                • Payment will be reflected instantly.
              </Text>

              <Text style={styles.procedureItemHighlight}>
                D. Cheque Payment
              </Text>
              <Text style={styles.procedureItem}>
                • Submit cheque in favour (Title) of "Secretary PSC" at the Accounts Department.{'\n'}
                • Payment will be reflected after 2–3 working days (subject to cheque clearance).
              </Text>

              <Text style={styles.procedureItemHighlight}>
                3. Terms & Conditions
              </Text>
              <Text style={styles.procedureItem}>
                • Updated outstanding balances will be available on the mobile app on the next working day after payment.{'\n'}
                • Monthly bills are generated on the 1st of every month.{'\n'}
                • Members are requested to clear dues before the 25th of each month.{'\n'}
                • 5% surcharge will be applied if payment is not made before the due date.{'\n'}
                • Updated bills and previous month bills can be viewed in the mobile app.{'\n'}
                • The mobile app and banking platforms will display outstanding balances of active members only. Members with suspended, terminated, absent, or cancelled status may contact the Accounts Office for bill inquiries.{'\n'}
                • For any clarification regarding billing, members may contact the Accounts Department during office hours.{'\n'}
                • For further information, please visit or call 091-9212753-4
              </Text>
            </View>
          </>
        )}

        {/* Tab 2: Monthly History */}
        {activeTab === 'history' && !isAdmin && memberData && (
          <View style={styles.section}>
            {/* Filter Section */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Icon name="filter" size={20} color="#b48a64" />
                <Text style={styles.filterTitle}>Filter Period</Text>
              </View>

              <View style={styles.filterRow}>
                {/* Month Selector */}
                <View style={styles.filterField}>
                  <Text style={styles.filterLabel}>Month</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {monthNames[parseInt(selectedMonth) - 1]}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#b48a64" />
                  </TouchableOpacity>
                </View>

                {/* Year Selector */}
                <View style={styles.filterField}>
                  <Text style={styles.filterLabel}>Year</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {selectedYear}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#b48a64" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Membership Info */}
              <View style={styles.membershipInfo}>
                <Icon name="account" size={16} color="#b48a64" />
                <Text style={styles.membershipText}>
                  Membership: {membershipNumber || 'Loading...'}
                </Text>
              </View>
            </View>

            {/* Bills List */}
            {loading ? (
              <View style={styles.loadingBillContainer}>
                <ActivityIndicator size="large" color="#b48a64" />
                <Text style={styles.loadingBillText}>Loading Bills...</Text>
              </View>
            ) : (
              <FlatList
                data={historyBills}
                renderItem={renderBillItem}
                keyExtractor={(item, index) => item.id || item.filename || index.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyComponent}
              />
            )}
          </View>
        )}

        {/* Month Dropdown Modal */}
        <Modal
          visible={showMonthDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMonthDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMonthDropdown(false)}
          >
            <View style={styles.modalContent}>
              <ScrollView>
                {monthNames.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthOption,
                      selectedMonth === (index + 1).toString().padStart(2, '0') && styles.selectedMonthOption
                    ]}
                    onPress={() => {
                      setSelectedMonth((index + 1).toString().padStart(2, '0'));
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text style={styles.monthOptionText}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Year Dropdown Modal */}
        <Modal
          visible={showYearDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowYearDropdown(false)}
          >
            <View style={styles.modalContent}>
              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearOption,
                    selectedYear === year.toString() && styles.selectedYearOption
                  ]}
                  onPress={() => {
                    setSelectedYear(year.toString());
                    setShowYearDropdown(false);
                  }}
                >
                  <Text style={styles.yearOptionText}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>


        {/* Admin Message - Only for admin when member data is loaded */}
        {/* {isAdmin && memberData && (
          <View style={styles.section}>
            <Text style={styles.adminMessage}>
              Payment section is only available to members. As an admin, you can only view member information.
            </Text>
          </View>
        )} */}
        </View>
      </ScrollView>
    </View>
  );
};

// Payment modes data (these are only used for members)
const paymentModes = [
  { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
  { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
];

const handleBankSelect = (bank) => {
  // This function is only used in member context
  // We'll define this inside the component but it's only called for members
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
  },
  contentWrapper: {
    paddingVertical: 20,
  },
  scrollView: {
    backgroundColor: '#F5F1E9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
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
  backIcon: {
    fontSize: 36,
    color: '#000',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Role Badge Styles
  roleBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  adminBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
  },
  memberBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  // Professional Card Style
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#543A14',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  billTopUp: {
    color: '#666',
    fontSize: 14,
  },
  selectChannel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  // Search Styles (Admin)
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchButton: {
    backgroundColor: '#C9A962',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  searchHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F2E8DF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  // Enhanced Member Info Card Styles
  memberInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#543A14',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8E0',
  },
  infoLabelContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  infoValueContainer: {
    flex: 1.5,
  },
  infoInput: {
    backgroundColor: '#F2E8DF',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    textAlign: 'right',
  },
  balanceCard: {
    backgroundColor: '#F9EFE6',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  balanceAmountDisplay: {
    fontSize: 32,
    fontWeight: '800',
    color: '#B48A64',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  negativeBalanceDisplay: {
    color: '#E74C3C',
  },
  bookingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8DDD0',
  },
  bookingsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  bookingsValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  negativeBalance: {
    color: '#E74C3C',
  },
  statusBadge: {
    backgroundColor: '#4C7A57',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadgePaid: {
    backgroundColor: '#4C7A57',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeHalfPaid: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeUnpaid: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeContainer: {
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8DDD0',
    marginVertical: 20,
  },
  // No Member Styles
  noMemberContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noMemberText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#C9A962',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Dropdown Styles
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  // Payment Modes Styles
  paymentModesSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentModesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  paymentModesTitleGold: {
    color: '#C9A962',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A962',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#00A651',
    backgroundColor: '#F0F8F4',
  },
  paymentMethod: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A962',
  },
  paymentMethodSelected: {
    borderColor: '#00A651',
    backgroundColor: '#F0F8F4',
  },
  paymentIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIcon: {
    fontSize: 48,
  },
  paymentImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  paymentImage: {
    width: 100,
    height: 100,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 36,
  },
  methodLabel: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Procedures Styles
  proceduresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  proceduresSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  proceduresList: {
    paddingLeft: 4,
  },
  procedureItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  procedureItemHighlight: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },
  // Button Styles
  submitButton: {
    backgroundColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#C9A962',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Important Notice Styles
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noticeBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    borderRadius: 6,
  },
  noticeItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#C9A962',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Enhanced Payment Section Styles
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  paymentInputGroup: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentInput: {
    backgroundColor: '#F2E8DF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  generateVoucherButton: {
    backgroundColor: '#B48A64',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B48A64',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  generateVoucherButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // View Monthly Bills Button Styles
  viewBillsButtonContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  viewBillsButton: {
    backgroundColor: '#B48A64',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B48A64',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  viewBillsIcon: {
    marginRight: 12,
  },
  viewBillsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Voucher Modal Styles
  voucherModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  voucherDetails: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#C9A962',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  voucherRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8E0',
  },
  voucherLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  voucherValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  consumerNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  consumerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    backgroundColor: '#C9A962',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
    flexShrink: 0,
  },
  instructionText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    flex: 1,
    paddingTop: 2,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#C9A962',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
    lineHeight: 18,
  },
  closeModalButton: {
    backgroundColor: '#C9A962',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Admin Message
  adminMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  // Tab Switcher Styles - Professional Card
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#B48A64',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#543A14',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#B48A64',
    borderRadius: 3,
  },
  // History Filter Styles - Card Based
  filterSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2E8DF',
    padding: 15,
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E8E0',
  },
  membershipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  // Bill Card Styles - Professional Horizontal Layout
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E8DDD0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  billIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2E8DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  billInfo: {
    flex: 1,
  },
  billFilename: {
    fontSize: 16,
    fontWeight: '700',
    color: '#543A14',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  billPeriod: {
    fontSize: 12,
    color: '#999',
  },
  billActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B48A64',
    backgroundColor: 'transparent',
    gap: 8,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B48A64',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5E6D3',
    borderWidth: 2,
    borderColor: '#B48A64',
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B48A64',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 8,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#543A14',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  loadingBillContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingBillText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Dropdown Modal Styles
  monthOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedMonthOption: {
    backgroundColor: '#FFF9F0',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#333',
  },
  yearOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedYearOption: {
    backgroundColor: '#FFF9F0',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

// =============================================================================
// BillPaymentReceipt Screen
// =============================================================================

// =============================================================================
// BillPaymentReceipt Screen
// =============================================================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BillPaymentReceipt = ({ navigation, route }) => {
  const { voucher, memberName, membershipNumber: memNo } = route.params || {};

  // Timer: 1 hour = 3600 seconds
  const TIMER_DURATION = 3600;
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Refs
  const viewShotRef = useRef(null);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generation time – captured once when the screen mounts
  const generationTime = useRef(new Date()).current;

  // ── Entrance animation ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Pulse animation for timer when < 5 min ──
  useEffect(() => {
    if (secondsLeft <= 300 && secondsLeft > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [secondsLeft <= 300]);

  // ── Poll backend for payment status every 10 seconds ──
  useEffect(() => {
    if (isPaid || isExpired) return;
    const consumerNumber = voucher?.consumer_number;
    if (!consumerNumber) return;

    const checkPaymentStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        // Try /payment/member/vouchers first (returns all vouchers for this member)
        const vouchersRes = await fetch(
          `${API_BASE_URL}/payment/member/vouchers?membershipNo=${memNo}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (vouchersRes.ok) {
          const vouchersData = await vouchersRes.json();
          // vouchersData could be an array or { data: [...] }
          const list = Array.isArray(vouchersData)
            ? vouchersData
            : (vouchersData?.data || vouchersData?.vouchers || []);

          const match = list.find(v =>
            String(v.consumer_number || v.consumerNumber || v.consumer_no) ===
            String(consumerNumber)
          );

          if (match) {
            const paidStatuses = ['PAID', 'paid', 'CONFIRMED', 'confirmed', 'SUCCESS', 'success'];
            const voucherStatus = match.status || match.paymentStatus || match.payment_status || '';
            if (paidStatuses.includes(voucherStatus)) {
              console.log('✅ Payment confirmed via voucher polling!');
              setIsPaid(true);
              return;
            }
          }
        }

        // Fallback: check bill-payment-history
        const histRes = await fetch(
          `${API_BASE_URL}/payment/bill-payment-history/${memNo}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (histRes.ok) {
          const histData = await histRes.json();
          const histList = Array.isArray(histData)
            ? histData
            : (histData?.data || histData?.bills || []);

          const histMatch = histList.find(b =>
            String(b.consumer_number || b.consumerNo || b.invoice_number) ===
            String(consumerNumber)
          );

          if (histMatch) {
            console.log('✅ Payment confirmed via bill history!');
            setIsPaid(true);
          }
        }
      } catch (err) {
        console.log('⚠️ Payment status poll error:', err.message);
      }
    };

    // Check immediately on mount
    checkPaymentStatus();

    // Then poll every 10 seconds
    const pollInterval = setInterval(checkPaymentStatus, 10000);

    return () => clearInterval(pollInterval);
  }, [isPaid, isExpired, voucher?.consumer_number, memNo]);

  // ── Countdown timer ──
  useEffect(() => {
    if (isExpired || isPaid) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpired, isPaid]);

  // ── Navigation guard ──
  useEffect(() => {
    const onBackPress = () => {
      if (isPaid) {
        // Payment done — go back to start freely
        navigation.reset({ index: 0, routes: [{ name: 'start' }] });
        return true;
      }
      showLeaveAlert();
      return true; // prevent default
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isPaid) return; // allow leaving after payment
      e.preventDefault();
      showLeaveAlert(() => navigation.dispatch(e.data.action));
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation, isPaid]);

  const showLeaveAlert = (onConfirm) => {
    Alert.alert(
      'Leave Payment?',
      'Leaving this screen will cancel your active consumer session. Do you wish to proceed?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            if (onConfirm) {
              onConfirm();
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // ── Copy handler ──
  const handleCopy = () => {
    if (isExpired || isPaid) return;
    if (voucher?.consumer_number) {
      Clipboard.setString(String(voucher.consumer_number));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Cancel handler ──
  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this bill payment? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              const voucherId = voucher?.id || voucher?.voucherId || voucher?.invoice_id;
              if (!voucherId) {
                Alert.alert('Error', 'Voucher ID not found.');
                return;
              }
              await paymentAPI.cancelBalanceVoucher(voucherId);
              Alert.alert('Cancelled', 'Your bill payment has been cancelled.', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              const msg = error?.response?.data?.message || error?.message || 'Failed to cancel payment.';
              Alert.alert('Error', msg);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  // ── Download handler ──
  const handleDownloadReceipt = async () => {
    try {
      setDownloadLoading(true);

      const hasPermission = await permissionService.requestPhotoLibraryPermission();
      if (!hasPermission) {
        permissionService.handlePermissionDenied();
        return;
      }

      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1.0,
        });

        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('Success', 'Receipt saved to gallery successfully!');
      } else {
        Alert.alert('Error', 'Capture reference not found.');
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Helpers ──
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const formattedDate = generationTime.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = generationTime.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Determine status
  const getStatus = () => {
    if (isExpired) return 'expired';
    if (isPaid) return 'paid';
    return 'pending';
  };

  const status = getStatus();

  const statusConfig = {
    pending: {
      icon: 'clock-outline',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      title: 'Payment Pending',
      subtitle: 'Please complete your payment via Kuickpay.',
    },
    paid: {
      icon: 'check-circle',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      title: 'Payment Success!',
      subtitle: 'Your payment was successful.',
    },
    expired: {
      icon: 'clock-alert-outline',
      color: '#F44336',
      bgColor: '#FFEBEE',
      title: 'Session Expired',
      subtitle: 'Your consumer number has expired.',
    },
  };

  const cfg = statusConfig[status];

  return (
    <View style={receiptStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9EFE6" />

      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={{ flex: 1, backgroundColor: '#F9EFE6' }}>
        <View style={receiptStyles.scrollContent}>
          {/* ── Status Icon ── */}
          <Animated.View
            style={[
              receiptStyles.iconWrapper,
              {
                backgroundColor: cfg.bgColor,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Icon name={cfg.icon} size={40} color={cfg.color} />
          </Animated.View>

          {/* ── Title ── */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[receiptStyles.title, { color: cfg.color }]}>{cfg.title}</Text>
            <Text style={receiptStyles.subtitle}>{cfg.subtitle}</Text>
          </Animated.View>
          {!isPaid && !isExpired && (
            <View style={receiptStyles.timerWrapper}>
              <View style={receiptStyles.timerContainer}>
                <Icon name="clock-outline" size={16} color="#dc3545" />
                <Text style={receiptStyles.timerText}> Expires in: {formatTime(secondsLeft)}</Text>
              </View>
              <TouchableOpacity
                style={receiptStyles.cancelVoucherGhostButton}
                onPress={handleCancel}
                disabled={isCancelling}
                activeOpacity={0.7}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <>
                    <Icon name="close" size={14} color="#666" />
                    <Text style={receiptStyles.cancelVoucherGhostText}>Cancel Bill Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          {isExpired && (
            <View style={receiptStyles.timerWrapper}>
              <View style={receiptStyles.timerContainer}>
                <Icon name="alert-outline" size={16} color="#dc3545" />
                <Text style={receiptStyles.timerText}> EXPIRED</Text>
              </View>
            </View>
          )}
          {/* ── Receipt Card ── */}
          <Animated.View
            style={[
              receiptStyles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Consumer Number */}
            <Text style={receiptStyles.cardLabel}>Consumer Number</Text>
            <View style={receiptStyles.consumerRow}>
              <Text style={receiptStyles.consumerText}>
                {voucher?.consumer_number || '—'}
              </Text>
              <TouchableOpacity
                onPress={handleCopy}
                disabled={isExpired || isPaid}
                style={[
                  receiptStyles.copyBtn,
                  (isExpired || isPaid) && { opacity: 0.35 },
                ]}
                activeOpacity={0.6}
              >
                <Icon
                  name={copied ? 'check-circle' : 'content-copy'}
                  size={20}
                  color={copied ? '#4CAF50' : '#C9A962'}
                />
              </TouchableOpacity>
            </View>
            {copied && (
              <Text style={receiptStyles.copiedLabel}>Copied to clipboard!</Text>
            )}

            {/* Divider */}
            <View style={receiptStyles.divider} />

            {/* Amount */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Amount</Text>
              <Text style={receiptStyles.rowValueBold}>
                Rs {voucher?.amount ? Number(voucher.amount).toLocaleString() : '0'}
              </Text>
            </View>

            {/* Status */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Status</Text>
              <View style={[receiptStyles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                <Text style={[receiptStyles.statusBadgeText, { color: cfg.color }]}>
                  {status === 'pending' ? 'Pending' : status === 'paid' ? 'Success' : 'Expired'}
                </Text>
              </View>
            </View>

            <View style={receiptStyles.dividerLight} />

            {/* Member Name */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Member Name</Text>
              <Text style={receiptStyles.rowValue}>{memberName || '—'}</Text>
            </View>

            {/* Membership Number */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Membership No.</Text>
              <Text style={receiptStyles.rowValue}>{memNo || '—'}</Text>
            </View>

            {/* Payment Method */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Payment Method</Text>
              <Text style={receiptStyles.rowValue}>Kuickpay</Text>
            </View>

            {/* Generation Time */}
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.rowLabel}>Generated</Text>
              <Text style={receiptStyles.rowValue}>
                {formattedDate}, {formattedTime}
              </Text>
            </View>
          </Animated.View>

          {/* ── Timer Banner ── */}


          {/* ── Spacer pushes buttons to bottom ── */}
          <View style={{ flex: 1 }} />

          {/* ── Action Buttons ── */}
          <View style={receiptStyles.actions}>
            {/* Download Receipt */}
            <TouchableOpacity
              style={receiptStyles.outlineBtn}
              onPress={handleDownloadReceipt}
              disabled={downloadLoading}
              activeOpacity={0.7}
            >
              {downloadLoading ? (
                <ActivityIndicator size="small" color="#C9A962" />
              ) : (
                <>
                  <Icon name="download-outline" size={18} color="#C9A962" />
                  <Text style={receiptStyles.outlineBtnText}>Download Receipt</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back to Home - Only visible when paid */}
            {isPaid && (
              <TouchableOpacity
                style={receiptStyles.solidBtn}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'start' }],
                  });
                }}
                activeOpacity={0.7}
              >
                <Icon name="home-outline" size={18} color="#fff" />
                <Text style={receiptStyles.solidBtnText}>Back to Home</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ViewShot>
    </View>
  );
};

// ── Receipt Styles ──
const receiptStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginBottom: 14,
  },
  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  consumerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
  },
  consumerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#222',
    letterSpacing: 0.3,
  },
  copyBtn: {
    padding: 4,
    marginLeft: 6,
  },
  copiedLabel: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F5F0EA',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: '#888',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  rowValueBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Timer
  timerWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
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
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
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
     backgroundColor: '#FFFFFF',
  },
  cancelVoucherGhostText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  // Buttons
  actions: {
    width: '100%',
    gap: 10,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C9A962',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFF',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C9A962',
  },
  solidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b48a64',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#b48a64',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  solidBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F4433620',
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
  },
});

export { BillPaymentReceipt };
export default Bills;