
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Welcome } from '@/components/onboarding/Welcome';
import { EmailSignup } from '@/components/onboarding/EmailSignup';
import { ProfileSetup } from '@/components/onboarding/ProfileSetup';
import { QuickTour } from '@/components/onboarding/QuickTour';
import { useAuth } from '@/hooks/useAuth';

const Onboarding = () => {
  const [step, setStep] = useState<'welcome' | 'email-signup' | 'email-signin' | 'profile-setup' | 'quick-tour'>('welcome');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    photoUrl: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // If user is already authenticated, redirect them to home or their intended destination
  useEffect(() => {
    if (user) {
      const from = location.state?.from || '/home';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  useEffect(() => {
    // Remove any previous localStorage authentication state when landing on onboarding
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
  }, []);

  const handleContinueWithEmail = () => {
    setStep('email-signup');
  };

  const handleSSOSignIn = () => {
    // After an SSO login, we proceed to profile setup to get the user's name
    setStep('profile-setup');
  };

  const handleSignInLink = () => {
    // For existing users who want to sign in, go to sign-in specific step
    setStep('email-signin');
  };

  const handleCreateAccount = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email }));
    setStep('profile-setup');
  };

  const handleSuccessfulSignIn = () => {
    // Navigate directly to home after successful sign in
    const from = location.state?.from || '/home';
    navigate(from, { replace: true });
  };

  const handleProfileComplete = (name: string, photoUrl: string = '') => {
    setFormData(prev => ({ ...prev, name, photoUrl }));
    setStep('quick-tour');
  };

  const handleSkipProfile = () => {
    setStep('quick-tour');
  };

  const handleFinishTour = () => {
    // Navigate to home screen when onboarding is complete
    // The user is already authenticated from the email signup
    const from = location.state?.from || '/home';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      {step === 'welcome' && (
        <Welcome 
          onContinueWithEmail={handleContinueWithEmail} 
          onSignInLink={handleSignInLink}
          onSSOLogin={handleSSOSignIn}
        />
      )}
      
      {step === 'email-signup' && (
        <EmailSignup onCreateAccount={handleCreateAccount} />
      )}
      
      {step === 'email-signin' && (
        <EmailSignup 
          onCreateAccount={handleCreateAccount}
          onSuccessfulSignIn={handleSuccessfulSignIn}
          initialMode="signin"
        />
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
