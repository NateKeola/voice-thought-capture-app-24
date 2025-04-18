
import React, { createContext, useContext, useState } from 'react';

interface UserProfileContextType {
  userName: string;
  setUserName: (name: string) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  return (
    <UserProfileContext.Provider value={{ userName, setUserName: updateUserName }}>
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
