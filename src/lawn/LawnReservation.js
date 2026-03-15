// import React, { useState, useEffect } from 'react';
// import {
//     StyleSheet,
//     Text,
//     View,
//     TouchableOpacity,
//     ScrollView,
//     SafeAreaView,
//     Alert,
//     StatusBar,
//     ImageBackground,
//     ActivityIndicator,
//     TextInput,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { lawnAPI } from '../../config/apis';
// import { useAuth } from '../auth/contexts/AuthContext';

// const timeSlotOptions = [
//     { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
//     { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
//     { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
// ];

// const LawnReservation = ({ route, navigation }) => {
//     const { venue } = route.params || {};
//     const { user } = useAuth();

//     const [dateConfigurations, setDateConfigurations] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [reservedDates, setReservedDates] = useState({});
//     const [isFetchingReservations, setIsFetchingReservations] = useState(false);
//     const [remarks, setRemarks] = useState('');
//     const [lawnLogs, setLawnLogs] = useState({ reservations: [], bookings: [], outOfOrders: [] });

//     const fetchReservations = async () => {
//         if (!venue?.id) return;
//         try {
//             setIsFetchingReservations(true);
//             const today = new Date();
//             const sixMonthsLater = new Date();
//             sixMonthsLater.setMonth(today.getMonth() + 6);

//             const from = today.toISOString().split('T')[0];
//             const to = sixMonthsLater.toISOString().split('T')[0];

//             const response = await lawnAPI.getLawnLogs(venue.id, from, to);
//             const data = response.data || {};
//             setLawnLogs(data);

//             const marked = {};


//             const getDatesInRange = (startDate, endDate) => {
//                 const dates = [];
//                 let current = new Date(startDate);
//                 const end = new Date(endDate);
//                 while (current <= end) {
//                     dates.push(current.toISOString().split('T')[0]);
//                     current.setDate(current.getDate() + 1);
//                 }
//                 return dates;
//             };

//             // 1. Process Reservations (Amber)
//             if (data.reservations && Array.isArray(data.reservations)) {
//                 data.reservations.forEach(res => {
//                     const range = getDatesInRange(res.reservedFrom, res.reservedTo);
//                     range.forEach(date => {
//                         marked[date] = {
//                             textColor: '#B8860B',
//                             status: 'RESERVED',
//                             customStyles: {
//                                 container: {
//                                     borderWidth: 1,
//                                     borderColor: '#B8860B',
//                                     borderRadius: 5,
//                                 }
//                             }
//                         };
//                     });
//                 });
//             }

//             // 2. Process Bookings (Blue)
//             if (data.bookings && Array.isArray(data.bookings)) {
//                 data.bookings.forEach(book => {
//                     const bookingDate = book.bookingDate || book.eventDate;
//                     if (bookingDate) {
//                         marked[bookingDate] = {
//                             disabled: true,
//                             disableTouchEvent: true,
//                             textColor: '#007AFF',
//                             status: 'BOOKED',
//                             customStyles: {
//                                 container: {
//                                     backgroundColor: '#E3F2FD',
//                                     borderWidth: 1,
//                                     borderColor: '#007AFF',
//                                     borderRadius: 5,
//                                 }
//                             }
//                         };
//                     }
//                 });
//             }

//             // 3. Process Out of Orders (Red)
//             if (data.outOfOrders && Array.isArray(data.outOfOrders)) {
//                 data.outOfOrders.forEach(oo => {
//                     const range = getDatesInRange(oo.startDate, oo.endDate);
//                     range.forEach(date => {
//                         marked[date] = {
//                             disabled: true,
//                             disableTouchEvent: true,
//                             textColor: '#FF3B30',
//                             status: 'OUT_OF_ORDER',
//                             customStyles: {
//                                 container: {
//                                     backgroundColor: '#FFEBEE',
//                                     borderWidth: 1,
//                                     borderColor: '#FF3B30',
//                                     borderRadius: 5,
//                                 }
//                             }
//                         };
//                     });
//                 });
//             }

//             setReservedDates(marked);
//         } catch (error) {
//             console.error("Error fetching lawn logs:", error);
//         } finally {
//             setIsFetchingReservations(false);
//         }
//     };

//     useEffect(() => {
//         fetchReservations();
//     }, [venue]);

//     const handleDateSelect = (day) => {
//         const dateString = day.dateString;

