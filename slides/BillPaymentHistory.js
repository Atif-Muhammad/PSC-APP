// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   ImageBackground,
//   RefreshControl,
//   Alert,
//   StatusBar,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useFocusEffect } from '@react-navigation/native';
// import { getBillPaymentHistory, getUserData } from '../config/apis';
// import { useAuth } from '../src/auth/contexts/AuthContext';

// export default function BillPaymentHistory({ navigation }) {
//   const { user } = useAuth();
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [expandedId, setExpandedId] = useState(null);

//   const toggleExpand = (id) => {
//     setExpandedId(prev => (prev === id ? null : id));
//   };

//   const membershipNo =
//     user?.membershipNo ||
//     user?.membership_no ||
//     user?.Membership_No ||
//     user?.id;

//   const fetchBillHistory = async (isRefreshing = false) => {
//     if (!membershipNo) {
//       setError('Membership number not found. Please login again.');
//       return;
//     }

//     try {
//       isRefreshing ? setRefreshing(true) : setLoading(true);
//       setError(null);

//       const data = await getBillPaymentHistory(membershipNo);

//       // Handle various response formats
//       let billList = [];
//       if (Array.isArray(data)) {
//         billList = data;
//       } else if (data?.data && Array.isArray(data.data)) {
//         billList = data.data;
//       } else if (data?.bills && Array.isArray(data.bills)) {
//         billList = data.bills;
//       } else if (data && typeof data === 'object') {
//         billList = [data];
//       }

//       // Sort by date descending (most recent first)
//       billList.sort((a, b) => {
//         const dateA = new Date(a.paidAt || a.createdAt || a.date || 0);
//         const dateB = new Date(b.paidAt || b.createdAt || b.date || 0);
//         return dateB - dateA;
//       });

//       setBills(billList);
//     } catch (err) {
//       console.error('Error fetching bill payment history:', err);
//       setError('Failed to load bill payment history. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchBillHistory();
//     }, [membershipNo])
//   );

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'N/A';
//       return date.toLocaleDateString('en-US', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });
//     } catch {
//       return 'N/A';
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return 'Rs. 0';
//     const num = parseFloat(amount);
//     if (isNaN(num)) return 'Rs. 0';
//     return `Rs. ${num.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
//   };

//   const getBillTypeLabel = (bill) => {
//     const type =
//       bill?.billType ||
//       bill?.type ||
//       bill?.category ||
//       bill?.bookingType ||
//       'Bill';
//     return String(type).replace(/_/g, ' ');
//   };

//   const getBillTypeIcon = (bill) => {
//     const type = String(
//       bill?.billType || bill?.type || bill?.category || bill?.bookingType || ''
//     ).toUpperCase();

//     if (type.includes('ROOM')) return 'bed';
//     if (type.includes('HALL')) return 'door-open';
//     if (type.includes('LAWN')) return 'grass';
//     if (type.includes('PHOTO') || type.includes('SHOOT')) return 'camera';
//     if (type.includes('MESS') || type.includes('FOOD')) return 'silverware-fork-knife';
//     if (type.includes('SPORT')) return 'run';
//     return 'receipt';
//   };

//   const renderBillCard = ({ item, index }) => {
//     const billDate = item.paidAt || item.createdAt || item.date;
//     const amount = item.amount || item.totalAmount || item.totalPrice || item.price || 0;
//     const billNo = item.billNo || item.invoiceNo || item.invoiceNumber || item.id || `#${index + 1}`;
//     const consumerNo = item.consumer_number || item.consumerNo || item.invoice_number || item.payment_id || 'N/A';
//     const description = item.description || item.remarks || item.note || null;
//     const cardId = String(item.id || item.billNo || item.invoiceNo || index);
//     const isExpanded = expandedId === cardId;

//     return (
//       <View style={styles.card}>
//         {/* ── Collapsed row (always visible) ── */}
//         <TouchableOpacity
//           style={styles.cardCollapsed}
//           onPress={() => toggleExpand(cardId)}
//           activeOpacity={0.7}
//         >
//           <View style={styles.iconCircle}>
//             <Icon name={getBillTypeIcon(item)} size={22} color="#C9A962" />
//           </View>

//           <View style={styles.cardTitleBlock}>
//             <Text style={styles.billType}>{getBillTypeLabel(item)}</Text>
//             <Text style={styles.billDate}>{formatDate(billDate)}</Text>
//           </View>

//           <View style={styles.collapsedRight}>
//             <View style={styles.paidBadge}>
//               <Icon name="check-circle" size={13} color="#00A651" />
//               <Text style={styles.paidBadgeText}>PAID</Text>
//             </View>
//             <Text style={styles.collapsedAmount}>{formatCurrency(amount)}</Text>
//           </View>

