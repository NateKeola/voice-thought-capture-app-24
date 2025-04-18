import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MemosPage from "./pages/MemosPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import MemoDetailPage from "./pages/MemoDetailPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import SignIn from "./pages/SignIn";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/onboarding" element={
              localStorage.getItem('isAuthenticated') === 'true' 
                ? <Navigate to="/home" replace /> 
                : <Onboarding />
            } />
            
            <Route path="/signin" element={
              localStorage.getItem('isAuthenticated') === 'true' 
                ? <Navigate to="/home" replace /> 
                : <SignIn />
            } />
            
            <Route path="/home" element={<AuthRoute><HomePage /></AuthRoute>} />
            <Route path="/memos" element={<AuthRoute><MemosPage /></AuthRoute>} />
            <Route path="/relationships" element={<AuthRoute><RelationshipsPage /></AuthRoute>} />
            <Route path="/memo/:id" element={<AuthRoute><MemoDetailPage /></AuthRoute>} />
            <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
