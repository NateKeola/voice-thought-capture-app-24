
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getMemoById, updateMemo, deleteMemo } from '../services/MemoStorage';
import { Memo, MemoType } from '../types';
import { Audio } from 'expo-av';
import { formatDistanceToNow } from 'date-fns';

type MemoDetailRouteProp = RouteProp<RootStackParamList, 'MemoDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MemoDetail'>;

const MemoDetailScreen = () => {
  const route = useRoute<MemoDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;
  
  const [memo, setMemo] = useState<Memo | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedType, setEditedType] = useState<MemoType>('note');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const loadMemo = async () => {
      try {
        setIsLoading(true);
        const foundMemo = await getMemoById(id);
        if (foundMemo) {
          setMemo(foundMemo);
          setEditedText(foundMemo.text);
          setEditedType(foundMemo.type);
        }
      } catch (error) {
        console.error('Error loading memo:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMemo();
    
    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const handleSave = async () => {
    if (!memo) return;
    
    try {
      setIsSaving(true);
      const updatedMemo = await updateMemo(id, {
        text: editedText,
        type: editedType
      });
      
      if (updatedMemo) {
        setMemo(updatedMemo);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating memo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Memo",
      "Are you sure you want to delete this memo?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteMemo(id);
              if (success) {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting memo:', error);
            }
          }
        }
      ]
    );
  };

  const handlePlayAudio = async () => {
    if (!memo?.audioUrl) {
      Alert.alert("No Audio", "This memo doesn't have an audio recording.");
      return;
    }

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: memo.audioUrl },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert("Playback Error", "Could not play the audio recording.");
    }
  };

  const handleTypeSelect = (type: MemoType) => {
    setEditedType(type);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9500" />
      </View>
    );
  }

  if (!memo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Memo not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {isEditing ? 'Edit Memo' : 'Memo Details'}
          </Text>
        </View>
        
        <View style={styles.cardContent}>
          {isEditing ? (
            <View style={styles.editSection}>
              <TextInput
                value={editedText}
                onChangeText={setEditedText}
                multiline
                style={styles.textInput}
              />
              
              <Text style={styles.typeLabel}>Memo Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    editedType === 'note' ? styles.selectedType : null
                  ]}
                  onPress={() => handleTypeSelect('note')}
                >
                  <Ionicons 
                    name="document-text" 
                    size={18} 
                    color={editedType === 'note' ? '#fff' : '#007aff'} 
                  />
                  <Text style={[
                    styles.typeText,
                    editedType === 'note' ? styles.selectedTypeText : null
                  ]}>Note</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    editedType === 'task' ? styles.selectedType : null
                  ]}
                  onPress={() => handleTypeSelect('task')}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={18} 
                    color={editedType === 'task' ? '#fff' : '#34c759'} 
                  />
                  <Text style={[
                    styles.typeText,
                    editedType === 'task' ? styles.selectedTypeText : null
                  ]}>Task</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    editedType === 'idea' ? styles.selectedType : null
                  ]}
                  onPress={() => handleTypeSelect('idea')}
                >
                  <Ionicons 
                    name="bulb" 
                    size={18} 
                    color={editedType === 'idea' ? '#fff' : '#ff9500'} 
                  />
                  <Text style={[
                    styles.typeText,
                    editedType === 'idea' ? styles.selectedTypeText : null
                  ]}>Idea</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.memoText}>{memo.text}</Text>
              
              <View style={styles.metaInfo}>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>
                    {memo.type.charAt(0).toUpperCase() + memo.type.slice(1)}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}
                </Text>
              </View>
              
              {memo.audioUrl && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={handlePlayAudio}
                >
                  <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={22} 
                    color="#007aff" 
                  />
                  <Text style={styles.audioButtonText}>
                    {isPlaying ? "Pause Audio" : "Play Audio"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          {isEditing ? (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditedText(memo.text);
                  setEditedType(memo.type);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="white" style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.viewButtons}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="white" style={styles.buttonIcon} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={18} color="white" style={styles.buttonIcon} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#666',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#007aff',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#fff9ec',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f6e9d2',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9500',
  },
  cardContent: {
    padding: 16,
  },
  memoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: '#fff9ec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f6e9d2',
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff9500',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  audioButtonText: {
    color: '#007aff',
    marginLeft: 6,
    fontSize: 14,
  },
  cardFooter: {
    padding: 16,
    backgroundColor: '#fff9ec',
    borderTopWidth: 1,
    borderTopColor: '#f6e9d2',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  editButton: {
    backgroundColor: '#ff9500',
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editSection: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 0.3,
  },
  selectedType: {
    backgroundColor: '#ff9500',
    borderColor: '#ff9500',
  },
  typeText: {
    marginLeft: 6,
    fontSize: 14,
  },
  selectedTypeText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MemoDetailScreen;
