//abd 27
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   StatusBar,
//   ScrollView,
//   Image,
//   ImageBackground,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from 'react-native';
// import { lawnAPI, getUserData } from '../../config/apis';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useAuth } from '../auth/contexts/AuthContext';
// import LawnSlider from './LawnSlider';

// const LawnListScreen = ({ route, navigation }) => {
//   const { categoryId, categoryName, categoryImages = [], passedLawns = [] } = route.params;
//   const [lawns, setLawns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const { user } = useAuth();
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Reusable transformation & sanitization logic
//   const transformLawnData = useCallback((data) => {
//     if (!Array.isArray(data)) return [];

//     return data.map((lawn, index) => {
//       // 1. Sanitize raw data: convert 'null' strings to actual null
//       const sanitizedLawn = {};
//       Object.keys(lawn).forEach(key => {
//         const val = lawn[key];
//         sanitizedLawn[key] = (val === 'null' || val === 'undefined') ? null : val;
//       });

//       // 2. Extract images with priority: lawn.images -> lawn_images -> image_url -> rawData.images
//       const findImages = (item) => {
//         if (Array.isArray(item.images) && item.images.length > 0) return item.images;
//         if (Array.isArray(item.lawn_images) && item.lawn_images.length > 0) return item.lawn_images;
//         if (item.rawData && Array.isArray(item.rawData.images) && item.rawData.images.length > 0) return item.rawData.images;
//         if (typeof item.image_url === 'string' && item.image_url.startsWith('http')) return [item.image_url];
//         return [];
//       };

//       const discoveredImages = findImages(sanitizedLawn);

//       return {
//         ...sanitizedLawn,
//         id: sanitizedLawn.id || index,
//         title: sanitizedLawn.title || sanitizedLawn.description || 'Unnamed Lawn',
//         images: discoveredImages,
//         type: 'lawn',
//         rawData: sanitizedLawn,
//       };
//     });
//   }, []);

//   const fetchLawns = async () => {
//     try {
//       if (passedLawns && passedLawns.length > 0) {
//         console.log(`📦 Using ${passedLawns.length} pre-loaded lawns...`);
//         // Map and sanitize passedLawns
//         const sanitized = transformLawnData(passedLawns);
//         setLawns(sanitized);
//         setLoading(false);
//         return;
//       }

//       console.log(`🌿 Fallback API for category ${categoryId}...`);
//       setError({ message: null, status: null });
//       setLoading(true);

//       const response = await lawnAPI.getLawnsByCategory(categoryId);
//       if (response?.data && Array.isArray(response.data)) {
//         setLawns(transformLawnData(response.data));
//       } else {
//         setLawns([]);
//       }
//     } catch (err) {
//       setError({ message: 'Failed to load lawns', status: err.response?.status });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleLawnPress = (lawn) => {
//     const lawnData = lawn.rawData || lawn;
//     if (isAdmin) {
//       navigation.navigate('LawnReservation', {
//         venue: { id: lawnData.id, title: lawnData.description || lawnData.title || lawn.title, location: 'Club Lawns' }
//       });
//     } else {
//       navigation.navigate('LawnBooking', { venue: lawnData, venueType: 'lawn' });
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchLawns();
//   };

//   useEffect(() => {
//     fetchLawns();
//     checkUserStatus();
//   }, [categoryId, passedLawns]);

//   const checkUserStatus = async () => {
//     try {
//       const userData = await getUserData();
//       const currentUser = user || userData;
//       if (!currentUser) return;
//       const role = (currentUser.role || currentUser.Role || currentUser.userRole || '').toLowerCase();
//       setIsAdmin(role.includes('admin'));
//     } catch (error) {
//       setIsAdmin(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
//         <ImageBackground source={require('../../assets/notch.jpg')} style={styles.notch} imageStyle={styles.notchImage}>
//           <View style={styles.notchContent}>
//             <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
//             <Text style={styles.headerText}>{categoryName}</Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>
//         <View style={styles.centerContent}><ActivityIndicator size="large" color="#b48a64" /><Text style={styles.loadingText}>Loading Lawns...</Text></View>
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
//       <View style={styles.container}>
//         <ImageBackground source={require('../../assets/notch.jpg')} style={styles.notch} imageStyle={styles.notchImage}>
//           <View style={styles.notchContent}>
//             <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
//             <Text style={styles.headerText}>{categoryName}</Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <SafeAreaView style={styles.safeArea}>
//           <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b48a64']} tintColor="#b48a64" />}
//           >
//             {lawns.length > 0 ? (
//               lawns.map((lawn) => {
//                 const truncateTitle = (title) => {
//                   if (!title) return 'Unnamed Lawn';
//                   const cateringIndex = title.toLowerCase().indexOf('catering');
//                   if (cateringIndex !== -1) return title.substring(0, cateringIndex + 8).trim();
//                   return title.length > 50 ? title.substring(0, 50) + '...' : title;
//                 };

