// Example: Updated LawnListScreen.js with Friendly Error Handling
// This is a REFERENCE FILE showing how to integrate the error handling system

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
} from 'react-native';
import { lawnAPI, getUserData } from '../../config/apis';
import apiClient from '../../config/apiClient'; // NEW: Import apiClient
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../auth/contexts/AuthContext';
import LawnSlider from './LawnSlider';
import FriendlyErrorCard from '../../components/FriendlyErrorCard'; // NEW: Import error card
import { useFriendlyError } from '../../hooks/useFriendlyError'; // NEW: Import hook

const LawnListScreenExample = ({ route, navigation }) => {
  const { categoryId, categoryName = 'Lawn Category', categoryImages = [], passedLawns = [] } = route.params || {};
  const [lawns, setLawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // NEW: Initialize friendly error hook for 'lawns' module
  const { 
    hasError, 
    errorMessage, 
    errorModule, 
    clearError,
    lastErrorTime 
  } = useFriendlyError('lawns');

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
      
      // NEW: Clear any previous errors before fetching
      clearError();
      
      setError({ message: null, status: null });
      setLoading(true);

      // OPTION 1: Continue using lawnAPI (if it wraps apiClient)
      const response = await lawnAPI.getLawnsByCategory(categoryId);
      
      // OPTION 2: Use apiClient directly (recommended for new code)
      // const response = await apiClient.get(`/lawns/category/${categoryId}`);
      
      if (response?.data && Array.isArray(response.data)) {
        setLawns(transformLawnData(response.data));
      } else {
        setLawns([]);
      }
    } catch (err) {
      // NEW: Check if it's a friendly error from our interceptor
      if (err.isFriendlyError) {
        // The error is already handled by the eventBus emission
        // The FriendlyErrorCard will display automatically via the hook
        console.log('🚨 Lawn API Error (500):', err.message);
        // Don't set technical error - let the friendly error card show
      } else {
        // Handle other errors normally
        setError({ 
          message: err.message || 'Failed to load lawns', 
          status: err.response?.status 
        });
      }
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
      setUserData(userData);

      const currentUser = user || userData;

      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      const extractedUserRole =
        currentUser.role ||
        currentUser.Role ||
        currentUser.userRole ||
        currentUser.user_role;

      const isAdminUser = extractedUserRole && (
        extractedUserRole.toLowerCase() === 'admin' ||
        extractedUserRole.toLowerCase() === 'super_admin' ||
        extractedUserRole.toLowerCase() === 'superadmin'
      );

      setIsAdmin(isAdminUser);
      console.log('👤 User status:', {
        isAdmin: isAdminUser,
        userRole: extractedUserRole
      });
    } catch (error) {
      console.error('❌ Error checking user status:', error);
      setIsAdmin(false);
    }
  };

  // NEW: If we have a friendly error, render it inline
  if (hasError && !loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FEF9F3" />
        
        {/* Header */}
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{categoryName}</Text>
            <View style={{ width: 40 }} />
          </View>
        </ImageBackground>
        
        {/* Main Content with Error Card */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Display Friendly Error Card */}
            <FriendlyErrorCard
              message={errorMessage}
              module={errorModule}
              onRetry={fetchLawns}
              onClose={() => navigation.goBack()}
              showActions={true}
            />
            
            {/* Optional: Show partial content or suggestions */}
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionTitle}>While you're here...</Text>
              <Text style={styles.suggestionText}>
                You can explore other facilities or try again later.
              </Text>
              
              <View style={styles.suggestionButtons}>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Icon name="home" size={20} color="#FFFFFF" />
                  <Text style={styles.suggestionButtonText}>Go Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.suggestionButton, styles.secondaryButton]}
                  onPress={() => navigation.navigate('Rooms')}
                >
                  <Icon name="room-service" size={20} color="#b48a64" />
                  <Text style={[styles.suggestionButtonText, styles.secondaryButtonText]}>View Rooms</Text>
                </TouchableOpacity>
              </View>
            </View>
            
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Normal rendering (no error)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF9F3" />
      
      {/* Header */}
      <ImageBackground
        source={require('../../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{categoryName}</Text>
          <View style={{ width: 40 }} />
        </View>
      </ImageBackground>
      
      {/* Main Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#b48a64" />
              <Text style={styles.loadingText}>Loading lawns...</Text>
            </View>
          )}
          
          {/* Error State (Traditional) */}
          {!loading && error?.message && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error.message}</Text>
              <TouchableOpacity style={styles.retryButtonSmall} onPress={fetchLawns}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Lawns List */}
          {!loading && !error?.message && lawns.length > 0 && (
            <View style={styles.lawnsGrid}>
              {lawns.map((lawn, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.lawnCard}
                  onPress={() => handleLawnPress(lawn)}
                  activeOpacity={0.8}
                  disabled={lawn.isOutOfService}
                >
                  {/* Your existing lawn card rendering */}
                  <View style={styles.cardImageContainer}>
                    {lawn.images && lawn.images.length > 0 ? (
                      <LawnSlider images={lawn.images} />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Icon name="grass" size={40} color="#ccc" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.lawnTitle}>{lawn.title}</Text>
                    <View style={styles.lawnDetails}>
                      <Icon name="people" size={16} color="#b48a64" />
                      <Text style={styles.lawnDetailText}>
                        {lawn.minGuests} - {lawn.maxGuests} guests
                      </Text>
                    </View>
                    <View style={styles.lawnDetails}>
                      <Icon name="payments" size={16} color="#b48a64" />
                      <Text style={styles.lawnDetailText}>
                        Rs. {lawn.guestCharges?.toLocaleString() || 0}
                      </Text>
                    </View>
                    
                    {lawn.isOutOfService && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableText}>Currently Unavailable</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* No Data */}
          {!loading && lawns.length === 0 && (
            <View style={styles.noDataContainer}>
              <Icon name="search-off" size={60} color="#ccc" />
              <Text style={styles.noDataText}>No lawns available in this category</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  notch: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden', minHeight: 120 },
  notchImage: { resizeMode: 'cover' },
  notchContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center', flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 15, paddingHorizontal: 12, paddingBottom: 30 },
  
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333', fontWeight: '600' },
  
  // Error Banner (Traditional)
  errorBanner: { backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#f44336', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorBannerText: { color: '#d32f2f', fontSize: 14, flex: 1, marginRight: 10 },
  retryButtonSmall: { backgroundColor: '#b48a64', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  
  // Lawns Grid
  lawnsGrid: {},
  lawnCard: { backgroundColor: '#FFF', marginBottom: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  cardImageContainer: { width: '100%', height: 200, backgroundColor: '#f0f0f0' },
  noImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  cardContent: { padding: 16 },
  lawnTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 12 },
  lawnDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  lawnDetailText: { fontSize: 14, color: '#2c3e50' },
  unavailableBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
  unavailableText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  // No Data
  noDataContainer: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  noDataText: { fontSize: 18, color: '#666', textAlign: 'center', marginTop: 10, fontWeight: '600' },
  
  // Suggestion Box (for error state)
  suggestionBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginHorizontal: 16, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  suggestionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  suggestionText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  suggestionButtons: { gap: 10 },
  suggestionButton: { backgroundColor: '#b48a64', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#b48a64' },
  suggestionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  secondaryButtonText: { color: '#b48a64' },
});

export default LawnListScreenExample;
