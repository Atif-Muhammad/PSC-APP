import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRoomRule, getHallRule, getLawnRule, getPhotoshootRule } from '../../config/apis';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Titles per booking type */
const TITLES = {
    ROOM: 'Guest Room Booking Terms & Conditions',
    HALL: 'Banquet Hall Booking Terms & Conditions',
    LAWN: 'Lawn Booking Terms & Conditions',
    PHOTOSHOOT: 'Photoshoot Booking Terms & Conditions',
};

/** Fallback static terms if API fails */
const FALLBACK_TERMS = {
    ROOM: [
        'Check-in time is 2:00 PM and check-out time is 12:00 PM (noon).',
        'A valid government-issued ID is required at check-in for all guests.',
        'An advance payment is required at the time of booking.',
        'Cancellations made at least 48 hours before check-in will receive a full refund.',
        'Guests are responsible for any damage to room property during their stay.',
        'Smoking is strictly prohibited inside the rooms.',
        'Pets are not allowed in the guest rooms.',
    ],
    HALL: [
        'Hall bookings must be made at least 7 days in advance.',
        'An advance payment of 50% is required to confirm the reservation.',
        'The hall must be vacated within the booked time slot.',
        'Guest count must not exceed the maximum capacity of the hall.',
        'Decorations must not cause damage to hall property.',
        'External catering is not allowed without prior permission.',
        'Cancellations made 7 or more days before the event receive a 50% refund.',
    ],
    LAWN: [
        'Lawn bookings must be made at least 10 days in advance.',
        'An advance payment is required to confirm the booking.',
        'The lawn must be vacated within the booked time slot.',
        'Guest count must not exceed the specified maximum capacity.',
        'Fireworks, firecrackers, or open flames are strictly prohibited.',
        'Vehicles are not allowed on the lawn area.',
        'Cancellations made 10 or more days before the event will receive a partial refund.',
    ],
    PHOTOSHOOT: [
        'Photoshoot slots must be reserved in advance from the booking office.',
        'Photoshoot duration should not exceed 2 hours. Overtime charges will apply.',
        'Use only designated areas for photoshoots.',
        'Attire and poses must adhere to the club\'s cultural standards.',
        'Any damage to club assets necessitates financial responsibility.',
        'Arrive on time. Notify in advance if unable to attend a scheduled session.',
        'Payments will not be refunded in the event of cancellation.',
    ],
};

/** Map bookingType → API function */
const RULE_FETCHERS = {
    ROOM: getRoomRule,
    HALL: getHallRule,
    LAWN: getLawnRule,
    PHOTOSHOOT: getPhotoshootRule,
};

/**
 * Strip all HTML tags and decode entities from a plain string.
 */
const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&mdash;/gi, '—')
        .replace(/&ndash;/gi, '–')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Parse the API's HTML `content` field into an array of plain-text points.
 * Groups list items under their preceding h2 heading.
 * Handles <li>, <p>, <div>, <td>, <br>-separated text, and plain text.
 * 
 * Input example:
 *   <h2>Timings</h2><ul><li>Check in - 1400 Hours</li></ul>
 * 
 * Output example:
 *   ['TIMINGS', 'Check in - 1400 Hours', ...]
 */
const parseContentToPoints = (html) => {
    if (!html || typeof html !== 'string') return [];

    const points = [];

    // 1. Extract headings (h1-h6) — these become section separators
    //    We process the HTML in order, so we first split into blocks by headings
    //    then parse content between headings.

    // Replace <br>, <br/>, <br /> with newlines for later splitting
    let processed = html.replace(/<br\s*\/?>/gi, '\n');

    // Extract all meaningful tags in order of appearance
    const tagRegex = /<(h[1-6]|li|p|div|td|th|dt|dd)[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;
    let foundAny = false;

    while ((match = tagRegex.exec(processed)) !== null) {
        const tag = match[1].toLowerCase();
        const rawText = stripHtml(match[2]);
        if (!rawText) continue;

        foundAny = true;

        if (tag.startsWith('h')) {
            // Use heading as a section separator label
            const heading = rawText.toUpperCase();
            points.push(`── ${heading} ──`);
        } else {
            // li, p, div, td, th, dt, dd — all treated as individual points
            // Some points might contain newlines from <br> replacement; split them
            const subPoints = rawText.split('\n').map(s => s.trim()).filter(Boolean);
            subPoints.forEach(sp => points.push(sp));
        }
    }

    // 2. If no tags were matched, the content might be plain text or only <br>-separated
    if (!foundAny) {
        const plainText = stripHtml(processed);
        if (plainText) {
            // Split on newlines, periods followed by space/newline, or numbered list patterns
            const lines = plainText
                .split(/\n+/)
                .map(s => s.trim())
                .filter(s => s.length > 0);

            if (lines.length > 1) {
                lines.forEach(l => points.push(l));
            } else if (plainText.length > 0) {
                // Single block — try splitting on sentence boundaries (". " or numbered "1." patterns)
                const sentences = plainText
                    .split(/(?<=\.)\s+(?=[A-Z0-9])/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                sentences.forEach(s => points.push(s));
            }
        }
    }

    return points;
};

/**
 * Normalize a rule item (one element from rawList) into an array of strings.
 * Returns ONE item's worth of content as multiple strings.
 */
const normalizeRuleItem = (item) => {
    if (typeof item === 'string') {
        // Check if the string itself is HTML
        if (/<[a-z][\s\S]*>/i.test(item)) {
            const parsed = parseContentToPoints(item);
            return parsed.length > 0 ? parsed : [stripHtml(item)].filter(Boolean);
        }
        return [stripHtml(item)].filter(Boolean);
    }

    // The actual API shape: { content: '<html>', type: 'ROOM', ... }
    const htmlContent =
        item?.content || item?.Content ||
        item?.html || item?.Html ||
        item?.body || item?.Body || '';

    if (htmlContent && typeof htmlContent === 'string') {
        const parsed = parseContentToPoints(htmlContent);
        if (parsed.length > 0) return parsed;
        // If parse returned nothing, still try stripping HTML to get plain text
        const stripped = stripHtml(htmlContent);
        if (stripped) return [stripped];
    }

    // Fallback: simple string fields
    const text =
        item?.rule || item?.Rule ||
        item?.description || item?.Description ||
        item?.text || item?.Text ||
        item?.title || item?.Title || '';

    if (text && typeof text === 'string') {
        // If the text looks like HTML, parse it
        if (/<[a-z][\s\S]*>/i.test(text)) {
            const parsed = parseContentToPoints(text);
            if (parsed.length > 0) return parsed;
        }
        return [stripHtml(text)].filter(Boolean);
    }

    return [];
};

/**
 * TermsAndConditions Component
 *
 * @param {string}   bookingType - 'ROOM' | 'HALL' | 'LAWN' | 'PHOTOSHOOT'
 * @param {boolean}  agreed      - Whether user has ticked the checkbox
 * @param {Function} onToggle    - Called when checkbox toggled
 * @param {boolean}  showError   - Whether to show red error highlight
 */
const TermsAndConditions = ({ bookingType = 'ROOM', agreed, onToggle, showError }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [rules, setRules] = useState([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [fetchedOnce, setFetchedOnce] = useState(false);

    const title = TITLES[bookingType] || TITLES.ROOM;

    const fetchRules = async () => {
        if (fetchedOnce) return;
        setLoadingRules(true);
        try {
            const fetcher = RULE_FETCHERS[bookingType];
            if (!fetcher) throw new Error('No fetcher for ' + bookingType);

            const data = await fetcher();

            // 🔍 Debug: log the raw API response so we can see its shape
            console.log(`📋 [TermsAndConditions] Raw API response for ${bookingType}:`, JSON.stringify(data));

            // Unwrap common API nesting — try every known wrapper key
            let rawList = data;
            if (!Array.isArray(rawList)) {
                rawList =
                    data?.data ||
                    data?.Data ||
                    data?.rules ||
                    data?.Rules ||
                    data?.result ||
                    data?.Result ||
                    data?.items ||
                    data?.Items ||
                    (typeof data === 'object' && data !== null
                        ? Object.values(data).find(v => Array.isArray(v))
                        : null) ||
                    null;
            }

            // If rawList is still not an array, the API may have returned a single object
            // with a `content` field (e.g. { content: "<html>...", type: "HALL" })
            if (!Array.isArray(rawList)) {
                if (rawList && typeof rawList === 'object' && (rawList.content || rawList.Content || rawList.html || rawList.Html)) {
                    rawList = [rawList];
                } else if (data && typeof data === 'object' && !Array.isArray(data) && (data.content || data.Content || data.html || data.Html)) {
                    rawList = [data];
                } else {
                    rawList = [];
                }
            }

            console.log(`📋 [TermsAndConditions] rawList (${rawList.length} items):`, JSON.stringify(rawList));

            // Each item may expand into multiple points (e.g. one item with big HTML content)
            const parsed = rawList.flatMap(normalizeRuleItem).filter(s => s && s.trim().length > 0);

            console.log(`📋 [TermsAndConditions] parsed texts (${parsed.length}):`, parsed);

            if (parsed.length > 0) {
                setRules(parsed);
            } else {
                console.warn(`⚠️ [TermsAndConditions] No valid rules parsed, using fallback for ${bookingType}`);
                setRules(FALLBACK_TERMS[bookingType] || []);
            }
        } catch (err) {
            console.warn('Terms: API fetch failed, using fallback.', err?.message);
            setRules(FALLBACK_TERMS[bookingType] || []);
        } finally {
            setLoadingRules(false);
            setFetchedOnce(true);
        }
    };

    const handleOpenModal = () => {
        fetchRules();
        setModalVisible(true);
    };

    return (
        <>
            {/* Checkbox Row */}
            <View style={[
                styles.container,
                showError && !agreed && styles.containerError,
            ]}>
                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={onToggle}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.checkbox,
                        agreed && styles.checkboxChecked,
                        showError && !agreed && styles.checkboxError,
                    ]}>
                        {agreed && <Icon name="check" size={16} color="#FFF" />}
                    </View>
                    <Text style={[
                        styles.checkboxText,
                        showError && !agreed && styles.checkboxTextError,
                    ]}>
                        I agree to the{' '}
                    </Text>
                    <TouchableOpacity onPress={handleOpenModal}>
                        <Text style={styles.linkText}>Terms &amp; Conditions</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                {showError && !agreed && (
                    <View style={styles.errorRow}>
                        <Icon name="error-outline" size={14} color="#D32F2F" />
                        <Text style={styles.errorText}>
                            You must agree to the Terms &amp; Conditions.
                        </Text>
                    </View>
                )}
            </View>

            {/* Terms Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Content */}
                        <ScrollView
                            style={styles.modalScrollView}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            {loadingRules ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#b48a64" />
                                    <Text style={styles.loadingText}>Loading terms...</Text>
                                </View>
                            ) : rules.length === 0 ? (
                                <Text style={styles.emptyText}>No terms available at the moment.</Text>
                            ) : (
                                (() => {
                                    let bulletIndex = 0;
                                    return rules.map((point, index) => {
                                        const isSection = point.startsWith('──');
                                        if (isSection) {
                                            // Section heading — strip the ── decorators
                                            const heading = point.replace(/^──\s*/, '').replace(/\s*──$/, '').trim();
                                            return (
                                                <View key={index} style={styles.sectionHeadingRow}>
                                                    <Text style={styles.sectionHeadingText}>{heading}</Text>
                                                </View>
                                            );
                                        }
                                        bulletIndex++;
                                        return (
                                            <View key={index} style={styles.termItem}>
                                                <View style={styles.termBullet}>
                                                    <Text style={styles.termBulletText}>{bulletIndex}</Text>
                                                </View>
                                                <Text style={styles.termText}>{point}</Text>
                                            </View>
                                        );
                                    });
                                })()
                            )}

                            {!loadingRules && (
                                <View style={styles.disclaimerBox}>
                                    <Icon name="info" size={18} color="#b48a64" />
                                    <Text style={styles.disclaimerText}>
                                        By checking the checkbox, you acknowledge that you have read, understood,
                                        and agree to abide by all the above terms and conditions. The club reserves
                                        the right to modify these terms at any time without prior notice.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.agreeButton}
                                onPress={() => {
                                    if (!agreed) onToggle();
                                    setModalVisible(false);
                                }}
                            >
                                <Icon name="check-circle" size={20} color="#FFF" />
                                <Text style={styles.agreeButtonText}>
                                    {agreed ? 'Close' : 'I Agree'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    containerError: {
        borderColor: '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: '#FFF5F5',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#b48a64',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#b48a64',
        borderColor: '#b48a64',
    },
    checkboxError: {
        borderColor: '#D32F2F',
    },
    checkboxText: {
        fontSize: 14,
        color: '#333',
    },
    checkboxTextError: {
        color: '#D32F2F',
    },
    linkText: {
        fontSize: 14,
        color: '#b48a64',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingLeft: 32,
    },
    errorText: {
        fontSize: 12,
        color: '#D32F2F',
        fontWeight: '600',
        marginLeft: 4,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.85,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6D8',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#2D3748',
        flex: 1,
        paddingRight: 10,
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalScrollView: {
        flexShrink: 1,
    },
    modalScrollContent: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#888',
    },
    sectionHeadingRow: {
        marginTop: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6D8',
        paddingBottom: 4,
    },
    sectionHeadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#b48a64',
        textTransform: 'uppercase',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        paddingVertical: 30,
        fontStyle: 'italic',
    },
    termItem: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'flex-start',
    },
    termBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#b48a64',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 1,
    },
    termBulletText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    termText: {
        flex: 1,
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 20,
    },
    disclaimerBox: {
        flexDirection: 'row',
        backgroundColor: '#FDF8F3',
        borderRadius: 10,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        alignItems: 'flex-start',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        color: '#8B7355',
        marginLeft: 10,
        lineHeight: 18,
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0E6D8',
    },
    agreeButton: {
        backgroundColor: '#b48a64',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    agreeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default TermsAndConditions;
