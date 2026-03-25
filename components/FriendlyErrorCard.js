// components/FriendlyErrorCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * FriendlyErrorCard Component
 * 
 * Displays user-friendly error messages for HTTP 500 errors
 * without technical jargon. Allows users to retry or navigate away.
 * 
 * @param {Object} props
 * @param {string} props.message - Friendly error message to display
 * @param {string} props.module - Module name (rooms, halls, lawns)
 * @param {Function} props.onRetry - Callback when user taps retry
 * @param {Function} props.onClose - Callback when user taps close/back
 * @param {boolean} props.showActions - Whether to show action buttons (default: true)
 */
const FriendlyErrorCard = ({ 
  message, 
  module = 'default',
  onRetry, 
  onClose,
  showActions = true 
}) => {
  
  // Get appropriate icon based on module
  const getModuleIcon = () => {
    switch (module) {
      case 'rooms':
        return 'room-service';
      case 'halls':
        return 'meeting-room';
      case 'lawns':
        return 'yard';
      default:
        return 'error-outline';
    }
  };
  
  // Get module display name
  const getModuleName = () => {
    switch (module) {
      case 'rooms':
        return 'Room Booking';
      case 'halls':
        return 'Hall Booking';
      case 'lawns':
        return 'Lawn Booking';
      default:
        return 'Service';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon 
          name={getModuleIcon()} 
          size={48} 
          color="#F59E0B" 
        />
      </View>
      
      <Text style={styles.title}>{getModuleName()} Unavailable</Text>
      
      <Text style={styles.message}>{message}</Text>
      
      {showActions && (
        <View style={styles.actionsContainer}>
          {onRetry && (
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          
          {onClose && (
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={20} color="#6B7280" />
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default FriendlyErrorCard;
