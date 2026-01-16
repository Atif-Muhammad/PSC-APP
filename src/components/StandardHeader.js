import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const StandardHeader = ({
    title,
    onBackPress,
    rightIcon,
    onRightPress,
    titleStyle,
    headerStyle,
}) => {
    const navigation = useNavigation();

    const handleBack = () => {
        if (typeof onBackPress === 'function') {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/notch.jpg')}
            style={[styles.notch, headerStyle]}
            imageStyle={styles.notchImage}
        >
            {/* Back Button */}
            {(onBackPress === true || typeof onBackPress === 'function' || onBackPress === undefined) && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
            )}

            {/* Title */}
            <Text style={[styles.headerText, titleStyle]} numberOfLines={1}>
                {title}
            </Text>

            {/* Right Icon */}
            {rightIcon && (
                <TouchableOpacity
                    style={styles.rightButton}
                    onPress={onRightPress}
                    activeOpacity={0.7}
                >
                    <Icon name={rightIcon} size={rightIcon === 'filter-list' ? 24 : 28} color="#000" />
                </TouchableOpacity>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    notch: {
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 60,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
    },
    notchImage: {
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    rightButton: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
});

export default StandardHeader;
