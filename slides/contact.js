import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getContactUs } from '../config/apis';

const contact = () => {
  const navigation = useNavigation();
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Starting to fetch contact data...');
      const data = await getContactUs();
      console.log('📄 Contact data received:', data);
      
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ No data or invalid format returned from API');
        setError('No contact information available');
        return;
      }
      
      // Transform array data - only extract Info Desk
      let infoDeskData = {};
      
      data.forEach(item => {
        const category = item.category?.toLowerCase();
        
        if (category?.includes('info')) {
          infoDeskData = {
            timing: item.time || '',
            phones: item.phoneNumbers || [],
            email: item.email || ''
          };
        }
      });
      
      const normalizedData = {
        infoDesk: infoDeskData
      };
      
      console.log('📋 Normalized contact data:', normalizedData);
      setContactData(normalizedData);
    } catch (err) {
      console.error('❌ Error fetching contact data:', err);
      setError(err.message || 'Failed to fetch contact information');
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@peshawarservicesclub.com');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        {/* 🔹 Notch with Image Background */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}>
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.ctext}>Contact Us</Text>
            <View style={{ width: 40 }} />
          </View>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5D4037" />
                <Text style={styles.loadingText}>Loading contact information...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={48} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : contactData ? (
              <>
                {/* Info Desk Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionTitle}>Info Desk</Text>
                    <View style={styles.timingBadge}>
                      <Icon name="access-time" size={14} color="#5D4037" />
                      <Text style={styles.timingBadgeText}>
                        {contactData.infoDesk?.timing || '9am - 8pm'}
                      </Text>
                    </View>
                  </View>
                  {contactData.infoDesk?.phones && contactData.infoDesk.phones.length > 0 ? (
                    contactData.infoDesk.phones.map((phone, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.contactRow}
                        onPress={() => handlePhonePress(phone)}>
                        <Text style={styles.icon}>📞</Text>
                        <Text style={styles.phoneText}>{phone}</Text>
                      </TouchableOpacity>
                    ))
                  ) : null}
                </View>

                {/* Address Card */}
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Address</Text>
                  <Text style={styles.addressText}>Peshawar Services Club</Text>
                  <Text style={styles.addressText}>40-The Mall, Peshawar Cantt.</Text>
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handlePhonePress('0919212753')}>
                    <Text style={styles.icon}>📞</Text>
                    <Text style={styles.phoneText}>091-9212753-4</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={handleEmailPress}>
                    <Text style={styles.icon}>✉️</Text>
                    <Text style={styles.emailText}>info@peshawarservicesclub.com</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}

          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
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

  ctext: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 8,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(93, 64, 55, 0.2)',
  },
  timingBadgeText: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '600',
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,

  },
  phoneText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#000000',
    marginVertical: 2,
  },
  emailText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#5D4037',
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default contact;