

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Alert,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   RefreshControl,
//   Modal,
//   TextInput,
//   ScrollView,
//   ImageBackground,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import IconAD from 'react-native-vector-icons/AntDesign';
// import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
// import {
//   getCurrentAdmin,
//   getAdminReservations,
//   cancelReservation,
//   updateReservation,
//   formatDate,
//   formatDateTime,
//   formatDateForInput,
// } from '../../config/apis';

// const ReservationsScreen = ({ navigation }) => {
//   const [admin, setAdmin] = useState(null);
//   const [reservations, setReservations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedReservation, setSelectedReservation] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editForm, setEditForm] = useState({
//     startDate: '',
//     endDate: '',
//     remarks: '',
//   });
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Get current logged-in admin from storage
//       const adminData = await getCurrentAdmin();
//       setAdmin(adminData);

//       // Get admin's reservations
//       if (adminData && adminData.id) {
//         const reservationsData = await getAdminReservations(adminData.id);
//         setReservations(reservationsData || []);
//       } else {
//         setReservations([]);
//         setError('No admin found. Please login again.');
//       }
//     } catch (error) {
//       console.error('Fetch error:', error);
//       setError('Failed to load data. Please check your connection.');
//       setReservations([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchData();
//     setRefreshing(false);
//   };

//   const handleCancelReservation = (reservation) => {
//     Alert.alert(
//       'Cancel Reservation',
//       `Are you sure you want to cancel reservation for ${reservation.resourceName}?`,
//       [
//         {
//           text: 'No',
//           style: 'cancel',
//           onPress: () => console.log('Cancel pressed')
//         },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               // For now, pass a simplified data structure
//               const cancelData = {
//                 roomIds: [reservation.id], // Assuming ID corresponds to room ID
//                 reserveFrom: new Date(reservation.startTime).toISOString().split('T')[0],
//                 reserveTo: new Date(reservation.endTime).toISOString().split('T')[0],
//                 remarks: reservation.remarks || 'Reservation cancelled'
//               };
//               await cancelReservation(cancelData);

//               // Update local state immediately
//               setReservations(prev =>
//                 prev.filter(r => r.id !== reservation.id)
//               );

//               Alert.alert(
//                 'Success',
//                 'Reservation cancelled successfully',
//                 [{ text: 'OK' }]
//               );
//             } catch (error) {
//               Alert.alert(
//                 'Error',
//                 error.response?.data?.message || 'Failed to cancel reservation'
//               );
//             }
//           },
//         },
//       ],
//       { cancelable: false }
//     );
//   };

//   const handleModifyReservation = (reservation) => {
//     setSelectedReservation(reservation);
//     setEditForm({
//       startDate: formatDateForInput(reservation.startTime),
//       endDate: formatDateForInput(reservation.endTime),
//       remarks: reservation.remarks || '',
//     });
//     setModalVisible(true);
//   };

//   const handleSaveModification = async () => {
//     // Validation
//     if (!editForm.startDate || !editForm.endDate) {
//       Alert.alert('Error', 'Please select both start and end dates');
//       return;
//     }

//     const startDate = new Date(editForm.startDate + 'T00:00:00Z');
//     const endDate = new Date(editForm.endDate + 'T00:00:00Z');

//     if (startDate >= endDate) {
//       Alert.alert('Error', 'End date must be after start date');
//       return;
//     }

//     if (!selectedReservation) return;

//     try {
//       const currentReservation = {
//         roomIds: [selectedReservation.id],
//         reserveFrom: new Date(selectedReservation.startTime).toISOString().split('T')[0],
//         reserveTo: new Date(selectedReservation.endTime).toISOString().split('T')[0]
//       };

//       const newDates = {
//         reserveFrom: startDate.toISOString().split('T')[0],
//         reserveTo: endDate.toISOString().split('T')[0],
//         remarks: editForm.remarks
//       };

//       await updateReservation(currentReservation, newDates);

//       // Update local state
//       setReservations(prev =>
//         prev.map(r =>
//           r.id === selectedReservation.id
//             ? {
//               ...r,
//               startTime: startDate.toISOString(),
//               endTime: endDate.toISOString(),
//               remarks: editForm.remarks
//             }
//             : r
//         )
//       );

