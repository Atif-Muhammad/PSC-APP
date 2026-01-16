
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { roomService } from '../../services/roomService';
import { useAuth } from '../auth/contexts/AuthContext';
import { getRoomRule } from '../../config/apis';
import HtmlRenderer from '../events/HtmlRenderer';

const { width: screenWidth } = Dimensions.get('window');

const features = [
  { icon: "currency-usd", label: "Best Rate" },
  { icon: "wifi", label: "WiFi" },
  { icon: "washing-machine", label: "Laundry" },
  { icon: "thermometer", label: "Temperature" },
  { icon: "key", label: "Keyless Entry" },
  { icon: "account-check-outline", label: "24/7 Reception" },
  { icon: "parking", label: "Parking" },
  { icon: "credit-card-outline", label: "E-Payment" },
  { icon: "room-service-outline", label: "Room Service" },
  { icon: "atm", label: "ATM" },
  { icon: "account-group", label: "Club Facilities" },
];

export default function home({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  const userRole = user?.role;
  const userName = user?.name;

  const [showWelcome, setShowWelcome] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    console.log('🏠 Home Screen - Auth Status:', {
      isAuthenticated,
      userRole,
      userName
    });

    fetchRoomRules();

    if (isAuthenticated) {
      fetchRoomTypes();
    } else {
      setError('Please login to access room information');
    }
  }, [isAuthenticated]);

  const fetchRoomRules = async () => {
    try {
      setLoadingRules(true);
      const fetchedRules = await getRoomRule();
      console.log('✅ Fetched room rules:', fetchedRules);
      setRules(fetchedRules);
    } catch (error) {
      console.error('Error fetching room rules:', error);
    } finally {
      setLoadingRules(false);
    }
  };

  // Check if user is admin
  const isAdminUser = () => {
    return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  };

  // Check if user is member
  const isMemberUser = () => {
    return userRole === 'MEMBER';
  };

  // Fetch room types from backend (available for all authenticated users)
  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching room types for user:', userRole);
      const types = await roomService.getRoomTypes();
      console.log("✅ Fetched room types:", types);

      if (types && Array.isArray(types)) {
        // Transform the data with images
        const transformedTypes = types.map(type => ({
          id: type.id,
          name: type.type,
          screen: 'details', // Navigate to RoomDetailsScreen
          priceMember: type.priceMember,
          priceGuest: type.priceGuest,
          images: type.images || [], // Include images from API
          description: `Premium ${type.type} accommodation`, // You can customize this
          originalData: type
        }));

        setRoomTypes(transformedTypes);
        if (transformedTypes.length > 0) {
          setActiveCategory(0);
        }
      } else {
        setRoomTypes([]);
      }
    } catch (err) {
      console.error('❌ Error fetching room types:', err);
      const errorMessage = err.message || 'Failed to load room types';
      setError(errorMessage);

      if (errorMessage.includes('Authentication failed') ||
        errorMessage.includes('No authentication token') ||
        errorMessage.includes('401')) {
        // Clear auth state and reset navigation stack
        await logout();
        Alert.alert(
          'Session Expired',
          'Please login again to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScr' }],
              })
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoomTypes();
    setRefreshing(false);
  };

  // Welcome effect based on user role
  useEffect(() => {
    if (userRole && showWelcome && isAuthenticated) {
      let welcomeMessage = '';
      let alertTitle = 'Welcome';

      switch (userRole) {
        case 'SUPER_ADMIN':
          welcomeMessage = `Hello Super Admin ${userName || ''}! 👑\n\nYou have full administrative privileges.`;
          alertTitle = 'Super Admin Access';
          break;
        case 'ADMIN':
          welcomeMessage = `Hello Admin ${userName || ''}! ⚙️\n\nYou have administrative access.`;
          alertTitle = 'Admin Access';
          break;
        case 'MEMBER':
          welcomeMessage = `Welcome ${userName || ''}! 👤\n\nBrowse our available room types.`;
          alertTitle = 'Member Access';
          break;
        default:
          welcomeMessage = `Welcome ${userName || 'User'}!`;
      }

      // const timer = setTimeout(() => {
        // Alert.alert(
        //   alertTitle,
        //   welcomeMessage,
        //   [
        //     {
        //       text: 'Get Started',
        //       onPress: () => setShowWelcome(false)
        //     }
        //   ]
        // );
      // }, 500);

      // return () => clearTimeout(timer);
    }
  }, [userRole, userName, showWelcome, isAuthenticated]);

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'MEMBER': return 'Member';
      default: return 'Guest';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'crown';
      case 'ADMIN': return 'shield-account';
      case 'MEMBER': return 'account';
      default: return 'account';
    }
  };

  const handleCategoryPress = (category, index) => {
    setActiveCategory(index);
    // Navigate to RoomDetailsScreen with the room type data
    navigation.navigate('details', {
      roomType: category
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            });
          }
        }
      ]
    );
  };

  // Render room card with image
  const renderRoomCard = (category, index) => {
    const hasImages = category.images && category.images.length > 0;
    const firstImage = hasImages ? category.images[0] : null;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.roomCard,
          index === activeCategory && styles.roomCardActive,
        ]}
        onPress={() => handleCategoryPress(category, index)}
      >
        {/* Room Image */}
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage.url }}
              style={styles.roomImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Icon name="image-off" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {category.name}
          </Text>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            {/* {category.priceMember && (
              <View style={styles.priceRow}>
                <Icon name="account" size={14} color="#2E7D32" />
                <Text style={styles.memberPrice}>
                  {category.priceMember}
                </Text>
                <Text style={styles.priceLabel}>Member</Text>
              </View>
            )} */}

            {/* {category.priceGuest && (
              <View style={styles.priceRow}>
                <Icon name="account-outline" size={14} color="#666" />
                <Text style={styles.guestPrice}>
                  {category.priceGuest}
                  
                </Text>
                <Text style={styles.priceLabel}>Guest Price</Text>
              </View>
            )} */}
          </View>

          {/* View Details Button */}
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#b48a64" />
          </View>
        </View>

        {/* Active Indicator */}
        {index === activeCategory && (
          <View style={styles.activeIndicator}>
            <Icon name="check-circle" size={20} color="#b48a64" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render room types for all users
  const renderRoomTypes = () => {
    if (loading && roomTypes.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Loading room types...</Text>
        </View>
      );
    }

    if (error && roomTypes.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // if (roomTypes.length === 0) {
    //   return (
    //     <View style={styles.noDataContainer}>
    //       <Icon name="image-off-outline" size={50} color="#999" />
    //       <Text style={styles.noDataText}>No room types available</Text>
    //       <Text style={styles.noDataSubtext}>
    //         Room types will appear here once added
    //       </Text>
    //       <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
    //         <Text style={styles.retryText}>Refresh</Text>
    //       </TouchableOpacity>
    //     </View>
    //   );
    // }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Categories</Text>
          {/* <Text style={styles.sectionSubtitle}>
            {roomTypes.length} type{roomTypes.length !== 1 ? 's' : ''} available
          </Text> */}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomTypesScroll}
          contentContainerStyle={styles.roomTypesContainer}
        >
          {roomTypes.map((category, index) => renderRoomCard(category, index))}
        </ScrollView>
      </>
    );
  };

  // Render content based on authentication
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.accessDeniedTitle}>Authentication Required</Text>
          <Text style={styles.accessDeniedText}>
            Please login to access room information.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            })}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return renderRoomTypes();
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#b48a64']}
          tintColor={'#b48a64'}
        />
      }
    >
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Guest Rooms</Text>
          {userRole ? (
            <View style={styles.roleContainer}>
              <Icon name={getRoleIcon()} size={16} color="#fff" />
              <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
              {isAdminUser() && (
                <Icon name="shield-check" size={14} color="#4CAF50" style={styles.adminBadge} />
              )}
            </View>
          ) : (
            <Text style={styles.noRole}>Not Logged In</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}
      {/* Image-based Notch Header */}
      <ImageBackground
        source={require('../../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('start')}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Guest Rooms</Text>
            {/* {userRole ? (
              <View style={styles.roleContainer}>
                <Icon name={getRoleIcon()} size={14} color="#000" />
                <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
                {isAdminUser() && (
                  <Icon name="shield-check" size={12} color="#4CAF50" style={styles.adminBadge} />
                )}
              </View>
            ) : (
              <Text style={styles.noRole}>Not Logged In</Text>
            )} */}
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {/* Add notification handler */ }}
            activeOpacity={0.7}
          >
            <Icon name="bell" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Enjoy Your Stay With Us</Text>
        <Text style={styles.welcomeText}>
          {isAdminUser()
            ? "Manage and browse all available room types for club members and guests"
            : isMemberUser()
              ? "Discover premium guest rooms with exclusive member benefits and pricing"
              : "Explore comfortable and well-equipped guest rooms for your perfect stay"
          }
        </Text>
      </View>

      {/* Room Types Section */}
      {renderContent()}

      {/* Features Section */}
      {/* <View style={styles.featuresSection}>
        <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
        <Text style={styles.featureSubtitle}>
          All club activities available on check in.
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Icon name={item.icon} size={32} color="#b8976d" />
              </View>
              <Text style={styles.featureText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View> */}
      {/* Policy Section */}
      <View style={styles.policySection}>
        <Text style={styles.policyTitle}>Guest Room Policy</Text>
        {loadingRules ? (
          <ActivityIndicator color="#b48a64" size="small" />
        ) : rules && rules.length > 0 ? (
          rules.map((rule, index) => (
            <View key={rule.id || index} style={styles.ruleItem}>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <HtmlRenderer
                  htmlContent={rule.content || rule.rule || ''}
                  textStyle={styles.ruleText}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noRulesText}>No rules available.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF9F3"
  },
  header: {
    backgroundColor: "#b48a64",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 140,
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    color: "#000",
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    marginLeft: 6,
  },
  noRole: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: 'italic',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    color: "black",
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    marginLeft: 6,
  },
  noRole: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: 'italic',
  },
  welcomeSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f3eb",
    margin: 15,
    borderRadius: 15,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  welcomeText: {
    textAlign: "center",
    color: "#555",
    lineHeight: 20,
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Room Types Scroll
  roomTypesScroll: {
    marginBottom: 20,
  },
  roomTypesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Room Card
  roomCard: {
    width: screenWidth * 0.75,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  roomCardActive: {
    borderColor: '#b48a64',
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
  },
  roomInfo: {
    padding: 15,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pricingContainer: {
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 6,
    marginRight: 4,
  },
  guestPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
    marginRight: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f3eb',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8d9c3',
  },
  viewDetailsText: {
    color: '#b48a64',
    fontWeight: '600',
    marginRight: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 15,
    backgroundColor: '#fff8f8',
    borderRadius: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    textAlign: 'center',
    color: '#d32f2f',
    marginBottom: 20,
    lineHeight: 18,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  noDataSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  // Access denied styles
  accessDeniedContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 20,
    backgroundColor: '#fff8f8',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 10,
    marginBottom: 10,
  },
  accessDeniedText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  // Button styles
  retryButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Features and policy styles
  // Features and policy styles
  featuresSection: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  featureSubtitle: {
    color: "#666",
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 25,
  },
  featureIconBox: {
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#b8976d",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
  },
  policySection: {
    backgroundColor: "#fff8f2",
    margin: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  policySub: {
    fontWeight: "bold",
    color: "#b48a64",
    marginTop: 15,
    marginBottom: 5,
  },
  bullet: {
    color: "#444",
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingRight: 10,
  },
  ruleText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    lineHeight: 20,
    flex: 1,
  },
  noRulesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
});
