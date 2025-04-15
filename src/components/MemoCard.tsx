
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Memo } from '../types';
import { formatDistanceToNow } from 'date-fns';

type MemoCardProps = {
  memo: Memo;
  onPress: () => void;
};

const MemoCard = ({ memo, onPress }: MemoCardProps) => {
  const { text, type, createdAt, audioUrl } = memo;
  
  const getTypeIcon = () => {
    switch (type) {
      case 'note':
        return <Ionicons name="document-text" size={20} color="#007aff" />;
      case 'task':
        return <Ionicons name="checkmark-circle" size={20} color="#34c759" />;
      case 'idea':
        return <Ionicons name="bulb" size={20} color="#ff9500" />;
      default:
        return <Ionicons name="document-text" size={20} color="#007aff" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'note':
        return '#d1e6ff';
      case 'task':
        return '#d1ffdb';
      case 'idea':
        return '#ffe8cc';
      default:
        return '#d1e6ff';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.typeContainer, { backgroundColor: getTypeColor() }]}>
          {getTypeIcon()}
          <Text style={styles.typeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        </View>
        <Text style={styles.date}>
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </Text>
      </View>
      
      <Text style={styles.content} numberOfLines={3}>
        {text}
      </Text>
      
      {audioUrl && (
        <View style={styles.audioIndicator}>
          <Ionicons name="musical-note" size={14} color="#666" />
          <Text style={styles.audioText}>Audio available</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  audioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default MemoCard;
