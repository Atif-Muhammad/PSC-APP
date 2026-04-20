import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserNotifications, updateNotiStatus } from "../config/apis";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AnnouncementRenderer from '../src/components/AnnouncementRenderer';

const { height } = Dimensions.get('window');

const announcements = [
  { id: "1", date: "2025-09-24", title: "Welcome" },
  { id: "2", date: "2024-08-12", title: "Welcome to the App" },
];

export default function Announcements({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await getUserNotifications();
      const lastClearedTime = await AsyncStorage.getItem('lastClearedNotificationsTime');

      let filteredResponse = response || [];
      if (lastClearedTime) {
        filteredResponse = filteredResponse.filter(item => new Date(item.createdAt) > new Date(lastClearedTime));
      }

      setAnnouncements(filteredResponse.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };



  // Fetch announcements every time the screen gains focus
  // (useEffect with [] only runs once on mount, but React Navigation
  // keeps screens mounted, so new notifications wouldn't appear)
  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [])
  );

  const openModal = async (item) => {
    setSelectedAnnouncement(item);
    setModalVisible(true);

    // Update status to seen if not already seen
    const isSeen = item?.deliveries?.[0]?.seen;
    if (isSeen === false) {
      try {
        await updateNotiStatus(item?.deliveries?.[0]?.id);
        // Update local state to reflect seen status
        setAnnouncements(prev =>
          prev.map(ann => ann.id === item.id ? {
            ...ann,
            deliveries: [{ ...ann.deliveries[0], seen: true }]
          } : ann)
        );
      } catch (error) {
        console.error("Error updating notification status:", error);
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAnnouncement(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <ImageBackground
        source={require("../assets/notch.jpg")}
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
          <Text style={styles.headerTitle}>Announcements</Text>
          <View style={styles.backButton} />
        </View>
      </ImageBackground>

      {/* Announcements List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A3834C" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isSeen = item?.deliveries?.[0]?.seen;
            return (
              <TouchableOpacity onPress={() => openModal(item)} activeOpacity={0.8}>
                <View style={[styles.card, isSeen ? styles.seenCard : styles.unseenCard]}>
                  <View style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                      <Text style={[styles.title, isSeen && styles.seenTitle]}>{item.title}</Text>
                    </View>
                    <Text style={styles.date}>
                      {item.createdAt ? formatDateTime(item.createdAt) : item.date}
                    </Text>
                  </View>
                  {!isSeen && <View style={styles.unreadDot} />}
                  <Icon name="chevron-right" size={20} color={isSeen ? "#AAA" : "#888"} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-none" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No announcements yet</Text>
            </View>
          }
        />
      )}

      {/* Floating Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchAnnouncements}>
        <Text style={styles.refreshIcon}>↻</Text>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalContent}>
                <View style={styles.modalIndicator} />

                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleContent}>
                    <View style={styles.iconCircle}>
                      <Icon name="notifications" size={20} color="#A3834C" />
                    </View>
                    <Text style={styles.modalTitle}>Notification Details</Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                    <Icon name="close" size={22} color="#555" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {selectedAnnouncement && (
                    <View style={styles.modalTextContent}>
                      <View style={styles.modalInfoRow}>
                        <Icon name="event" size={14} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.modalDate}>
                          {selectedAnnouncement.createdAt ? formatDateTime(selectedAnnouncement.createdAt) : selectedAnnouncement.date}
                        </Text>
                      </View>

                      <Text style={styles.modalItemTitle}>{selectedAnnouncement.title}</Text>

                      <View style={styles.modalDivider} />

                      <View style={styles.messageBubble}>
                        {/* Rich Text Renderer for HTML content */}
                        <AnnouncementRenderer
                          htmlContent={
                            selectedAnnouncement.description ||
                            selectedAnnouncement.content ||
                            selectedAnnouncement.body ||
                            selectedAnnouncement.message ||
                            "<p>No detailed description available.</p>"
                          }
                        />
                      </View>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity style={styles.confirmButton} onPress={closeModal}>
                  <Text style={styles.confirmButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF5EE",
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
  notchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unseenCard: {
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 4,
    borderLeftColor: "#F8CF93",
  },
  seenCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E8D4B8",
    opacity: 0.8,
    shadowOpacity: 0, // Remove shadow for seen cards
    elevation: 0,
  },
  cardContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F8CF93",
    marginRight: 10,
  },
  date: {
    color: "#888",
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  seenTitle: {
    fontWeight: "400",
    color: "#888",
  },
  refreshButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#F8CF93",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  refreshIcon: {
    fontSize: 26,
    color: "#000",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end', // Style like a bottom sheet
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: height * 0.5,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 13,
    color: '#999',
  },
  modalItemTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    lineHeight: 28,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 16,
  },
  messageBubble: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  confirmButton: {
    backgroundColor: '#b48a64',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    shadowColor: "#F8CF93",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Loading and Empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});

