
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RecordButton from '../components/RecordButton';
import TextMemoInput from '../components/TextMemoInput';

const HomeScreen = () => {
  const [text, setText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MEMO</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.recordingContainer}>
            <RecordButton onTextInput={setText} text={text} />
          </View>
          
          <View style={styles.textInputContainer}>
            <TextMemoInput text={text} onChangeText={setText} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff9500',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    marginTop: 'auto',
  },
});

export default HomeScreen;
