
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileContextType {
  userName: string;
  setUserName: (name: string) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userName, setUserNameState] = useState(() => localStorage.getItem('userName') || '');

  // Load user name from Supabase user metadata when user is available
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      const nameFromSupabase = user.user_metadata.full_name;
      setUserNameState(nameFromSupabase);
      localStorage.setItem('userName', nameFromSupabase);
    }
  }, [user]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
  };

  return (
    <UserProfileContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
