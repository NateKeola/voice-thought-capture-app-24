
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

type OnboardingStep = 'welcome' | 'email-signup' | 'profile-setup' | 'quick-tour';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const navigation = useNavigation<NavigationProp>();

  const handleContinueWithEmail = () => {
    setStep('email-signup');
  };

  const handleSignInDirectly = async () => {
    try {
      // Mark user as authenticated
      await AsyncStorage.setItem('isAuthenticated', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error setting authentication status:', error);
      Alert.alert('Error', 'Could not sign in. Please try again.');
    }
  };

  const handleCreateAccount = () => {
    if (!email.trim() || !password.trim() || password.length < 6) {
      Alert.alert('Invalid Input', 'Please enter a valid email and password (min 6 characters)');
      return;
    }
    
    setStep('profile-setup');
  };

  const handleProfileComplete = async () => {
    try {
      // Save user info (in a real app, would be encrypted or saved in a secure storage)
      if (name.trim()) {
        await AsyncStorage.setItem('userName', name);
      }
      
      // Show quick tour
      setStep('quick-tour');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

  const handleSkipProfile = () => {
    setStep('quick-tour');
  };

  const tourSteps = [
    {
      title: 'Record Your Thoughts',
      description: 'Tap the mic button to start recording. Your speech will be transcribed into text.',
      icon: 'mic',
    },
    {
      title: 'Organize Your Memos',
      description: 'Memos are automatically categorized as notes, tasks, or ideas based on content.',
      icon: 'layers',
    },
    {
      title: 'Stay Connected',
      description: 'Track your conversations with people in your life and never miss important follow-ups.',
      icon: 'people',
    },
  ];

  const handleFinishTour = async () => {
    try {
      // Mark user as authenticated
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error setting authentication status:', error);
      Alert.alert('Error', 'Could not complete onboarding. Please try again.');
    }
  };

  const renderTourStep = (index: number) => {
    const step = tourSteps[index];
    
    return (
      <View style={styles.tourStep} key={index}>
        <View style={styles.tourIconContainer}>
          <Ionicons name={step.icon as any} size={60} color="#ff9500" />
        </View>
        <Text style={styles.tourTitle}>{step.title}</Text>
        <Text style={styles.tourDescription}>{step.description}</Text>
      </View>
    );
  };

  const renderTourControls = () => {
    return (
      <View style={styles.tourControls}>
        <View style={styles.tourIndicators}>
          {tourSteps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.tourIndicator,
                i === currentTourStep ? styles.activeTourIndicator : null,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.tourButtons}>
          {currentTourStep > 0 && (
            <TouchableOpacity
              style={styles.tourBackButton}
              onPress={() => setCurrentTourStep(currentTourStep - 1)}
            >
              <Text style={styles.tourBackText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentTourStep < tourSteps.length - 1 ? (
            <TouchableOpacity
              style={styles.tourNextButton}
              onPress={() => setCurrentTourStep(currentTourStep + 1)}
            >
              <Text style={styles.tourNextText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.tourFinishButton}
              onPress={handleFinishTour}
            >
              <Text style={styles.tourFinishText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 'welcome' && (
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MEMO</Text>
            <Text style={styles.tagline}>Capture your thoughts, anytime, anywhere</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleContinueWithEmail}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Continue with Email</Text>
            </TouchableOpacity>
            
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleSignInDirectly}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {step === 'email-signup' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('welcome')}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Sign up to get started with Memo</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
            </View>
            
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
      
      {step === 'profile-setup' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('email-signup')}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.formTitle}>Complete Your Profile</Text>
            <Text style={styles.formSubtitle}>Tell us a bit about yourself</Text>
            
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
              <TouchableOpacity style={styles.addPhotoButton}>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleProfileComplete}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipProfile}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
      {step === 'quick-tour' && (
        <View style={styles.tourContainer}>
          <View style={styles.tourContent}>
            {renderTourStep(currentTourStep)}
          </View>
          
          {renderTourControls()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  emailButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signInText: {
    color: '#666',
  },
  signInLink: {
    color: '#ff9500',
    fontWeight: '600',
    marginLeft: 4,
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  createAccountButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addPhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addPhotoText: {
    color: '#ff9500',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  tourContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tourContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tourStep: {
    width: width - 48,
    alignItems: 'center',
  },
  tourIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff9ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tourDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  tourControls: {
    padding: 24,
  },
  tourIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tourIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeTourIndicator: {
    backgroundColor: '#ff9500',
    width: 16,
  },
  tourButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tourBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tourBackText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  tourNextButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  tourNextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tourFinishButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  tourFinishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
