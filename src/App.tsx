import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from 'react-query';

import AuthGuard from '@/components/AuthGuard';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import CategoryPage from '@/pages/CategoryPage';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { MemoProvider } from '@/contexts/MemoContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { Toaster } from '@/components/ui/toaster';
import { AchievementProvider } from '@/contexts/AchievementContext';
import AchievementsPage from '@/pages/AchievementsPage';

function App() {
  return (
    <Router>
      <QueryClient>
        <UserProfileProvider>
          <MemoProvider>
            <CategoryProvider>
              <AchievementProvider>
                <div className="relative">
                  <AuthGuard>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      <Route path="/" element={<HomePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/achievements" element={<AchievementsPage />} />
                    </Routes>
                  </AuthGuard>
                  <Toaster />
                </div>
              </AchievementProvider>
            </CategoryProvider>
          </MemoProvider>
        </UserProfileProvider>
      </QueryClient>
    </Router>
  );
}

export default App;
