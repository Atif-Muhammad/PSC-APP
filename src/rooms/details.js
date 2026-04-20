import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Alert,
    StatusBar,
    Image,
    Dimensions,
    Modal,
    TextInput,
    RefreshControl,
    Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { useVoucher } from '../auth/contexts/VoucherContext';
import { contentService } from '../../config/apis';
import { useAuth } from '../auth/contexts/AuthContext';
import { ImageBackground } from 'react-native';
import Swiper from "react-native-swiper";
import HtmlRenderer from '../events/HtmlRenderer';

const { width: screenWidth } = Dimensions.get('window');

export default function details({ navigation, route }) {
    const { setVoucher } = useVoucher();
    const { user, isAuthenticated } = useAuth();

    console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
    console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

    const userRole = user?.role;
    const userName = user?.name;
    const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
    const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

    console.log('🔍 Extracted values:', {
        userRole,
        userName,
        membershipNo,
        adminId,
        allUserKeys: user ? Object.keys(user) : 'No user'
    });

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [roomType, setRoomType] = useState(route.params?.roomType);
    const [imageIndex, setImageIndex] = useState(0);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [showUnreserveModal, setShowUnreserveModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [roomRules, setRoomRules] = useState([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [rulesExpanded, setRulesExpanded] = useState(false);
    const [rulesError, setRulesError] = useState(null);

    useEffect(() => {
        console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

        if (!isAuthenticated || !user) {
            Alert.alert(
                'Authentication Required',
                'Please login to access room details.',
                [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
            );
            return;
        }

        fetchRoomRules();
        // For members, check availability immediately
        if (isMemberUser()) {
            checkRoomTypeAvailability();
        } else {
            fetchRooms();
        }
    }, [isAuthenticated, user]);

    // Fetch room rules from backend
    const fetchRoomRules = async () => {
        try {
            setLoadingRules(true);
            setRulesError(null);

            console.log('📡 Fetching room rules');
            const rules = await contentService.getRules('ROOM'); // Assuming 'ROOM' is the type for rooms
            console.log("✅ Fetched room rules:", rules);

            if (rules && Array.isArray(rules)) {
                setRoomRules(rules);
            } else {
                setRoomRules([]);
            }
        } catch (err) {
            console.error('❌ Error fetching room rules:', err);
            setRulesError('Failed to load room rules');
        } finally {
            setLoadingRules(false);
        }
    };

    // Render dynamic room rules
    const renderRoomRules = () => {
        if (!isAuthenticated) {
            return null; // Don't show rules if not authenticated
        }

        if (loadingRules && roomRules.length === 0) {
            return (
                <View style={styles.rulesLoadingContainer}>
                    <ActivityIndicator size="small" color="#b48a64" />
                    <Text style={styles.rulesLoadingText}>Loading policies...</Text>
                </View>
            );
        }

        if (rulesError || roomRules.length === 0) {
            // Show static rules as fallback
            return renderStaticRules();
        }

        const displayRules = rulesExpanded ? roomRules : roomRules.slice(0, 1);

        return (
            <View style={styles.policySection}>
                <View style={styles.rulesHeader}>
                    <Text style={styles.policyTitle}>Room Booking Policy</Text>
                </View>

                {displayRules.map((rule, index) => (
                    <View key={rule._id || index} style={styles.ruleItem}>
                        <HtmlRenderer
                            htmlContent={rule.content}
                            maxLines={rulesExpanded ? undefined : 3}
                            textStyle={styles.ruleText}
                        />
                    </View>
                ))}

                {roomRules.length > 1 && !rulesExpanded && (
                    <TouchableOpacity
                        style={styles.expandRulesButton}
                        onPress={() => setRulesExpanded(true)}
                    >
                        <Text style={styles.expandRulesText}>Show More Rules</Text>
                        <Icon name="chevron-down" size={16} color="#b48a64" />
                    </TouchableOpacity>
                )}

                {/* Last updated info */}
                {roomRules.length > 0 && roomRules[0].updatedAt && (
                    <View style={styles.rulesFooter}>
                        <Text style={styles.updatedText}>
                            Last updated: {new Date(roomRules[0].updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Static rules fallback (when API fails or no rules)
    const renderStaticRules = () => (
        <View style={styles.policySection}>
            <Text style={styles.policyTitle}>Room Booking Policy</Text>

            <Text style={styles.policySub}>Check-in/Check-out</Text>
            <Text style={styles.bullet}>• Check-in: 2:00 PM</Text>
            <Text style={styles.bullet}>• Check-out: 12:00 PM</Text>

            <Text style={styles.policySub}>Booking Guidelines</Text>
            <Text style={styles.bullet}>• Modern amenities inclusion</Text>
            <Text style={styles.bullet}>• Room maintenance schedule</Text>
            <Text style={styles.bullet}>• Membership card mandatory at check-in</Text>
            <Text style={styles.bullet}>• Cancellation policy applies</Text>

            <Text style={styles.policySub}>Cancellation Schedule</Text>
            <Text style={styles.bullet}>• 48 hours before: Full refund</Text>
            <Text style={styles.bullet}>• 24-48 hours before: 50% refund</Text>
            <Text style={styles.bullet}>• Less than 24 hours: No refund</Text>
        </View>
    );

    const isAdminUser = () => {
        const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
        console.log('👮 isAdminUser check:', { userRole, isAdmin });
        return isAdmin;
    };

    const isMemberUser = () => {
        const isMember = userRole === 'MEMBER';
        console.log('👤 isMemberUser check:', { userRole, isMember });
        return isMember;
    };

    // Check room type availability for members
    const checkRoomTypeAvailability = async () => {
        try {
            setLoadingRooms(true);
            console.log('🔍 Checking availability for room type:', roomType.id);

            const todayVal = new Date();
            const today = `${todayVal.getFullYear()}-${String(todayVal.getMonth() + 1).padStart(2, '0')}-${String(todayVal.getDate()).padStart(2, '0')}`;
            const tomorrowVal = new Date(Date.now() + 86400000);
            const tomorrow = `${tomorrowVal.getFullYear()}-${String(tomorrowVal.getMonth() + 1).padStart(2, '0')}-${String(tomorrowVal.getDate()).padStart(2, '0')}`;

            const availabilityData = await roomService.getMemberRoomsForDate(today, tomorrow, roomType.id);

            console.log("✅ Availability check result:", availabilityData);

            if (availabilityData &&
                (availabilityData.available === true ||
                    (Array.isArray(availabilityData) && availabilityData.length > 0) ||
                    availabilityData.message === 'Rooms are available')) {
                setIsAvailable(true);
            } else {
                setIsAvailable(false);
                Alert.alert(
                    'Not Available',
                    'Sorry, this room type is not available for the selected dates. Please try different dates or contact support.'
                );
            }

            setAvailabilityChecked(true);
        } catch (error) {
            console.error('❌ Error checking availability:', error);
            setIsAvailable(false);
            Alert.alert(
                'Availability Check Failed',
                'Unable to check room availability. Please try again.'
            );
        } finally {
            setLoadingRooms(false);
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            console.log('🔄 Fetching rooms for roomType:', roomType.id);
            console.log('👤 Current user role:', userRole);

            const roomData = await roomService.getAvailableRooms(roomType.id, userRole);

            console.log("✅ Fetched available rooms:", roomData);
            setRooms(roomData);
        } catch (error) {
            console.error('❌ Error fetching rooms:', error);

            if (error.response?.status === 403) {
                Alert.alert(
                    'Access Denied',
                    'You do not have permission to view available rooms. Please contact administrator.'
                );
            } else if (error.response?.status === 401) {
                Alert.alert(
                    'Authentication Error',
                    'Please login again to continue.'
                );
                navigation.navigate('LoginScr');
            } else {
                Alert.alert('Error', 'Failed to load available rooms. Please try again.');
            }
        } finally {
            setLoadingRooms(false);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const isRoomReserved = (room) => {
        try {
            const today = new Date();
            
            // Check for active bookings (BOOKED status)
            if (room.bookings && Array.isArray(room.bookings)) {
                for (const bookingWrapper of room.bookings) {
                    if (!bookingWrapper) continue;
                    
                    // Skip cancelled bookings
                    const booking = bookingWrapper.booking || bookingWrapper;
                    const isCancelled = 
                        booking.paymentStatus === 'CANCELLED' ||
                        booking.status === 'CANCELLED' ||
                        booking.bookingStatus === 'CANCELLED';
                    
                    if (isCancelled) continue;
                    
                    const checkIn = booking.checkIn || booking.bookingDate;
                    const checkOut = booking.checkOut || booking.endDate || booking.bookingDate;
                    
                    if (checkIn && checkOut) {
                        const checkInDate = new Date(checkIn);
                        const checkOutDate = new Date(checkOut);
                        
                        if (today >= checkInDate && today <= checkOutDate) {
                            return true;
                        }
                    }
                }
            }
            
            // Check for reservations (RESERVED status)
            if (room.reservations && Array.isArray(room.reservations)) {
                for (const reservation of room.reservations) {
                    if (!reservation) continue;
                    
                    const reservedFrom = reservation.reservedFrom;
                    const reservedTo = reservation.reservedTo;
                    
                    if (reservedFrom && reservedTo) {
                        const fromDate = new Date(reservedFrom);
                        const toDate = new Date(reservedTo);
                        
                        if (today >= fromDate && today <= toDate) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking room reservation status:', error);
            return false;
        }
    };

    const handleRoomSelect = (room) => {
        console.log('🛏️ Room selected:', room.roomNumber);
        
        // Check if room is reserved or booked
        if (isRoomReserved(room)) {
            Alert.alert(
                'Room Not Available',
                'This room is already reserved or booked and cannot be selected.',
                [{ text: 'OK' }]
            );
            return;
        }
        
        if (isAdminUser()) {
            if (selectedRooms.find(r => r.id === room.id)) {
                setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
            } else {
                setSelectedRooms([...selectedRooms, room]);
            }
        } else {
            setSelectedRoom(room);
        }
    };

    const handleBookNow = () => {
        console.log('📖 Book Now clicked');
        console.log('👤 User object:', JSON.stringify(user, null, 2));
        console.log('📊 User status:', user?.status, user?.Status, user?.memberStatus);

        // Check if member is deactivated - handle multiple possible field names and casing
        const userStatus = user?.status || user?.Status || user?.memberStatus || '';
        if (userStatus.toUpperCase() === 'DEACTIVATED') {
            Alert.alert(
                'Account Deactivated',
                'You cannot book room. Please contact PSC for assistance.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (isMemberUser()) {
            console.log("check 1:", roomType)
            // Navigate to the new RoomBookingScreen instead of showing modal
            navigation.navigate('RoomBookingScreen', {
                roomType: roomType,
                room: selectedRoom,
                isMember: true,
                isAvailable: isAvailable,
            });
        } else {
            if (!selectedRoom) {
                Alert.alert('Please Select', 'Please select a room to continue');
                return;
            }
            // Navigate to the new RoomBookingScreen instead of showing modal
            navigation.navigate('RoomBookingScreen', {
                roomType: roomType,
                room: selectedRoom,
                isMember: false,
                isAvailable: isAvailable,
            });
        }
    };

    const handleReserveRooms = () => {
        console.log('🔒 Reserve Rooms clicked');
        if (selectedRooms.length === 0) {
            Alert.alert('Please Select', 'Please select at least one room to reserve');
            return;
        }
        setShowReservationModal(true);
    };

    const handleUnreserveRooms = () => {
        console.log('🔓 Unreserve Rooms clicked');
        if (selectedRooms.length === 0) {
            Alert.alert('Please Select', 'Please select at least one room to unreserve');
            return;
        }
        setShowUnreserveModal(true);
    };

    const handleConfirmBooking = async (bookingData) => {
        try {
            console.log('🎫 Starting booking process...');

            // Check if member is deactivated - prevent booking even if modal was opened
            const userStatus = user?.status || user?.Status || user?.memberStatus || '';
            if (userStatus.toUpperCase() === 'DEACTIVATED') {
                Alert.alert(
                    'Account Deactivated',
                    'You cannot book room. Please contact PSC for assistance.',
                    [{ text: 'OK' }]
                );
                setShowBookingModal(false);
                return;
            }

            const possibleMembershipNo = membershipNo || user?.id;

            if (!possibleMembershipNo) {
                Alert.alert(
                    'Membership Number Required',
                    `We couldn't find your membership number.`,
                    [{ text: 'OK' }]
                );
                return;
            }

            console.log('✅ Using membership number:', possibleMembershipNo);
            console.log("booking:", bookingData)
            // Prepare payload according to backend expectations
            const payload = {
                membership_no: possibleMembershipNo, // Send membership_no at root level
                from: bookingData.checkIn,
                to: bookingData.checkOut,
                numberOfRooms: bookingData.numberOfRooms || 1,
                numberOfAdults: bookingData.numberOfAdults || 1,
                numberOfChildren: bookingData.numberOfChildren || 0,
                pricingType: bookingData.isGuestBooking ? 'guest' : 'member',
                specialRequest: bookingData.specialRequest || '',
                // Note: Don't send totalPrice - backend calculates it
                // Note: Don't send selectedRoomIds - backend selects available rooms
                // Note: Don't send roomTypeId - it's in the query parameter
                // Guest booking fields
                guestName: bookingData.isGuestBooking ? bookingData.guestName : '',
                guestContact: bookingData.isGuestBooking ? bookingData.guestContact : '',
                remarks: bookingData.remarks || '',
            };

            console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

            // Call the booking service with roomType as query parameter
            const response = await bookingService.memberBookingRoom(roomType.id, payload);
            const result = response.data;
            console.log('✅ Booking response data received:', result);

            const navigationParams = {
                bookingType: 'ROOM',
                voucherData: result, // Pass the whole new structure
                bookingId: result.voucher?.booking_id || result.voucher?.id,
                invoiceNumber: result.voucher?.voucher_no,
                dueDate: result.due_date || result.voucher?.expiresAt,
                bookingData: {
                    ...bookingData,
                    totalPrice: result.voucher?.amount || bookingData.totalPrice,
                },
                roomType: roomType,
                memberDetails: result.membership ? {
                    memberName: result.membership.name,
                    membershipNo: result.membership.no,
                    email: result.membership.email,
                    contact: result.membership.contact
                } : null,
                isGuest: bookingData.isGuestBooking
            };

            // Set global voucher for the floating timer
            setVoucher(result, navigationParams);

            // Navigate to voucher screen
            navigation.navigate('voucher', navigationParams);

        } catch (error) {
            console.error('💥 Booking error in component:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: error.response?.data
            });

            let errorMessage = error.message || 'Failed to book room. Please try again.';

            // Extract error message from backend response if available
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.ResponseMessage) {
                errorMessage = error.response.data.ResponseMessage;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            // Handle specific HTTP status codes
            if (error.message?.includes('Network Error')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error.response?.status === 409) {
                errorMessage = errorMessage || 'Room not available for selected dates. Please choose different dates.';
            } else if (error.response?.status === 400) {
                errorMessage = errorMessage || 'Invalid booking data. Please check your information and try again.';
            } else if (error.response?.status === 500) {
                errorMessage = errorMessage || 'Server error. Please try again later.';
                // Log server errors for debugging
                console.error('Server error details:', error.response?.data);
            }

            Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
        }
    };

    // const handleConfirmReservation = async (reservationData) => {
    //   try {
    //     console.log('🔐 Starting reservation process...');
    //     console.log('   - User role:', userRole);

    //     const roomIds = selectedRooms.map(room => room.id);
    //     const payload = {
    //       roomIds: roomIds,
    //       reserve: true,
    //       reserveFrom: reservationData.reserveFrom,
    //       reserveTo: reservationData.reserveTo,
    //     };

    //     console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
    //     console.log('👤 Admin ID will come from JWT token');

    //     await roomService.reserveRooms(payload);

    //     Alert.alert(
    //       'Reservation Successful!',
    //       `${selectedRooms.length} room(s) have been reserved successfully.`,
    //       [{
    //         text: 'OK',
    //         onPress: () => {
    //           setShowReservationModal(false);
    //           setSelectedRooms([]);
    //           fetchRooms();
    //         }
    //       }]
    //     );
    //   } catch (error) {
    //     console.error('💥 Reservation error:', error);
    //     Alert.alert(
    //       'Reservation Failed',
    //       error.message || 'Failed to reserve rooms. Please try again.'
    //     );
    //   }
    // };

    const handleConfirmReservation = async (reservationData) => {
        try {
            console.log('🔐 Starting reservation process...');
            console.log('   - User role:', userRole);

            const roomIds = selectedRooms.map(room => room.id);
            const payload = {
                roomIds: roomIds,
                reserve: true,
                reserveFrom: reservationData.reserveFrom,
                reserveTo: reservationData.reserveTo,
                remarks: reservationData.remarks, // Added remarks
            };

            console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
            console.log('👤 Admin ID will come from JWT token');

            await roomService.reserveRooms(payload);

            Alert.alert(
                'Reservation Successful!',
                `${selectedRooms.length} room(s) have been reserved successfully.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setShowReservationModal(false);
                        setSelectedRooms([]);
                        fetchRooms();
                    }
                }]
            );
        } catch (error) {
            console.error('💥 Reservation error:', error);
            Alert.alert(
                'Reservation Failed',
                error.message || 'Failed to reserve rooms. Please try again.'
            );
        }
    };

    const handleConfirmUnreserve = async (unreserveData) => {
        try {
            console.log('🔓 Starting unreservation process...');
            console.log('   - User role:', userRole);

            const roomIds = selectedRooms.map(room => room.id);
            const payload = {
                roomIds: roomIds,
                reserve: false,
                reserveFrom: unreserveData.reserveFrom,
                reserveTo: unreserveData.reserveTo,
                remarks: unreserveData.remarks, // Added remarks
            };

            console.log('📦 Final unreservation payload:', JSON.stringify(payload, null, 2));

            await roomService.reserveRooms(payload);

            Alert.alert(
                'Unreservation Successful!',
                `${selectedRooms.length} room(s) have been unreserved successfully.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setShowUnreserveModal(false);
                        setSelectedRooms([]);
                        fetchRooms();
                    }
                }]
            );
        } catch (error) {
            console.error('💥 Unreservation error:', error);
            Alert.alert(
                'Unreservation Failed',
                error.message || 'Failed to unreserve rooms. Please try again.'
            );
        }
    };


    const onRefresh = () => {
        console.log('🔄 Pull-to-refresh triggered');
        setRefreshing(true);
        Promise.all([
            isMemberUser() ? checkRoomTypeAvailability() : fetchRooms(),
            fetchRoomRules()
        ]).finally(() => {
            setRefreshing(false);
        });
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'N/A';
        return `${parseFloat(price).toFixed(0)}Rs`;
    };

    // Room-specific features data
    const roomFeatures = {
        'Suite': {
            features: [
                'Single room',
                'Double bed',
                'TV lounge',
                'Sofa set',
                'Dining table',
                'Refrigerator',
                'Wifi',
                'Washroom with toiletries',
            ],
        },

        'Deluxe': {
            features: [
                'Single room',
                'Double bed',
                'Sofa set',
                'TV',
                'Dining Table',
                'Refrigerator',
                'Wifi',
                'Washroom with toiletries',
            ],
        },

        'Studio': {
            features: [
                'Single room',
                'Two single beds',
                'Sofa set',
                'TV',
                'Dining Table',
                'Refrigerator',
                'Wifi',
                'Washroom with toiletries',
            ],
        },
    };


    // Get features for current room type
    const getRoomFeatures = () => {
        const roomTypeName = roomType.name;
        // Check if room type name contains any of the keys
        for (const key of Object.keys(roomFeatures)) {
            if (roomTypeName.toLowerCase().includes(key.toLowerCase())) {
                return roomFeatures[key];
            }
        }
        // Default features for all other room types
        return {
            description: `${roomTypeName} comprise of:`,
            features: [
                'Single room',
                'Double bed',
                'TV',
                'Sofa set',
                'Refrigerator',
                'Side table',
                'Dining Table',
                'Washroom with toiletries',
            ],
        };
    };

    // Render features section
    const renderFeaturesSection = () => {
        const features = getRoomFeatures();
        if (!features) return null;

        return (
            <View style={styles.featuresSection}>
                <Text style={styles.featuresSectionTitle}>Features</Text>
                {/* <Text style={styles.featuresDescription}>{features.description}</Text> */}
                <View style={styles.featuresList}>
                    {features.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.featureItemText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderImages = () => {
        const images = roomType.images || [];

        if (images.length === 0) {
            return (
                <View style={styles.noImageContainer}>
                    <Icon name="image" size={60} color="#ccc" style={{ marginTop: 30 }} />
                    <Text style={styles.noImageText}>No images available</Text>
                </View>
            );
        }

        return (
            <View style={styles.sliderContainer}>
                <Swiper
                    autoplay
                    autoplayTimeout={4}
                    loop
                    showsPagination
                    activeDotColor="#A3834C"
                >
                    {images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: img.url }}
                            style={styles.sliderImage}
                        />
                    ))}
                </Swiper>
            </View>
        );
    };

    const renderRoomItem = ({ item }) => {
        const isSelected = isAdminUser()
            ? selectedRooms.find(r => r.id === item.id)
            : selectedRoom?.id === item.id;
        
        const isReserved = isRoomReserved(item);

        return (
            <TouchableOpacity
                style={[
                    styles.roomItem,
                    isSelected && styles.roomItemSelected,
                    isReserved && styles.roomItemReserved,
                ]}
                onPress={() => handleRoomSelect(item)}
                disabled={isReserved}
                activeOpacity={isReserved ? 0.5 : 0.7}
            >
                <View style={styles.roomInfo}>
                    <Text style={[
                        styles.roomNumber,
                        isReserved && styles.roomNumberReserved,
                    ]}>
                        Room {item.roomNumber}
                        {isReserved && ' (Reserved)'}
                    </Text>
                    <Text style={[
                        styles.roomDescription,
                        isReserved && styles.roomDescriptionReserved,
                    ]}>
                        {item.description || 'Comfortable and well-equipped room'}
                    </Text>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusIndicator,
                                isReserved ? styles.reserved : (item.isActive ? styles.active : styles.inactive),
                            ]}
                        />
                        <Text style={[
                            styles.statusText,
                            isReserved && styles.statusTextReserved,
                        ]}>
                            {isReserved ? 'Reserved' : (item.isActive ? 'Available' : 'Unavailable')}
                        </Text>
                    </View>
                </View>
                <Icon
                    name={isReserved ? 'lock' : (isSelected ? 'check-circle' : 'radio-button-unchecked')}
                    size={24}
                    color={isReserved ? '#999' : '#b48a64'}
                />
            </TouchableOpacity>
        );
    };

    // Render member-specific view
    const renderMemberView = () => {
        return (
            <View style={styles.memberSection}>
                {/* <Text style={styles.sectionTitle}>Book {roomType.name}</Text> */}

                {/* <View style={styles.availabilityInfo}>
                    <View style={styles.availabilityHeader}>
                        <Icon
                            name={isAvailable ? "check-circle" : "error"}
                            size={24}
                            color={isAvailable ? "#28a745" : "#dc3545"}
                        />
                        <Text style={[
                            styles.availabilityText,
                            { color: isAvailable ? "#28a745" : "#dc3545" }
                        ]}>
                            {isAvailable ? 'Available for Booking' : 'Currently Not Available'}
                        </Text>
                    </View>

                    <Text style={styles.availabilityDescription}>
                        {isAvailable
                            ? 'This room type is available for booking. Click "Book Now" to proceed with your reservation.'
                            : 'This room type is not available for the default dates. You can still check availability for different dates in the booking form.'
                        }
                    </Text>
                </View> */}

                {/* <View style={styles.bookingInfo}>
          <Text style={styles.bookingInfoTitle}>Booking Options</Text>
          <View style={styles.infoItem}>
            <Icon name="person" size={16} color="#b48a64" />
            <Text style={styles.infoText}>
              Book for yourself at member price: {formatPrice(roomType.priceMember)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="person-outline" size={16} color="#b48a64" />
            <Text style={styles.infoText}>
              Book for guest at guest price: {formatPrice(roomType.priceGuest)}
            </Text>
          </View>
        </View> */}
            </View>
        );
    };

    // Render admin view with room selection
    const renderAdminView = () => {
        return (
            <View style={styles.roomsSection}>
                <Text style={styles.sectionTitle}>Select Rooms to Reserve/Unreserve</Text>

                {loadingRooms ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#b48a64" />
                        <Text style={styles.loadingText}>Loading available rooms...</Text>
                    </View>
                ) : rooms.length > 0 ? (
                    <FlatList
                        data={rooms}
                        renderItem={renderRoomItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.noRoomsContainer}>
                        <Icon name="meeting-room" size={50} color="#ccc" />
                        <Text style={styles.noRoomsText}>No rooms available</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
                            <Text style={styles.retryText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Authentication Required</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.accessDeniedContainer}>
                    <Icon name="block" size={60} color="#ff6b6b" />
                    <Text style={styles.accessDeniedTitle}>Please Login</Text>
                    <Text style={styles.accessDeniedText}>
                        You need to be logged in to view room details.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('LoginScr')}
                    >
                        <Text style={styles.backButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <ImageBackground
                source={require("../../assets/notch.jpg")}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
                        <Icon name="arrow-back" size={28} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.notchTitle}>{roomType.name}</Text>

                    <View style={{ width: 40 }} />
                </View>
            </ImageBackground>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#b48a64']}
                    />
                }
            >
                {renderImages()}

                {/* Room Features Section */}
                {renderFeaturesSection()}

                {/* Admin-only Room Count & Selection Info */}
                {isAdminUser() && (
                    <View style={styles.roomTypeInfo}>
                        <View style={styles.roomCount}>
                            <Icon name="meeting-room" size={16} color="#666" />
                            <Text style={styles.roomCountText}>
                                {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
                            </Text>
                            {selectedRooms.length > 0 && (
                                <Text style={styles.selectedCountText}>
                                    • {selectedRooms.length} selected
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Conditionally render member or admin view */}
                {isMemberUser() ? renderMemberView() : renderAdminView()}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Actions */}
            {!loadingRooms && (
                <View style={styles.footer}>
                    {isAdminUser() ? (
                        <View style={styles.adminActions}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.reserveButton,
                                    selectedRooms.length === 0 && styles.buttonDisabled,
                                ]}
                                onPress={handleReserveRooms}
                                disabled={selectedRooms.length === 0}
                            >
                                <Text style={styles.actionButtonText}>
                                    Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.unreserveButton,
                                    selectedRooms.length === 0 && styles.buttonDisabled,
                                ]}
                                onPress={handleUnreserveRooms}
                                disabled={selectedRooms.length === 0}
                            >
                                <Text style={styles.actionButtonText}>
                                    Unreserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.bookButton,
                            ]}
                            onPress={handleBookNow}
                        >
                            <Text style={styles.actionButtonText}>
                                {availabilityChecked
                                    ? (isAvailable ? 'Book Now' : 'Check Availability')
                                    : 'Book Now'
                                }
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}


            {/* BookingModal removed - now using RoomBookingScreen */}


            <ReservationModal
                visible={showReservationModal}
                onClose={() => setShowReservationModal(false)}
                onConfirm={handleConfirmReservation}
                selectedRooms={selectedRooms}
                isReserve={true}
            />

            <ReservationModal
                visible={showUnreserveModal}
                onClose={() => setShowUnreserveModal(false)}
                onConfirm={handleConfirmUnreserve}
                selectedRooms={selectedRooms}
                isReserve={false}
            />
        </View>
    );
}

// Updated Booking Modal Component with Guest Booking DEFAULTED TO TRUE
const BookingModal = ({ visible, onClose, onConfirm, room, roomType, navigation, isMember, isAvailable }) => {
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [numberOfAdults, setNumberOfAdults] = useState('1');
    const [numberOfChildren, setNumberOfChildren] = useState('0');
    const [numberOfRooms, setNumberOfRooms] = useState('1');
    const [specialRequest, setSpecialRequest] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Guest booking fields (using existing schema fields) - DEFAULT TO TRUE
    const [isGuestBooking, setIsGuestBooking] = useState(true); // Changed from false to true
    const [guestName, setGuestName] = useState('');
    const [guestContact, setGuestContact] = useState('');
    const [remarks, setRemarks] = useState('');

    const calculateTotalPrice = () => {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const price = isGuestBooking ? roomType.priceGuest : roomType.priceMember;
        const roomsCount = parseInt(numberOfRooms) || 1;
        return nights * price * roomsCount;
    };

    // Check availability for selected dates
    const checkAvailability = async () => {
        try {
            setCheckingAvailability(true);
            const fromDate = `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}-${String(checkIn.getDate()).padStart(2, '0')}`;
            const toDate = `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}-${String(checkOut.getDate()).padStart(2, '0')}`;

            const availabilityData = await roomService.getMemberRoomsForDate(fromDate, toDate, roomType.id);

            if (availabilityData &&
                (availabilityData.available === true ||
                    (Array.isArray(availabilityData) && availabilityData.length > 0) ||
                    availabilityData.message === 'Rooms are available')) {
                Alert.alert('Available', 'Rooms are available for the selected dates!');
            } else {
                Alert.alert('Not Available', 'Sorry, no rooms available for the selected dates. Please try different dates.');
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            Alert.alert('Error', 'Failed to check availability. Please try again.');
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleConfirm = async () => {
        if (!checkIn || !checkOut) {
            Alert.alert('Error', 'Please select check-in and check-out dates');
            return;
        }

        if (checkIn >= checkOut) {
            Alert.alert('Error', 'Check-out date must be after check-in date');
            return;
        }

        const adults = parseInt(numberOfAdults) || 1;
        const children = parseInt(numberOfChildren) || 0;
        const roomsCount = parseInt(numberOfRooms) || 1;

        if (adults < 1) {
            Alert.alert('Error', 'At least one adult is required');
            return;
        }

        if (roomsCount < 1) {
            Alert.alert('Error', 'At least one room is required');
            return;
        }

        // Validate guest booking fields
        if (isGuestBooking) {
            if (!guestName || guestName.trim() === '') {
                Alert.alert('Error', 'Please enter guest name');
                return;
            }
            if (!guestContact || guestContact.trim() === '') {
                Alert.alert('Error', 'Please enter guest contact number');
                return;
            }
        }

        setLoading(true);
        try {
            const bookingData = {
                checkIn: `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}-${String(checkIn.getDate()).padStart(2, '0')}`,
                checkOut: `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}-${String(checkOut.getDate()).padStart(2, '0')}`,
                numberOfAdults: adults,
                numberOfChildren: children,
                numberOfRooms: roomsCount,
                specialRequest: specialRequest,
                totalPrice: calculateTotalPrice(),
                isGuestBooking: isGuestBooking,
                guestName: guestName,
                guestContact: guestContact,
                remarks: remarks,
            };

            await onConfirm(bookingData);
        } catch (error) {
            console.error('Booking modal error:', error);
            // Error is handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isGuestBooking ? `Book for Guest` : `Book ${roomType.name}`}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Guest Booking Toggle - Only for members */}
                        {isMember && (
                            <View style={styles.guestBookingToggle}>
                                <View style={styles.toggleContainer}>
                                    <Text style={styles.toggleLabel}>
                                        {isGuestBooking ? 'Booking for Guest' : 'Booking for Self'}
                                    </Text>
                                    <Switch
                                        value={isGuestBooking}
                                        onValueChange={setIsGuestBooking}
                                        trackColor={{ false: '#ddd', true: '#b48a64' }}
                                        thumbColor={isGuestBooking ? '#fff' : '#f4f3f4'}
                                    />
                                </View>
                                <Text style={styles.toggleDescription}>
                                    {isGuestBooking
                                        ? `You're booking for a guest. Guest charges: Rs. ${roomType.priceGuest} per night`
                                        : `You're booking for yourself. Member charges: Rs. ${roomType.priceMember} per night`
                                    }
                                </Text>
                            </View>
                        )}

                        {/* Guest Details Fields - Only show when guest booking is selected */}
                        {isMember && isGuestBooking && (
                            <View style={styles.guestDetailsSection}>
                                <Text style={styles.sectionSubtitle}>Guest Information</Text>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Guest Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={guestName}
                                        onChangeText={setGuestName}
                                        placeholder="Enter guest full name"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Guest Contact Number *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={guestContact}
                                        onChangeText={setGuestContact}
                                        placeholder="Enter guest phone number"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Check-in Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowCheckInPicker(true)}
                            >
                                <Icon name="calendar-today" size={20} color="#666" />
                                <Text style={styles.dateText}>
                                    {checkIn.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showCheckInPicker && (
                                <DateTimePicker
                                    value={checkIn}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowCheckInPicker(false);
                                        if (date) setCheckIn(date);
                                    }}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Check-out Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowCheckOutPicker(true)}
                            >
                                <Icon name="calendar-today" size={20} color="#666" />
                                <Text style={styles.dateText}>
                                    {checkOut.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showCheckOutPicker && (
                                <DateTimePicker
                                    value={checkOut}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowCheckOutPicker(false);
                                        if (date) setCheckOut(date);
                                    }}
                                    minimumDate={new Date(checkIn.getTime() + 86400000)}
                                />
                            )}
                        </View>

                        <View style={styles.row}>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Adults</Text>
                                <TextInput
                                    style={styles.input}
                                    value={numberOfAdults}
                                    onChangeText={setNumberOfAdults}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Children</Text>
                                <TextInput
                                    style={styles.input}
                                    value={numberOfChildren}
                                    onChangeText={setNumberOfChildren}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.thirdInput}>
                                <Text style={styles.label}>Rooms</Text>
                                <TextInput
                                    style={styles.input}
                                    value={numberOfRooms}
                                    onChangeText={setNumberOfRooms}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Special Request (Optional)</Text>
                            <TextInput
                                style={styles.textArea}
                                value={specialRequest}
                                onChangeText={setSpecialRequest}
                                placeholder="Any special request/requirement..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* <View style={styles.formGroup}>
                            <Text style={styles.label}>Remarks (Optional)</Text>
                            <TextInput
                                style={styles.textArea}
                                value={remarks}
                                onChangeText={setRemarks}
                                placeholder="Any additional remarks..."
                                multiline
                                numberOfLines={2}
                            />
                        </View> */}

                        <View style={styles.priceSummary}>
                            <View>
                                <Text style={styles.priceLabel}>Total Amount:</Text>
                                <Text style={styles.priceSubtitle}>
                                    {isGuestBooking ? 'Guest Charges' : 'Member Charges'}
                                </Text>
                            </View>
                            <View style={styles.priceValueContainer}>
                                <Text style={styles.priceValue}>
                                    Rs. {calculateTotalPrice().toFixed(2)}
                                </Text>
                                <Text style={styles.priceBreakdown}>
                                    {parseInt(numberOfRooms) || 1} room(s) × {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} night(s) × {isGuestBooking ? roomType.priceGuest : roomType.priceMember}</Text>
                            </View>
                        </View>

                        <View style={styles.infoBox}>
                            <Icon name="info" size={16} color="#b48a64" />
                            <Text style={styles.infoText}>
                                {isGuestBooking
                                    ? `Booking ${numberOfRooms} room(s) for your guest. The guest will need to provide ID at check-in.`
                                    : `Booking ${numberOfRooms} room(s) of ${roomType.name}. Rooms will be automatically assigned based on availability.`
                                }
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, loading && styles.buttonDisabled]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    {isGuestBooking ? 'Book for Guest' : 'Confirm Booking'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Reservation Modal Component with Remarks
const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms, isReserve = true }) => {
    const [reserveFrom, setReserveFrom] = useState(new Date());
    const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [remarks, setRemarks] = useState(''); // Added remarks state
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!reserveFrom || !reserveTo) {
            Alert.alert('Error', 'Please select reservation dates');
            return;
        }

        if (reserveFrom >= reserveTo) {
            Alert.alert('Error', 'Reservation end date must be after start date');
            return;
        }

        setLoading(true);
        try {
            const reservationData = {
                reserveFrom: `${reserveFrom.getFullYear()}-${String(reserveFrom.getMonth() + 1).padStart(2, '0')}-${String(reserveFrom.getDate()).padStart(2, '0')}`,
                reserveTo: `${reserveTo.getFullYear()}-${String(reserveTo.getMonth() + 1).padStart(2, '0')}-${String(reserveTo.getDate()).padStart(2, '0')}`,
                remarks: remarks, // Added remarks
            };

            await onConfirm(reservationData);
        } catch (error) {
            console.error('Reservation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isReserve ? 'Reserve' : 'Unreserve'} {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.reservationInfo}>
                            You are about to {isReserve ? 'reserve' : 'unreserve'} the following rooms:
                        </Text>

                        <View style={styles.roomsList}>
                            {selectedRooms.map(room => (
                                <Text key={room.id} style={styles.roomItemText}>
                                    • Room {room.roomNumber}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{isReserve ? 'Reserve From' : 'Unreserve From'}</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Icon name="calendar-today" size={20} color="#666" />
                                <Text style={styles.dateText}>
                                    {reserveFrom.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showFromPicker && (
                                <DateTimePicker
                                    value={reserveFrom}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowFromPicker(false);
                                        if (date) setReserveFrom(date);
                                    }}
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{isReserve ? 'Reserve To' : 'Unreserve To'}</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowToPicker(true)}
                            >
                                <Icon name="calendar-today" size={20} color="#666" />
                                <Text style={styles.dateText}>
                                    {reserveTo.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showToPicker && (
                                <DateTimePicker
                                    value={reserveTo}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowToPicker(false);
                                        if (date) setReserveTo(date);
                                    }}
                                />
                            )}
                        </View>

                        {/* Add Remarks Field */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Remarks (Optional)</Text>
                            <TextInput
                                style={styles.textArea}
                                value={remarks}
                                onChangeText={setRemarks}
                                placeholder="Enter any remarks for this reservation"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* <View style={styles.infoBox}>
                            <Icon name="info" size={16} color={isReserve ? "#28a745" : "#dc3545"} />
                            <Text style={[styles.infoText, { color: isReserve ? "#28a745" : "#dc3545" }]}>
                                {isReserve
                                    ? 'Reserving rooms will make them unavailable for booking during the selected period.'
                                    : 'Unreserving rooms will make them available for booking again.'
                                }
                            </Text>
                        </View> */}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    {isReserve ? 'Confirm Reservation' : 'Confirm Unreservation'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#dbc9a5',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: { flex: 1 },
    imageSection: {
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: 250,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    imageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    imageIndicatorActive: {
        backgroundColor: '#fff',
        width: 20,
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
        resizeMode: "cover",
    },
    notchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconWrapper: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    notchTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: 'center',
    },

    sliderContainer: {
        marginTop: 20,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,
        marginBottom: 50,

    },
    sliderImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 10,
    },
    noImageContainer: {
        marginTop: 20,
        height: 200,
        fyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 5,
    },
    noImageText: {

        color: '#666',
        fontSize: 16,
    },

    roomTypeInfo: {
        padding: 20,
    },
    roomTypeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    debugSection: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#6c757d',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6c757d',
        marginBottom: 5,
    },
    debugText: {
        fontSize: 10,
        color: '#6c757d',
        marginBottom: 2,
    },
    smallDebugText: {
        fontSize: 8,
        color: '#6c757d',
        fontStyle: 'italic',
    },
    pricingSection: {
        marginBottom: 15,
    },
    pricingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    priceContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    perNightText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
        marginTop: 5,
    },
    roomCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roomCountText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    selectedCountText: {
        fontSize: 14,
        color: '#b48a64',
        fontWeight: 'bold',
        marginLeft: 10,
    },

    // Member Section Styles
    memberSection: {
        padding: 20,
        paddingTop: 0,
    },
    availabilityInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 15,
    },
    availabilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    availabilityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availabilityDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    bookingInfo: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
    },
    bookingInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        lineHeight: 18,
    },

    // Rooms Section (Admin)
    roomsSection: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    roomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    roomItemSelected: {
        borderColor: '#b48a64',
        backgroundColor: '#fdf6f0',
    },
    roomItemReserved: {
        opacity: 0.6,
        backgroundColor: '#f5f5f5',
    },
    roomInfo: {
        flex: 1,
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    roomNumberReserved: {
        color: '#999',
        fontWeight: '600',
    },
    roomDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    roomDescriptionReserved: {
        color: '#999',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    active: {
        backgroundColor: '#28a745',
    },
    inactive: {
        backgroundColor: '#dc3545',
    },
    reserved: {
        backgroundColor: '#F59E0B',
    },
    statusText: {
        fontSize: 12,
        color: 'black',
    },
    statusTextReserved: {
        color: '#F59E0B',
        fontWeight: '600',
    },
    noRoomsContainer: {
        alignItems: 'center',
        padding: 40,
    },
    noRoomsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
    },
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 28,
        backgroundColor: '#FEF9F3',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    adminActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookButton: {
        backgroundColor: '#b48a64',
        shadowColor: '#b48a64',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    reserveButton: {
        backgroundColor: '#b48a64',
        shadowColor: '#b48a64',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    unreserveButton: {
        backgroundColor: '#dc3545',
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    accessDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    accessDeniedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    accessDeniedText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    backButton: {
        backgroundColor: '#b48a64',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FEF9F3',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        padding: 20,
    },
    availabilityCheckSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f0f7ff',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
    },
    availabilityCheckTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    checkAvailabilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#b48a64',
        padding: 12,
        borderRadius: 8,
    },
    checkAvailabilityText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // Guest Booking Toggle
    guestBookingToggle: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    toggleDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },

    // Guest Details Section
    guestDetailsSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f0f7ff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d0e7ff',
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1565c0',
        marginBottom: 10,
    },

    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    dateText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    thirdInput: {
        flex: 1,
    },
    halfInput: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    priceSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    priceSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    priceValueContainer: {
        alignItems: 'flex-end',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    priceBreakdown: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f7ff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
        marginBottom: 20
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#1565c0',
        marginLeft: 8,
        lineHeight: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 12, // Reduced from 20
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        backgroundColor: '#FEF9F3',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10, // Reduced from 15
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#b48a64',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: '#b48a64',
        fontWeight: 'bold',
        fontSize: 16,
        paddingTop: 4,
    },
    confirmButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#b48a64',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    reservationInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    roomsList: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    roomItemText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },

    // Room Features Section Styles
    featuresSection: {
        marginHorizontal: 15,
        marginTop: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    featuresSectionTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#b48a64',
        marginBottom: 10,
    },
    featuresDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    featuresList: {
        marginTop: 5,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 18,
        lineHeight: 24,
        color: '#b48a64',
        marginRight: 8,
        marginTop: -3,
    },
    featureItemText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        flex: 1,
    },

    // Policy Section Styles
    policySection: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginTop: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    rulesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    policyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "left",
        color: '#b48a64',
    },
    policySub: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#b48a64",
        marginTop: 15,
        marginBottom: 8,
    },
    ruleItem: {
        marginBottom: 10,
    },
    ruleText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    expandRulesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    expandRulesText: {
        color: '#b48a64',
        fontWeight: 'bold',
        marginRight: 5,
    },
    rulesFooter: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    updatedText: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
    },
    rulesLoadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    rulesLoadingText: {
        marginTop: 10,
        color: '#b48a64',
        fontSize: 12,
    },
});
