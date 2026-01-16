import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { getRules } from '../../config/apis';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HtmlRenderer from './HtmlRenderer';
import StandardHeader from '../components/StandardHeader';

const ClubRulesScreen = ({ navigation }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // 🔹 Track expanded rules
    const [expandedRules, setExpandedRules] = useState({});

    const fetchRules = async () => {
        try {
            setError(null);
            const data = await getRules();
            const activeRules = Array.isArray(data)
                ? data.filter(rule => rule.isActive === true)
                : [];
            setRules(activeRules);
        } catch (err) {
            setError(err.message || 'Failed to fetch rules');
            console.error('Fetch rules error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setExpandedRules({});
            };
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRules();
    }, []);

    const toggleExpand = (id) => {
        setExpandedRules(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const renderRuleItem = ({ item, index }) => {
        const isExpanded = expandedRules[item.id];

        // Calculate plain text length to decide whether to show "View More"
        const plainText = (item.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const showViewMore = plainText.length > 600;

        return (
            <View style={styles.ruleCard}>
                {/* HTML CONTENT */}
                <View
                    style={[
                        styles.htmlContainer,
                        (!isExpanded && showViewMore) && styles.collapsedContent,
                    ]}
                >
                    <HtmlRenderer
                        htmlContent={item.content}
                        textStyle={styles.htmlText}
                    />
                </View>

                {/* VIEW MORE / LESS */}
                {showViewMore && (
                    <TouchableOpacity
                        onPress={() => toggleExpand(item.id)}
                        style={styles.viewMoreButton}
                    >
                        <Text style={styles.viewMoreText}>
                            {isExpanded ? 'View Less ▲' : 'View More ▼'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* FOOTER */}
                <View style={styles.ruleFooter}>
                    <Text style={styles.ruleDate}>
                        Updated:{' '}
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                            'en-US',
                            {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }
                        )}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A3834C" />
                <Text style={styles.loadingText}>Loading rules...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="error-outline" size={60} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchRules}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <StandardHeader
                title="Club Rules"
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={rules}
                renderItem={renderRuleItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#A3834C']}
                        tintColor="#A3834C"
                    />
                }
                ListHeaderComponent={
                    rules.length > 0 && (
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>
                                Important: Please read all rules carefully to ensure
                                a pleasant experience
                            </Text>
                        </View>
                    )
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="rule" size={80} color="#DDD" />
                        <Text style={styles.emptyTitle}>No rules available</Text>
                        <Text style={styles.emptySubtitle}>
                            Club rules will be displayed here once added
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    /* -------------------- NOTCH HEADER -------------------- */
    notch: {
        height: 120,
        paddingTop: 50,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 37,
    },
    headerText: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
        marginRight: 40,
    },

    /* -------------------- LIST -------------------- */
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    listHeader: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107',
    },
    listHeaderText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
        fontWeight: '500',
    },

    ruleCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 10,
        elevation: 3,
    },

    ruleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    ruleNumberContainer: {
        backgroundColor: '#A3834C',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ruleNumber: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    ruleStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },

    htmlContainer: {
        marginBottom: 10,
    },
    collapsedContent: {
        maxHeight: 180,
        overflow: 'hidden',
    },
    htmlText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },

    viewMoreButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    viewMoreText: {
        color: '#A3834C',
        fontWeight: '600',
        fontSize: 14,
    },

    ruleFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 10,
    },
    ruleDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },

    /* -------------------- STATES -------------------- */
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        textAlign: 'center',
        marginVertical: 15,
    },
    retryButton: {
        backgroundColor: '#A3834C',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: '500',
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 18,
        color: '#AAA',
        marginTop: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#BBB',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default ClubRulesScreen;