//       Alert.alert(
//         'Success',
//         'Reservation updated successfully',
//         [{ text: 'OK' }]
//       );

//       setModalVisible(false);
//     } catch (error) {
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to update reservation'
//       );
//     }
//   };

//   const renderReservationItem = ({ item }) => (
//     <View style={styles.reservationCard}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.resourceName}>{item.resourceName}</Text>
//         <View style={[
//           styles.typeBadge,
//           { backgroundColor: getTypeColor(item.type) }
//         ]}>
//           <Text style={styles.typeText}>{item.type}</Text>
//         </View>
//       </View>

//       <View style={styles.datesContainer}>
//         <View style={styles.dateRow}>
//           <Icon name="calendar-outline" size={16} color="#6C757D" style={styles.dateIcon} />
//           <Text style={styles.dateLabel}>From:</Text>
//           <Text style={styles.dateValue}>
//             {formatDateTime(item.startTime)}
//           </Text>
//         </View>

//         <View style={styles.dateRow}>
//           <Icon name="calendar-outline" size={16} color="#6C757D" style={styles.dateIcon} />
//           <Text style={styles.dateLabel}>To:</Text>
//           <Text style={styles.dateValue}>
//             {formatDateTime(item.endTime)}
//           </Text>
//         </View>
//       </View>

//       {item.remarks ? (
//         <View style={styles.remarksContainer}>
//           <Text style={styles.remarksLabel}>Remarks:</Text>
//           <Text style={styles.remarksText}>{item.remarks}</Text>
//         </View>
//       ) : null}

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={[styles.button, styles.modifyButton]}
//           onPress={() => handleModifyReservation(item)}
//         >
//           <Icon name="create-outline" size={18} color="#4A90E2" />
//           <Text style={styles.modifyButtonText}>Edit</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, styles.cancelButton]}
//           onPress={() => handleCancelReservation(item)}
//         >
//           <Icon name="trash-outline" size={18} color="#FFFFFF" />
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const getTypeColor = (type) => {
//     switch (type) {
//       case 'ROOM': return '#4A90E2';
//       case 'HALL': return '#9013FE';
//       case 'LAWN': return '#7ED321';
//       case 'PHOTOSHOOT': return '#F5A623';
//       default: return '#9B9B9B';
//     }
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading reservations...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* 🔹 Notch Header */}
//       <ImageBackground
//         source={require('../../assets/notch.jpg')}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchRow}>
//           <TouchableOpacity
//             style={styles.iconWrapper}
//             onPress={() => navigation && navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <IconMC name="arrow-left" size={28} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.notchTitle}>Reservations</Text>

//           <View style={{ width: 40 }} />
//         </View>
//       </ImageBackground>

//       {error && !loading ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchData}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : reservations.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No reservations found</Text>
//           <Text style={styles.emptySubText}>
//             You don't have any reservations at the moment.
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={reservations}
//           renderItem={renderReservationItem}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//               colors={['#007AFF']}
//               tintColor="#007AFF"
//             />
//           }
//         />
//       )}

//       {/* Modification Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ScrollView style={styles.modalScrollView}>
//               <Text style={styles.modalTitle}>
//                 Edit Reservation
//               </Text>
//               {selectedReservation && (
//                 <Text style={styles.modalSubtitle}>
//                   {selectedReservation.resourceName} ({selectedReservation.type})
//                 </Text>
//               )}

//               <View style={styles.formGroup}>
//                 <Text style={styles.inputLabel}>Start Date</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={editForm.startDate}
//                   onChangeText={(text) =>
//                     setEditForm({ ...editForm, startDate: text })
//                   }
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor="#999"
//                 />
//                 <Text style={styles.inputHint}>
//                   Example: 2024-12-25
//                 </Text>
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.inputLabel}>End Date</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={editForm.endDate}
//                   onChangeText={(text) =>
//                     setEditForm({ ...editForm, endDate: text })
//                   }
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor="#999"
//                 />
//                 <Text style={styles.inputHint}>
//                   Example: 2024-12-26
//                 </Text>
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.inputLabel}>Remarks</Text>
//                 <TextInput
//                   style={[styles.input, styles.textArea]}
//                   value={editForm.remarks}
//                   onChangeText={(text) =>
//                     setEditForm({ ...editForm, remarks: text })
//                   }
//                   placeholder="Enter any remarks..."
//                   placeholderTextColor="#999"
//                   multiline
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                 />
//               </View>

