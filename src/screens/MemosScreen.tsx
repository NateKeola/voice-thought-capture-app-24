
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemoCard from '../components/MemoCard';
import { getAllMemos } from '../services/MemoStorage';
import { Memo, MemoType } from '../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const MemosScreen = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const navigation = useNavigation<NavigationProp>();

  // Load memos when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadMemos = async () => {
        const allMemos = await getAllMemos();
        setMemos(allMemos);
      };
      
      loadMemos();
    }, [])
  );

  const filteredMemos = activeFilter === 'all' 
    ? memos 
    : memos.filter(memo => memo.type === activeFilter);

  const renderTypeFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterOption, activeFilter === 'all' ? styles.activeFilter : null]}
        onPress={() => setActiveFilter('all')}
      >
        <Ionicons 
          name="layers" 
          size={18} 
          color={activeFilter === 'all' ? '#ff9500' : '#666'} 
        />
        <Text 
          style={[
            styles.filterText, 
            activeFilter === 'all' ? styles.activeFilterText : null
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterOption, activeFilter === 'note' ? styles.activeFilter : null]}
        onPress={() => setActiveFilter('note')}
      >
        <Ionicons 
          name="document-text" 
          size={18} 
          color={activeFilter === 'note' ? '#ff9500' : '#666'} 
        />
        <Text 
          style={[
            styles.filterText, 
            activeFilter === 'note' ? styles.activeFilterText : null
          ]}
        >
          Notes
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterOption, activeFilter === 'task' ? styles.activeFilter : null]}
        onPress={() => setActiveFilter('task')}
      >
        <Ionicons 
          name="checkmark-circle" 
          size={18} 
          color={activeFilter === 'task' ? '#ff9500' : '#666'} 
        />
        <Text 
          style={[
            styles.filterText, 
            activeFilter === 'task' ? styles.activeFilterText : null
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterOption, activeFilter === 'idea' ? styles.activeFilter : null]}
        onPress={() => setActiveFilter('idea')}
      >
        <Ionicons 
          name="bulb" 
          size={18} 
          color={activeFilter === 'idea' ? '#ff9500' : '#666'} 
        />
        <Text 
          style={[
            styles.filterText, 
            activeFilter === 'idea' ? styles.activeFilterText : null
          ]}
        >
          Ideas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>No memos found</Text>
      <Text style={styles.emptySubtext}>
        {activeFilter !== 'all' 
          ? 'Try changing your filter or create a new memo' 
          : 'Create your first memo by recording or typing'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Memos</Text>
        </View>
        
        {renderTypeFilter()}
        
        <FlatList
          data={filteredMemos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MemoCard 
              memo={item} 
              onPress={() => navigation.navigate('MemoDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: '#fff9ec',
  },
  filterText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#666',
  },
  activeFilterText: {
    color: '#ff9500',
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
});

export default MemosScreen;
