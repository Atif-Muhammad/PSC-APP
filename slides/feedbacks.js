import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    RefreshControl,
    Modal,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import IconAD from 'react-native-vector-icons/AntDesign';
import { feedbackAPI, checkAuthStatus } from '../config/apis';

const THEME_COLOR = '#b48a64'; // Gold
const SECONDARY_COLOR = '#1A1A1A'; // Deep Black
const BG_COLOR = '#F8F9FA';

const FeedbackScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [isAdding, setIsAdding] = useState(true); // Default to New Feedback form until we confirm user has history
    const [refreshing, setRefreshing] = useState(false);
    const [showWalkthrough, setShowWalkthrough] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: '',
        categoryId: null,
        subCategoryId: null,
        otherSubCategory: '',
        message: '',
    });

    useEffect(() => {
        fetchInitialData();
        fetchFeedbacks();

        // Add focus listener to show walkthrough every time user visits the screen
        const unsubscribe = navigation.addListener('focus', () => {
            setShowWalkthrough(true);
        });

        return unsubscribe;
    }, [navigation]);

    const completeWalkthrough = () => {
        setShowWalkthrough(false);
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [catsRaw, subCatsRaw] = await Promise.all([
                feedbackAPI.getCategories(),
                feedbackAPI.getSubCategories(),
            ]);

            // Defensively unwrap: API might return array directly, or nested in .data / .Data / .categories etc.
            const unwrap = (raw) => {
                if (Array.isArray(raw)) return raw;
                if (raw && Array.isArray(raw.data)) return raw.data;
                if (raw && Array.isArray(raw.Data)) return raw.Data;
                if (raw && Array.isArray(raw.categories)) return raw.categories;
                if (raw && Array.isArray(raw.subCategories)) return raw.subCategories;
                if (raw && Array.isArray(raw.subcategories)) return raw.subcategories;
                if (raw && Array.isArray(raw.result)) return raw.result;
                if (raw && Array.isArray(raw.rows)) return raw.rows;
                return [];
            };

            const cats = unwrap(catsRaw);
            const subCats = unwrap(subCatsRaw);

            console.log('📂 Categories raw:', JSON.stringify(catsRaw));
            console.log('📂 SubCategories raw:', JSON.stringify(subCatsRaw));
            console.log('✅ Parsed cats count:', cats.length, '| subCats count:', subCats.length);

            // Support multiple field names for id and name
            const mapCat = (c) => ({
                label: c.name || c.Name || c.categoryName || c.title || '(Unnamed)',
                value: c.id || c.Id || c.categoryId || c.Sno || c._id,
            });

            const mapSubCat = (s) => ({
                label: s.name || s.Name || s.subCategoryName || s.title || '(Unnamed)',
                value: s.id || s.Id || s.subCategoryId || s.Sno || s._id,
                // Try all possible FK field names that link subcategory to a category
                categoryId: s.categoryId || s.CategoryId || s.category_id || s.parentId || s.parent_id || null,
            });

            setCategories(cats.map(mapCat));
            setSubCategories(subCats.map(mapSubCat));
        } catch (error) {
            console.error('Fetch feedback data error:', error);
            Alert.alert('Error', 'Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const data = await feedbackAPI.getFeedbacks();

            // Get current user to filter feedback
            const authStatus = await checkAuthStatus();

            if (authStatus && authStatus.isAuthenticated && authStatus.userData) {
                const currentUser = authStatus.userData;
                const userId = currentUser.Sno || currentUser.id || currentUser.userId;
                const userMemNo = currentUser.membership_no || currentUser.Membership_No || currentUser.membershipNumber || currentUser.memberId;

                // Filter feedbacks strictly for the current user
                const userFeedbacks = data.filter(item => {
                    // Collect all possible ID and membership number variations from the feedback item
                    const itemIds = [
                        item.userId, item.user_id, item.memberId, item.member_id, item.Sno, item.sno, item.MemberSno,
                        item.user?.id, item.user?.Sno, item.user?.sno, item.user?.MemberSno,
                        item.member?.id, item.member?.Sno, item.member?.sno, item.member?.MemberSno
                    ].map(id => id ? String(id).trim() : null).filter(Boolean);

                    const itemMemNos = [
                        item.membership_no, item.membershipNo, item.Membership_No,
                        item.user?.membership_no, item.user?.Membership_No, item.user?.membershipNo,
                        item.member?.membership_no, item.member?.Membership_No, item.member?.membershipNo
                    ].map(no => no ? String(no).trim().toLowerCase() : null).filter(Boolean);

                    const currentUserId = userId ? String(userId).trim() : null;
                    const currentUserMemNo = userMemNo ? String(userMemNo).trim().toLowerCase() : null;

                    // Match by ID
                    if (currentUserId && itemIds.includes(currentUserId)) return true;
                    // Match by Membership No
                    if (currentUserMemNo && itemMemNos.includes(currentUserMemNo)) return true;

                    return false;
                });

                if (userFeedbacks.length === 0 && data.length > 0) {
                    // Let's examine the first element of 'data' to see why our filter didn't match
                    const sample = data[0];
                    const keys = Object.keys(sample).join(', ');
                    const userKeys = typeof sample.user === 'object' && sample.user ? Object.keys(sample.user).join(', ') : 'no user object';
                    const memberKeys = typeof sample.member === 'object' && sample.member ? Object.keys(sample.member).join(', ') : 'no member object';

                    console.warn('Debug - Filtered out all items. Expected userId:', currentUserId, 'memNo:', currentUserMemNo);
                    console.warn('Debug - Data[0] sample keys:', keys);

                    // Show a quick alert on screen for debugging to see which fields are returned
                    Alert.alert(
                        'Debug Info',
                        `Filter cleared all items. Your ID: ${currentUserId}, Mem: ${currentUserMemNo}.\n\n` +
                        `Item keys: ${keys}\n` +
                        `Item user keys: ${userKeys}\n` +
                        `Item member keys: ${memberKeys}`
                    );
                }

                setFeedbacks(userFeedbacks);
                // Set default view: New Feedback if no history, otherwise History
                setIsAdding(userFeedbacks.length === 0);
            } else {
                setFeedbacks([]); // Not authenticated or user unidentifiable
                setIsAdding(true); // Default to form if we can't get history
            }
        } catch (error) {
            console.error('Fetch feedbacks error:', error);
            Alert.alert('Error', 'Failed to load feedback history. Please try again.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFeedbacks();
        setRefreshing(false);
    };

    const getStatusBadge = (status) => {
        let bgColor, textColor;
        switch (status?.toUpperCase()) {
            case 'PENDING':
                bgColor = '#FFFBEB'; // Yellow background
                textColor = '#92400E'; // Yellow text
                break;
            case 'IN_PROCESS':
            case 'IN PROGRESS':
                bgColor = '#E0F2FE'; // Blue background
                textColor = '#0369A1'; // Blue text
                break;
            case 'COMPLETED':
                bgColor = '#ECFDF5'; // Green background
                textColor = '#14532D'; // Green text
                break;
            default:
                bgColor = '#F3F4F6'; // Gray background
                textColor = '#374151'; // Gray text
        }

        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {status || 'Unknown'}
                </Text>
            </View>
        );
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const renderFeedbackHistory = () => {
        return (
            <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                    <View>
                        <Text style={styles.historyTitle}>Feedback History</Text>
                        <Text style={styles.historySubtitle}>View your submitted feedback and admin responses</Text>
                    </View>
                </View>

                {feedbacks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Icon name="chatbubble-ellipses-outline" size={60} color="#B0B0B0" />
                        </View>
                        <Text style={styles.emptyText}>No feedback history yet</Text>
                        <Text style={styles.emptySubtext}>Your submitted feedback will appear here</Text>
                        <TouchableOpacity
                            style={styles.emptyActionButton}
                            onPress={() => setIsAdding(true)}
                        >
                            <Text style={styles.emptyActionText}>Submit Your First Feedback</Text>
                            <Icon name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={feedbacks}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={({ item }) => (
                            <View style={styles.feedbackCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Text style={styles.feedbackDate}>{formatDate(item.createdAt || item.created_at)}</Text>
                                        <Text style={styles.feedbackTime}>
                                            {new Date(item.createdAt || item.created_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </View>
                                    {getStatusBadge(item.status)}
                                </View>

                                <Text style={styles.feedbackSubject}>{typeof item.subject === 'string' ? item.subject : 'No subject'}</Text>

                                <Text style={styles.feedbackMessage} numberOfLines={3}>
                                    {typeof item.message === 'string' ? item.message : 'No message'}
                                </Text>

                                <View style={styles.categoryContainer}>
                                    <Icon name="pricetags-outline" size={14} color="#666" />
                                    <Text style={styles.feedbackCategory}>
                                        {typeof item.category === 'string' ? item.category :
                                            typeof item.category?.name === 'string' ? item.category.name :
                                                'N/A'}
                                    </Text>
                                    {(typeof item.subCategory === 'string' || typeof item.subCategory?.name === 'string') && (
                                        <Text style={styles.feedbackSubCategory}>
                                            • {typeof item.subCategory === 'string' ? item.subCategory : item.subCategory.name}
                                        </Text>
                                    )}
                                </View>

                                {/* Admin Remarks Section */}
                                {(() => {
                                    // Collect all remarks into a normalized array
                                    let remarksList = [];

                                    if (Array.isArray(item.remarks)) {
                                        remarksList = item.remarks.map(r => ({
                                            text: typeof r === 'string' ? r : (r.remark || r.text || r.message || r.description || ''),
                                            date: r.createdAt || r.created_at || r.date || null,
                                            adminName: r.adminName || r.admin_name || r.name || r.createdBy || null,
                                            status: r.status || null,
                                        })).filter(r => r.text);
                                    } else {
                                        const remarkText =
                                            (typeof item.remarks === 'string' && item.remarks) ||
                                            (typeof item.adminRemarks === 'string' && item.adminRemarks) ||
                                            (typeof item.remark === 'string' && item.remark) ||
                                            '';
                                        if (remarkText) {
                                            remarksList = [{
                                                text: remarkText,
                                                date: item.updatedAt || item.updated_at || null,
                                                adminName: item.adminName || item.admin_name || null,
                                                status: item.status || null,
                                            }];
                                        }
                                    }

                                    if (remarksList.length === 0) return null;

                                    // Derive accent color from the PARENT feedback status
                                    const parentStatus = item.status?.toUpperCase();
                                    const statusColor =
                                        parentStatus === 'COMPLETED' ? '#10B981' :
                                            parentStatus === 'IN_PROCESS' || parentStatus === 'IN PROGRESS' ? '#3B82F6' :
                                                '#F59E0B'; // pending / default = amber

                                    return (
                                        <View style={styles.adminReplyWrapper}>
                                            {/* Section Header */}
                                            <View style={styles.adminReplyHeader}>
                                                <Icon name="chatbubble-ellipses" size={16} color={statusColor} />
                                                <Text style={styles.adminReplySectionTitle}>Admin Response</Text>
                                                <View style={[styles.adminReplyCount, { backgroundColor: statusColor }]}>
                                                    <Text style={styles.adminReplyCountText}>{remarksList.length}</Text>
                                                </View>
                                            </View>

                                            {remarksList.map((remark, idx) => (
                                                <View key={idx} style={[styles.adminReplyCard, { borderLeftColor: statusColor }]}>
                                                    {/* Reply Meta Row: Status + Date */}
                                                    <View style={styles.adminReplyMeta}>
                                                        {remark.status ? (
                                                            <View style={[styles.adminStatusPill, {
                                                                backgroundColor:
                                                                    remark.status?.toUpperCase() === 'COMPLETED' ? '#ECFDF5' :
                                                                        remark.status?.toUpperCase() === 'IN_PROCESS' || remark.status?.toUpperCase() === 'IN PROGRESS' ? '#EFF6FF' :
                                                                            '#FFFBEB'
                                                            }]}>
                                                                <View style={[styles.adminStatusDot, {
                                                                    backgroundColor:
                                                                        remark.status?.toUpperCase() === 'COMPLETED' ? '#10B981' :
                                                                            remark.status?.toUpperCase() === 'IN_PROCESS' || remark.status?.toUpperCase() === 'IN PROGRESS' ? '#3B82F6' :
                                                                                '#F59E0B'
                                                                }]} />
                                                                <Text style={[styles.adminStatusText, {
                                                                    color:
                                                                        remark.status?.toUpperCase() === 'COMPLETED' ? '#059669' :
                                                                            remark.status?.toUpperCase() === 'IN_PROCESS' || remark.status?.toUpperCase() === 'IN PROGRESS' ? '#2563EB' :
                                                                                '#92400E'
                                                                }]}>{remark.status}</Text>
                                                            </View>
                                                        ) : null}

                                                        {remark.date ? (
                                                            <View style={styles.adminReplyDateRow}>
                                                                <Icon name="time-outline" size={12} color="#999" />
                                                                <Text style={styles.adminReplyDate}>
                                                                    {formatDate(remark.date)}  {new Date(remark.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                </Text>
                                                            </View>
                                                        ) : null}
                                                    </View>

                                                    {/* Reply Text */}
                                                    <Text style={styles.adminReplyText}>{remark.text}</Text>

                                                    {/* Admin Name Footer */}
                                                    {/* {remark.adminName ? (
                                                        <View style={styles.adminNameRow}>
                                                            <Icon name="person-circle-outline" size={14} color="#b48a64" />
                                                            <Text style={styles.adminReplyAuthor}>{remark.adminName}</Text>
                                                        </View>
                                                    ) : null} */}
                                                </View>
                                            ))}
                                        </View>
                                    );
                                })()}
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[THEME_COLOR]}
                                tintColor={THEME_COLOR}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                    />
                )}
            </View>
        );
    };

    const handleCategoryChange = (item) => {
        setForm(prev => ({
            ...prev,
            categoryId: item.value,
            subCategoryId: null,
            otherSubCategory: ''
        }));

        // Filter subcategories if categoryId exists in subcategory data
        const filtered = subCategories.filter(s => !s.categoryId || s.categoryId === item.value);
        // Add "Other" option
        setFilteredSubCategories([...filtered, { label: 'Other', value: 'OTHER' }]);
    };
    const handleSubmit = async () => {
        if (!form.subject || !form.categoryId || !form.message) {
            Alert.alert('Error', 'Please fill in all required fields (Subject, Category, and Message)');
            return;
        }

        if (form.subCategoryId === 'OTHER' && !form.otherSubCategory) {
            Alert.alert('Error', 'Please specify the other sub-category');
            return;
        }

        try {
            setSubmitting(true);

            // ✅ Payload without otherSubCategory
            const payload = {
                subject: form.subject,
                message: form.message,
                categoryId: form.categoryId,
                subCategoryId: form.subCategoryId === 'OTHER' ? null : form.subCategoryId,
                // ❌ otherSubCategory is NOT sent
            };

            await feedbackAPI.submitFeedback(payload);

            // Refresh the feedback list after successful submission
            await fetchFeedbacks();

            // Reset the form
            setForm({
                subject: '',
                categoryId: null,
                subCategoryId: null,
                otherSubCategory: '',
                message: '',
            });

            Alert.alert(
                'Success',
                'Thank you for your feedback! We will review it shortly.',
                [{ text: 'OK', onPress: () => setIsAdding(false) }]
            );
        } catch (error) {
            console.error('Submit feedback error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={THEME_COLOR} />
                <Text style={styles.loadingText}>Loading Feedback...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/notch.jpg')}
                style={styles.headerBg}
                imageStyle={styles.headerImage}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            if (isAdding) {
                                setIsAdding(false);
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <IconAD name="arrowleft" size={26} color="black" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>{isAdding ? 'New Feedback' : 'Feedback'}</Text>
                        <Text style={styles.headerSubtitle}>{isAdding ? 'Submit your feedback' : 'View history & submit feedback'}</Text>
                    </View>
                    {!isAdding ? (
                        <TouchableOpacity
                            style={{

                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',

                            }}
                            onPress={() => setIsAdding(true)}
                        >
                            <Icon name="add" size={28} color="black" style={{ fontWeight: '1000' }} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </ImageBackground>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {isAdding ? (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.formContainer}>

                            {/* Subject */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subject *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Briefly describe your feedback"
                                    placeholderTextColor="#999"
                                    value={form.subject}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
                                />
                            </View>

                            {/* Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category *</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={categories}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Category"
                                    searchPlaceholder="Search..."
                                    value={form.categoryId}
                                    onChange={handleCategoryChange}
                                    renderLeftIcon={() => (
                                        <Icon style={styles.icon} color={THEME_COLOR} name="list" size={20} />
                                    )}
                                />
                            </View>

                            {/* Sub Category */}
                            {form.categoryId && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Sub-Category</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        inputSearchStyle={styles.inputSearchStyle}
                                        iconStyle={styles.iconStyle}
                                        data={filteredSubCategories}
                                        search
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Sub-Category"
                                        searchPlaceholder="Search..."
                                        value={form.subCategoryId}
                                        onChange={(item) => setForm(prev => ({ ...prev, subCategoryId: item.value }))}
                                        renderLeftIcon={() => (
                                            <Icon style={styles.icon} color={THEME_COLOR} name="options" size={20} />
                                        )}
                                    />
                                </View>
                            )}

                            {/* Other Sub Category */}
                            {form.subCategoryId === 'OTHER' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Please specify *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter custom category"
                                        placeholderTextColor="#999"
                                        value={form.otherSubCategory}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, otherSubCategory: text }))}
                                    />
                                </View>
                            )}

                            {/* Message */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Message / Remarks *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Share your detailed thoughts, suggestions or complaints..."
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={6}
                                    value={form.message}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, message: text }))}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                                        <Icon name="send" size={18} color="#FFF" style={{ marginLeft: 10 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    renderFeedbackHistory()
                )}
            </KeyboardAvoidingView>

            {/* App Walkthrough Overlay */}
            <Modal
                visible={showWalkthrough && !isAdding}
                transparent={true}
                animationType="fade"
                onRequestClose={completeWalkthrough}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    {/* Fake Highlighted Button overlaying the real one */}
                    <View style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 55 : 45, // Approximated position for the add button
                        right: 20,
                        backgroundColor: '#b48a64',
                        width: 44, // Slightly larger to highlight
                        height: 44,
                        borderRadius: 22,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#FFF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 15,
                        elevation: 10,
                        borderWidth: 2,
                        borderColor: '#FFF',
                    }}>
                        <Icon name="add" size={28} color="#FFF" style={{ fontWeight: 'bold' }} />
                    </View>

                    {/* SVG Dashed Arrow pointing from Tooltip up to the Button */}
                    <View style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 100 : 90,
                        right: 42,
                        width: 60,
                        height: 70,
                    }}>
                        <Svg height="100%" width="100%" viewBox="0 0 60 70">
                            {/* Curved dashed line from bottom-left (tooltip) to top-right (button) */}
                            <Path
                                d="M10,70 Q40,50 50,15"
                                fill="none"
                                stroke="#FFF"
                                strokeWidth="2.5"
                                strokeDasharray="6,4"
                            />
                            {/* Arrow head pointing at the button */}
                            <Path
                                d="M38,20 L50,15 L53,28"
                                fill="none"
                                stroke="#FFF"
                                strokeWidth="2.5"
                            />
                        </Svg>
                    </View>

                    {/* Tooltip Box styled like the inspiration but in Gold/Light Gold theme */}
                    <View style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 170 : 160,
                        right: 20,
                        backgroundColor: '#FDECDA', // Very light gold/orange tint
                        padding: 20,
                        borderRadius: 12,
                        width: Dimensions.get('window').width * 0.7,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 8,
                    }}>
                        <Text style={{
                            color: '#333',
                            fontSize: 16,
                            fontWeight: '600',
                            textAlign: 'center',
                            lineHeight: 24,
                            marginBottom: 15,
                        }}>
                            Tap here to submit a new feedback or complaint to the administration
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#b48a64',
                                paddingVertical: 10,
                                borderRadius: 8,
                                alignItems: 'center',
                                width: '100%',
                            }}
                            onPress={completeWalkthrough}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    headerBg: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerImage: {
        opacity: 0.9,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    titleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: SECONDARY_COLOR,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#555',
        fontWeight: '500',
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 50,
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F5F5F5',
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: SECONDARY_COLOR,
        marginBottom: 12,
        marginLeft: 2,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 15,
        padding: 18,
        fontSize: 16,
        color: '#2D3748',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    textArea: {
        height: 140,
        textAlignVertical: 'top',
        paddingTop: 18,
    },
    dropdown: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 18,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    icon: {
        marginRight: 10,
    },
    placeholderStyle: {
        fontSize: 15,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 15,
        color: '#333',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 15,
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: THEME_COLOR,
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: THEME_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 0,
    },
    disabledButton: {
        opacity: 0.7,
        shadowOpacity: 0.1,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG_COLOR,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    historyContainer: {
        flex: 1,
        backgroundColor: '#FAF8F5',
        padding: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    historyTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: SECONDARY_COLOR,
        letterSpacing: 0.5,
    },
    historySubtitle: {
        fontSize: 14,
        color: '#777',
        fontWeight: '500',
        marginTop: 4,
    },
    fabButton: {
        backgroundColor: THEME_COLOR,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: THEME_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 30,
    },
    emptyIconContainer: {
        marginBottom: 25,
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#555',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    emptyActionButton: {
        backgroundColor: THEME_COLOR,
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: THEME_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    emptyActionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    feedbackCard: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    feedbackDate: {
        fontSize: 15,
        color: SECONDARY_COLOR,
        fontWeight: '700',
        marginBottom: 2,
    },
    feedbackTime: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    feedbackSubject: {
        fontSize: 19,
        fontWeight: '700',
        color: SECONDARY_COLOR,
        marginBottom: 12,
        lineHeight: 26,
    },
    feedbackMessage: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        marginBottom: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    feedbackCategory: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginLeft: 6,
        marginRight: 8,
    },
    feedbackSubCategory: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    remarksContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
        marginTop: 12,
    },
    remarksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    remarksTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3748',
        marginLeft: 8,
    },
    remarksText: {
        fontSize: 15,
        color: '#4A5568',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    adminName: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'right',
    },

    // ── Admin Reply Card ──────────────────────────────────
    adminReplyWrapper: {
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#EEF0F4',
        paddingTop: 12,
    },
    adminReplyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    adminReplySectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2D3748',
        marginLeft: 6,
        flex: 1,
    },
    adminReplyCount: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    adminReplyCountText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    adminReplyCard: {
        backgroundColor: '#F7FAFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        borderLeftWidth: 3,
        borderLeftColor: '#4A90E2',
    },
    adminReplyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    adminStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    adminStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    adminStatusText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
        textTransform: 'capitalize',
    },
    adminReplyDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminReplyDate: {
        fontSize: 11,
        color: '#999',
        marginLeft: 4,
    },
    adminReplyText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 21,
        marginBottom: 8,
    },
    adminNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    adminReplyAuthor: {
        fontSize: 12,
        color: '#b48a64',
        fontWeight: '700',
        marginLeft: 5,
    },
});

export default FeedbackScreen;