//         // Conflict Check
//         const existingStatus = reservedDates[dateString];
//         if (existingStatus?.disabled) {
//             const message = existingStatus.status === 'BOOKED'
//                 ? 'This date is already booked by a member.'
//                 : 'This lawn is under maintenance/out of order on this date.';
//             Alert.alert('Unavailable', message);
//             return;
//         }

//         const newConfigs = { ...dateConfigurations };

//         if (newConfigs[dateString]) {
//             delete newConfigs[dateString];
//         } else {
//             newConfigs[dateString] = {
//                 timeSlot: timeSlotOptions[0].value,
//                 timeSlotOpen: false,
//             };
//         }
//         setDateConfigurations(newConfigs);
//     };

//     const updateTimeSlot = (date, slot) => {
//         const newConfigs = { ...dateConfigurations };
//         newConfigs[date].timeSlot = slot;
//         setDateConfigurations(newConfigs);
//     };

//     const setTimeSlotOpen = (date, open) => {
//         const newConfigs = { ...dateConfigurations };
//         Object.keys(newConfigs).forEach(d => {
//             newConfigs[d].timeSlotOpen = d === date ? open : false;
//         });
//         setDateConfigurations(newConfigs);
//     };

//     const handleReserve = async () => {
//         const dates = Object.keys(dateConfigurations);
//         if (dates.length === 0) {
//             Alert.alert('Error', 'Please select at least one date from the calendar');
//             return;
//         }

//         const unreserveList = [];
//         const reserveList = [];

//         const findExistingReservation = (date, slot) => {
//             return lawnLogs.reservations.find(res => {
//                 const resFrom = new Date(res.reservedFrom).toISOString().split('T')[0];
//                 const resTo = new Date(res.reservedTo).toISOString().split('T')[0];
//                 return date >= resFrom && date <= resTo && res.timeSlot === slot;
//             });
//         };

//         dates.forEach(date => {
//             const slot = dateConfigurations[date].timeSlot;
//             const existing = findExistingReservation(date, slot);
//             if (existing) {
//                 unreserveList.push({ date, slot });
//             } else {
//                 reserveList.push({ date, slot });
//             }
//         });

//         if (unreserveList.length > 0) {
//             const dateSummary = unreserveList.map(item => `${item.date} (${item.slot})`).join('\n');
//             Alert.alert(
//                 'Un-reserve Confirmation',
//                 `The following slots are already reserved and will be un-reserved:\n\n${dateSummary}\n\nDo you want to continue?`,
//                 [
//                     { text: 'Cancel', style: 'cancel' },
//                     { text: 'Continue', onPress: () => processReservations(reserveList, unreserveList) }
//                 ]
//             );
//         } else {
//             processReservations(reserveList, []);
//         }
//     };

//     const processReservations = async (toReserve, toUnreserve) => {
//         try {
//             setLoading(true);

//             for (const item of toUnreserve) {
//                 const payload = {
//                     lawnIds: [venue.id],
//                     reserve: false,
//                     timeSlot: item.slot,
//                     reserveFrom: item.date,
//                     reserveTo: item.date,
//                     remarks: remarks,
//                 };
//                 await lawnAPI.reserveLawns(payload);
//             }

//             for (const item of toReserve) {
//                 const payload = {
//                     lawnIds: [venue.id],
//                     reserve: true,
//                     timeSlot: item.slot,
//                     reserveFrom: item.date,
//                     reserveTo: item.date,
//                     remarks: remarks,
//                 };
//                 await lawnAPI.reserveLawns(payload);
//             }