//               <View style={styles.modalButtons}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.cancelModalButton]}
//                   onPress={() => setModalVisible(false)}
//                 >
//                   <Text style={styles.cancelModalButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.saveButton]}
//                   onPress={handleSaveModification}
//                 >
//                   <Text style={styles.saveButtonText}>Save Changes</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF9F3',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   reservationCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   resourceName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     flex: 1,
//     marginRight: 12,
//   },
//   typeBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 16,
//   },
//   typeText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   datesContainer: {
//     marginBottom: 12,
//   },
//   dateRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   dateIcon: {
//     marginRight: 8,
//   },
//   dateLabel: {
//     fontSize: 14,
//     color: '#6C757D',
//     width: 50,
//     fontWeight: '500',
//   },
//   dateValue: {
//     fontSize: 14,
//     color: '#495057',
//     flex: 1,
//   },
//   remarksContainer: {
//     backgroundColor: '#F8F9FA',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   remarksLabel: {
//     fontSize: 12,
//     color: '#6C757D',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   remarksText: {
//     fontSize: 14,
//     color: '#495057',
//     lineHeight: 20,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 6,
//   },
//   modifyButton: {
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#4A90E2',
//   },
//   cancelButton: {
//     backgroundColor: '#DC3545',
//   },
//   modifyButtonText: {
//     color: '#4A90E2',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   cancelButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#6C757D',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#DC3545',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyEmoji: {
//     fontSize: 48,
//     marginBottom: 16,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 8,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: '#6C757D',
//     textAlign: 'center',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//   },
//   modalScrollView: {
//     padding: 24,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   modalSubtitle: {
//     fontSize: 16,
//     color: '#6C757D',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   formGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#495057',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CED4DA',
//     borderRadius: 8,
//     padding: 14,
//     fontSize: 16,
//     backgroundColor: '#FFFFFF',
//     color: '#212529',
//   },
//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   inputHint: {
//     fontSize: 12,
//     color: '#6C757D',
//     marginTop: 4,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 8,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelModalButton: {
//     backgroundColor: '#F8F9FA',
//     borderWidth: 1,
//     borderColor: '#DEE2E6',
//   },
//   cancelModalButtonText: {
//     color: '#6C757D',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   saveButton: {
//     backgroundColor: '#007AFF',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 16,
//   },
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
//   notchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   iconWrapper: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   notchTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#000",
//     flex: 1,
//     textAlign: 'center',
//   },

//   notchTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#000",
//     flex: 1,
//     textAlign: 'center',
//   },
// });



// export default ReservationsScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconAD from 'react-native-vector-icons/AntDesign';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getCurrentAdmin,
  getAdminReservations,
  cancelReservation,
  updateReservation,
  formatDate,
  formatDateTime,
  formatDateForInput,
} from '../../config/apis';

