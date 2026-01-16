import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import HtmlRenderer from '../src/events/HtmlRenderer';
import { getAboutUs, getClubHistory } from '../config/apis';

const { width: screenWidth } = Dimensions.get('window');

const About = () => {
  const navigation = useNavigation();
  const [aboutUs, setAboutUs] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllAbout, setShowAllAbout] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Function to split about text into preview and full content
  const getAboutPreview = (htmlContent) => {
    if (!htmlContent) {
      const defaultText = `Established in 1863 as the "Games Club", the Peshawar Services Club (PSC) has undergone various transformations, from being the HQ for the Vale Hunt Club in 1870 to "Peshawar Club" in 1899. Since 1947, its name changed multiple times until settling on "Peshawar Services Club" in 2011. Spanning acres of land, PSC offers its members a place for socializing, various amenities, including indoor and outdoor sports facilities, dining areas, and elegant accommodations.`;
      return {
        preview: defaultText,
        fullContent: defaultText,
        hasMore: false
      };
    }

    // Remove HTML tags and get plain text
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

    // Split into sentences (simple approach)
    const sentences = plainText.split(/(?<=[.!?])\s+/);

    if (sentences.length <= 2) {
      return {
        preview: htmlContent,
        fullContent: htmlContent,
        hasMore: false
      };
    }

    // First 2 sentences as preview
    const previewSentences = sentences.slice(0, 2);
    let previewText = previewSentences.join(' ');

    // Ensure preview ends with proper punctuation
    if (!/[.!?]$/.test(previewText)) {
      previewText += '...';
    } else {
      previewText = previewText.replace(/[.!?]$/, '...');
    }

    return {
      preview: previewText,
      fullContent: htmlContent,
      hasMore: true
    };
  };

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch both About Us and History in parallel
      const [aboutData, historyData] = await Promise.all([
        getAboutUs(),
        getClubHistory()
      ]);

      setAboutUs(aboutData);
      setHistory(historyData);

      // Animate content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const openImageViewer = (imageUrl) => {
    setSelectedImage([{ url: imageUrl }]);
    setImageViewerVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVisibleHistory = () => {
    if (showAllHistory) {
      return history;
    }
    return history.slice(0, 4); // Show only first 4 items initially
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A3834C" />
        <Text style={styles.loadingText}>Loading about PSC...</Text>
      </View>
    );
  }

  const visibleHistory = getVisibleHistory();
  const aboutContent = aboutUs ? getAboutPreview(aboutUs.clubInfo) : getAboutPreview(null);

  return (
    <>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Notch Header */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.headerText}>About PSC</Text>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#A3834C']}
                tintColor="#A3834C"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={24} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* About Us Section - Club Info */}
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.card}>
                <HtmlRenderer
                  htmlContent={showAllAbout ? aboutContent.fullContent : aboutContent.preview}
                  textStyle={styles.contentText}
                  maxLines={showAllAbout ? undefined : 6}
                />

                {/* View More Button */}
                {aboutContent.hasMore && (
                  <TouchableOpacity
                    onPress={() => setShowAllAbout(!showAllAbout)}
                    style={styles.viewMoreButton}
                  >
                    <Text style={styles.viewMoreText}>
                      {showAllAbout ? 'View Less' : 'View More'}
                    </Text>
                    <Icon
                      name={showAllAbout ? 'expand-less' : 'expand-more'}
                      size={20}
                      color="#A3834C"
                    />
                  </TouchableOpacity>
                )}


              </View>


            </Animated.View>

            {/* Divider - From second code styling */}
            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.lineText}>Down the Memory Lane</Text>
              <View style={styles.line} />
            </View>

            {/* Club History Section */}
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* History Items */}
              {history.length > 0 ? (
                <>
                  {visibleHistory.map((item, index) => (
                    <View style={styles.imageCard} key={item.id || index}>
                      {item.image && (
                        <TouchableOpacity
                          onPress={() => openImageViewer(item.image)}
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{ uri: item.image }}
                            style={styles.memoryImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}

                      <View style={styles.historyTextContainer}>
                        <HtmlRenderer
                          htmlContent={item.description}
                          textStyle={styles.captionText}
                        />
                      </View>


                    </View>
                  ))}

                  {/* Show More/Less Button for History */}
                  {history.length > 4 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllHistory(!showAllHistory)}
                    >
                      <Text style={styles.showMoreText}>
                        {showAllHistory ? 'Show Less' : `Show All (${history.length} items)`}
                      </Text>
                      <Icon
                        name={showAllHistory ? 'expand-less' : 'expand-more'}
                        size={20}
                        color="#A3834C"
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="history" size={80} color="#DDD" />
                  <Text style={styles.emptyTitle}>No History Available</Text>
                  <Text style={styles.emptySubtitle}>
                    Club history will be displayed here once added
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Contact/Info Section */}


            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Peshawar Services Club - A legacy of excellence since 1863
              </Text>
              <Text style={styles.footerCopyright}>
                © {new Date().getFullYear()} All Rights Reserved
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={selectedImage}
          enableSwipeDown={true}
          onSwipeDown={() => setImageViewerVisible(false)}
          enablePreload={true}
          index={0}
          footerContainerStyle={styles.imageViewerFooter}
          renderFooter={() => (
            <TouchableOpacity
              style={styles.closeImageViewer}
              onPress={() => setImageViewerVisible(false)}
            >
              <Icon name="close" size={30} color="#FFF" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  /* Fixed height notch header - From second code */
  notch: {
    height: 120, // 🔒 Fixed height (doesn't grow/shrink)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60, // space for arrow and title
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
  },
  notchImage: {
    resizeMode: 'cover',
  },

  /* Perfect horizontal alignment for arrow and title - From second code */
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
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
    paddingBottom: 40,
  },

  /* Card styling from second code */
  card: {
    backgroundColor: '#f1e3dcff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 12,
  },

  /* View More Button - Matching the Show More button style */
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#A3834C',
    fontWeight: '600',
    marginRight: 8,
  },

  updateInfo: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  updateText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 5,
  },

  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A3834C',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Divider styling from second code */
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A3834C',
  },

  /* Image Card styling from second code */
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memoryImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  historyTextContainer: {
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  captionText: {
    fontSize: 15,
    color: '#A3834C',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  historyDateSmall: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },

  /* Show More Button - Updated to match design */
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  showMoreText: {
    fontSize: 14,
    color: '#A3834C',
    fontWeight: '600',
    marginRight: 8,
  },

  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#C62828',
    marginLeft: 10,
    marginRight: 10,
  },
  retryButton: {
    backgroundColor: '#A3834C',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  infoSection: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A3834C',
    marginBottom: 10,
    marginLeft: 5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageViewerFooter: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  closeImageViewer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 15,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#AAA',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default About;