import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import MemosPage from "./pages/MemosPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import MemoDetailPage from "./pages/MemoDetailPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import SignIn from "./pages/SignIn";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { MemoProvider } from "./contexts/MemoContext";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    if (!authStatus) {
      navigate('/signin', { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);
  
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  return null;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProfileProvider>
          <MemoProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/signin" element={
                  localStorage.getItem('isAuthenticated') === 'true' 
                    ? <Navigate to="/home" replace /> 
                    : <SignIn />
                } />
                <Route path="/home" element={<AuthRoute><HomePage /></AuthRoute>} />
                <Route path="/memos" element={<AuthRoute><MemosPage /></AuthRoute>} />
                <Route path="/tasks" element={<AuthRoute><TasksPage /></AuthRoute>} />
                <Route path="/relationships" element={<AuthRoute><RelationshipsPage /></AuthRoute>} />
                <Route path="/memo/:id" element={<AuthRoute><MemoDetailPage /></AuthRoute>} />
                <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MemoProvider>
        </UserProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