const ReservationsScreen = ({ navigation }) => {
  const [admin, setAdmin] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    startDate: '',
    endDate: '',
    remarks: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current logged-in admin from storage
      const adminData = await getCurrentAdmin();
      setAdmin(adminData);

      // Get admin's reservations
      if (adminData && adminData.id) {
        const reservationsData = await getAdminReservations(adminData.id);
        setReservations(reservationsData || []);
      } else {
        setReservations([]);
        setError('No admin found. Please login again.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load data. Please check your connection.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCancelReservation = (reservation) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel reservation for ${reservation.resourceName}?`,
      [
        {
          text: 'No',
          style: 'cancel',
          onPress: () => console.log('Cancel pressed')
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(reservation.id);

              // Update local state immediately
              setReservations(prev =>
                prev.filter(r => r.id !== reservation.id)
              );

              Alert.alert(
                'Success',
                'Reservation cancelled successfully',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel reservation'
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleModifyReservation = (reservation) => {
    setSelectedReservation(reservation);
    setEditForm({
      startDate: formatDateForInput(reservation.startTime),
      endDate: formatDateForInput(reservation.endTime),
      remarks: reservation.remarks || '',
    });
    setModalVisible(true);
  };

  const handleSaveModification = async () => {
    // Validation
    if (!editForm.startDate || !editForm.endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    const startDate = new Date(editForm.startDate + 'T00:00:00Z');
    const endDate = new Date(editForm.endDate + 'T00:00:00Z');

    if (startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    if (!selectedReservation) return;

    try {
      const updateData = {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        remarks: editForm.remarks,
      };

      await updateReservation(selectedReservation.id, updateData);

      // Update local state
      setReservations(prev =>
        prev.map(r =>
          r.id === selectedReservation.id
            ? {
              ...r,
              startTime: updateData.startTime,
              endTime: updateData.endTime,
              remarks: updateData.remarks
            }
            : r
        )
      );

      Alert.alert(
        'Success',
        'Reservation updated successfully',
        [{ text: 'OK' }]
      );

      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update reservation'
      );
    }
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.resourceName}>{item.resourceName}</Text>
        <View style={[
          styles.typeBadge,
          { backgroundColor: getTypeColor(item.type) }
        ]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>

      <View style={styles.datesContainer}>
        <View style={styles.dateRow}>
          <Icon name="calendar-outline" size={16} color="#6C757D" style={styles.dateIcon} />
          <Text style={styles.dateLabel}>From:</Text>
          <Text style={styles.dateValue}>
            {formatDateTime(item.startTime)}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Icon name="calendar-outline" size={16} color="#6C757D" style={styles.dateIcon} />
          <Text style={styles.dateLabel}>To:</Text>
          <Text style={styles.dateValue}>
            {formatDateTime(item.endTime)}
          </Text>
        </View>
      </View>

      {item.remarks ? (
        <View style={styles.remarksContainer}>
          <Text style={styles.remarksLabel}>Remarks:</Text>
          <Text style={styles.remarksText}>{item.remarks}</Text>
        </View>
      ) : null}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.modifyButton]}
          onPress={() => handleModifyReservation(item)}
        >
          <Icon name="create-outline" size={18} color="#b48a64" />
          <Text style={styles.modifyButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => handleCancelReservation(item)}
        >
          <Icon name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'ROOM': return '#4A90E2';
      case 'HALL': return '#9013FE';
      case 'LAWN': return '#7ED321';
      case 'PHOTOSHOOT': return '#F5A623';
      default: return '#9B9B9B';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Notch Header */}
      <ImageBackground
        source={require('../../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation && navigation.goBack()}
            activeOpacity={0.7}
          >
            <IconMC name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>Reservations</Text>

          <View style={{ width: 40 }} />
        </View>
      </ImageBackground>

      {error && !loading ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reservations found</Text>
          <Text style={styles.emptySubText}>
            You don't have any reservations at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}

      {/* Modification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalTitle}>
                Edit Reservation
              </Text>
              {selectedReservation && (
                <Text style={styles.modalSubtitle}>
                  {selectedReservation.resourceName} ({selectedReservation.type})
                </Text>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.startDate}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, startDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputHint}>
                  Example: 2024-12-25
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.endDate}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, endDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputHint}>
                  Example: 2024-12-26
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Remarks</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.remarks}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, remarks: text })
                  }
                  placeholder="Enter any remarks..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveModification}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0EC',
  },
  listContainer: {
    padding: 16,
    paddingTop: 18,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
    letterSpacing: 0.2,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  datesContainer: {
    marginBottom: 14,
    backgroundColor: '#FAFBFD',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 13,
    color: '#b48a64',
    width: 50,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontWeight: '600',
  },
  remarksContainer: {
    backgroundColor: '#FAFBFD',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  remarksLabel: {
    fontSize: 11,
    color: '#b48a64',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  remarksText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  modifyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#b48a64',
    shadowColor: '#b48a64',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modifyButtonText: {
    color: '#b48a64',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0EC',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#b48a64',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 18,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
  },
  modalScrollView: {
    padding: 26,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFBFC',
    color: '#1E293B',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelModalButtonText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#b48a64',
    shadowColor: '#b48a64',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
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
  notchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notchTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: 'center',
  },
});

export default ReservationsScreen;