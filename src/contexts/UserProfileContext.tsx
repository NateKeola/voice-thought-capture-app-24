
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
    if (user?.user_metadata) {
      const fullName = user.user_metadata.full_name;
      const firstName = user.user_metadata.first_name;
      const lastName = user.user_metadata.last_name;
      
      // Prefer full_name, fallback to first_name + last_name, then individual names
      let nameFromSupabase = '';
      if (fullName) {
        nameFromSupabase = fullName;
      } else if (firstName && lastName) {
        nameFromSupabase = `${firstName} ${lastName}`;
      } else if (firstName) {
        nameFromSupabase = firstName;
      } else if (lastName) {
        nameFromSupabase = lastName;
      }
      
      if (nameFromSupabase) {
        setUserNameState(nameFromSupabase);
        localStorage.setItem('userName', nameFromSupabase);
      }
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
