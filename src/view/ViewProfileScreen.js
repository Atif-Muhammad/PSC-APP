import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../auth/contexts/AuthContext';
import axios from 'axios';

// Base URL from your config
const BASE_URL = Platform.select({
  android: 'https://admin.peshawarservicesclub.com/api',
  ios: 'https://admin.peshawarservicesclub.com/api',
});

// Update member function as specified
export const updateMember = async ({ Membership_No, updates }) => {
  const response = await axios.patch(
    `${BASE_URL}/member/update/member?memberID=${Membership_No}`,
    updates,
    { withCredentials: true }
  );
  return response.data;
};

const ViewProfileScreen = ({ navigation }) => {
  const { user } = useAuth();

  // State management
  const [email, setEmail] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setInitialEmail(user.email);
    }
  }, [user]);

  // Check if email has changed
  const hasEmailChanged = email !== initialEmail;

  // Handle save email
  const handleSaveEmail = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);

      const membershipNo =
        user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;

      if (!membershipNo) {
        Alert.alert('Error', 'Membership number not found. Please login again.');
        return;
      }

      // Call updateMember API with exact format specified
      await updateMember({
        Membership_No: membershipNo,
        updates: { Email: email },
      });

      // Update local state
      setInitialEmail(email);
      setIsEditingEmail(false);

      Alert.alert('Success', 'Profile Updated Successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEmail(initialEmail);
    setIsEditingEmail(false);
  };

  // Get first initial for avatar
  const getFirstInitial = () => {
    const name = user?.name || user?.userName || 'M';
    return name.charAt(0).toUpperCase();
  };

  // Render navigation item
  const renderNavItem = (label, iconName, onPress) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.navItemLeft}>
        <Icon name={iconName} size={24} color="#1A237E" />
        <Text style={styles.navItemLabel}>{label}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section - Matching Home Screen */}
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>View Profile</Text>

            <View style={styles.placeholder} />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.usertext}>
              {user?.name || user?.userName || 'Member'}
            </Text>
            <View style={styles.roleContainer}>
              <MaterialIcons name="badge" size={16} color="#666" />
              <Text style={styles.roleText}>
                #{user?.membershipNo || user?.membership_no || 'N/A'}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Avatar Card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getFirstInitial()}</Text>
            </View>
          </View>

          {/* Details Card - Editable Email */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name="email-outline" size={20} color="#666" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Email</Text>
              </View>

              <View style={styles.detailRight}>
                {isEditingEmail ? (
                  <TextInput
                    style={styles.emailInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                  />
                ) : (
                  <Text style={styles.detailValue}>{email || 'Not provided'}</Text>
                )}

                {!isEditingEmail && (
                  <TouchableOpacity
                    onPress={() => setIsEditingEmail(true)}
                    style={styles.editButton}
                    disabled={isLoading}
                  >
                    <Icon name="pencil-outline" size={20} color="#C5A059" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Action Buttons when editing */}
            {isEditingEmail && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.saveButton, !hasEmailChanged && styles.saveButtonDisabled]}
                  onPress={handleSaveEmail}
                  disabled={!hasEmailChanged || isLoading}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Links Section - Matching Sidebar Menu Style */}
          <View style={styles.quickLinksSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Quick Links</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.linksCard}>
              {renderNavItem(
                'My Bookings',
                'calendar-clock',
                () => navigation.navigate('MemberBookingsScreen')
              )}

              <View style={styles.separator} />

              {renderNavItem(
                'Bill Payment History',
                'file-document-outline',
                () => navigation.navigate('BillPaymentHistory')
              )}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  // Safe Area & Status Bar
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },

  // Header Section - Matching Home Screen Exactly
  headerBackground: {
    backgroundColor: '#fffaf2',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerImage: {
    resizeMode: 'cover',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  usertext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Avatar Card
  avatarCard: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Card Styles - Matching Facilities Cards
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    maxWidth: 200,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  editButton: {
    marginLeft: 12,
    padding: 4,
  },
  emailInput: {
    fontSize: 15,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#C5A059',
    paddingVertical: 4,
    paddingRight: 8,
    minWidth: 200,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Action Buttons
  actionButtons: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#C5A059',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    backgroundColor: '#D4C5A9',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },

  // Quick Links Section - Matching Sidebar Menu
  quickLinksSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  linksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
});

export default ViewProfileScreen;
