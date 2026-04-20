
import React, { useState } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Use library instead of custom decoder
import { storeAuthData, getBaseUrl, userWho, registerFcmToken, removeAuthData, loginAdmin } from '../../config/apis';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './contexts/AuthContext';

const background = require('../../assets/bg.jpeg');
const logo = require('../../assets/PSCLogoFullWhite.png');

const LoginScr = ({ navigation }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('member');
  const [memberId, setMemberId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = `${getBaseUrl()}/auth`;

  // === MEMBER LOGIN ===
  // Helper function to mask email
  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '***@***';

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***';

    // Mask local part (show first 3 and last 1 character)
    let maskedLocal;
    if (localPart.length <= 4) {
      // For very short emails, show first char and mask the rest
      maskedLocal = localPart[0] + '*'.repeat(localPart.length - 1);
    } else {
      const firstThree = localPart.substring(0, 3);
      const lastOne = localPart.substring(localPart.length - 1);
      const middleLength = localPart.length - 4;
      maskedLocal = firstThree + '*'.repeat(middleLength) + lastOne;
    }

    // Mask domain completely to show only ***
    const domainParts = domain.split('.');
    let maskedDomain = '***';

    // Preserve the extension if it exists
    if (domainParts.length > 1) {
      const extension = domainParts.slice(1).join('.');
      maskedDomain += '.' + extension;
    }

    return `${maskedLocal}@${maskedDomain}`;
  };

  const handleSendOTP = async () => {
    if (!memberId.trim()) {
      Alert.alert('Error', 'Please enter your Member ID.');
      return;
    }

    setLoading(true);
    try {
      console.log(`${BASE_URL}/sendOTP/member`)
      console.log('📤 Sending OTP for member:', memberId);
      const response = await axios.post(
        `${BASE_URL}/sendOTP/member`,
        { memberID: memberId.trim() },
        {
          headers: { 'client-type': 'mobile' },
          timeout: 60000 // Increased timeout to 60s for email sending
        }
      );

      console.log('✅ OTP sent response:', response);

      // Extract email from response - the email is in 'accepted' array or 'envelope.to' array
      const userEmail = response.data?.accepted?.[0] ||
        response.data?.envelope?.to?.[0] ||
        response.data?.email ||
        response.data?.data?.email;

      console.log('📧 Extracted email:', userEmail);
      const maskedEmail = maskEmail(userEmail);
      console.log('🔒 Masked email:', maskedEmail);

      setOtpSent(true);

      // Display success alert with masked email and expiry info
      Alert.alert(
        'Success',
        `OTP sent to your registered email "${maskedEmail}"\n\nNote: OTP will expire after 1 hour.`
      );
    } catch (err) {
      console.error('❌ OTP send error:', err);
      if (err.toJSON) {
        console.error('❌ Error JSON:', JSON.stringify(err.toJSON(), null, 2));
      }
      if (err.response) {
        console.error('❌ Response status:', err.response.status);
        console.error('❌ Response data:', JSON.stringify(err.response.data, null, 2));
        console.error('❌ Response headers:', JSON.stringify(err.response.headers, null, 2));
      } else if (err.request) {
        console.error('❌ No response received. Request:', err.request);
      } else {
        console.error('❌ Error setting up request:', err.message);
      }

      // Check if the member is blocked or deactivated (403 Forbidden)
      if (err.response?.status === 403) {
        const message = err.response?.data?.message || 'Your account access has been restricted.';
        Alert.alert(
          '⚠️ Account Restricted',
          message + '\n\nIf you believe this is an error, please visit the club office or call the administration desk.',
          [
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }

      // Handle member not found
      if (err.response?.status === 400 || err.response?.status === 404) {
        Alert.alert(
          'Member Not Found',
          'The Member ID you entered was not found. Please check and try again.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Handle timeout error
      if (err.code === 'ECONNABORTED') {
        Alert.alert('Timeout', 'The request took too long. The email might still be sending. Please wait a moment and check your inbox.');
        return;
      }

      // Generic error handling
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }
    if (!memberId.trim()) {
      Alert.alert('Error', 'Member ID is required.');
      return;
    }

    setLoading(true);
    try {
      // Get FCM Token for Single Device Session
      let fcmToken = null;
      try {
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }
        fcmToken = await messaging().getToken();
      } catch (fcmErr) {
        console.warn('⚠️ Could not get FCM token for login:', fcmErr.message);
      }

      const response = await axios.post(
        `${BASE_URL}/login/member`,
        {
          memberID: memberId.trim(),
          otp: otp.trim(),
          fcmToken: fcmToken, // Pass fcmToken here
        },
        {
          headers: { 'client-type': 'mobile' },
          timeout: 10000
        }
      );

      console.log('✅ OTP verification response:', response);

      const { access_token, refresh_token } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('No tokens received from server');
      }

      // Decode the JWT token to get member information
      let decodedToken;
      try {
        decodedToken = jwtDecode(access_token);
        console.log('🔓 Decoded JWT token:', decodedToken);
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
        decodedToken = null;
      }

      const userInfo = {
        role: 'MEMBER',
        name: decodedToken?.name || 'Member',
        email: decodedToken?.email || '',
        memberId: decodedToken?.id || memberId.trim(),
        membershipNo: decodedToken?.membershipNo || decodedToken?.id || memberId.trim(),
        status: decodedToken?.status || 'ACTIVE', // Include member status for booking restrictions
        ...(decodedToken?.id && { id: decodedToken.id })
      };

      console.log('📝 UserInfo to be stored:', userInfo);

      // Store tokens and user data
      await storeAuthData({ access_token, refresh_token }, userInfo);

      // Verify user activeness
      try {
        const userWhoData = await userWho(fcmToken);
        console.log('✅ User status check result:', userWhoData);

        // Always try to get and send current FCM token
        try {
          // Note: On simulators, this might still fail if not configured correctly, 
          // but we've added entitlements to help.
          if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
          }
          const currentToken = await messaging().getToken();
          if (currentToken) {
            console.log('🔑 Current FCM Token:', currentToken);
            await registerFcmToken(userInfo.id, currentToken);
            console.log('✅ FCM token updated on backend');
          } else {
            console.log('⚠️ No FCM token available');
          }
        } catch (fcmErr) {
          console.warn('⚠️ FCM registration failed (Common on simulators):', fcmErr.message);
          // Non-blocking error
        }

        // Check if FCM token is missing in userWho response
        if (!userWhoData?.fcmToken) {
          console.log('❕ FCM token missing in user-who response, checking permissions...');
          try {
            const authStatus = await messaging().requestPermission();
            const enabled =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
              console.log('🔔 Permission granted after check');
              if (Platform.OS === 'ios') {
                await messaging().registerDeviceForRemoteMessages();
              }
              const newToken = await messaging().getToken();
              if (newToken) {
                await registerFcmToken(userInfo.id, newToken);
                console.log('✅ FCM token updated after permission grant');
              }
            }
          } catch (permError) {
            console.warn('⚠️ Permission check failed:', permError.message);
          }
        }

      } catch (activCheckErr) {
        console.error('❌ User activeness check failed:', activCheckErr);
        // We log this but don't necessarily block login unless it's a specific 403
        if (activCheckErr.response?.status === 403) {
          await removeAuthData();
          throw new Error('User is not active. Please contact support.');
        }
      }

      // Update global auth state
      login(userInfo, access_token, refresh_token);

      Alert.alert('Success', 'Login successful!');
      console.log('✅ Tokens saved and global auth updated');

      // Navigate to start
      navigation.navigate('start');

    } catch (err) {
      console.error('❌ OTP verification error:', err);

      let errorMessage = 'Invalid OTP. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Member not found.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // === ADMIN LOGIN ===
  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Admin login attempt:', { email });

      // Use the loginAdmin function from apis.js
      const result = await loginAdmin(email.trim(), password.trim());

      console.log('✅ Admin login response:', result);

      const { admin, token } = result;
      
      // Validate admin data exists
      if (!admin) {
        throw new Error('Admin login failed: Invalid response from server');
      }

      // Get FCM Token for Single Device Session
      let fcmToken = null;
      try {
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }
        fcmToken = await messaging().getToken();
        
        // Register FCM token if we have both admin ID and token
        if (admin && admin.id && fcmToken) {
          console.log('🔑 Current Admin FCM Token:', fcmToken);
          await registerFcmToken(admin.id, fcmToken);
          console.log('✅ Admin FCM token updated on backend');
        }
      } catch (fcmErr) {
        console.warn('⚠️ Could not get or register FCM token for admin login:', fcmErr.message);
      }

      // Update global auth state
      // Since loginAdmin already stores tokens, we just need to call login with the admin data
      // and the tokens that were already stored
      const storedAccessToken = await AsyncStorage.getItem('access_token');
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      
      // Double-check that admin data exists before passing to login
      if (!admin) {
        throw new Error('Admin login failed: Invalid admin data after login');
      }
      
      login(admin, storedAccessToken, storedRefreshToken);

      Alert.alert('Success', 'Admin login successful!');
      console.log('✅ Admin tokens saved and global auth updated');

      navigation.navigate('start');

    } catch (err) {
      console.error('❌ Admin login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Admin account not found.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Bad request. Please check your credentials.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'member' ? 'admin' : 'member');
    setOtpSent(false);
    setMemberId('');
    setOtp('');
    setEmail('');
    setPassword('');
  };

  // In your login/signup success handler:
  const handleLoginSuccess = async (responseData) => {
    try {
      const { access_token, refresh_token, user } = responseData;

      // Store auth tokens and user data
      await storeAuthData(
        { access_token, refresh_token },
        user
      );

      console.log('✅ Login successful, stored user:', user);

      // Navigate to home
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login storage error:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground source={background} resizeMode="cover" style={styles.image}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.welcome}>
              <Text style={styles.gret}>
                {mode === 'member' ? 'Member Login' : 'Admin Login'}
              </Text>

              {mode === 'member' ? (
                <>
                  {!otpSent ? (
                    <>
                      <View style={styles.inputContainer}>
                        <Icon name="badge-account-horizontal" size={20} color="black" style={styles.icon} />
                        <TextInput
                          placeholder="Enter Member ID"
                          placeholderTextColor="rgba(0,0,0,0.5)"
                          style={styles.input}
                          value={memberId}
                          onChangeText={setMemberId}
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loading}
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOTP}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputContainer}>
                        <Icon name="email-outline" size={20} color="black" style={styles.icon} />
                        <TextInput
                          placeholder="Enter OTP"
                          placeholderTextColor="rgba(0,0,0,0.5)"
                          style={styles.input}
                          value={otp}
                          onChangeText={setOtp}
                          keyboardType="number-pad"
                          editable={!loading}
                          maxLength={6}
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleVerifyOTP}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Verify OTP</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        style={styles.backLink}
                      >
                        <Text style={styles.backLinkText}>
                          ← Back to Member ID
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Icon name="email-outline" size={20} color="black" style={styles.icon} />
                    <TextInput
                      placeholder="Enter Admin Email"
                      placeholderTextColor="rgba(0,0,0,0.5)"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="black" style={styles.icon} />
                    <TextInput
                      placeholder="Enter Password"
                      placeholderTextColor="rgba(0,0,0,0.5)"
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleAdminLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={toggleMode}
                style={styles.modeToggle}
                disabled={loading}
              >
                <Text style={styles.modeToggleText}>
                  {mode === 'member' ? 'Login as Admin?' : 'Login as Member?'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aboutButton}
                onPress={() => navigation.navigate('about')}
                activeOpacity={0.7}
              >
                <Icon name="information-outline" size={20} color="white" style={styles.aboutIcon} />
                <Text style={styles.aboutText}>About PSC</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  image: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logo: { width: 400, height: 300, opacity: 1 },
  welcome: {
    marginTop: 70,
    alignItems: 'center',
    width: '80%',
  },
  gret: {
    fontSize: 38,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  icon: { fontSize: 20, marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    color: 'black',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'rgba(216, 184, 54, 0.82)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modeToggle: { marginTop: 20 },
  modeToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  backLink: { marginTop: 15 },
  backLinkText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  aboutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  aboutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginScr;