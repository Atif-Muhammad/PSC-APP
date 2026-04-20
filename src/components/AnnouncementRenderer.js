import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, Linking, Alert } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

// Custom HTML renderer for announcements with app theme styling
const AnnouncementRenderer = ({ htmlContent, style }) => {
    const { width } = useWindowDimensions();

    // App theme colors
    const themeColors = {
        primary: '#A3834C',      // Gold accent color from your app
        text: '#333333',         // Primary text
        textLight: '#666666',    // Secondary text
        background: '#FFFFFF',
        link: '#A3834C',
        codeBg: '#F5F5F5',
    };

    // Font settings
    const baseFontSize = Platform.OS === 'android' ? 15 : 16;
    const baseLineHeight = Platform.OS === 'android' ? 24 : 26;

    // Safe link handler
    const handleLinkPress = useCallback((event, href) => {
        if (!href) return;
        
        // Validate URL scheme for security
        const validSchemes = ['http://', 'https://', 'mailto:', 'tel:'];
        const hasValidScheme = validSchemes.some(scheme => href.toLowerCase().startsWith(scheme));
        
        if (hasValidScheme) {
            Linking.openURL(href).catch(() => {
                Alert.alert('Error', 'Unable to open this link');
            });
        } else {
            Alert.alert('Security Warning', 'This link may not be safe to open');
        }
    }, []);

    // Optimized tags styles configuration
    const tagsStyles = useMemo(() => ({
        body: {
            color: themeColors.text,
            fontSize: baseFontSize,
            lineHeight: baseLineHeight,
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        },
        p: {
            marginBottom: 12,
            color: themeColors.text,
            fontSize: baseFontSize,
            lineHeight: baseLineHeight,
        },
        h1: {
            fontSize: 26,
            fontWeight: '700',
            marginTop: 20,
            marginBottom: 12,
            color: themeColors.text,
            lineHeight: 32,
        },
        h2: {
            fontSize: 22,
            fontWeight: '700',
            marginTop: 18,
            marginBottom: 10,
            color: themeColors.text,
            lineHeight: 28,
        },
        h3: {
            fontSize: 19,
            fontWeight: '600',
            marginTop: 16,
            marginBottom: 8,
            color: themeColors.text,
            lineHeight: 26,
        },
        h4: {
            fontSize: 17,
            fontWeight: '600',
            marginTop: 14,
            marginBottom: 6,
            color: themeColors.textLight,
        },
        ul: {
            marginBottom: 12,
            paddingLeft: 20,
        },
        ol: {
            marginBottom: 12,
            paddingLeft: 20,
        },
        li: {
            fontSize: baseFontSize,
            lineHeight: baseLineHeight,
            marginBottom: 6,
            color: themeColors.text,
        },
        strong: {
            fontWeight: '700',
        },
        b: {
            fontWeight: '700',
        },
        em: {
            fontStyle: 'italic',
        },
        i: {
            fontStyle: 'italic',
        },
        u: {
            textDecorationLine: 'underline',
        },
        s: {
            textDecorationLine: 'line-through',
        },
        a: {
            color: themeColors.link,
            textDecorationLine: 'underline',
            fontWeight: '600',
        },
        img: {
            maxWidth: '100%',
            borderRadius: 8,
            marginVertical: 8,
        },
        blockquote: {
            borderLeftWidth: 4,
            borderLeftColor: themeColors.primary,
            paddingLeft: 16,
            marginVertical: 12,
            backgroundColor: '#FAFAFA',
            paddingVertical: 8,
        },
        pre: {
            backgroundColor: themeColors.codeBg,
            padding: 12,
            borderRadius: 6,
            overflow: 'scroll',
            fontSize: baseFontSize - 1,
        },
        code: {
            backgroundColor: themeColors.codeBg,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 4,
            fontSize: baseFontSize - 1,
            fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
        },
        hr: {
            height: 1,
            backgroundColor: '#E0E0E0',
            marginVertical: 16,
        },
    }), [baseFontSize, baseLineHeight]);

    // Class-based styles for common rich text editor classes
    const classesStyles = useMemo(() => ({
        'ql-align-center': { textAlign: 'center' },
        'ql-align-right': { textAlign: 'right' },
        'ql-align-justify': { textAlign: 'justify' },
        'ql-align-left': { textAlign: 'left' },
        'text-primary': { color: themeColors.primary },
        'text-highlight': { backgroundColor: '#FFF9E6', padding: 2 },
    }), [themeColors.primary]);

    // Image rendering configuration
    const renderersProps = useMemo(() => ({
        img: {
            enableExperimentalPercentWidth: true,
            maxInitialScale: 1,
            ignoreAlternateResourceRequests: true,
        },
    }), []);

    // System fonts
    const systemFonts = useMemo(() => 
        Platform.OS === 'android'
            ? ['Roboto', 'sans-serif', 'serif', 'monospace']
            : ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
    []);

    // Clean and sanitize HTML
    const cleanHtml = useMemo(() => {
        if (!htmlContent) return '';
        
        let content = String(htmlContent)
            .replace(/&nbsp;/g, ' ')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
            
        return content;
    }, [htmlContent]);

    // Handle empty content
    if (!cleanHtml || cleanHtml.trim() === '') {
        return null;
    }

    return (
        <View style={[styles.container, style]}>
            <RenderHtml
                contentWidth={width - 40}
                source={{ html: cleanHtml }}
                tagsStyles={tagsStyles}
                classesStyles={classesStyles}
                baseStyle={{
                    color: themeColors.text,
                    fontSize: baseFontSize,
                    lineHeight: baseLineHeight,
                }}
                systemFonts={systemFonts}
                renderersProps={renderersProps}
                enableExperimentalMarginCollapsing={true}
                enableCSSInlineProcessing={true}
                enableExperimentalBRCollapsing={true}
                ignoredDomTags={['iframe', 'script', 'style']}
                onLinkPress={handleLinkPress}
                defaultTextProps={{
                    selectable: true,
                    allowFontScaling: true,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 8,
    },
});

export default AnnouncementRenderer;