//           <Icon
//             name={isExpanded ? 'chevron-up' : 'chevron-down'}
//             size={20}
//             color="#aaa"
//             style={styles.chevron}
//           />
//         </TouchableOpacity>

//         {/* ── Expanded details ── */}
//         {isExpanded && (
//           <View style={styles.cardExpanded}>
//             <View style={styles.divider} />

//             <View style={styles.detailsGrid}>
//               <View style={styles.detailItem}>
//                 <Text style={styles.detailLabel}>Consumer No.</Text>
//                 <View style={styles.valueWithIcon}>
//                   <Text style={[styles.detailValue, styles.goldText]}>{String(consumerNo)}</Text>
//                 </View>
//               </View>

//               <View style={styles.detailItem}>
//                 <Text style={styles.detailLabel}>Bill No.</Text>
//                 <Text style={styles.detailValue}>{String(billNo)}</Text>
//               </View>
//             </View>

//             <View style={styles.detailsGrid}>
//               {item.memberName || item.member_name ? (
//                 <View style={styles.detailItem}>
//                   <Text style={styles.detailLabel}>Member</Text>
//                   <Text style={styles.detailValue} numberOfLines={1}>
//                     {item.memberName || item.member_name}
//                   </Text>
//                 </View>
//               ) : <View style={styles.detailItem} />}

//               <View style={[styles.detailItem, styles.amountBlock]}>
//                 <Text style={styles.detailLabel}>Paid Amount</Text>
//                 <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
//               </View>
//             </View>

//             {description ? (
//               <View style={styles.descriptionContainer}>
//                 <Icon name="information-outline" size={14} color="#999" />
//                 <Text style={styles.description} numberOfLines={2}>
//                   {description}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderEmpty = () => {
//     if (loading) return null;
//     return (
//       <View style={styles.emptyContainer}>
//         <Icon name="receipt" size={70} color="#ddd" />
//         <Text style={styles.emptyTitle}>No Bill Payments Found</Text>
//         <Text style={styles.emptySubtitle}>
//           Your paid bill history will appear here.
//         </Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => fetchBillHistory()}
//         >
//           <Text style={styles.retryButtonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderError = () => (
//     <View style={styles.emptyContainer}>
//       <Icon name="alert-circle-outline" size={70} color="#e57373" />
//       <Text style={styles.emptyTitle}>Something went wrong</Text>
//       <Text style={styles.emptySubtitle}>{error}</Text>
//       <TouchableOpacity
//         style={styles.retryButton}
//         onPress={() => fetchBillHistory()}
//       >
//         <Text style={styles.retryButtonText}>Try Again</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />

//       {/* Header */}
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
//             <Icon name="arrow-left" size={28} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Bill Payment History</Text>
//           <TouchableOpacity
//             style={styles.refreshButton}
//             onPress={() => fetchBillHistory(true)}
//           >
//             <Icon name="reload" size={24} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>

//       {/* Summary Banner */}
//       {!loading && !error && bills.length > 0 && (
//         <View style={styles.summaryBanner}>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryCount}>{bills.length}</Text>
//             <Text style={styles.summaryLabel}>Transactions</Text>
//           </View>
//           <View style={styles.summaryDivider} />
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryAmount}>
//               {formatCurrency(
//                 bills.reduce(
//                   (sum, b) =>
//                     sum +
//                     parseFloat(
//                       b.amount || b.totalAmount || b.totalPrice || b.price || 0
//                     ),
//                   0
//                 )
//               )}
//             </Text>
//             <Text style={styles.summaryLabel}>Total Paid</Text>
//           </View>
//         </View>
//       )}

//       {/* Content */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#b48a64" />
//           <Text style={styles.loadingText}>Loading bill history...</Text>
//         </View>
//       ) : error ? (
//         renderError()
//       ) : (
//         <FlatList
//           data={bills}
//           keyExtractor={(item, index) =>
//             String(item.id || item.billNo || item.invoiceNo || index)
//           }
//           renderItem={renderBillCard}
//           contentContainerStyle={[
//             styles.listContent,
//             bills.length === 0 && styles.emptyListContent,
//           ]}
//           ListEmptyComponent={renderEmpty}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchBillHistory(true)}
//               colors={['#b48a64']}
//               tintColor="#b48a64"
//             />
//           }
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF9F3', // Light cream background from main UI
//   },

//   // ── Header ──
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
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   refreshButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     flex: 1,
//     textAlign: 'center',
//   },

