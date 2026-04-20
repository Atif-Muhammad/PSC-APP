import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
  RefreshControl,
  Modal,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listMonthlyBills, getBaseUrl } from '../config/apis';

// Theme colors - defined outside component for StyleSheet access
const THEME = {
  primary: '#543A14',
  secondary: '#8B5A2B',
  gold: '#B48A64',
  background: '#F5F1E9',
  card: '#FFFFFF',
  inputBackground: '#F2E8DF',
  text: '#543A14',
  textSecondary: '#999',
  border: '#E8DDD0',
  downloadButton: '#F5E6D3',
};

const MonthlyBillHistory = ({ navigation }) => {
  // State Management - CRITICAL FIXES
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [allBills, setAllBills] = useState([]); // All bills from API
  const [filteredBills, setFilteredBills] = useState([]); // Filtered bills for current user
  const [currentUser, setCurrentUser] = useState(null);
  const [membershipNo, setMembershipNo] = useState(null); // CRITICAL: Initialize as null

  // Period selectors - Default to March 2026
  const [selectedMonth, setSelectedMonth] = useState('03'); // Default to March
  const [selectedYear, setSelectedYear] = useState('2026'); // Default to 2026
  
  // Dropdown states
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Theme colors - reference to external constant
  const theme = THEME;

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear -2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  // Fetch user data and bills on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch bills when month/year changes
  useEffect(() => {
    // Clear previous bills immediately when filters change (prevent ghosting)
    setFilteredBills([]);
    
    if (membershipNo) {
      fetchBills();
    }
  }, [selectedMonth, selectedYear, membershipNo]);

  const fetchUserData = async () => {
   try {
     const userData = await AsyncStorage.getItem('user_data');
     if (userData) {
       const parsedUser= JSON.parse(userData);
        setCurrentUser(parsedUser);
        
        // Extract membership number with sanitization
       const memberNo = parsedUser?.Membership_No || 
                       parsedUser?.membershipNo || 
                       parsedUser?.memberId || 
                       parsedUser?.id || '';
        
        // Sanitize - remove any non-digit characters
       const sanitizedNo= String(memberNo).replace(/[^0-9]/g, '');
        setMembershipNo(sanitizedNo);
        
       console.log('👤 User loaded, Membership No:', sanitizedNo);
      } else {
        setError('User data not found. Please login again.');
      }
    } catch (err) {
     console.error('❌ Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
   if (!membershipNo) return;
    
   try {
      setLoading(true);
      setError(null);
      
     console.log(`📋 Fetching all bills for month: ${selectedMonth}, year: ${selectedYear}`);
      
      // Fetch ALL bills for the selected month/year (not filtered by member)
     const billsData = await listMonthlyBills(selectedMonth, selectedYear);
     console.log('📦 All bills received:', billsData);
      
      // Store all bills
     const billsArray = Array.isArray(billsData) ? billsData : [billsData].filter(Boolean);
      setAllBills(billsArray);
      
      // CLIENT-SIDE FILTERING: Filter bills for current user only using MATHEMATICAL TRUTH
      const myBills = billsArray.filter(bill => {
        // 1. Force the User's ID to a pure integer (Removes 'PSC-', '00', etc.)
        const userNum = parseInt(String(membershipNo).replace(/[^0-9]/g, ''), 10);

        // 2. Extract the Bill's ID from the dedicated field or filename prefix
        const rawBillId = bill.membershipNo || (bill.filename || "").split('_')[0];
        const billNum = parseInt(String(rawBillId).replace(/[^0-9]/g, ''), 10);

        // 3. THE TRUTH TEST: 
        // If user is 3, billNum MUST BE 3. 803 === 3 will always be FALSE.
        const isMatch = billNum === userNum;

        // 4. FORCED DEBUGGING (KILL THE GHOST):
        if (billNum === 803 && userNum === 3 && isMatch === false) {
            console.log("✅ SUCCESS: Blocked Bill 803 from User 3.");
        } else if (isMatch && billNum !== userNum) {
            console.error("🛑 CRITICAL FAILURE: Logic leak detected.");
        }

        return isMatch;
      });
      
     console.log(`✅ Filtered to ${myBills.length} bills for member ${membershipNo}`);
      setFilteredBills(myBills);
      
    } catch (err) {
     console.error('❌ Error fetching bills:', err);
      setError(err.message || 'Failed to fetch bills');
      Alert.alert('Error', err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBills();
  }, [selectedMonth, selectedYear, membershipNo]);

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

  const renderBillItem = ({ item }) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <View style={styles.billIconContainer}>
          <Icon name="file-pdf-box" size={32} color={THEME.gold} />
        </View>
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
         style={styles.viewButton}
          onPress={() => handleViewBill(item)}
          activeOpacity={0.7}
        >
          <Icon name="eye-outline" size={20} color={THEME.gold} />
          <Text style={styles.viewButtonText}>VIEW</Text>
        </TouchableOpacity>

        <TouchableOpacity
         style={styles.downloadButton}
          onPress={() => handleDownloadBill(item)}
          activeOpacity={0.7}
        >
          <Icon name="download-outline" size={20} color="#FFF" />
          <Text style={styles.downloadButtonText}>DOWNLOAD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-remove-outline" size={64} color="#999" />
      <Text style={styles.emptyTitle}>No Bills Found</Text>
      <Text style={styles.emptyText}>
        No monthly bills available for the selected filters.
      </Text>
    </View>
  );

 if (loading && !refreshing) {
   return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.gold} />
        <Text style={styles.loadingText}>Loading Bills...</Text>
      </View>
    );
  }

 return (
    <View style={[styles.container, { backgroundColor: THEME.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      {/* Notch Header */}
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

          <Text style={styles.headerText}>Monthly Bills</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchBills}
          >
            <Icon name="refresh" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Filter Card */}
      <View style={styles.filterCard}>
        <Text style={styles.cardTitle}>Filter Bills</Text>

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
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {monthNames[parseInt(selectedMonth) - 1]}
              </Text>
              <Icon name="chevron-down" size={20} color={THEME.gold} />
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
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>{selectedYear}</Text>
              <Icon name="chevron-down" size={20} color={THEME.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Membership Info */}
        {membershipNo && (
          <View style={styles.membershipInfo}>
            <Icon name="account-outline" size={16} color="#666" />
            <Text style={styles.membershipText}>
              Membership: {membershipNo}
            </Text>
          </View>
        )}
      </View>

      {/* Bills List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>
            {error}
          </Text>
          <TouchableOpacity
           style={styles.retryButton}
            onPress={fetchBills}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
         renderItem={renderBillItem}
          keyExtractor={(item, index) => item.id || item.filename || index.toString()}
         contentContainerStyle={styles.listContent}
         refreshControl={
            <RefreshControl
             refreshing={refreshing}
              onRefresh={onRefresh}
             tintColor={THEME.gold}
             colors={[THEME.gold]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
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
    {/* Use styles.dropdownModal to ensure a white background and elevation */}
    <View style={styles.dropdownModal}>
      <ScrollView>
        {yearOptions.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.dropdownOption,
              selectedYear === year.toString() && styles.selectedOption
            ]}
            onPress={() => {
              setSelectedYear(year.toString());
              setShowYearDropdown(false);
            }}
          >
            <Text style={styles.dropdownOptionText}>{year}</Text>
            {/* Visual indicator for current selection */}
            {selectedYear === year.toString() && (
              <Icon name="check" size={20} color="#B48A64" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
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

  // Notch Header Styles (matching BillPaymentsScreen)
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
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filter Card Styles
 filterCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#543A14',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 15,
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
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8DDD0',
  },
  membershipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },

  // Dropdown Modal Styles
  dropdownModal: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 250,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },

  // Bill Card Styles
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

  // List & Empty State Styles
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // Modal & Dropdown Options
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '60%',
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  monthOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  yearOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedMonthOption: {
    backgroundColor: '#F2E8DF',
  },
  selectedYearOption: {
    backgroundColor: '#F2E8DF',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#333',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MonthlyBillHistory;