//             Alert.alert(
//                 'Success',
//                 'Reservations updated successfully',
//                 [
//                     {
//                         text: 'OK',
//                         onPress: () => navigation.goBack()
//                     }
//                 ]
//             );
//         } catch (error) {
//             console.error('Reservation error:', error);
//             Alert.alert(
//                 'Error',
//                 error.response?.data?.message || 'Failed to update reservations'
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDateForDisplay = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const markedDates = {
//         ...reservedDates,
//         ...Object.keys(dateConfigurations).reduce((acc, date) => {
//             acc[date] = {
//                 selected: true,
//                 selectedColor: '#b48a64',
//                 customStyles: reservedDates[date]?.status === 'RESERVED' ? {
//                     container: {
//                         borderWidth: 2,
//                         borderColor: '#FFF',
//                     }
//                 } : undefined
//             };
//             return acc;
//         }, {})
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="dark-content" />
//             <ImageBackground
//                 source={require('../../assets/notch.jpg')}
//                 style={styles.notch}
//                 imageStyle={styles.notchImage}
//             >
//                 <View style={styles.notchContent}>
//                     <TouchableOpacity
//                         style={styles.backButton}
//                         onPress={() => navigation.goBack()}
//                     >
//                         <Icon name="arrow-back" size={28} color="#000" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerText}>Lawn Reservation</Text>
//                     <View style={styles.placeholder} />
//                 </View>
//             </ImageBackground>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <View style={styles.venueCard}>
//                     <Text style={styles.venueName}>{venue?.title || 'Lawn'}</Text>
//                     <Text style={styles.venueLocation}>{venue?.location || 'Club Lawns'}</Text>
//                 </View>

//                 <View style={styles.sectionCard}>
//                     <View style={styles.sectionHeader}>
//                         <MaterialIcons name="event" size={22} color="#b48a64" />
//                         <Text style={styles.sectionTitle}>Select Reservation Dates</Text>
//                     </View>
//                     <Calendar
//                         markingType={'custom'}
//                         minDate={new Date().toISOString().split('T')[0]}
//                         onDayPress={handleDateSelect}
//                         markedDates={markedDates}
//                         theme={{
//                             selectedDayBackgroundColor: '#b48a64',
//                             todayTextColor: '#b48a64',
//                             arrowColor: '#b48a64',
//                         }}
//                     />
//                 </View>

//                 {Object.keys(dateConfigurations).length > 0 ? (
//                     <View style={styles.configurationsContainer}>
//                         <View style={styles.sectionHeader}>
//                             <MaterialIcons name="access-time" size={22} color="#b48a64" />
//                             <Text style={styles.sectionTitle}>Time Slot Configurations</Text>
//                         </View>
//                         {Object.keys(dateConfigurations).sort().map((date, index) => (
//                             <View key={date} style={[styles.configCard, { zIndex: 1000 - index }]}>
//                                 <Text style={styles.dateLabel}>{formatDateForDisplay(date)}</Text>
//                                 <DropDownPicker
//                                     open={dateConfigurations[date].timeSlotOpen}
//                                     value={dateConfigurations[date].timeSlot}
//                                     items={timeSlotOptions}
//                                     setOpen={(open) => setTimeSlotOpen(date, open)}
//                                     setValue={(callback) => {
//                                         const value = typeof callback === 'function' ? callback(dateConfigurations[date].timeSlot) : callback;
//                                         updateTimeSlot(date, value);
//                                     }}
//                                     placeholder="Select Time Slot"
//                                     style={styles.dropdown}
//                                     dropDownContainerStyle={styles.dropdownContainer}
//                                     listMode="SCROLLVIEW"
//                                     zIndex={1000 - index}
//                                 />
//                             </View>
//                         ))}
//                     </View>
//                 ) : (
//                     <View style={styles.emptyContainer}>
//                     </View>
//                 )}

//                 <View style={styles.sectionCard}>
//                     <View style={styles.sectionHeader}>
//                         <MaterialIcons name="note-add" size={22} color="#b48a64" />
//                         <Text style={styles.sectionTitle}>Admin Remarks</Text>
//                     </View>
//                     <TextInput
//                         style={styles.remarksInput}
//                         placeholder="Add some remarks or notes here..."
//                         placeholderTextColor="#999"
//                         multiline
//                         numberOfLines={4}
//                         value={remarks}
//                         onChangeText={setRemarks}
//                     />
//                 </View>
//             </ScrollView>

//             <View style={styles.bottomButtonContainer}>
//                 <View style={styles.contactContainer}>
//                     <Text style={styles.contactText}>
//                         <Text style={{ fontWeight: 'bold' }}>Note: </Text>
//                         For more details contact booking office{' '}
//                         <Text style={{ fontWeight: 'bold' }}>03419777711</Text>.
//                     </Text>
//                 </View>

//                 <TouchableOpacity
//                     style={[styles.submitButton, loading && styles.disabledButton]}
//                     onPress={handleReserve}
//                     disabled={loading || Object.keys(dateConfigurations).length === 0}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="#FFF" />
//                     ) : (
//                         <Text style={styles.submitButtonText}>Confirm Reservation</Text>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FEF9F3',
//     },
//     notch: {
//         paddingTop: 50,
//         paddingBottom: 20,
//         paddingHorizontal: 20,
//         borderBottomEndRadius: 30,
//         borderBottomStartRadius: 30,
//         overflow: 'hidden',
//         minHeight: 120,
//     },
//     notchImage: {
//         resizeMode: 'cover',
//     },
//     notchContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     backButton: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#000',
//         textAlign: 'center',
//         flex: 1,
//     },
//     placeholder: {
//         width: 40,
//     },
//     scrollContent: {
//         padding: 20,
//     },
//     venueCard: {
//         backgroundColor: '#FFF',
//         padding: 20,
//         borderRadius: 15,
//         marginBottom: 20,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     venueName: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     venueLocation: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 4,
//     },
//     sectionCard: {
//         backgroundColor: '#FFF',
//         padding: 15,
//         borderRadius: 15,
//         marginBottom: 20,
//         elevation: 2,
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#b48a64',
//         marginLeft: 10,
//     },
//     configurationsContainer: {
//         marginBottom: 20,
//     },
//     configCard: {
//         backgroundColor: '#FFF',
//         padding: 15,
//         borderRadius: 12,
//         marginBottom: 10,
//         borderWidth: 1,
//         borderColor: '#EEE',
//     },
//     dateLabel: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#555',
//         marginBottom: 10,
//     },
//     dropdown: {
//         borderColor: '#DDD',
//         borderRadius: 8,
//         minHeight: 40,
//     },
//     dropdownContainer: {
//         borderColor: '#DDD',
//     },

//     emptyText: {
//         color: '#999',
//         textAlign: 'center',
//     },
//     submitButton: {
//         backgroundColor: '#b48a64',
//         padding: 18,
//         borderRadius: 15,
//         alignItems: 'center',
//     },
//     submitButtonText: {
//         color: '#FFF',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     disabledButton: {
//         opacity: 0.6,
//     },
//     remarksInput: {
//         backgroundColor: '#F9F9F9',
//         borderWidth: 1,
//         borderColor: '#EEE',
//         borderRadius: 12,
//         padding: 15,
//         fontSize: 14,
//         color: '#333',
//         minHeight: 100,
//         textAlignVertical: 'top',
//     },
//     bottomButtonContainer: {
//         paddingHorizontal: 20,
//         paddingBottom: Platform.OS === 'ios' ? 10 : 20,
//         backgroundColor: '#F8F9FA',
//         borderTopWidth: 1,
//         borderTopColor: '#EEE',
//         paddingTop: 10,
//     },
//     contactContainer: {
//         marginBottom: 10,
//         alignItems: 'center',
//         paddingHorizontal: 10,
//     },
//     contactText: {
//         fontSize: 13,
//         color: '#666',
//         textAlign: 'center',
//         lineHeight: 18,
//     },
// });

// export default LawnReservation;


import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    StatusBar,
    ImageBackground,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { lawnAPI } from '../../config/apis';
import { useAuth } from '../auth/contexts/AuthContext';

const timeSlotOptions = [
    { label: 'Day (8:00 AM - 8:00 PM)', value: 'DAY' },
    { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
];

const LawnReservation = ({ route, navigation }) => {
    const { venue } = route.params || {};
    const { user } = useAuth();

    const [dateConfigurations, setDateConfigurations] = useState({});
    const [loading, setLoading] = useState(false);
    const [reservedDates, setReservedDates] = useState({});
    const [isFetchingReservations, setIsFetchingReservations] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [lawnLogs, setLawnLogs] = useState({ reservations: [], bookings: [], outOfOrders: [] });

    const fetchReservations = async () => {
        if (!venue?.id) return;
        try {
            setIsFetchingReservations(true);
            const today = new Date();
            const sixMonthsLater = new Date();
            sixMonthsLater.setMonth(today.getMonth() + 6);

            const from = today.toISOString().split('T')[0];
            const to = sixMonthsLater.toISOString().split('T')[0];

            const response = await lawnAPI.getLawnLogs(venue.id, from, to);
            const data = response.data || {};
            setLawnLogs(data);

            const marked = {};


            const getDatesInRange = (startDate, endDate) => {
                const dates = [];
                let current = new Date(startDate);
                const end = new Date(endDate);
                while (current <= end) {
                    dates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
                return dates;
            };

            // 1. Process Reservations (Amber)
            if (data.reservations && Array.isArray(data.reservations)) {
                data.reservations.forEach(res => {
                    const range = getDatesInRange(res.reservedFrom, res.reservedTo);
                    range.forEach(date => {
                        marked[date] = {
                            textColor: '#B8860B',
                            status: 'RESERVED',
                            customStyles: {
                                container: {
                                    borderWidth: 1,
                                    borderColor: '#B8860B',
                                    borderRadius: 5,
                                }
                            }
                        };
                    });
                });
            }

            // 2. Process Bookings (Blue)
            if (data.bookings && Array.isArray(data.bookings)) {
                data.bookings.forEach(book => {
                    const bookingDate = book.bookingDate || book.eventDate;
                    if (bookingDate) {
                        marked[bookingDate] = {
                            disabled: true,
                            disableTouchEvent: true,
                            textColor: '#007AFF',
                            status: 'BOOKED',
                            customStyles: {
                                container: {
                                    backgroundColor: '#E3F2FD',
                                    borderWidth: 1,
                                    borderColor: '#007AFF',
                                    borderRadius: 5,
                                }
                            }
                        };
                    }
                });
            }

            // 3. Process Out of Orders (Red)
            if (data.outOfOrders && Array.isArray(data.outOfOrders)) {
                data.outOfOrders.forEach(oo => {
                    const range = getDatesInRange(oo.startDate, oo.endDate);
                    range.forEach(date => {
                        marked[date] = {
                            disabled: true,
                            disableTouchEvent: true,
                            textColor: '#FF3B30',
                            status: 'OUT_OF_ORDER',
                            customStyles: {
                                container: {
                                    backgroundColor: '#FFEBEE',
                                    borderWidth: 1,
                                    borderColor: '#FF3B30',
                                    borderRadius: 5,
                                }
                            }
                        };
                    });
                });
            }

            setReservedDates(marked);
        } catch (error) {
            console.error("Error fetching lawn logs:", error);
        } finally {
            setIsFetchingReservations(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [venue]);

    const handleDateSelect = (day) => {
        const dateString = day.dateString;

        // Conflict Check
        const existingStatus = reservedDates[dateString];
        if (existingStatus?.disabled) {
            const message = existingStatus.status === 'BOOKED'
                ? 'This date is already booked by a member.'
                : 'This lawn is under maintenance/out of order on this date.';
            Alert.alert('Unavailable', message);
            return;
        }

        const newConfigs = { ...dateConfigurations };

        if (newConfigs[dateString]) {
            delete newConfigs[dateString];
        } else {
            newConfigs[dateString] = {
                timeSlot: timeSlotOptions[0].value,
                timeSlotOpen: false,
            };
        }
        setDateConfigurations(newConfigs);
    };

    const updateTimeSlot = (date, slot) => {
        const newConfigs = { ...dateConfigurations };
        newConfigs[date].timeSlot = slot;
        setDateConfigurations(newConfigs);
    };

    const setTimeSlotOpen = (date, open) => {
        const newConfigs = { ...dateConfigurations };
        Object.keys(newConfigs).forEach(d => {
            newConfigs[d].timeSlotOpen = d === date ? open : false;
        });
        setDateConfigurations(newConfigs);
    };

    const handleReserve = async () => {
        const dates = Object.keys(dateConfigurations);
        if (dates.length === 0) {
            Alert.alert('Error', 'Please select at least one date from the calendar');
            return;
        }

        const unreserveList = [];
        const reserveList = [];

        const findExistingReservation = (date, slot) => {
            return lawnLogs.reservations.find(res => {
                const resFrom = new Date(res.reservedFrom).toISOString().split('T')[0];
                const resTo = new Date(res.reservedTo).toISOString().split('T')[0];
                return date >= resFrom && date <= resTo && res.timeSlot === slot;
            });
        };

        dates.forEach(date => {
            const slot = dateConfigurations[date].timeSlot;
            const existing = findExistingReservation(date, slot);
            if (existing) {
                unreserveList.push({ date, slot });
            } else {
                reserveList.push({ date, slot });
            }
        });

        if (unreserveList.length > 0) {
            const dateSummary = unreserveList.map(item => `${item.date} (${item.slot})`).join('\n');
            Alert.alert(
                'Un-reserve Confirmation',
                `The following slots are already reserved and will be un-reserved:\n\n${dateSummary}\n\nDo you want to continue?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => processReservations(reserveList, unreserveList) }
                ]
            );
        } else {
            processReservations(reserveList, []);
        }
    };

    const processReservations = async (toReserve, toUnreserve) => {
        try {
            setLoading(true);

            for (const item of toUnreserve) {
                const payload = {
                    lawnIds: [venue.id],
                    reserve: false,
                    timeSlot: item.slot,
                    reserveFrom: item.date,
                    reserveTo: item.date,
                    remarks: remarks,
                };
                await lawnAPI.reserveLawns(payload);
            }

            for (const item of toReserve) {
                const payload = {
                    lawnIds: [venue.id],
                    reserve: true,
                    timeSlot: item.slot,
                    reserveFrom: item.date,
                    reserveTo: item.date,
                    remarks: remarks,
                };
                await lawnAPI.reserveLawns(payload);
            }

            Alert.alert(
                'Success',
                'Reservations updated successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Reservation error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update reservations'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const markedDates = {
        ...reservedDates,
        ...Object.keys(dateConfigurations).reduce((acc, date) => {
            acc[date] = {
                selected: true,
                selectedColor: '#b48a64',
                customStyles: reservedDates[date]?.status === 'RESERVED' ? {
                    container: {
                        borderWidth: 2,
                        borderColor: '#FFF',
                    }
                } : undefined
            };
            return acc;
        }, {})
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ImageBackground
                source={require('../../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Lawn Reservation</Text>
                    <View style={styles.placeholder} />
                </View>
            </ImageBackground>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.venueCard}>
                    <Text style={styles.venueName}>{venue?.title || 'Lawn'}</Text>
                    <Text style={styles.venueLocation}>{venue?.location || 'Club Lawns'}</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="event" size={22} color="#b48a64" />
                        <Text style={styles.sectionTitle}>Select Reservation Dates</Text>
                    </View>
                    <Calendar
                        markingType={'custom'}
                        minDate={new Date().toISOString().split('T')[0]}
                        onDayPress={handleDateSelect}
                        markedDates={markedDates}
                        theme={{
                            selectedDayBackgroundColor: '#b48a64',
                            todayTextColor: '#b48a64',
                            arrowColor: '#b48a64',
                        }}
                    />
                </View>

                {Object.keys(dateConfigurations).length > 0 ? (
                    <View style={styles.configurationsContainer}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="access-time" size={22} color="#b48a64" />
                            <Text style={styles.sectionTitle}>Time Slot Configurations</Text>
                        </View>
                        {Object.keys(dateConfigurations).sort().map((date, index) => (
                            <View key={date} style={[styles.configCard, { zIndex: 1000 - index }]}>
                                <Text style={styles.dateLabel}>{formatDateForDisplay(date)}</Text>
                                <DropDownPicker
                                    open={dateConfigurations[date].timeSlotOpen}
                                    value={dateConfigurations[date].timeSlot}
                                    items={timeSlotOptions}
                                    setOpen={(open) => setTimeSlotOpen(date, open)}
                                    setValue={(callback) => {
                                        const value = typeof callback === 'function' ? callback(dateConfigurations[date].timeSlot) : callback;
                                        updateTimeSlot(date, value);
                                    }}
                                    placeholder="Select Time Slot"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode="SCROLLVIEW"
                                    zIndex={1000 - index}
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                    </View>
                )}

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="note-add" size={22} color="#b48a64" />
                        <Text style={styles.sectionTitle}>Admin Remarks</Text>
                    </View>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Add some remarks or notes here..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={remarks}
                        onChangeText={setRemarks}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                <View style={styles.contactContainer}>
                    <Text style={styles.contactText}>
                        <Text style={{ fontWeight: 'bold' }}>Note: </Text>
                        For more details contact booking office{' '}
                        <Text style={{ fontWeight: 'bold' }}>03419777711</Text>.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleReserve}
                    disabled={loading || Object.keys(dateConfigurations).length === 0}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Confirm Reservation</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 20,
    },
    venueCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    venueName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    venueLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    sectionCard: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#b48a64',
        marginLeft: 10,
    },
    configurationsContainer: {
        marginBottom: 20,
    },
    configCard: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 10,
    },
    dropdown: {
        borderColor: '#DDD',
        borderRadius: 8,
        minHeight: 40,
    },
    dropdownContainer: {
        borderColor: '#DDD',
    },

    emptyText: {
        color: '#999',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#b48a64',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    remarksInput: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 12,
        padding: 15,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    bottomButtonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
        backgroundColor: '#F8F9FA',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    },
    contactContainer: {
        marginBottom: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    contactText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default LawnReservation;