//   // ── Summary Banner ──
//   summaryBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 14,
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     elevation: 4,
//     shadowColor: '#C9A962',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     borderWidth: 1,
//     borderColor: '#F0E8E0',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryDivider: {
//     width: 1,
//     height: 36,
//     backgroundColor: '#F0E8E0',
//     marginHorizontal: 10,
//   },
//   summaryCount: {
//     fontSize: 26,
//     fontWeight: '800',
//     color: '#000',
//   },
//   summaryAmount: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#00A651', // Green for positive financials
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },

//   // ── List ──
//   listContent: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 40,
//   },
//   emptyListContent: {
//     flexGrow: 1,
//   },

//   // ── Card ──
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginBottom: 12,
//     overflow: 'hidden',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     borderWidth: 1,
//     borderColor: '#F0E8E0',
//   },
//   // Always-visible collapsed row
//   cardCollapsed: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//   },
//   collapsedRight: {
//     alignItems: 'flex-end',
//     marginRight: 8,
//   },
//   collapsedAmount: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: '#222',
//     marginTop: 4,
//   },
//   chevron: {
//     marginLeft: 2,
//   },
//   // Expanded section shown below the row
//   cardExpanded: {
//     paddingHorizontal: 14,
//     paddingBottom: 14,
//   },
//   iconCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#FFF9F0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#F0E8E0',
//   },
//   cardTitleBlock: {
//     flex: 1,
//   },
//   billType: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#222',
//     textTransform: 'capitalize',
//   },
//   billDate: {
//     fontSize: 13,
//     color: '#888',
//     marginTop: 1,
//   },
//   paidBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F8F4', // Light green BG
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     gap: 4,
//     borderWidth: 1,
//     borderColor: '#D4EFDF',
//   },
//   paidBadgeText: {
//     color: '#00A651',
//     fontSize: 11,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0E8E0',
//     marginVertical: 14,
//   },
//   detailsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   detailItem: {
//     flex: 1,
//   },
//   amountBlock: {
//     alignItems: 'flex-end',
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '600',
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 0.3,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '700',
//   },
//   valueWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   goldText: {
//     color: '#C9A962',
//   },
//   amountText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#000',
//   },
//   descriptionContainer: {
//     marginTop: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9F9F9',
//     padding: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   description: {
//     fontSize: 12,
//     color: '#777',
//     fontStyle: 'italic',
//     flex: 1,
//   },

//   // ── Loading ──
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#C9A962',
//     fontWeight: '600',
//   },

//   // ── Empty / Error ──
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     paddingBottom: 60,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#333',
//     marginTop: 16,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   retryButton: {
//     marginTop: 24,
//     backgroundColor: '#C9A962',
//     paddingHorizontal: 32,
//     paddingVertical: 14,
//     borderRadius: 25,
//     elevation: 3,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
// });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { getBillPaymentHistory, getUserData } from '../config/apis';
import { useAuth } from '../src/auth/contexts/AuthContext';