//                 const getSliderImages = (item) => {
//                   // 1. Resolve images with Inheritance (lawn -> category)
//                   const baseImages = (item.images && item.images.length > 0)
//                     ? item.images
//                     : (categoryImages && categoryImages.length > 0 ? categoryImages : []);

//                   // 2. Strict Alternating Flip: Even = Reversed, Odd = Normal
//                   let processedImages = [...baseImages];
//                   if (categoryId % 2 === 0 && processedImages.length > 0) {
//                     processedImages.reverse();
//                   }

//                   // 3. Max 5 images
//                   return processedImages.slice(0, 5);
//                 };

//                 return (
//                   <View key={lawn.id} style={styles.card}>
//                     <View style={styles.cardImageContainer}>
//                       <LawnSlider
//                         images={getSliderImages(lawn)}
//                         height={200}
//                         borderRadius={15}
//                         autoPlay={true}
//                         interval={3000}
//                       />
//                     </View>
//                     <View style={styles.cardUpperSection}>
//                       <View style={styles.titleRow}>
//                         <Text style={styles.cardTitle}>{truncateTitle(lawn.title)}</Text>
//                         {lawn.isOutOfService && (
//                           <View style={styles.unavailableBadge}><Text style={styles.unavailableBadgeText}>Unavailable</Text></View>
//                         )}
//                       </View>
//                       <View style={styles.detailGrid}>
//                         <View style={styles.detailItem}>
//                           <Icon name="groups" size={20} color="#b48a64" style={styles.detailIcon} />
//                           <View style={styles.detailInfo}>
//                             <Text style={styles.detailLabel}>Capacity</Text>
//                             <Text style={styles.detailValue}>{lawn.minGuests} - {lawn.maxGuests} Guests</Text>
//                           </View>
//                         </View>
//                         <View style={styles.detailItem}>
//                           <Icon name="payments" size={20} color="#b48a64" style={styles.detailIcon} />
//                           <View style={styles.detailInfo}>
//                             <Text style={styles.detailLabel}>Guest Charges</Text>
//                             <Text style={styles.detailValue}>Rs. {lawn.guestCharges?.toLocaleString() || 0}</Text>
//                           </View>
//                         </View>
//                       </View>
//                     </View>
//                     <View style={styles.cardBottomSection}>
//                       <TouchableOpacity
//                         style={[styles.viewDetailButton, lawn.isOutOfService && styles.viewDetailButtonDisabled]}
//                         onPress={() => handleLawnPress(lawn)}
//                         disabled={lawn.isOutOfService}
//                         activeOpacity={0.8}
//                       >
//                         <Text style={styles.viewDetailButtonText}>{isAdmin ? 'Reserve' : 'View Detail'}</Text>
//                         <Icon name="arrow-forward" size={16} color="#b48a64" />
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               })
//             ) : (
//               !loading && <View style={styles.noDataContainer}><Text style={styles.noDataText}>No lawns available</Text></View>
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FEF9F3' },
//   loadingContainer: { flex: 1, backgroundColor: '#FEF9F3' },
//   centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   loadingText: { marginTop: 10, fontSize: 16, color: '#333', fontWeight: '600' },
//   notch: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden', minHeight: 120 },
//   notchImage: { resizeMode: 'cover' },
//   notchContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
//   headerText: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center', flex: 1 },
//   placeholder: { width: 40 },
//   safeArea: { flex: 1 },
//   scrollView: { flex: 1 },
//   scrollContent: { paddingVertical: 15, paddingHorizontal: 12, paddingBottom: 30 },
//   errorBanner: { backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#f44336', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   errorBannerText: { color: '#d32f2f', fontSize: 14, flex: 1, marginRight: 10 },
//   retryButtonSmall: { backgroundColor: '#b48a64', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
//   retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
//   noDataContainer: { justifyContent: 'center', alignItems: 'center', padding: 40 },
//   noDataText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
//   card: { backgroundColor: '#FFF', marginBottom: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
//   cardUpperSection: { padding: 16, backgroundColor: '#FFF' },
//   cardBottomSection: { backgroundColor: '#b48a64', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
//   titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
//   cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', flex: 1, marginRight: 10, lineHeight: 24 },
//   detailGrid: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   detailItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   detailIcon: { marginRight: 12, width: 24 },
//   detailInfo: { flex: 1 },
//   detailLabel: { fontSize: 11, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
//   detailValue: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
//   unavailableBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   unavailableBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
//   viewDetailButton: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   viewDetailButtonDisabled: { backgroundColor: '#ccc', opacity: 0.7 },
//   viewDetailButtonText: { fontSize: 14, fontWeight: '600', color: '#b48a64' },
//   cardImageContainer: { width: '100%', height: 200, borderTopLeftRadius: 15, borderTopRightRadius: 15, overflow: 'hidden', backgroundColor: '#f0f0f0' },
// });

