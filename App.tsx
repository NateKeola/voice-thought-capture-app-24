
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MemosScreen from './src/screens/MemosScreen';
import RelationshipsScreen from './src/screens/RelationshipsScreen';
import MemoDetailScreen from './src/screens/MemoDetailScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Types
import { RootStackParamList, TabParamList } from './src/types';
import { initializeSampleData } from './src/services/MemoStorage';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Memos') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Relationships') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff9500',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Memos" component={MemosScreen} />
      <Tab.Screen name="Relationships" component={RelationshipsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const auth = await AsyncStorage.getItem('isAuthenticated');
        setIsAuthenticated(auth === 'true');
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Main" 
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="MemoDetail" 
                component={MemoDetailScreen}
                options={{ 
                  title: 'Memo Details',
                  headerTintColor: '#ff9500',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
