
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveMemo } from '../services/MemoStorage';
import { detectMemoType } from '../services/SpeechToText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type TextMemoInputProps = {
  text: string;
  onChangeText: (text: string) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const TextMemoInput = ({ text, onChangeText }: TextMemoInputProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      // Show error toast or alert
      return;
    }

    try {
      setIsSaving(true);
      
      // Detect the memo type
      const memoType = detectMemoType(text);
      
      // Save the memo
      const memo = await saveMemo({
        text: text,
        type: memoType,
        audioUrl: null // No audio for text-only memos
      });
      
      // Clear the input
      onChangeText('');
      
      // Navigate to the memo detail
      navigation.navigate('MemoDetail', { id: memo.id });
    } catch (error) {
      console.error('Error saving memo:', error);
      // Show error toast or alert
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Type your memo here..."
        style={styles.input}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity
        style={[
          styles.button,
          !text.trim() ? styles.buttonDisabled : null
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || isSaving}
      >
        <Ionicons name="send" size={16} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>Save Memo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ff9500',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  icon: {
    marginRight: 6,
  },
});

export default TextMemoInput;