// export default LawnListScreen;

//affan27
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { lawnAPI, getUserData } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../auth/contexts/AuthContext';
import LawnSlider from './LawnSlider';

const LawnListScreen = ({ route, navigation }) => {
  const { categoryId, categoryName = 'Lawn Category', categoryImages = [], passedLawns = [] } = route.params || {};
  const [lawns, setLawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Reusable transformation & sanitization logic
  const transformLawnData = useCallback((data) => {
    if (!Array.isArray(data)) return [];

    return data.map((lawn, index) => {
      // 1. Sanitize raw data: convert 'null' strings to actual null
      const sanitizedLawn = {};
      Object.keys(lawn).forEach(key => {
        const val = lawn[key];
        sanitizedLawn[key] = (val === 'null' || val === 'undefined') ? null : val;
      });

      // 2. Extract images with priority: lawn.images -> lawn_images -> image_url -> rawData.images
      const findImages = (item) => {
        if (Array.isArray(item.images) && item.images.length > 0) return item.images;
        if (Array.isArray(item.lawn_images) && item.lawn_images.length > 0) return item.lawn_images;
        if (item.rawData && Array.isArray(item.rawData.images) && item.rawData.images.length > 0) return item.rawData.images;
        if (typeof item.image_url === 'string' && item.image_url.startsWith('http')) return [item.image_url];
        return [];
      };

      const discoveredImages = findImages(sanitizedLawn);

      return {
        ...sanitizedLawn,
        id: sanitizedLawn.id || index,
        title: sanitizedLawn.title || sanitizedLawn.description || 'Unnamed Lawn',
        images: discoveredImages,
        type: 'lawn',
        rawData: sanitizedLawn,
      };
    });
  }, []);

  const fetchLawns = async () => {
    try {
      if (passedLawns && passedLawns.length > 0) {
        console.log(`📦 Using ${passedLawns.length} pre-loaded lawns...`);
        // Map and sanitize passedLawns
        const sanitized = transformLawnData(passedLawns);
        setLawns(sanitized);
        setLoading(false);
        return;
      }

      console.log(`🌿 Fallback API for category ${categoryId}...`);
      setError({ message: null, status: null });
      setLoading(true);

      const response = await lawnAPI.getLawnsByCategory(categoryId);
      if (response?.data && Array.isArray(response.data)) {
        setLawns(transformLawnData(response.data));
      } else {
        setLawns([]);
      }
    } catch (err) {
      setError({ message: 'Failed to load lawns', status: err.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLawnPress = (lawn) => {
    const lawnData = lawn.rawData || lawn;
    if (isAdmin) {
      navigation.navigate('LawnReservation', {
        venue: { id: lawnData.id, title: lawnData.description || lawnData.title || lawn.title, location: 'Club Lawns' }
      });
    } else {
      navigation.navigate('LawnBooking', { venue: lawnData, venueType: 'lawn' });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLawns();
  };

  useEffect(() => {
    fetchLawns();
    checkUserStatus();
  }, [categoryId, passedLawns]);

  const checkUserStatus = async () => {
    try {
      const userData = await getUserData();
      const currentUser = user || userData;
      if (!currentUser) return;
      const role = (currentUser.role || currentUser.Role || currentUser.userRole || '').toLowerCase();
      setIsAdmin(role.includes('admin'));
    } catch (error) {
      setIsAdmin(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
        <ImageBackground source={require('../../assets/notch.jpg')} style={styles.notch} imageStyle={styles.notchImage}>
          <View style={styles.notchContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
            <Text style={styles.headerText}>{categoryName}</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>
        <View style={styles.centerContent}><ActivityIndicator size="large" color="#b48a64" /><Text style={styles.loadingText}>Loading Lawns...</Text></View>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#FEF9F3" barStyle="dark-content" />
      <View style={styles.container}>
        <ImageBackground source={require('../../assets/notch.jpg')} style={styles.notch} imageStyle={styles.notchImage}>
          <View style={styles.notchContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={28} color="#000" /></TouchableOpacity>
            <Text style={styles.headerText}>{categoryName}</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b48a64']} tintColor="#b48a64" />}
          >
            {lawns.length > 0 ? (
              lawns.map((lawn) => {
                const truncateTitle = (title) => {
                  if (!title) return 'Unnamed Lawn';
                  const cateringIndex = title.toLowerCase().indexOf('catering');
                  if (cateringIndex !== -1) return title.substring(0, cateringIndex + 8).trim();
                  return title.length > 50 ? title.substring(0, 50) + '...' : title;
                };

                const getSliderImages = (item) => {
                  // 1. Resolve images with Inheritance (lawn -> category)
                  const baseImages = (item.images && item.images.length > 0)
                    ? item.images
                    : (categoryImages && categoryImages.length > 0 ? categoryImages : []);

                  // 2. Strict Alternating Flip: Even = Reversed, Odd = Normal
                  let processedImages = [...baseImages];
                  if (categoryId % 2 === 0 && processedImages.length > 0) {
                    processedImages.reverse();
                  }

                  // 3. Max 5 images
                  return processedImages.slice(0, 5);
                };

                return (
                  <View key={lawn.id} style={styles.card}>
                    <View style={styles.cardImageContainer}>
                      <LawnSlider
                        images={getSliderImages(lawn)}
                        height={200}
                        borderRadius={15}
                        autoPlay={true}
                        interval={3000}
                      />
                    </View>
                    <View style={styles.cardUpperSection}>
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle}>{truncateTitle(lawn.title)}</Text>
                        {lawn.isOutOfService && (
                          <View style={styles.unavailableBadge}><Text style={styles.unavailableBadgeText}>Unavailable</Text></View>
                        )}
                      </View>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                          <Icon name="groups" size={20} color="#b48a64" style={styles.detailIcon} />
                          <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Capacity</Text>
                            <Text style={styles.detailValue}>{lawn.minGuests} - {lawn.maxGuests} Guests</Text>
                          </View>
                        </View>
                        <View style={styles.detailItem}>
                          <Icon name="payments" size={20} color="#b48a64" style={styles.detailIcon} />
                          <View style={styles.detailInfo}>
                            <Text style={styles.detailLabel}>Guest Charges</Text>
                            <Text style={styles.detailValue}>Rs. {lawn.guestCharges?.toLocaleString() || 0}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.cardBottomSection}>
                      <TouchableOpacity
                        style={[styles.viewDetailButton, lawn.isOutOfService && styles.viewDetailButtonDisabled]}
                        onPress={() => handleLawnPress(lawn)}
                        disabled={lawn.isOutOfService}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.viewDetailButtonText}>{isAdmin ? 'Reserve' : 'View Detail'}</Text>
                        <Icon name="arrow-forward" size={16} color="#b48a64" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              !loading && <View style={styles.noDataContainer}><Text style={styles.noDataText}>No lawns available</Text></View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  loadingContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333', fontWeight: '600' },
  notch: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden', minHeight: 120 },
  notchImage: { resizeMode: 'cover' },
  notchContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center', flex: 1 },
  placeholder: { width: 40 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 15, paddingHorizontal: 12, paddingBottom: 30 },
  errorBanner: { backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#f44336', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorBannerText: { color: '#d32f2f', fontSize: 14, flex: 1, marginRight: 10 },
  retryButtonSmall: { backgroundColor: '#b48a64', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  noDataText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  card: { backgroundColor: '#FFF', marginBottom: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  cardUpperSection: { padding: 16, backgroundColor: '#FFF' },
  cardBottomSection: { backgroundColor: '#b48a64', padding: 12, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', flex: 1, marginRight: 10, lineHeight: 24 },
  detailGrid: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailIcon: { marginRight: 12, width: 24 },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  unavailableBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  unavailableBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  viewDetailButton: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  viewDetailButtonDisabled: { backgroundColor: '#ccc', opacity: 0.7 },
  viewDetailButtonText: { fontSize: 14, fontWeight: '600', color: '#b48a64' },
  cardImageContainer: { width: '100%', height: 200, borderTopLeftRadius: 15, borderTopRightRadius: 15, overflow: 'hidden', backgroundColor: '#f0f0f0' },
});

export default LawnListScreen;