export default function BillPaymentHistory({ navigation }) {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const membershipNo =
    user?.membershipNo ||
    user?.membership_no ||
    user?.Membership_No ||
    user?.id;

  const fetchBillHistory = async (isRefreshing = false) => {
    if (!membershipNo) {
      setError('Membership number not found. Please login again.');
      return;
    }

    try {
      isRefreshing ? setRefreshing(true) : setLoading(true);
      setError(null);

      const data = await getBillPaymentHistory(membershipNo);

      // Handle various response formats
      let billList = [];
      if (Array.isArray(data)) {
        billList = data;
      } else if (data?.data && Array.isArray(data.data)) {
        billList = data.data;
      } else if (data?.bills && Array.isArray(data.bills)) {
        billList = data.bills;
      } else if (data && typeof data === 'object') {
        billList = [data];
      }

      // Sort by date descending (most recent first)
      billList.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || a.date || 0);
        const dateB = new Date(b.paidAt || b.createdAt || b.date || 0);
        return dateB - dateA;
      });

      setBills(billList);
    } catch (err) {
      console.error('Error fetching bill payment history:', err);
      setError('Failed to load bill payment history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBillHistory();
    }, [membershipNo])
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Rs. 0';
    return `Rs. ${num.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
  };

  const getBillTypeLabel = (bill) => {
    const type =
      bill?.billType ||
      bill?.type ||
      bill?.category ||
      bill?.bookingType ||
      'Bill';
    return String(type).replace(/_/g, ' ');
  };

  const getBillTypeIcon = (bill) => {
    const type = String(
      bill?.billType || bill?.type || bill?.category || bill?.bookingType || ''
    ).toUpperCase();

    if (type.includes('ROOM')) return 'bed';
    if (type.includes('HALL')) return 'door-open';
    if (type.includes('LAWN')) return 'grass';
    if (type.includes('PHOTO') || type.includes('SHOOT')) return 'camera';
    if (type.includes('MESS') || type.includes('FOOD')) return 'silverware-fork-knife';
    if (type.includes('SPORT')) return 'run';
    return 'receipt';
  };

  const renderBillCard = ({ item, index }) => {
    const billDate = item.paidAt || item.createdAt || item.date;
    const amount = item.amount || item.totalAmount || item.totalPrice || item.price || 0;
    const billNo = item.billNo || item.invoiceNo || item.invoiceNumber || item.id || `#${index + 1}`;
    const consumerNo = item.consumer_number || item.consumerNo || item.invoice_number || item.payment_id || 'N/A';
    const description = item.description || item.remarks || item.note || null;
    const cardId = String(item.id || item.billNo || item.invoiceNo || index);
    const isExpanded = expandedId === cardId;

    return (
      <View style={styles.card}>
        {/* ── Collapsed row (always visible) ── */}
        <TouchableOpacity
          style={styles.cardCollapsed}
          onPress={() => toggleExpand(cardId)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Icon name={getBillTypeIcon(item)} size={22} color="#C9A962" />
          </View>

          <View style={styles.cardTitleBlock}>
            <Text style={styles.billType}>{getBillTypeLabel(item)}</Text>
            <Text style={styles.billDate}>{formatDate(billDate)}</Text>
          </View>

          <View style={styles.collapsedRight}>
            <View style={styles.paidBadge}>
              <Icon name="check-circle" size={13} color="#00A651" />
              <Text style={styles.paidBadgeText}>PAID</Text>
            </View>
            {!isExpanded && (
              <Text style={styles.collapsedAmount}>{formatCurrency(amount)}</Text>
            )}
          </View>

          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#aaa"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* ── Expanded details ── */}
        {isExpanded && (
          <View style={styles.cardExpanded}>
            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Consumer No.</Text>
                <View style={styles.valueWithIcon}>
                  <Text style={[styles.detailValue, styles.goldText]}>{String(consumerNo)}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bill No.</Text>
                <Text style={styles.detailValue}>{String(billNo)}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              {item.memberName || item.member_name ? (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Member</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {item.memberName || item.member_name}
                  </Text>
                </View>
              ) : <View style={styles.detailItem} />}

              <View style={[styles.detailItem, styles.amountBlock]}>
                <Text style={styles.detailLabel}>Paid Amount</Text>
                <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
              </View>
            </View>

            {/* {description ? (
              <View style={styles.descriptionContainer}>
                <Icon name="information-outline" size={14} color="#999" />
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
              </View>
            ) : null} */}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="receipt" size={70} color="#ddd" />
        <Text style={styles.emptyTitle}>No Bill Payments Found</Text>
        <Text style={styles.emptySubtitle}>
          Your paid bill history will appear here.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchBillHistory()}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Icon name="alert-circle-outline" size={70} color="#e57373" />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchBillHistory()}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />

      {/* Header */}
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
            <Icon name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill Payment History</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchBillHistory(true)}
          >
            <Icon name="reload" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Summary Banner */}
      {!loading && !error && bills.length > 0 && (
        <View style={styles.summaryBanner}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryCount}>{bills.length}</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmount}>
              {formatCurrency(
                bills.reduce(
                  (sum, b) =>
                    sum +
                    parseFloat(
                      b.amount || b.totalAmount || b.totalPrice || b.price || 0
                    ),
                  0
                )
              )}
            </Text>
            <Text style={styles.summaryLabel}>Total Paid</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Loading bill history...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item, index) =>
            String(item.id || item.billNo || item.invoiceNo || index)
          }
          renderItem={renderBillCard}
          contentContainerStyle={[
            styles.listContent,
            bills.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBillHistory(true)}
              colors={['#b48a64']}
              tintColor="#b48a64"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3', // Light cream background from main UI
  },

  // ── Header ──
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
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },

  // ── Summary Banner ──
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#C9A962',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E8E0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F0E8E0',
    marginHorizontal: 10,
  },
  summaryCount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00A651', // Green for positive financials
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0E8E0',
  },
  // Always-visible collapsed row
  cardCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  collapsedRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  collapsedAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
    marginTop: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  // Expanded section shown below the row
  cardExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0E8E0',
  },
  cardTitleBlock: {
    flex: 1,
  },
  billType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    textTransform: 'capitalize',
  },
  billDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F4', // Light green BG
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D4EFDF',
  },
  paidBadgeText: {
    color: '#00A651',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E8E0',
    marginVertical: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  valueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goldText: {
    color: '#C9A962',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  descriptionContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  description: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    flex: 1,
  },

  // ── Loading ──
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#C9A962',
    fontWeight: '600',
  },

  // ── Empty / Error ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#C9A962',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});