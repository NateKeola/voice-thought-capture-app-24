
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder } from '../services/AudioRecorder';
import { saveMemo } from '../services/MemoStorage';
import { detectMemoType } from '../services/SpeechToText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type RecordButtonProps = {
  onTextInput: (text: string) => void;
  text: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const RecordButton = ({ onTextInput, text }: RecordButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  
  const {
    isRecording,
    isPaused,
    formattedDuration,
    audioUri,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsProcessing(true);
      const uri = await stopRecording();
      setRecordingComplete(true);
      setIsProcessing(false);
    } else {
      // Start recording
      setRecordingComplete(false);
      startRecording();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleSaveMemo = async () => {
    try {
      setIsProcessing(true);
      const memoText = text || "Empty memo";
      const memoType = detectMemoType(memoText);
      
      const memo = await saveMemo({
        text: memoText,
        type: memoType,
        audioUrl: audioUri
      });
      
      // Reset states
      setRecordingComplete(false);
      onTextInput('');
      
      // Navigate to the memo detail
      navigation.navigate('MemoDetail', { id: memo.id });
    } catch (error) {
      console.error('Error saving memo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    // Reset states
    setRecordingComplete(false);
    cancelRecording();
    onTextInput('');
  };

  const renderRecordingControls = () => {
    if (recordingComplete) {
      return (
        <View style={styles.controlsContainer}>
          <Text style={styles.recordingComplete}>Recording Complete</Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {text.substring(0, 50)}{text.length > 50 ? '...' : ''}
          </Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isProcessing}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveMemo}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Save Memo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    if (isRecording) {
      return (
        <View style={styles.controlsContainer}>
          <Text style={styles.duration}>{formattedDuration}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.circleButton, styles.pauseButton]}
              onPress={handlePauseResume}
              disabled={isProcessing}
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={28} 
                color="#ff9500" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.circleButton, styles.stopButton]}
              onPress={handleToggleRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Ionicons name="square" size={28} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          {text.trim().length > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.saveButton, styles.saveButtonSmall]}
              onPress={handleSaveMemo}
              disabled={isProcessing}
            >
              <Ionicons name="save-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Save Memo</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <TouchableOpacity
        style={[styles.mainRecordButton]}
        onPress={handleToggleRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Ionicons name="mic" size={40} color="white" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderRecordingControls()}
      
      {isRecording && !isPaused && (
        <View style={styles.pulsingCircle} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  controlsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRecordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff9500',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  pauseButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  stopButton: {
    backgroundColor: '#ff3b30',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  saveButtonSmall: {
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  duration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingComplete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
  pulsingCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    opacity: 0.7,
  },
});

export default RecordButton;
