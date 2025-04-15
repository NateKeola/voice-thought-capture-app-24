
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for relationships
const mockRelationships = [
  { id: '1', name: 'Alex Johnson', lastContact: '2 days ago', notes: 3 },
  { id: '2', name: 'Sam Wilson', lastContact: '1 week ago', notes: 5 },
  { id: '3', name: 'Taylor Rodriguez', lastContact: 'Yesterday', notes: 1 },
  { id: '4', name: 'Morgan Lee', lastContact: '3 days ago', notes: 2 },
];

const RelationshipsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [relationships, setRelationships] = useState(mockRelationships);
  
  // Filter relationships based on search query
  const filteredRelationships = searchQuery 
    ? relationships.filter(rel => 
        rel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : relationships;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Relationships</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search relationships..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={filteredRelationships}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.relationshipCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Relationship details will be available in a future update.')}
            >
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={24} color="#ff9500" />
              </View>
              
              <View style={styles.relationshipInfo}>
                <Text style={styles.relationshipName}>{item.name}</Text>
                <Text style={styles.lastContact}>Last contact: {item.lastContact}</Text>
              </View>
              
              <View style={styles.notesTag}>
                <Text style={styles.notesText}>{item.notes} notes</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No relationships found</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Adding new relationships will be available in a future update.')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#ff9500" />
              <Text style={styles.addButtonText}>Add Relationship</Text>
            </TouchableOpacity>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  relationshipCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff9ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 14,
    color: '#666',
  },
  notesTag: {
    backgroundColor: '#fff9ec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff9500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9ec',
    borderWidth: 1,
    borderColor: '#ffdfb0',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  addButtonText: {
    color: '#ff9500',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RelationshipsScreen;
