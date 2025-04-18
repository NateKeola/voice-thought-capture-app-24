import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Welcome } from '@/components/onboarding/Welcome';
import { EmailSignup } from '@/components/onboarding/EmailSignup';
import { ProfileSetup } from '@/components/onboarding/ProfileSetup';
import { QuickTour } from '@/components/onboarding/QuickTour';

const Onboarding = () => {
  const [step, setStep] = useState<'welcome' | 'email-signup' | 'profile-setup' | 'quick-tour'>('welcome');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    photoUrl: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Remove any previous authentication state when landing on onboarding
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
  }, []);

  const handleContinueWithEmail = () => {
    setStep('email-signup');
  };

  const handleSignInLink = () => {
    // Mark user as authenticated
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/home');
  };

  const handleCreateAccount = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email }));
    setStep('profile-setup');
  };

  const handleProfileComplete = (name: string, photoUrl: string = '') => {
    setFormData(prev => ({ ...prev, name, photoUrl }));
    setStep('quick-tour');
  };

  const handleSkipProfile = () => {
    setStep('quick-tour');
  };

  const handleFinishTour = () => {
    // Mark user as authenticated
    localStorage.setItem('isAuthenticated', 'true');
    // Navigate to home screen when onboarding is complete
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      {step === 'welcome' && (
        <Welcome 
          onContinueWithEmail={handleContinueWithEmail} 
          onSignInLink={handleSignInLink}
        />
      )}
      
      {step === 'email-signup' && (
        <EmailSignup onCreateAccount={handleCreateAccount} />
      )}
      
      {step === 'profile-setup' && (
        <ProfileSetup 
          onComplete={handleProfileComplete} 
          onSkip={handleSkipProfile}
        />
      )}
      
      {step === 'quick-tour' && (
        <QuickTour onFinish={handleFinishTour} />
      )}
    </div>
  );
};

export default Onboarding;
